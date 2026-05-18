# 프론트엔드 구조

## JS 모듈 목록

| 파일 | 역할 | 주요 export |
|------|------|-------------|
| `state.js` | 전역 상태 저장소 | `allRows`, `strategies`, `logic`, `sortCol`, `sortAsc` |
| `api.js` | 서버 fetch 래퍼 | `apiStocks()`, `apiScreen()`, `apiStrategies()`, `apiStrategy()`, `apiDca()`, `apiBacktest()` |
| `table.js` | 테이블 렌더·정렬 | `renderTable()`, `sortTable()`, `sortBy()` |
| `filter.js` | 필터 조건 UI | `addCondition()`, `removeCondition()`, `runScreen()`, `resetFilter()` |
| `strategy.js` | 전략 패널 | `renderStrategies()`, `applyStrategy()`, `openBacktest()` |
| `dca.js` | DCA 모달 | `openDca()`, `runDca()`, `closeDca()` |
| `backtest.js` | 백테스트 모달 | `openBacktest()`, `runBacktest()`, `closeBacktest()` |
| `main.js` | 부트스트랩 | `init()`, 상태 폴링 |

---

## 모듈 의존 관계

```
state.js          ← 의존 없음 (순수 변수)
api.js            ← 의존 없음
table.js          ← state.js (allRows 읽기)
filter.js         ← state.js, api.js, table.js
strategy.js       ← state.js, filter.js, api.js
dca.js            ← api.js
backtest.js       ← state.js (strategies 읽기), api.js
main.js           ← 모든 모듈
```

HTML에서 `<script>` 태그 순서가 의존성 해결을 담당한다. 번들러 없음.

---

## 전역 상태 (state.js)

```js
let allRows      = [];        // 현재 표시 중인 종목 행
let strategies   = [];        // /api/strategies 응답 캐시
let logic        = "AND";     // 필터 조건 조합 논리
let sortCol      = "market_cap";
let sortAsc      = false;
```

상태는 모듈 간에 직접 변수 공유로 관리된다 (단일 HTML SPA이므로 별도 상태관리 라이브러리 불필요).

---

## CSS 시스템

### CSS 변수 (`:root`)

```css
--bg-primary:      #0d1117;   /* 전체 배경 */
--bg-secondary:    #161b22;   /* 카드·패널 배경 */
--bg-tertiary:     #21262d;   /* 입력·행 호버 */
--border:          #30363d;   /* 경계선 */
--text-primary:    #e6edf3;   /* 본문 텍스트 */
--text-secondary:  #8b949e;   /* 보조 텍스트 */
--accent:          #58a6ff;   /* 강조색 (링크·버튼) */
--positive:        #3fb950;   /* 상승·긍정 */
--negative:        #f85149;   /* 하락·부정 */
--warning:         #d29922;   /* 경고 */
```

### 레이아웃 구조

```
body
├── .topbar                   ← 상단 바 (로고 + 버튼)
├── .main-layout
│   ├── .sidebar              ← 필터 패널 (PC: 고정 왼쪽, 모바일: 접힘)
│   └── .content-area
│       ├── #stockTable       ← 종목 테이블
│       └── .strategy-panel   ← 전략 카드 그리드
└── .modal-overlay            ← DCA / 백테스트 모달 (공통 패턴)
```

### 반응형 브레이크포인트

| 범위 | 적용 |
|------|------|
| `max-width: 768px` | 모바일: 사이드바 숨김, 테이블 수평 스크롤, 단일 컬럼 카드 |
| `max-width: 480px` | 소형 모바일: 폰트 축소, 버튼 풀 너비 |

---

## 컴포넌트 패턴

### 모달

모든 모달은 동일한 구조를 따른다:

```html
<div class="overlay" id="xxxOverlay">
  <div class="modal">
    <div class="modal-header">
      <h3>제목</h3>
      <button class="close-btn" onclick="closeXxx()">×</button>
    </div>
    <div class="modal-body">...</div>
  </div>
</div>
```

```js
function openXxx() {
  document.getElementById("xxxOverlay").style.display = "flex";
}
function closeXxx() {
  document.getElementById("xxxOverlay").style.display = "none";
}
```

오버레이 클릭으로도 닫힌다 (`overlay.onclick = (e) => { if (e.target === overlay) close(); }`).

### 필터 조건 행

조건은 동적으로 추가/제거되는 행으로 구성된다:

```html
<div class="condition-row" id="cond-{id}">
  <select class="field-select">...</select>
  <select class="op-select">...</select>
  <input class="value-input" type="number" />
  <button onclick="removeCondition('{id}')">−</button>
</div>
```

### 전략 카드

```html
<div class="strategy-card" style="border-left: 3px solid {color}">
  <div class="strategy-header">
    <span class="strategy-name">{name}</span>
    <span class="strategy-subtitle">{subtitle}</span>
  </div>
  <p class="strategy-desc">{description}</p>
  <div class="strategy-conditions">...</div>
  <div class="strategy-actions">
    <button onclick="applyStrategy('{id}')">적용</button>
    <button onclick="openBacktest('{id}')">🔬 백테스트</button>
  </div>
</div>
```

---

## 데이터 폴링

`main.js`는 앱 초기화 후 30초마다 `/api/status`를 조회해 서버 갱신 여부를 확인한다. 갱신 감지 시 `/api/stocks`를 재요청해 테이블을 업데이트한다.

```js
setInterval(async () => {
  const status = await fetch("/api/status").then(r => r.json());
  // 마지막 갱신 시각 비교 후 필요 시 재로드
}, 30_000);
```
