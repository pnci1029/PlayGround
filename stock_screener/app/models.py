"""
Pydantic request/response models.
"""
from typing import List, Optional
from pydantic import BaseModel


class Condition(BaseModel):
    field: str
    op: str       # >, <, >=, <=, =
    value: float


class ScreenRequest(BaseModel):
    conditions: List[Condition]
    logic: str = "AND"          # AND | OR
    market: Optional[str] = None
    sort: str = "market_cap"
    order: str = "desc"
