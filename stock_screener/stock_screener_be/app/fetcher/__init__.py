from app.fetcher.us import fetch_us
from app.fetcher.kr import fetch_kr


def fetch_all() -> None:
    fetch_us()
    fetch_kr()
