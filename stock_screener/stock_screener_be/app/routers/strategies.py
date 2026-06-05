from typing import Optional

from fastapi import APIRouter, Query

from app.models import Condition, ScreenRequest
from app.routers.stocks import screen_stocks
from strategies import STRATEGIES

router = APIRouter(prefix="/api", tags=["strategies"])


@router.get("/strategies")
def list_strategies():
    return [
        {
            "id":          k,
            "name":        v["name"],
            "subtitle":    v.get("subtitle", ""),
            "description": v["description"],
            "group":       v.get("group", "classic"),
            "phase":       v.get("phase"),
            "color":       v.get("color", "#58a6ff"),
            "conditions":  v["conditions"],
            "logic":       v.get("logic", "AND"),
        }
        for k, v in STRATEGIES.items()
    ]


@router.get("/strategy/{strategy_id}")
def apply_strategy(
    strategy_id: str,
    market: Optional[str] = Query(None),
    sort:   str = Query("market_cap"),
    order:  str = Query("desc"),
):
    if strategy_id not in STRATEGIES:
        return {"error": "strategy not found"}

    s = STRATEGIES[strategy_id]
    req = ScreenRequest(
        conditions=[Condition(**c) for c in s["conditions"]],
        logic=s.get("logic", "AND"),
        market=market or None,
        sort=sort,
        order=order,
    )
    return screen_stocks(req)
