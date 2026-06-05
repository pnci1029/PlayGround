# 기술 아키텍처

## 기술 스택

| 레이어 | 기술 | 역할 |
|--------|------|------|
| **백엔드** | FastAPI (Python) | REST API 서버 |
| **DB** | SQLite | 종목 스냅샷 저장 |
| **데이터 수집** | yfinance, FinanceDataReader | US / KR 주식 데이터 |
| **프론트엔드** | Vanilla JS (ES6+) | SPA 구조, 모듈 분리 |
| **스타일** | CSS Variables + Flexbox/Grid | 다크 테마, 반응형 |
| **서버** | uvicorn | ASGI 서버 |

---

## 디렉터리 구조

```
stock_screener_be/
│
├── main.py                    # 진입점 — uvicorn 실행
│
├── app/                       # FastAPI 애플리케이션 패키지
│   ├── __init__.py
│   ├── main.py                # create_app() 팩토리, lifespan 훅
│   ├── config.py              # 상수 (티커 목록, 컬럼명, 허용 연산자)
│   ├── db.py                  # SQLite 연결, 테이블 초기화
│   ├── models.py              # Pydantic 요청/응답 모델
│   │
│   ├── fetcher/               # 데이터 수집 모듈
│   │   ├── __init__.py        # fetch_all() — us + kr 순차 실행
│   │   ├── common.py          # safe_float(), upsert() 공통 유틸
│   │   ├── us.py              # fetch_us() — yfinance S&P500 30종목
│   │   └── kr.py              # fetch_kr() — FDR + yfinance KR 30종목
│   │
│   └── routers/               # API 라우터 (기능별 분리)
│       ├── __init__.py
│       ├── system.py          # GET / · /api/refresh · /api/status
│       ├── stocks.py          # GET /api/stocks · POST /api/screen
│       ├── strategies.py      # GET /api/strategies · /api/strategy/{id}
│       ├── dca.py             # GET /api/dca
│       └── backtest.py        # POST /api/backtest
│
├── strategies/
│   └── __init__.py            # STRATEGIES dict — 전략 추가는 이 파일만 수정
│
├── templates/
│   └── index.html             # 단일 HTML — SPA 구조
│
├── static/
│   ├── css/
│   │   └── main.css           # 전체 스타일 (CSS 변수 기반)
│   └── js/
│       ├── state.js           # 전역 상태 (allRows, strategies, logic 등)
│       ├── api.js             # fetch 래퍼 (apiStocks, apiScreen 등)
│       ├── table.js           # 테이블 렌더링 · 정렬
│       ├── filter.js          # 필터 조건 UI · 스크리닝 실행
│       ├── strategy.js        # 전략 패널 · 코스톨라니 다이어그램
│       ├── dca.js             # DCA 계산기 모달
│       ├── backtest.js        # 백테스트 모달
│       └── main.js            # 앱 부트스트랩 · 상태 폴링
│
└── docs/                      # 프로젝트 문서
    ├── README.md
    ├── overview.md
    ├── architecture.md        ← 현재 파일
    ├── api.md
    ├── frontend.md
    ├── data.md
    ├── features.md
    └── roadmap.md
```

---

## 데이터 흐름

### 1. 서버 시작 시 (초기 데이터 로드)
```
main.py
  └─ uvicorn.run("app.main:app")
       └─ lifespan()
            ├─ init_db()          → stocks + last_refresh 테이블 생성
            └─ fetch_all()        → US 30종목 + KR 30종목 yfinance 수집
                 └─ upsert()      → SQLite stocks 테이블에 저장/갱신
```

### 2. 스크리닝 요청
```
브라우저 → POST /api/screen {conditions, logic, market, sort, order}
  └─ stocks.py router
       └─ WHERE 절 동적 생성 (화이트리스트 검증 포함)
            └─ SQLite SELECT → JSON 응답
```

### 3. 백테스트 요청
```
브라우저 → POST /api/backtest {strategy_id, start_date, end_date, market}
  └─ backtest.py router
       └─ asyncio.to_thread(_backtest)
            └─ ThreadPoolExecutor(12) 병렬 처리
                 ├─ yfinance.history()      → 기간 주가
                 ├─ yfinance.financials     → 과거 손익계산서 (정밀모드)
                 ├─ yfinance.balance_sheet  → 과거 대차대조표 (정밀모드)
                 └─ 조건 필터 → 수익률 계산 → JSON 응답
```

---

## 앱 초기화 순서 (프론트엔드)

JS 파일 로드 순서가 의존성을 결정한다:

```
state.js      ← 전역 변수 선언 (allRows, strategies, logic 등)
api.js        ← fetch 래퍼 (state에 의존하지 않음)
table.js      ← 렌더링 함수 (state.allRows 참조)
filter.js     ← 조건 UI (state.logic, api.js 참조)
strategy.js   ← 전략 패널 (state.strategies, filter.js 참조)
dca.js        ← DCA 모달 (api.js 참조)
backtest.js   ← 백테스트 모달 (state.strategies, api.js 참조)
main.js       ← 부트스트랩 (모든 모듈 초기화)
```

---

## 확장 원칙

### 전략 추가
`strategies/__init__.py`의 `STRATEGIES` dict에 항목 추가만으로 API와 UI 모두 자동 반영.

```python
"my_strategy": {
    "name": "내 전략",
    "subtitle": "부제",
    "description": "설명",
    "group": "classic",          # kostolany | classic | legendary
    "conditions": [...],
    "logic": "AND",
    "color": "#58a6ff",
}
```

### 라우터 추가
`app/routers/`에 파일 생성 후 `app/main.py`의 `create_app()`에 `include_router()` 한 줄 추가.

### JS 모듈 추가
`templates/index.html` 하단 `<script>` 태그에 순서대로 추가. 의존 모듈보다 뒤에 위치.
