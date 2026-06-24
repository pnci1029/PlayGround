# AI 소설 생성 — LLM 기법 & 프롬프팅 리서치

> LLM(특히 OpenAI GPT 계열)으로 "읽을거리"(소설/단편/인터랙티브 픽션)를 생성할 때의 기술·프롬프팅 기법 정리.
> 출처: arXiv 논문, OpenAI 공식 문서/쿡북, 엔지니어링 블로그(gwern, LessWrong 등) 교차 검증.
> 작성: 2026-06-24

---

## 0. 핵심 요약 (TL;DR)

- **한 번의 거대한 프롬프트로 긴 소설을 뽑지 말 것.** 검증된 모든 방법(Re3, DOC, Dramatron, RecurrentGPT, DOME)이 공통적으로 **"계획 → 확장"의 계층적/반복적 생성**을 쓴다. 짧은 단편이라도 "아웃라인 → 산문" 2단계가 품질을 크게 높인다.
- **AI 티(AI-ese)·보라색 산문(purple prose)·클리셰는 시스템 프롬프트에서 명시적으로 금지**해야 줄어든다. "없는 것 말고 있는 것을 묘사", "안티테제 구문 금지" 같은 구체적 규칙이 효과적.
- **모델**: gpt-4.1 또는 gpt-4.1-mini. (본 프로젝트는 비용 우선 → **mini** 채택.)
- **제목+챕터 반환은 Structured Outputs(JSON Schema, strict)** 로 강제.
- **사용자 키워드는 무료 `omni-moderation-latest`로 사전 필터링** + 출력 사후 검사.
- 창작용 샘플링: **temperature 0.8~1.0, top_p 0.9~1.0, frequency_penalty 0.3~0.7, presence_penalty 0.3~0.6**.

---

## 1. 프롬프팅 기법 (Creative/Fiction Prompting)

### 1.1 시스템 프롬프트 / "소설가" 페르소나
- **작업을 "픽션"으로 프레이밍**하면 어두운 주제·강한 목소리를 더 일관되게 다루고 검열 거부도 준다.
- "좋은 모델 + 정확히 원하는 것 말하기 + 초기 장면 제공 + 공격적 리라이트"가 품질의 핵심.
- 창작 블록을 다른 규칙(사실성/간결성)과 **분리**하라 — 묘사를 살리려면 간결 제약을 창작 블록에선 풀어야.
- **너무 짧은 시스템 프롬프트는 역효과**. 풍부한 스타일 가이드가 더 나은 통제력.

### 1.2 장르/톤/스타일 컨디셔닝 (SF/판타지/추리)
- 형용사("생생하게")만 요청하면 보라색 산문으로 빠진다. 대신 **실제 객체·실제 메커니즘·감각적 디테일** 같은 *기계적 제약*을 줘라.
  - SF: 실제 기술 시스템으로 근거화 → 환상이 "필연적"으로 느껴짐.
- *적용:* 장르별 "근거화 어휘 사전"을 만들어 시스템 프롬프트에 주입(추리=알리바이/물증/타임라인, 판타지=마법 체계의 규칙/대가).

### 1.3 구조 기법

| 기법 | 핵심 | LLM 적용 |
|---|---|---|
| **3막 구조** | 시작-중간-끝 | 짧은 단편 기본값 |
| **Save the Cat 비트 시트** | 3막을 15개 비트로(백분율 위치) | "비트별 1~2문단" 생성 |
| **Snowflake Method** | 한 문장→10단계 점진 확장(프랙탈) | "로그라인 → 문단 → 인물 → 장면 → 산문" outline-then-expand |

- *적용:* 키워드 → **① 로그라인 → ② 비트 시트(JSON) → ③ 비트별 산문**. Snowflake의 "한 문장에서 확장"이 키워드 입력 UX와 자연스럽게 맞물림.

### 1.4 길이·페이싱·챕터 제어
- 절대 단어수보다 **구조적 단위(비트/장면 수)** 로 길이를 통제할 때 더 안정적. max tokens로 캡.
- 챕터 경계는 **Structured Outputs `chapters:[{title,body}]`** 로 강제하면 깔끔.

### 1.5 화자/시점(POV)·few-shot
- **인물 심리부터 브레인스토밍**(동기·내적 갈등) 후 장면으로 — 캐릭터 입체화.
- 스테레오타입 회피: "수학 천재"라 부르지 말고 그가 *실제로 무엇을 아는지* 서술.
- 원하는 문체 2~3문단을 few-shot으로(단, 저작권 텍스트 직접 삽입 금지, 톤만 추출).
- POV/시제는 시스템 프롬프트에 못박기("3인칭 제한적, 과거시제").

### 1.6 클리셰·"AI 티"·purple prose 제거 (가장 실전적) — `STYLE BANS`
gwern 2025 시스템 프롬프트에서 검증된 구체적 금지 규칙:
- **안티테제 구문 금지:** "It was not X, but Y" (한국어 "단순한 X가 아니라 Y였다").
- **리스트-부정 금지:** "No X, no Y—just Z".
- **"없는 것"이 아니라 "있는 것"을 묘사**(부재 묘사는 대표적 AI tell).
- **따뜻한 색조(노랑/갈색/세피아) 향수성 묘사 금지.**
- **감상주의·노력 없는 깨달음(unearned epiphany) 금지** — 행동에서 주제를 추론하게, 설교 금지.
- **수행적 헤징 제거**, 감정 일반화보다 **기술적 구체성** 선호.
- *적용:* 위를 시스템 프롬프트 `STYLE BANS` 블록으로 삽입. (여유 있으면 생성 후 "위반 찾아 리라이트" self-critique 1패스 추가 — 비용 트레이드오프.)

### 1.7 샘플링 파라미터 (창작용)

| 파라미터 | 권장 | 효과 |
|---|---|---|
| temperature | 0.8~1.0 | 창의성↑(과하면 일관성 붕괴) |
| top_p | 0.9~1.0 | 동적 어휘 범위 |
| frequency_penalty | 0.3~0.7 | 반복 억제(필수) |
| presence_penalty | 0.3~0.6 | 새 주제 도입 |

- temp/top_p 동시 극단 금지. **아웃라인 단계=낮은 temp(0.4~0.6), 산문 단계=높은 temp(0.9~1.0)** 분리가 실전 팁. 디버깅엔 `seed` 고정.

---

## 2. 생성 아키텍처 / 워크플로

### 2.1 계층적·다단계 생성
모든 검증된 시스템의 공통 골격. 단편이라도 **최소 2단계(아웃라인→산문)** 채택 가치.

### 2.2 명명된 방법론 (Named Methods)

| 방법 | 출처 | 핵심 | 특징 |
|---|---|---|---|
| **Re3** | EMNLP 2022 (arXiv 2210.06774) | Plan→Draft→Rewrite(리랭킹)→Edit | 플롯 일관성 +14%p, 전제 관련성 +20%p |
| **DOC** | Yang 2022 | 상세 아웃라인 선생성으로 일관 통제 | Re3 후속 |
| **Dramatron** | DeepMind CHI 2023 (2209.14958) | 프롬프트 체이닝 3계층(로그라인→인물/플롯/장소→대사) | 단편에 가장 단순·강력 |
| **RecurrentGPT** | arXiv 2305.13304 | 언어로 LSTM 모방(단기=현 단락 요약, 장기=누적 요약) + Plan→Content→Prompt 루프 | 반복·인터랙티브 |
| **DOME** | arXiv 2412.13575 | 거친 아웃라인 + 동적 상세 아웃라인 + 시간 지식그래프 메모리 | 고정 아웃라인 한계 극복 |

> **본 앱 권장:** 단편이면 **Dramatron식 계층 프롬프트 체이닝**(로그라인→비트→산문)이 최적. 연재/장편 확장 시 RecurrentGPT 누적 메모리 + DOME 동적 아웃라인.

### 2.3 일관성·연속성 유지 (memory / "story bible")
- **SCORE**(arXiv 2503.23512): 동적 상태 추적 + 계층 요약 + 하이브리드 RAG(FAISS+TF-IDF+감정정렬) → 일관성 +23.6%, 환각 -41.8%.
- 연속성 오류는 **사실·시간 차원, 서사 중반부, 고엔트로피 구간**에 몰림("Lost in Stories"). → 중반부 집중 검증.
- *적용:* 인물/설정/타임라인을 **JSON 상태 객체(story bible)** 로 따로 관리해 매 호출 앞부분에 주입, 생성 후 LLM이 상태 갱신. (단편 MVP에선 과함 — 장편 확장 시.)

### 2.4 Structured Outputs로 챕터 반환
- **Structured Outputs > JSON mode** (스키마 준수 보장). 지원: gpt-4o-2024-08-06+, gpt-4o-mini, gpt-4.1 계열.
- JS는 Zod 스키마 → SDK 자동 변환, 또는 `response_format:{type:"json_schema", json_schema:{...}, strict:true}` + `additionalProperties:false`.
- *적용:* `{title, logline, chapters:[{title,body}]}` 스키마로 한 번에. **단, 긴 산문은 챕터별 개별 호출**이 max-token 잘림·품질 면에서 유리(스키마는 아웃라인에, 산문은 스트리밍).

### 2.5 스트리밍 (UX)
- 산문은 `stream=True`로 "써지는" 경험 → 체감 지연↓. 아웃라인/JSON은 비스트리밍, 산문만 스트리밍하는 하이브리드.

### 2.6 RAG (연재형)
- 연재 웹소설이면 과거 화 요약·설정을 벡터DB에 저장, 새 화 생성 시 관련 top-N 검색 주입(SCORE 패턴). 단편 MVP엔 불필요.

---

## 3. OpenAI API 실무 팁

### 3.1 모델 선택 (2025~2026)
- **gpt-4.1**: gpt-4o 대비 ~26% 저렴, 100만 토큰 컨텍스트, 지시 준수 우수.
- **gpt-4.1-mini**: gpt-4o급 지능에 지연 ~50%↓, 비용 ~83%↓. → **본 앱 채택**.
- **gpt-4.1-nano**: 분류/라우팅/짧은 후처리용.
- o-시리즈(추론): 산문보다 **플롯 일관성 검증·구조 설계**에 유용(비용·지연 높음).
- (참고: gwern은 순수 문학성에서 Claude Opus 4를 최고로 평가 — 멀티프로바이더 여지.)

#### 모델 선택 가이드 — "더 작은(싼) 모델은 안 되나?"

소설 같은 **창작 산문은 모델 체급에 민감**하다. 작은 모델일수록 ①플롯이 중간에 무너지고 ②클리셰·반복("AI 티")이 늘고 ③지시(POV/시제/금지규칙)를 덜 지킨다. 그래서 **"읽을 만한" 소설의 현실적 하한선은 mini 급**이다.

| 체급 | 대표 모델 | 소설 적합도 | 메모 |
|------|-----------|-------------|------|
| 대형 | gpt-4.1 / gpt-4o | ★★★ | 품질 최상, 비용↑ |
| **중소(mini)** | **gpt-4.1-mini** / gpt-4o-mini | ★★ | **가성비 스윗스팟 — 본 앱 채택** |
| 초소형(nano) | gpt-4.1-nano | ★ | 분류·후처리용. **산문엔 부적합** |
| 구형 소형 | gpt-3.5-turbo | ☆ | 단편엔 가능하나 클리셰·일관성 약함. **신규 채택 비권장** |

> **"3.6 mini" 관련 메모:** OpenAI에는 `gpt-3.6` 같은 모델이 없다(아마 `gpt-3.5` 또는 `o3-mini`/`gpt-4o-mini`와 혼동). 정리하면:
> - **gpt-3.5-turbo**: 옛날 소형 모델. 가장 싸지만 소설 품질(일관성·문체)이 눈에 띄게 떨어져 **신규 프로젝트엔 권장하지 않음**.
> - **gpt-4o-mini / gpt-4.1-mini**: 3.5보다 훨씬 똑똑한데 가격은 비슷하거나 더 쌈 → **"작은 모델"을 원해도 3.5 대신 이쪽이 정답.**
> - **o3-mini / o4-mini**(추론 모델): 수학·코딩·논리 검증용. 창작 산문엔 굳이 불필요.
>
> **결론:** 비용을 아끼려는 의도라면 `gpt-3.5`로 내려가지 말고 **`gpt-4.1-mini`(또는 `gpt-4o-mini`)에 머무는 것이 옳다.** 더 내려가면(nano/3.5) 절약액은 작은데 품질 손해가 크다. 반대로 산문이 밋밋하면 **산문 단계만** `gpt-4.1`로 올리는 게 효율적이다. (mini도 단편 1편이 매우 저렴 + 하루 3개 상한이 비용 캡 역할.)

### 3.2 토큰/비용 통제
- **프롬프트 캐싱**(자동·무료): 입력 토큰 비용 최대 90%↓(gpt-4.1 75% 할인), 지연 ~80%↓. → **반복 접두부(시스템 프롬프트·스타일 가이드·story bible)를 프롬프트 앞쪽에 고정**해 캐시 적중 극대화.
- **Batch API/Flex**: 비실시간 대량 생성 50% 할인(미리 생성형 콘텐츠에).
- 산문은 챕터 단위 분할 호출로 max-token 잘림·재생성 낭비 방지.

### 3.3 Structured Outputs / JSON
→ §2.4. 제목+챕터 반환 표준.

---

## 4. 품질 평가 & 안전

### 4.1 모더레이션
- **`omni-moderation-latest`**(무료, GPT-4o 기반): `flagged` + `categories`.
- 범주: sexual, sexual/minors, harassment, hate, illicit, self-harm, violence 등.
- 창작 앱은 민감 주제 다소 허용하되 **명백 위반(특히 sexual/minors)은 무조건 차단**.
- 권장 패턴(쿡북): ① 입력 키워드 사전 모더레이션 → ② 출력 사후 모더레이션 → ③ 비동기 병렬 → ④ 계층적(차단어 사전→경량 분류기→LLM 판단→사람 검토).

### 4.2 품질 평가
- 자동 지표(BLEU류)는 창작 품질 못 잡음. **LLM-as-judge**(일관성·관련성·표현력·플롯완결성 1~5점) + 소규모 인간 평가 병행.
- 차원별 루브릭: ①플롯 일관성 ②키워드 관련성 ③캐릭터 일관성 ④문체 독창성(클리셰/AI-ese) ⑤페이싱.
- **self-critique 패스**(STYLE BANS 위반·플롯 구멍 리라이트)가 비용 대비 가장 효과 큰 품질 향상 수단(Re3 Edit과 동형).

---

## 5. 권장 레퍼런스 파이프라인 (앱 적용형)

1. **입력 검증** — 키워드 모더레이션(omni-moderation, 무료, 비동기).
2. **로그라인+비트(JSON, Structured Outputs)** — gpt-4.1-mini, temp 0.5. 키워드+장르 → {title, logline, beats, pov, tone} = story bible.
3. **산문 확장(스트리밍)** — gpt-4.1-mini, temp ~0.95, freq_penalty ~0.5. 시스템 프롬프트에 STYLE BANS 고정(캐시 적중).
4. **출력 모더레이션** — 최종 재검사.
5. **저장 + 쿼터 +1.**

비용 최적화: 반복 접두부 앞배치(캐싱) + 하루 3개 상한 + (미리 생성형은 Batch 50%↓).

---

## 출처 (Sources)

**논문/방법론**
- Re3 — https://arxiv.org/abs/2210.06774
- Dramatron — https://arxiv.org/pdf/2209.14958 · https://github.com/google-deepmind/dramatron
- RecurrentGPT — https://arxiv.org/pdf/2305.13304
- DOME — https://arxiv.org/html/2412.13575v1
- SCORE — https://arxiv.org/html/2503.23512v1
- Entity Coherence — https://arxiv.org/pdf/2202.01709
- Lost in Stories — https://arxiv.org/pdf/2603.05890
- DOC — https://www.researchgate.net/publication/372914906

**프롬프팅/문체**
- gwern, My 2025 LLM System Prompts — https://gwern.net/system-prompts-2025
- LessWrong, Creative writing with LLMs (Prompting for fiction) — https://www.lesswrong.com/posts/D9MHrR8GrgSbXMqtB/

**구조 기법**
- Save the Cat Beat Sheet — https://reedsy.com/blog/guide/story-structure/save-the-cat-beat-sheet/
- Snowflake Method — https://www.thewordling.com/the-snowflake-method/

**OpenAI 실무**
- Structured Outputs — https://developers.openai.com/api/docs/guides/structured-outputs
- Prompt Caching — https://developers.openai.com/api/docs/guides/prompt-caching
- GPT-4.1 — https://openai.com/index/gpt-4-1/
- Pricing — https://openai.com/api/pricing/
- Moderation Cookbook — https://developers.openai.com/cookbook/examples/how_to_use_moderation
- Safety best practices — https://developers.openai.com/api/docs/guides/safety-best-practices

> ⚠️ 일부 검색 결과에 미래 시점 모델명(예: "gpt-5.5")이 섞여 있었으나, 본 문서는 **현재 검증 가능한 gpt-4.1/4o 계열** 기준으로 작성. 구현 직전 OpenAI 최신 모델·가격 재확인 필요.
