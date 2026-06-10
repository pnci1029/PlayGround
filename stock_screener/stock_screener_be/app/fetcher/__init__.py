from app.fetcher.us import fetch_us
from app.fetcher.kr import fetch_kr_universe, fetch_kr_fundamentals


def fetch_all() -> None:
    """서버 시작 시 1회 전체 수집. 가격(빠름) → 펀더멘털(느림) 순."""
    fetch_us()
    fetch_kr_universe()
    fetch_kr_fundamentals()
