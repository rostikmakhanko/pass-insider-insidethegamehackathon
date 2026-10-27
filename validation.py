"""Request validation in two steps.

1. Structure and types: Pydantic (right types, ranges, no unknown fields).
2. Cross-references: things only visible across the whole payload
   (duplicate ids, a pass naming a player that does not exist, team sizes).

Both steps report problems in the same shape, so the client handles one format:
    {"field": "passes[1].to", "code": "unknown_player", "message": "..."}
"""
from collections import Counter
from typing import Any

from pydantic import ValidationError

from errors import ApiError
from models import AnalyzeRequest, Issue

MAX_PLAYERS_PER_TEAM = 11


def parse_request(payload: Any) -> AnalyzeRequest:
    try:
        req = AnalyzeRequest.model_validate(payload)
    except ValidationError as exc:
        # include_input=False: do not echo the client's data back at them.
        errors = exc.errors(include_url=False, include_context=False, include_input=False)
        issues = [Issue(field=_path(e["loc"]), code=e["type"], message=e["msg"]) for e in errors]
        raise _validation_error(issues) from None

    issues = find_reference_issues(req)
    if issues:
        raise _validation_error(issues)
    return req


def find_reference_issues(req: AnalyzeRequest) -> list[Issue]:
    issues: list[Issue] = []

    # players: unique ids, sensible team sizes
    for pid, n in Counter(p.id for p in req.players).items():
        if n > 1:
            idx = next(i for i, p in enumerate(req.players) if p.id == pid)
            issues.append(Issue(field=f"players[{idx}].id", code="duplicate_id",
                                message=f"Player id '{pid}' is used {n} times."))
    by_team = Counter(p.team for p in req.players)
    for team in ("home", "away"):
        if by_team[team] == 0:
            issues.append(Issue(field="players", code="missing_team",
                                message=f"No players for the {team} team."))
        elif by_team[team] > MAX_PLAYERS_PER_TEAM:
            issues.append(Issue(field="players", code="too_many_players",
                                message=f"The {team} team has {by_team[team]} players (max {MAX_PLAYERS_PER_TEAM})."))

    # passes: unique ids, known players, no self-passes
    known = {p.id for p in req.players}
    seen: set[str] = set()
    for i, p in enumerate(req.passes):
        if p.id in seen:
            issues.append(Issue(field=f"passes[{i}].id", code="duplicate_id",
                                message=f"Pass id '{p.id}' is used more than once."))
        seen.add(p.id)
        for key, pid in (("from", p.from_player), ("to", p.to_player)):
            if pid not in known:
                issues.append(Issue(field=f"passes[{i}].{key}", code="unknown_player",
                                    message=f"No player with id '{pid}' in 'players'."))
        if p.from_player == p.to_player:
            issues.append(Issue(field=f"passes[{i}].to", code="same_player",
                                message="A pass needs two different players."))
    return issues


def _validation_error(issues: list[Issue]) -> ApiError:
    return ApiError(422, "validation_error", "Request validation failed",
                    details=[i.model_dump() for i in issues])


def _path(loc: tuple) -> str:
    """('passes', 1, 'to') -> 'passes[1].to'"""
    out = ""
    for part in loc:
        out += f"[{part}]" if isinstance(part, int) else (f".{part}" if out else str(part))
    return out or "(body)"