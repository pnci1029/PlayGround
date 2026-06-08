import asyncio

from fastapi import APIRouter, BackgroundTasks

from app.db import get_db

router = APIRouter(tags=["system"])

_refresh_running = False


@router.get("/")
def serve_index():
    # 프론트엔드는 Vercel(stock_screener_fe)로 분리됨 - 이 백엔드는 API 전용.
    return {"service": "StockScreen API", "status": "ok", "docs": "/docs"}


@router.get("/api/refresh")
async def refresh(background_tasks: BackgroundTasks):
    global _refresh_running
    if _refresh_running:
        return {"status": "already_running"}
    _refresh_running = True

    async def _run():
        global _refresh_running
        try:
            from app.fetcher import fetch_all
            await asyncio.to_thread(fetch_all)
        finally:
            _refresh_running = False

    background_tasks.add_task(_run)
    return {"status": "started"}


@router.get("/api/status")
def status():
    from app.config import DB_SCHEMA
    conn = get_db()
    
    with conn.cursor() as cur:
        cur.execute(f"SELECT market, COUNT(*) as cnt FROM {DB_SCHEMA}.stocks GROUP BY market")
        counts = {r["market"]: r["cnt"] for r in cur.fetchall()}
        
        cur.execute(f"SELECT market, finished_at FROM {DB_SCHEMA}.last_refresh")
        refreshes = {r["market"]: r["finished_at"] for r in cur.fetchall()}
    
    conn.close()
    return {
        "counts": counts,
        "last_refresh": refreshes,
        "refresh_running": _refresh_running,
    }
