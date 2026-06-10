import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import init_db
from app.fetcher import fetch_all
from app.scheduler import start_scheduler, stop_scheduler
from app.routers import system, stocks, strategies, dca, backtest, watchlist

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    asyncio.create_task(asyncio.to_thread(fetch_all))  # 시작 시 1회 즉시 수집
    start_scheduler()                                   # 이후 장중 주기 갱신
    yield
    stop_scheduler()


def create_app() -> FastAPI:
    app = FastAPI(title="StockScreen API", version="1.0.0", lifespan=lifespan)
    
    # CORS 설정 (프론트엔드에서 API 호출 가능하도록)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3005", "http://127.0.0.1:3005"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.include_router(system.router)
    app.include_router(stocks.router)
    app.include_router(strategies.router)
    app.include_router(dca.router)
    app.include_router(backtest.router)
    app.include_router(watchlist.router)
    return app


app = create_app()
