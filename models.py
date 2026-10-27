"""Contract for POST /api/analyze.

This file is the single source of truth. The client's TypeScript types are
generated from it (see export_schema.py), so the two sides cannot drift apart.

Coordinates
-----------
x and y are PERCENTAGES of the pitch (0..100), sent as plain numbers.
  x runs along the length: 0 = left goal line, 100 = right goal line
  y runs across the width: 0 = top touchline,  100 = bottom touchline
The home team attacks toward x = 100, the away team toward x = 0.
The server converts to metres (105 x 68 m pitch) itself.
"""
from typing import Annotated, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

SCHEMA_VERSION = 1

# --- reusable field types ---------------------------------------------------

# Ids end up in logs and (later) in LLM prompts, so keep them boring.
Id = Annotated[str, StringConstraints(pattern=r"^[A-Za-z0-9_-]{1,40}$")]
# Free text (names). Also untrusted: short, trimmed, never executed.
Label = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=60)]
# strict=True: "50" or "+0.09" or "22m" are rejected; only real JSON numbers pass.
Percent = Annotated[float, Field(strict=True, ge=0, le=100)]

Team = Literal["home", "away"]
PassType = Literal["ground", "lofted", "through", "cross"]


class Strict(BaseModel):
    # Unknown fields are an error, so a typo or a leftover field is reported
    # instead of being silently ignored.
    model_config = ConfigDict(extra="forbid")


# --- request ----------------------------------------------------------------

class Player(Strict):
    id: Id
    team: Team
    x: Percent
    y: Percent
    name: Optional[Label] = None
    number: Optional[Annotated[int, Field(strict=True, ge=0, le=99)]]
    position: Optional[Annotated[str, StringConstraints(max_length=8)]]


class Pass(Strict):
    id: Id
    # "from" is a Python keyword, so the Python attribute differs from the JSON key.
    from_player: Id = Field(alias="from")
    to_player: Id = Field(alias="to")
    type: PassType = "ground"


class Match(Strict):
    home_team: Label
    away_team: Label
    competition: Optional[Label]


class AnalyzeRequest(Strict):
    schema_version: Literal[1]
    match: Match
    # One frozen frame: every pass is evaluated against these positions.
    players: list[Player] = Field(min_length=2, max_length=22)
    passes: list[Pass] = Field(min_length=1, max_length=50)


# --- response ---------------------------------------------------------------

class Issue(Strict):
    """A problem with a specific field. Used for validation errors and warnings."""
    field: Optional[str]
    code: str
    message: str


class PassAnalysis(Strict):
    pass_id: str
    passer_id: str
    receiver_id: str
    type: PassType
    distance_m: float
    # Metres gained toward the opponent goal (negative = backward).
    forward_m: float
    # Receiver plays for the other team: the ball is lost.
    is_turnover: bool
    # Gets at least 10 m closer to the opponent goal.
    is_progressive: bool
    enters_final_third: bool
    enters_box: bool
    # Opponents within 3 m of the passing lane.
    lane_blockers: int
    # Distance (m) from the receiver to the nearest opponent. Null for turnovers.
    receiver_pressure_m: Optional[float]
    # Heuristic estimate, 0..1. Null for turnovers.
    completion_likelihood: Optional[float]
    # Heuristic change in goal threat (end minus start). Null for turnovers.
    threat_gain: Optional[float]


class SituationStats(Strict):
    pass_count: int
    turnover_count: int
    progressive_count: int
    total_distance_m: float
    # Pass with the highest threat_gain among non-turnovers; null if none.
    key_pass_id: Optional[str]


class AnalyzeResponse(Strict):
    summary: str
    stats: SituationStats
    passes: list[PassAnalysis]
    warnings: list[Issue]