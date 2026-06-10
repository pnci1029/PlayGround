# StockScreen 프로젝트 문서

> **한국어 기반 주식 스크리너 & 포트폴리오 분석 도구**

---

## 📂 문서 목록

| 파일 | 내용 |
|------|------|
| [overview.md](./overview.md) | 프로젝트 목적 · 비전 · 핵심 컨셉 |
| [architecture.md](./architecture.md) | 기술 스택 · 파일 구조 · 데이터 흐름 |
| [api.md](./api.md) | 전체 API 엔드포인트 레퍼런스 |
| [frontend.md](./frontend.md) | JS 모듈 구조 · CSS 시스템 · 컴포넌트 패턴 |
| [data.md](./data.md) | DB 스키마 · 데이터 소스 · 필드 정의 |
| [kis.md](./kis.md) | **KIS 한국투자증권 OpenAPI 연동** · 자동 갱신 스케줄러 |
| [features.md](./features.md) | 현재 기능 목록 · 완성도 현황 |
| [roadmap.md](./roadmap.md) | 개발 예정 기능 · 우선순위 |

---

## 빠른 시작

```bash
# 의존성 설치
pip install fastapi uvicorn yfinance FinanceDataReader pandas

# 서버 실행 (포트 8005)
cd stock_screener_be
python main.py
```

브라우저에서 `http://localhost:8005` 접속.

---

## 현재 버전

| 항목 | 내용 |
|------|------|
| 버전 | v0.3.0 (beta) |
| 스택 | FastAPI · PostgreSQL · Vanilla JS |
| 데이터 | FDR(KR 가격) · KIS(KR 펀더멘털) · yfinance(US) |
| 커버리지 | US 30종목 · KR 전 종목 ~2,600 (KOSPI+KOSDAQ 보통주) |
| 갱신 | KR 가격 10분 / KR 펀더멘털 하루1회 / US 10분 (apscheduler) |
| 목표 플랫폼 | 모바일 우선 · PC 반응형 |
