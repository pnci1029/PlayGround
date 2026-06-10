"""
KR 종목 수집.

- fetch_kr_universe():    전 종목 가격/시총/거래량/등락률 (FinanceDataReader). 10분 주기.
- fetch_kr_fundamentals(): 전 종목 PER/PBR/ROE/EPS/52주 (KIS sweep). 하루 1회.

가격은 FDR(전 시장 1콜), 펀더멘털은 KIS(정식 API, 종목별)로 분리.
pykrx는 KRX 로그인 요구 + 해외 IP 차단 이슈로 사용하지 않음.
"""
import time
import logging
from datetime import datetime

import FinanceDataReader as fdr

from app.config import DB_SCHEMA, KR_UNIVERSE_SIZE
from app.db import get_db
from app.fetcher.common import safe_float, safe_int, upsert_price, upsert_fundamentals
from app.kis.quote import domestic_price

log = logging.getLogger("fetcher.kr")


def _kr_listing():
    """FDR KRX 상장목록(현재가 포함) — KOSPI/KOSDAQ 보통주, 시총 내림차순.
    KR_UNIVERSE_SIZE > 0 이면 상위 N개로 제한, 0이면 전 종목."""
    df = fdr.StockListing("KRX")
    df = df[df["Market"].isin(["KOSPI", "KOSDAQ"])].copy()
    df = df[~df["Name"].astype(str).str.endswith(("우", "우B"))]   # 우선주 제외
    df = df.dropna(subset=["Marcap"]).sort_values("Marcap", ascending=False)
    if KR_UNIVERSE_SIZE and KR_UNIVERSE_SIZE > 0:
        df = df.head(KR_UNIVERSE_SIZE)
    return df


def _mark_refresh(conn, market_id: int, market: str, now: str) -> None:
    with conn.cursor() as cur:
        cur.execute(
            f"""INSERT INTO {DB_SCHEMA}.last_refresh(id, market, finished_at)
                VALUES (%s, %s, %s)
                ON CONFLICT(id) DO UPDATE SET
                    market=EXCLUDED.market, finished_at=EXCLUDED.finished_at""",
            (market_id, market, now),
        )


def fetch_kr_universe() -> None:
    """전 KR 종목 가격/시총/거래량/등락률 (FDR). 가격 컬럼만 upsert."""
    df = _kr_listing()
    now = datetime.utcnow().isoformat()
    rows = []
    for _, r in df.iterrows():
        code = str(r["Code"])
        if not code.isdigit():
            continue
        rows.append(dict(
            ticker=code, market="KR", name=str(r["Name"]),
            price=safe_float(r.get("Close")),
            change_pct=safe_float(r.get("ChagesRatio")),  # FDR 컬럼명 오타가 원본임
            volume=safe_int(r.get("Volume")),
            market_cap=safe_float(r.get("Marcap")),        # 이미 원(KRW) 단위
            updated_at=now,
        ))
    conn = get_db()
    upsert_price(conn, rows)
    _mark_refresh(conn, 2, "KR", now)
    conn.commit()
    conn.close()
    log.info("KR universe (FDR): %d종목 갱신", len(rows))


def fetch_kr_fundamentals() -> None:
    """전 KR 종목 PER/PBR/ROE/EPS/52주 (KIS sweep). 펀더멘털 컬럼만 upsert.
    ROE = PBR/PER (= EPS/BPS). 종목당 1콜이라 시간이 걸려 하루 1회만 돈다."""
    codes = [str(c) for c in _kr_listing()["Code"].tolist() if str(c).isdigit()]
    now = datetime.utcnow().isoformat()
    rows = []
    ok = 0
    for code in codes:
        try:
            q = domestic_price(code)
            per = safe_float(q.get("per"))
            pbr = safe_float(q.get("pbr"))
            roe = (pbr / per) if (per and pbr) else None   # PBR/PER = ROE(소수)
            rows.append(dict(
                ticker=code, market="KR",
                per=per, pbr=pbr, roe=safe_float(roe),
                eps=safe_float(q.get("eps")),
                div_yield=None,  # KIS 기본 시세 미제공
                week52_high=safe_float(q.get("week52_high")),
                week52_low=safe_float(q.get("week52_low")),
                updated_at=now,
            ))
            ok += 1
            time.sleep(0.05)  # KIS 초당 한도 여유
        except Exception as e:
            log.warning("KR fund %s: %s", code, e)
    conn = get_db()
    upsert_fundamentals(conn, rows)
    conn.commit()
    conn.close()
    log.info("KR fundamentals (KIS): %d/%d종목 갱신", ok, len(codes))
