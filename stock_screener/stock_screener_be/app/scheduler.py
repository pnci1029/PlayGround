"""
주기적 시세 갱신 스케줄러 (apscheduler).

- KR(KIS):     장중(평일 09:00~15:30 KST) 30초 주기
- US(yfinance): 장중(평일 09:30~16:00 ET) 10분 주기 — yfinance 과호출/차단 방지
장외·주말에는 각 job이 알아서 건너뛴다(스킵).

max_instances=1 + coalesce=True 로 이전 수집이 안 끝났으면 겹쳐 돌지 않게 한다.
"""
import logging
from datetime import datetime, time as dtime
from zoneinfo import ZoneInfo

from apscheduler.schedulers.background import BackgroundScheduler

from app.fetcher.kr import fetch_kr
from app.fetcher.us import fetch_us

log = logging.getLogger("scheduler")

_KST = ZoneInfo("Asia/Seoul")
_ET = ZoneInfo("America/New_York")

KR_INTERVAL_SEC = 30
US_INTERVAL_MIN = 10


def _is_open(tz: ZoneInfo, start: dtime, end: dtime) -> bool:
    now = datetime.now(tz)
    if now.weekday() >= 5:  # 토(5)/일(6) 휴장
        return False
    return start <= now.time() <= end


def _kr_job() -> None:
    if not _is_open(_KST, dtime(9, 0), dtime(15, 30)):
        return
    try:
        fetch_kr()
    except Exception as e:
        log.warning("KR 주기 수집 실패: %s", e)


def _us_job() -> None:
    if not _is_open(_ET, dtime(9, 30), dtime(16, 0)):
        return
    try:
        fetch_us()
    except Exception as e:
        log.warning("US 주기 수집 실패: %s", e)


_scheduler: BackgroundScheduler | None = None


def start_scheduler() -> BackgroundScheduler:
    global _scheduler
    if _scheduler is not None:
        return _scheduler
    sched = BackgroundScheduler(timezone="UTC")
    sched.add_job(_kr_job, "interval", seconds=KR_INTERVAL_SEC,
                  id="kr_poll", max_instances=1, coalesce=True)
    sched.add_job(_us_job, "interval", minutes=US_INTERVAL_MIN,
                  id="us_poll", max_instances=1, coalesce=True)
    sched.start()
    _scheduler = sched
    log.info("시세 스케줄러 시작: KR %ds(장중) / US %dm(장중)",
             KR_INTERVAL_SEC, US_INTERVAL_MIN)
    return sched


def stop_scheduler() -> None:
    global _scheduler
    if _scheduler is not None:
        _scheduler.shutdown(wait=False)
        _scheduler = None
