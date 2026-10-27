import math

from typing import Optional

from models import (
    AnalyzeRequest, AnalyzeResponse, Issue, Pass, PassAnalysis, Player, SituationStats,
)
 
# --- pitch geometry (metres) ------------------------------------------------
PITCH_L = 105.0
PITCH_W = 68.0
GOAL_Y = PITCH_W / 2
FINAL_THIRD_X = PITCH_L * 2 / 3          # 70 m from own goal line
BOX_DEPTH = 16.5
BOX_HALF_WIDTH = 20.16                   # penalty area is 40.32 m wide
 
# --- tunable heuristics -----------------------------------------------------
PROGRESSIVE_MIN_M = 10.0                 # closer to goal by at least this much
LANE_RADIUS_M = 3.0                      # opponent this close to the line blocks it
TYPE_PENALTY = {"ground": 0.0, "lofted": 0.05, "through": 0.10, "cross": 0.15}
 
Point = tuple[float, float]
 
 
# --- geometry helpers -------------------------------------------------------
 
def to_attack_frame(player: Player, team: str) -> Point:
    """Percent -> metres, flipped so `team` always attacks toward x = 105."""
    x = player.x * PITCH_L / 100
    y = player.y * PITCH_W / 100
    return (x, y) if team == "home" else (PITCH_L - x, y)
 
 
def dist(a: Point, b: Point) -> float:
    return math.hypot(a[0] - b[0], a[1] - b[1])
 
 
def dist_to_goal(p: Point) -> float:
    return dist(p, (PITCH_L, GOAL_Y))
 
 
def point_segment_distance(p: Point, a: Point, b: Point) -> float:
    """Shortest distance from point p to the segment a-b."""
    dx, dy = b[0] - a[0], b[1] - a[1]
    length_sq = dx * dx + dy * dy
    if length_sq == 0:
        return dist(p, a)
    t = max(0.0, min(1.0, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / length_sq))
    return dist(p, (a[0] + t * dx, a[1] + t * dy))
 
 
def in_box(p: Point) -> bool:
    return p[0] >= PITCH_L - BOX_DEPTH and abs(p[1] - GOAL_Y) <= BOX_HALF_WIDTH
 
 
def threat(p: Point) -> float:
    """Goal-threat proxy: 0.5 * exp(-d/16). ~0.25 at 11 m, ~0.08 at 30 m, ~0.02 at 52 m."""
    return 0.5 * math.exp(-dist_to_goal(p) / 16)
 
 
# --- one pass ---------------------------------------------------------------
 
def analyze_pass(p: Pass, players: dict[str, Player]) -> PassAnalysis:
    passer, receiver = players[p.from_player], players[p.to_player]
    team = passer.team
    start = to_attack_frame(passer, team)
    end = to_attack_frame(receiver, team)
    distance = dist(start, end)
    forward = end[0] - start[0]
    is_turnover = receiver.team != team
 
    opponents = [to_attack_frame(o, team) for o in players.values() if o.team != team]
    blockers = sum(point_segment_distance(o, start, end) <= LANE_RADIUS_M for o in opponents)
 
    base = dict(pass_id=p.id, passer_id=passer.id, receiver_id=receiver.id, type=p.type,
                distance_m=round(distance, 1), forward_m=round(forward, 1),
                lane_blockers=blockers, is_turnover=is_turnover)
 
    if is_turnover:
        # The ball is lost: positional gains and likelihoods would be meaningless.
        return PassAnalysis(**base, is_progressive=False, enters_final_third=False, enters_box=False,
                            receiver_pressure_m=None, completion_likelihood=None, threat_gain=None)
 
    pressure = min(dist(end, o) for o in opponents)
    likelihood = (0.96
                  - 0.006 * max(0.0, distance - 15.0)           # long passes are harder
                  - 0.12 * blockers                              # defenders in the lane
                  - 0.15 * max(0.0, 4.0 - pressure) / 4.0        # receiver closed down
                  - TYPE_PENALTY[p.type])
    likelihood = min(0.98, max(0.05, likelihood))
 
    return PassAnalysis(
        **base,
        is_progressive=(dist_to_goal(start) - dist_to_goal(end)) >= PROGRESSIVE_MIN_M,
        enters_final_third=start[0] < FINAL_THIRD_X <= end[0],
        enters_box=in_box(end) and not in_box(start),
        receiver_pressure_m=round(pressure, 1),
        completion_likelihood=round(likelihood, 2),
        threat_gain=round(threat(end) - threat(start), 3),
    )
 
 
# --- whole situation --------------------------------------------------------
 
def analyze_situation(req: AnalyzeRequest) -> AnalyzeResponse:
    players = {p.id: p for p in req.players}
    results = [analyze_pass(p, players) for p in req.passes]
 
    warnings = [
        Issue(field=f"passes[{i}].to", code="receiver_is_opponent",
              message=(f"Pass '{r.pass_id}' is addressed to opponent '{_label(players[r.receiver_id])}'. "
                       "It is treated as a turnover and cannot be the key pass."))
        for i, r in enumerate(results) if r.is_turnover
    ]
 
    candidates = [r for r in results if not r.is_turnover]
    key = max(candidates, key=lambda r: r.threat_gain) if candidates else None  # ties: first wins
 
    stats = SituationStats(
        pass_count=len(results),
        turnover_count=sum(r.is_turnover for r in results),
        progressive_count=sum(r.is_progressive for r in results),
        total_distance_m=round(sum(r.distance_m for r in results), 1),
        key_pass_id=key.pass_id if key else None,
    )
    return AnalyzeResponse(summary=_summary(stats, key, players), stats=stats,
                           passes=results, warnings=warnings)
 
 
def _label(p: Player) -> str:
    return p.name or p.id
 
 
def _summary(stats: SituationStats, key: Optional[PassAnalysis], players: dict[str, Player]) -> str:
    n = stats.pass_count
    head = f"The situation consists of {n} pass{'' if n == 1 else 'es'}"
    if key is None:
        return f"{head}, none of which reaches a teammate."
    return (f"{head}, the most interesting one is from "
            f"{_label(players[key.passer_id])} to {_label(players[key.receiver_id])}.")
 