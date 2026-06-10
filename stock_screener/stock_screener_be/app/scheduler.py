"""
주기적 시세 갱신 스케줄러 (apscheduler).

- KR 전 종목 가격(FDR):   장중(평일 09:00~15:30 KST) **10분** 주기
- KR 전 종목 펀더멘털(KIS): **하루 1회** 평일 15:40 KST (장 마감 후)
- US(yfinance):           장중(평일 09:30~16:00 ET) 10분 주기

장외·주말엔 interval job이 알아서 스킵한다.
실시간(체결 즉시)은 "고른 종목"만 KIS WebSocket으로 별도 구현 예정.
"""
import logging
from datetime import datetime, time as dtime
from zoneinfo import ZoneInfo

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from app.fetcher.kr import fetch_kr_universe, fetch_kr_fundamentals
from app.fetcher.us import fetch_us

log = logging.getLogger("scheduler")

_KST = ZoneInfo("Asia/Seoul")
_ET = ZoneInfo("America/New_York")

KR_INTERVAL_MIN = 10
US_INTERVAL_MIN = 10


def _is_open(tz: ZoneInfo, start: dtime, end: dtime) -> bool:
    now = datetime.now(tz)
    if now.weekday() >= 5:  # 토(5)/일(6) 휴장
        return False
    return start <= now.time() <= end


def _kr_universe_job() -> None:
    if not _is_open(_KST, dtime(9, 0), dtime(15, 30)):
        return
    try:
        fetch_kr_universe()
    except Exception as e:
        log.warning("KR 전종목 주기 수집 실패: %s", e)


def _kr_fund_job() -> None:
    # 마감 후 1회. (장중 안 바뀌는 EPS/BPS 기반이라 하루 1회면 충분)
    try:
        fetch_kr_fundamentals()
    except Exception as e:
        log.warning("KR 펀더멘털 수집 실패: %s", e)


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
    sched.add_job(_kr_universe_job, "interval", minutes=KR_INTERVAL_MIN,
                  id="kr_universe", max_instances=1, coalesce=True)
    sched.add_job(_us_job, "interval", minutes=US_INTERVAL_MIN,
                  id="us_poll", max_instances=1, coalesce=True)
    sched.add_job(_kr_fund_job, CronTrigger(day_of_week="mon-fri", hour=15, minute=40, timezone=_KST),
                  id="kr_fund", max_instances=1, coalesce=True)
    sched.start()
    _scheduler = sched
    log.info("시세 스케줄러 시작: KR가격 %dm / US %dm / KR펀더멘털 평일 15:40 KST",
             KR_INTERVAL_MIN, US_INTERVAL_MIN)
    return sched


def stop_scheduler() -> None:
    global _scheduler
    if _scheduler is not None:
        _scheduler.shutdown(wait=False)
        _scheduler = None
