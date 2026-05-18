"""
Application-wide constants and configuration.
"""
import os

# Database configuration
DB_HOST = os.getenv("DB_HOST", "postgres")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "playground")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_SCHEMA = os.getenv("DB_SCHEMA", "stocks")

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
}

OPS: dict[str, str] = {
    ">": ">", "<": "<", ">=": ">=", "<=": "<=", "=": "=",
}
