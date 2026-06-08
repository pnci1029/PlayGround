# StockScreen 프론트엔드 포팅 명세서

> 원본(`develop/stock_screener` — Flask 템플릿 + 바닐라 JS)을 **Next.js(React/TSX)** 로 이식하기 위한 상세 기능 명세.
> 목표: **원본과 최대한 동일한 UI/동작**. 디자인(`main.css`)은 그대로 재사용하고 클래스명을 동일하게 유지한다.

---

## 0. 아키텍처 / 전제

- **FE/BE 분리**: 프론트는 Vercel(`stock.chhong.kr`), 백엔드는 Contabo(`stock-api.chhong.kr`, FastAPI).
- 모든 API는 상대경로 `/api/*` 로 호출 → `vercel.json` rewrite 가 `https://stock-api.chhong.kr/api/$1` 로 프록시.
- 원본은 **전역 상태 + 전역 함수 + DOM 직접조작** 방식. React 포팅 시 동일 동작을 **상태(useState/useReducer) + 선언적 렌더**로 재현한다.
- 디자인 토큰(다크 테마)·클래스명은 `main.css` 그대로. → `app/globals.css`에 원본 CSS를 100% 그대로 넣는다.
- 폰트 13px 기준, 모노스페이스 다수, 다크(`#0d1117`) 배경.

### 색상 토큰 (main.css :root)
| 변수 | 값 | 용도 |
|---|---|---|
| `--bg` | #0d1117 | 배경 |
| `--surface` | #161b22 | 바/카드 |
| `--border` | #30363d | 테두리 |
| `--border2` | #21262d | 옅은 테두리 |
| `--text` | #e6edf3 | 본문 |
| `--muted` | #8b949e | 보조 |
| `--blue` | #58a6ff | 강조/링크/티커 |
| `--green` | #3fb950 | 상승/양수 |
| `--red` | #f85149 | 하락/음수 |
| `--yellow` | #d29922 | 경고/중립경계 |
| `--purple` | #bc8cff | 전략 탭 |

---

## 1. 전역 상태 (원본 state.js)

| 상태 | 초기값 | 의미 |
|---|---|---|
| `allRows` | [] | 현재 로드된 전체 종목(스크린 결과 포함) |
| `displayRows` | [] | 정렬 적용된 표시용 행 |
| `curMkt` | 'ALL' | 시장 필터 ('ALL'\|'US'\|'KR') |
| `sortCol` | 'market_cap' | 정렬 컬럼 |
| `sortAsc` | false | 오름차순 여부 (기본 내림차순) |
| `logic` | 'AND' | 필터 결합 ('AND'\|'OR') |
| `screening` | false | 현재 스크린(필터)된 상태인지 |
| `strategies` | {} | id→전략 맵 |
| `selectedStrat` | null | 선택된 전략 id |
| `stratPanelOpen` | false | 전략 패널 열림 |

### 필터 가능 필드 (FIELDS)
`price`(가격), `change_pct`(등락률 %), `market_cap`(시가총액), `per`(PER), `pbr`(PBR), `roe`(ROE %), `eps`(EPS), `div_yield`(배당수익률), `week52_high`(52W 고가), `week52_low`(52W 저가), `volume`(거래량)

---

## 2. API 계약

| 메서드 | 경로 | 파라미터 | 응답 |
|---|---|---|---|
| GET | `/api/stocks` | `market?`, `sort=market_cap`, `order=desc`, `limit=200` | `Stock[]` |
| POST | `/api/screen` | body: `{conditions:[{field,op,value}], logic, market\|null, sort, order}` | `Stock[]` |
| GET | `/api/refresh` | — | `{}` (갱신 트리거) |
| GET | `/api/status` | — | `{refresh_running:boolean, counts:{US:number, KR:number}}` |
| GET | `/api/strategies` | — | `Strategy[]` |
| GET | `/api/dca` | `ticker, start, amount, market, freq` | `DcaResult` |
| POST | `/api/backtest` | body: `{strategy_id, start_date, end_date, market}` | `BacktestResult` |
| GET | `/api/watchlists` | — | `WatchGroup[]` |
| POST | `/api/watchlists` | body: `{name, tickers:[]}` | `{id}` |
| PUT | `/api/watchlists/:id` | body: `{name?, tickers?}` | `{}` |
| DELETE | `/api/watchlists/:id` | — | `{}` |
| GET | `/api/watchlists/:id/strategy-fit` | — | `StrategyFitResult` |
| POST | `/api/watchlists/:id/returns` | body: `{start_date}` | `ReturnsResult` |

### 타입 (응답 형태 — 원본 사용처에서 역산)

```ts
type Market = 'US' | 'KR';

interface Stock {
  ticker: string; name: string; market: Market;
  price: number|null; change_pct: number|null; market_cap: number|null;
  per: number|null; pbr: number|null; roe: number|null;        // roe/div_yield는 소수(0.10 = 10%)
  eps: number|null; div_yield: number|null; volume: number|null;
  week52_high: number|null; week52_low: number|null;
}

interface Condition { field: string; op: '<'|'<='|'>'|'>='|'='; value: number; }

interface Strategy {
  id: string; name: string; subtitle: string; investor?: string;
  description: string; color: string;
  group: 'kostolany'|'classic'|'legendary';
  conditions: Condition[]; logic: 'AND'|'OR';
}

interface DcaResult {
  error?: string;
  current_price: number; total_invested: number; final_value: number;
  profit: number; profit_pct: number; cagr: number; n_periods: number;
  history: { date: string; value: number; invested: number }[];
}

interface BacktestResult {
  error?: string;
  strategy_name: string; data_quality: 'precise'|'lite';
  start_date: string; end_date: string;
  portfolio_return: number|null; benchmark_return: number|null;
  unmatched_count?: number;
  matched: { ticker:string; name:string; return_pct:number|null;
             data_quality:'precise'|'lite'; fundamentals?:Record<string,number|string> }[];
}

interface WatchGroup { id: number; name: string; tickers: string[]; }

interface StrategyFitResult {
  error?: string;
  tickers: string[];
  strategies: { id:string; name:string; group:string }[];
  ticker_info: Record<string, { market?: Market; name?: string }>;
  matrix: Record<string, Record<string, boolean|null>>;  // matrix[ticker][stratId]
}

interface ReturnsResult {
  error?: string; start_date: string; end_date: string;
  results: { ticker:string; name?:string; start_price:number|null;
             end_price:number|null; return_pct:number|null; error?:string }[];
}
```

---

## 3. 레이아웃 (상→하)

```
┌ topbar (sticky, 48px) ───────────────────────────────────────────┐
│ StockScreen | [전체][US][KR] | [투자전략] ……spacer……              │
│ [관심종목][백테스트][DCA 계산기] ●상태점 상태텍스트 [↻새로고침]     │
├ filterbar (sticky, top:48) ──────────────────────────────────────┤
│ FILTER  [조건칩들…]  [AND/OR]  [+조건추가] [스크린] [초기화] …N개   │
├ strategy-panel (토글, 기본 닫힘) ────────────────────────────────┤
│ [코스톨라니 달걀모형 SVG] │ [전통 전략 카드…][전설 카드…][정보]    │
├ table-wrap (잔여 높이) ──────────────────────────────────────────┤
│ 정렬가능 헤더 12열 + 행들                                          │
└──────────────────────────────────────────────────────────────────┘
(모달: DCA / 백테스트 / 관심종목 — overlay)
```

높이 동기화: 원본은 `tableWrap` 높이를 `100vh - (topbar+filterbar+stratPanel)` 로 계산. React에선 flex 레이아웃(`height:100vh` 컬럼 + `flex:1` 테이블 영역, `overflow:auto`)으로 대체 가능(동일 결과).

---

## 4. 기능 상세

### 4.1 시장 필터 (topbar)
- 버튼 3개 `전체/US/KR`. 클릭 시 `curMkt` 설정, active 클래스 토글.
- 변경 시: `screening` 이면 `runScreen()`, 아니면 `loadAll()` 재호출.
- active 스타일: `.mkt-btn.active` (파란 테두리/배경).

### 4.2 상태 폴링 (topbar 우측)
- `pollStatus()` 5초 간격 setTimeout 루프.
- `/api/status` 결과:
  - `refresh_running:true` → 점 `running`(노랑 펄스), 텍스트 "갱신 중…"
  - `total>0` → 점 `ok`(초록), 텍스트 `US {us} · KR {kr}`. 그리고 `allRows`가 비어있으면 `loadAll()`.
  - `total==0` → 점 기본, 텍스트 "데이터 없음"
  - 예외 → 점 기본, 텍스트 "서버 오프라인"
- 초기 텍스트 "연결 중…".

### 4.3 새로고침
- `doRefresh()` → `GET /api/refresh` 호출만. (응답 후 폴링이 상태 반영)

### 4.4 데이터 로드
- `loadAll()`: `/api/stocks?market=…` (ALL이면 market 생략) → `allRows` 설정, `screening=false`, 정렬 적용.

### 4.5 주식 테이블 (12열)
헤더(정렬 가능, 클릭 시 `sortBy`): 티커, 종목명, 가격, 등락률, 시총, PER, PBR, ROE%, 배당%, 52W H, 52W L, **52W 위치(정렬불가)**.

정렬:
- 같은 컬럼 재클릭 → asc/desc 토글, 다른 컬럼 → 해당 컬럼 desc.
- null/undefined는 항상 뒤로. 문자열은 localeCompare.
- 정렬된 헤더에 `.sorted` 클래스 + 화살표(`▲`asc/`▼`desc).
- 정렬은 클라이언트에서 `allRows` 복사 후 수행.

셀 포맷 규칙 (table.js):
- **가격/52W**: `fmtPrice` — KR이면 `1,234원`, US면 `$1,234.00`(천단위, 소수2).
- **등락률**: `fmtChg` — `+1.23%`/`-1.23%`. 색: >0.1 `up`(초록), <-0.1 `down`(빨강), else `neu`. 부호 + 양수만.
- **시총**: `fmtCap` — ≥1e12 `T`(소수2), ≥1e9 `B`(소수1), ≥1e8 `억`(정수), else `toLocaleString`.
- **PER**: 소수1. **PBR**: 소수2.
- **ROE**: `roe*100` 소수1 + `%` (원본은 소수값을 %로).
- **배당**: `div_yield*100` 소수2 + `%`.
- null/undefined 값 → `—` (클래스 `na`).
- 티커 셀: `.ticker-cell`(파랑 굵게) + 시장 배지(`badge-us`/`badge-kr`, 라벨 US/KR).
- 종목명 셀: `.name-cell` (말줄임, title 속성에 풀네임). 없으면 ticker 표시.
- **52W 위치 sparkBar**: `(price-low)/(high-low)*100`, 0~100 clamp. 막대 폭 = pct%. 색: ≥75 초록, ≤25 빨강, else 노랑. 옆에 `{pct}%` 텍스트. 값 없으면 `—`.
- 결과 카운트: `resultCount` 에 `<span>{N}</span>개 종목`. 0개면 비움.
- 빈 결과: "조건에 맞는 종목이 없습니다." (state-box)
- 로딩 초기: "데이터 로딩 중…\n최초 실행 시 1~2분 소요됩니다."

### 4.6 필터 조건 (filterbar)
- `addCond(field='per', op='<', val='')`: 조건행 추가 — [필드 select][연산자 select][값 number][× 삭제].
  - 연산자 옵션: `< <= > >= =`.
- `delCond(id)`: 행 제거. 모든 행이 사라지면 `screening=false`, 전략선택 해제, `loadAll()`.
- `toggleLogic()`: AND↔OR 토글. 버튼 클래스 `.logic-toggle.and`(파랑)/`.or`(보라), 텍스트도 변경.
- `runScreen()`: 유효 조건 수집(field/op + 숫자값). 조건 없으면 `loadAll()`. 있으면 `POST /api/screen` → `allRows`, `screening=true`, 정렬.
  - 유효성: `value`가 NaN이 아닌 조건만 포함.
  - market: ALL이면 null.
- `resetAll()`: 조건 모두 제거, logic=AND, screening=false, 전략해제, stratInfo 비움, `loadAll()`.
- **초기 부팅 시 기본 조건 2개 자동 추가**: `per < 20`, `roe > 0.10`. (단, 부팅 시 자동 runScreen은 안 함 — loadAll 데이터가 폴링/상태로 채워짐. 조건은 입력만 돼있음.)

### 4.7 전략 패널
- `toggleStratPanel()`: 패널 open 토글, `투자전략` 탭 active 토글.
- `loadStrategies()`: `/api/strategies` → `strategies` 맵 채우고, `group==='classic'`→전통카드, `'legendary'`→전설카드 렌더.
- **코스톨라니 달걀모형**: 고정 SVG (index.html 내 하드코딩). 6개 phase 원 A~F(매집/상승/과열/분산/하락/공포), 각 그룹 클릭 → `applyStrategy('kost_A'…)`. 선택 시 해당 원 `fill`을 `#1c2128`로.
  - phase id: `kost_A`~`kost_F`, 원 id `pc-kost_X`.
- **전략 카드** (`strat-card`): 상단 색바(s.color), 이름, subtitle, investor(있으면), description, 하단 [백테스트] 버튼(클릭 시 `event.stopPropagation` 후 `openBacktest(id)`).
  - 카드 클릭 → `applyStrategy(id)`.
- `applyStrategy(id)`:
  1. 기존 선택 해제(카드 selected 제거, 모든 phase 원 fill 초기화 `#0d1117`).
  2. `selectedStrat=id`, 해당 카드 `.selected`, 해당 phase 원 fill `#1c2128`.
  3. `stratInfo` HTML: `**{name}** — {description}` + 줄바꿈 + 조건식(파랑 모노) `field op value` 를 ` {logic} ` 로 join.
  4. 조건리스트 비우고 logic=s.logic, 버튼 갱신.
  5. `s.conditions` 각각 `addCond` 로 추가.
  6. `runScreen()` 실행.
- `clearStratSelection()`: 카드 selected 제거 + phase 원 fill 초기화.

### 4.8 DCA 시뮬레이터 모달
- 열기/닫기: `openDCA`/`closeDCA`, 오버레이 바깥 클릭 닫기.
- 폼: 티커(기본 AAPL), 시작일(date, 기본 2020-01-01), 회당 금액(number, 기본 100), 시장(US/KR), 주기(monthly/weekly).
- 유효성: ticker/start 필수, amount>0. (미충족 시 무동작)
- `runDCA()`: 로딩 표시 → `GET /api/dca` → 에러면 에러박스, 성공이면 통계+차트.
- **통계 4칸** (`_renderDCAStats`):
  1. 총 투자금 (KR `₩`/US `$`), 서브: `{n_periods}회 × {단위}{amount}`
  2. 현재 가치 (파랑), 서브: `현재가 {cur}`
  3. 수익/손실 (초록/빨강, 부호+절댓값), 서브: `{±}{profit_pct}%`
  4. 연평균 수익률 CAGR (초록/빨강, `{±}{cagr}%`), 서브: "CAGR"
  - 통화 포맷: KR `₩` + toLocaleString, US `$` + (현재가는 toFixed(2), 나머지 toLocaleString).
- **차트** (`drawDCAChart`, canvas): 최근 36기간 history. 투자금(파란 점선+옅은영역) vs 평가금(손익부호색 실선+그라데이션 영역). 그리드 3선, x축 날짜 라벨(약 6개), 범례(투자금/평가금).
  - React: `<canvas ref>` + useEffect 에서 동일 Canvas 2D 로직 그대로 사용.

### 4.9 백테스트 모달
- 열기 `openBacktest(stratId?)`: 전략 select 채우고(`optgroup` 그룹별: 코스톨라니/전통 전략/전설적 투자자), stratId 있으면 선택. 시작일=3년전, 종료일=오늘 기본. 결과/에러/로딩 숨김.
- 폼: 전략 select, 시작일, 종료일, 시장(전체/US/KR), [백테스트 실행 ▶].
- `runBacktest()` 유효성: 전략·시작·종료 필수, 시작<종료. `POST /api/backtest`. 로딩 "분석 중… 30~90초". 에러 처리.
- **결과** (`_renderBtResult`):
  - 헤더: 전략명 + 품질배지(`precise`→정밀모드 초록 / `lite`→라이트모드 노랑) + 기간.
  - 통계 4칸: 전략 수익률(`matched.length`종목 등가중), 벤치마크(SPY), 초과수익 α(전략−벤치), 편입 종목 수(`총 N개 분석`).
  - 포맷 `fmt`: null→`N/A`, else `{±}{v.toFixed(2)}%`. 색: 양수 초록/음수 빨강.
  - 편입 종목 상세 리스트: 각 행 [품질점(precise초록/lite노랑) + 티커 + 이름] [fundamentals(KEY=val) + 수익률].
  - 매칭 0개 → "해당 기간에 조건에 맞는 종목이 없었습니다".
  - `lite` 모드면 하단 노란 주의 노트.

### 4.10 관심종목 모달
- 열기 `openWatchlist()` → `_loadGroups()`. 레이아웃: 좌측 그룹 사이드바 + 우측 상세.
- **그룹 CRUD**:
  - `_loadGroups`: `GET /api/watchlists` → 목록 렌더. 있으면 첫(또는 기존 active) 그룹 선택, 없으면 빈 상태.
  - `wlCreateGroup`: `prompt`로 이름 입력 → `POST /api/watchlists {name, tickers:[]}` → 새 그룹 활성화.
  - `wlRenameGroup(id,name)`: 이름 input blur/Enter → `PUT {name}`.
  - `wlDeleteGroup(id)`: `confirm` → `DELETE`.
- **상세 패널**:
  - 헤더: 이름 input(편집) + 🗑 삭제.
  - 티커 섹션: 입력(datalist=allRows 티커들) + [+추가], chips 목록(각 칩 × 삭제). 비면 "종목을 추가하세요".
    - `wlAddTicker`: 대문자화, 중복 무시, `PUT {tickers:[...,new]}`.
    - `wlRemoveTicker`: 필터 후 `PUT {tickers}`.
  - 분석 탭 2개: **전략 적합성** / **수익률 분석** (`wlSetMode`).
- **전략 적합성** (`wlRunFit`): `GET /api/watchlists/:id/strategy-fit`.
  - 그룹별(코스톨라니/전통/전설) 매트릭스 테이블: 행=티커(시장배지+티커+풀네임), 열=전략(이름 첫단어), 셀 `matrix[t][s.id]`: true `✓`(초록) / false `✗` / null `-`.
  - 하단 "전략 적합 요약": 티커별 매칭된 전략 배지 나열, 없으면 "해당 전략 없음".
  - 종목 없으면 "종목을 먼저 추가하세요".
- **수익률 분석** (`wlRunReturns`): 기준 시작일(date, 기본 1년전) + [수익률 계산]. `POST /api/watchlists/:id/returns {start_date}`. 로딩 "30~60초".
  - 메타: `{start}→{end}` + 그룹 평균(양수 pos/음수 neg).
  - 테이블: 종목, 이름, 매수가, 현재가, 수익률(부호+%, pos/neg색, null이면 error/`-`).

---

## 5. 부팅 순서 (원본 main.js 말미)
1. ResizeObserver로 높이 동기화 (React에선 flex로 대체)
2. `pollStatus()` 시작
3. `loadStrategies()`
4. 기본 조건 `addCond('per','<',20)`, `addCond('roe','>',0.10)`

---

## 6. React 컴포넌트 구조 (제안)

```
src/
  app/
    layout.tsx          # html/body + globals.css import
    page.tsx            # 'use client' 루트 — 상태/폴링/조합
    globals.css         # 원본 main.css 100% 그대로
  lib/
    api.ts              # 엔드포인트 래퍼 + 타입
    format.ts           # fmt/fmtCap/fmtPrice/fmtChg/sparkBar 포맷 헬퍼
  components/
    TopBar.tsx
    FilterBar.tsx
    StrategyPanel.tsx   # 코스톨라니 SVG + 카드
    StockTable.tsx
    DcaModal.tsx        # canvas 차트 포함
    BacktestModal.tsx
    WatchlistModal.tsx
```

상태 관리: 루트 `page.tsx`에서 `allRows/displayRows/curMkt/sort/logic/screening/strategies/selectedStrat` 보유, 콜백을 자식에 전달. 모달 open 상태도 루트.

## 7. 동일성 체크리스트 (개발 후 검증)
- [ ] 다크 테마/폰트/간격이 원본과 시각적으로 동일 (main.css 그대로라 보장)
- [ ] 12열 테이블 + 포맷 규칙 동일 (T/B/억, ₩/$, ROE·배당 ×100, sparkbar 색)
- [ ] 정렬 토글/화살표/ null 뒤로
- [ ] 필터 조건 추가/삭제/AND-OR/스크린/초기화 + 기본 2조건
- [ ] 전략 패널: 코스톨라니 SVG, 카드, applyStrategy 조건자동입력+스크린, 카드 내 백테스트 버튼
- [ ] DCA: 폼 기본값, 통계 4칸 포맷, canvas 차트(투자금 점선/평가금 실선/범례)
- [ ] 백테스트: optgroup select, 품질배지, 통계 4칸, 편입종목 리스트, lite 노트
- [ ] 관심종목: 그룹 CRUD, 칩, 전략적합 매트릭스, 수익률 테이블
- [ ] 상태 폴링 5초, 점 색/텍스트 4상태
- [ ] 반응형(≤768/≤480) 동작
```
