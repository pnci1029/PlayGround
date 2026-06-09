"""
KIS 연동 점검 스크립트.

실행:
    cd stock_screener_be
    python kis_test.py
"""
import logging

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")

from app.config import KIS_ENV
from app.kis.quote import domestic_price, overseas_price

if __name__ == "__main__":
    print(f"\n[KIS_ENV = {KIS_ENV}]\n")

    print("=== 국내: 삼성전자(005930) ===")
    try:
        print(domestic_price("005930"))
    except Exception as e:
        print("국내 조회 실패:", repr(e))

    print("\n=== 해외: AAPL (NAS) ===")
    try:
        print(overseas_price("AAPL", "NAS"))
    except Exception as e:
        print("해외 조회 실패:", repr(e))
