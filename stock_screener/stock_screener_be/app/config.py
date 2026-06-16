"""
Application-wide constants and configuration.
"""
import os

# 로컬 개발 시 .env 자동 로드.
# 환경변수는 루트 playground/.env 한 곳에서 통합 관리한다.
# (도커에서는 docker-compose의 env_file로 주입되므로 아래 로드는 무해하게 스킵됨)
try:
    from dotenv import load_dotenv
    _here = os.path.dirname(os.path.abspath(__file__))
    # app → stock_screener_be → stock_screener → playground(.env)
    load_dotenv(os.path.join(_here, "..", "..", "..", ".env"))
except ImportError:
    pass

# Database configuration
DB_HOST = os.getenv("DB_HOST", "postgres")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "playground")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_SCHEMA = os.getenv("DB_SCHEMA", "stocks")

# ── KIS (한국투자증권) OpenAPI ──────────────────────────────
# 조회 전용. 주문 기능은 이 프로젝트에 포함하지 않음.
KIS_ENV = os.getenv("KIS_ENV", "real").lower()   # "real"(실전) | "paper"(모의)
KIS_APP_KEY = os.getenv("KIS_APP_KEY")
KIS_APP_SECRET = os.getenv("KIS_APP_SECRET")
KIS_ACCOUNT_NO = os.getenv("KIS_ACCOUNT_NO")       # 계좌 8자리 (시세조회엔 불필요, 추후용)
KIS_ACCOUNT_PROD = os.getenv("KIS_ACCOUNT_PROD", "01")  # 상품코드 2자리

# KR 종목 유니버스 크기. 0이면 전 종목(KOSPI+KOSDAQ 보통주, 우선주 제외),
# 1 이상이면 FDR 상장목록 시가총액 상위 N개로 제한(테스트/축소용).
KR_UNIVERSE_SIZE = int(os.getenv("KR_UNIVERSE_SIZE", "0"))

SP500_TICKERS = [
    "AAPL","MSFT","NVDA","AMZN","GOOGL","META","TSLA","BRK-B","JPM","V",
    "UNH","XOM","LLY","AVGO","MA","HD","PG","JNJ","MRK","COST",
    "ABBV","BAC","CVX","NFLX","AMD","ORCL","CRM","KO","WMT","PEP",
]

KR_TICKERS = [
    "005930","000660","035720","005380","051910","068270","035420","006400",
    "028260","105560","055550","096770","012330","003550","017670","066570",
    "018260","086790","032830","009150","010130","011200","003490","034730",
    "000270","015760","034020","047050","010950","009830",
]

NUMERIC_COLS: set[str] = {
    "price", "change_pct", "market_cap", "per", "pbr",
    "roe", "eps", "div_yield", "week52_high", "week52_low", "volume",
    "debt_ratio", "eps_growth", "sales_growth",
}

OPS: dict[str, str] = {
    ">": ">", "<": "<", ">=": ">=", "<=": "<=", "=": "=",
}
