# 트렌드 순위 시스템 구현 계획

## 개요

기존의 단순 실시간 데이터 나열 방식에서 벗어나 **키워드 화제성 기반 순위 시스템**으로 전환합니다. 키워드 순위 노출 사이트를 참고하여 시간대별 화제성 순위, 순위 변동 추이를 제공하는 고도화된 트렌드 분석 시스템을 구축합니다.

## 목표

- **화제성 기반 순위**: 단순 최신순이 아닌 언급빈도, 상호작용 등을 종합한 화제성 점수로 순위 결정
- **시간대별 필터링**: 1시간, 6시간, 1일, 3일, 1주일 단위 트렌드 순위 제공
- **순위 변동 추적**: 이전 시간대 대비 순위 변동을 시각적으로 표시
- **멀티 소스 통합**: Reddit, HackerNews, GitHub, Dev.to 등 다양한 소스 데이터 통합 분석

---

## Phase 1: 핵심 순위 시스템 구축 (1주차)

### 1.1 데이터베이스 스키마 확장

#### 새로운 테이블 생성
```sql
-- 화제성 순위 테이블
CREATE TABLE trending_rankings (
  id SERIAL PRIMARY KEY,
  keyword VARCHAR(255) NOT NULL,
  timeframe ENUM('1h', '6h', '1d', '3d', '1w') NOT NULL,
  current_rank INTEGER NOT NULL,
  previous_rank INTEGER,
  trending_score DECIMAL(10,2) NOT NULL,
  mentions_count INTEGER NOT NULL,
  engagement_total INTEGER NOT NULL,
  growth_rate DECIMAL(5,2),
  sources TEXT[],
  calculated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(keyword, timeframe, DATE(calculated_at))
);

-- 시간대별 집계 통계
CREATE TABLE trending_stats_hourly (
  keyword VARCHAR(255),
  hour_timestamp TIMESTAMP,
  mentions INTEGER,
  engagement INTEGER,
  unique_sources INTEGER,
  source_breakdown JSONB,
  PRIMARY KEY(keyword, hour_timestamp)
);

-- 성능 인덱스
CREATE INDEX idx_rankings_timeframe_rank ON trending_rankings(timeframe, current_rank);
CREATE INDEX idx_rankings_calculated_at ON trending_rankings(calculated_at DESC);
CREATE INDEX idx_stats_hourly_timestamp ON trending_stats_hourly(hour_timestamp DESC);
```

**작업 파일**: `database/trending-ranking-schema.sql`

### 1.2 화제성 점수 계산 알고리즘 구현

#### 백엔드 서비스 로직
```typescript
// src/services/trendingCalculator.ts
interface TrendingScoreData {
  keyword: string
  mentions: number
  engagement: number
  sources: string[]
  timeframe: string
  growthRate: number
}

class TrendingCalculator {
  // 소스별 가중치 설정
  private sourceWeights = {
    hackernews: 2.0,    // 기술 전문성 높음
    reddit: 1.5,        // 대중적 관심도
    github: 1.8,        // 개발 트렌드
    devto: 1.3,         // 개발자 커뮤니티
    rss: 1.0            // 일반 뉴스
  }

  calculateTrendingScore(data: TrendingScoreData): number {
    const baseScore = data.mentions * 1.0
    const engagementBonus = data.engagement * 0.5
    const sourceMultiplier = this.getSourceWeight(data.sources)
    const growthBonus = Math.max(0, data.growthRate * 10)
    const timeframeMultiplier = this.getTimeframeMultiplier(data.timeframe)
    
    return (baseScore + engagementBonus + growthBonus) * sourceMultiplier * timeframeMultiplier
  }

  private getSourceWeight(sources: string[]): number {
    const weights = sources.map(source => this.sourceWeights[source] || 1.0)
    return weights.reduce((sum, weight) => sum + weight, 0) / weights.length
  }

  private getTimeframeMultiplier(timeframe: string): number {
    // 짧은 시간대일수록 높은 가중치 (급상승 트렌드 반영)
    const multipliers = { '1h': 2.0, '6h': 1.5, '1d': 1.0, '3d': 0.8, '1w': 0.6 }
    return multipliers[timeframe] || 1.0
  }
}
```

**작업 파일**: `trend_be/src/services/trendingCalculator.ts`

### 1.3 배치 처리 시스템

#### 스케줄러 구현
```typescript
// src/services/trendingScheduler.ts
class TrendingScheduler {
  // 매 10분마다 실행
  @Cron('*/10 * * * *')
  async calculateTrendingRankings() {
    const timeframes = ['1h', '6h', '1d', '3d', '1w']
    
    for (const timeframe of timeframes) {
      await this.processTimeframe(timeframe)
    }
  }

  private async processTimeframe(timeframe: string) {
    // 1. 해당 시간대 데이터 집계
    const aggregatedData = await this.aggregateData(timeframe)
    
    // 2. 화제성 점수 계산
    const scoredTrends = aggregatedData.map(data => ({
      ...data,
      score: this.calculator.calculateTrendingScore(data)
    }))
    
    // 3. 순위 매기기
    const rankedTrends = scoredTrends
      .sort((a, b) => b.score - a.score)
      .map((item, index) => ({ ...item, rank: index + 1 }))
    
    // 4. 이전 순위와 비교
    const withTrendDirection = await this.compareWithPrevious(rankedTrends, timeframe)
    
    // 5. DB 저장
    await this.saveTrendingRankings(withTrendDirection, timeframe)
  }
}
```

**작업 파일**: `trend_be/src/services/trendingScheduler.ts`

### 1.4 API 엔드포인트 구현

```typescript
// src/routes/trending.ts
router.get('/rankings', async (req, res) => {
  const { timeframe = '1h', limit = 50 } = req.query
  
  const rankings = await db.query(`
    SELECT * FROM trending_rankings 
    WHERE timeframe = $1 
    AND DATE(calculated_at) = CURRENT_DATE
    ORDER BY current_rank ASC
    LIMIT $2
  `, [timeframe, limit])

  res.json({
    timeframe,
    lastUpdate: new Date(),
    rankings: rankings.rows
  })
})

router.get('/keyword/:keyword/history', async (req, res) => {
  const { keyword } = req.params
  const { timeframe = '1d' } = req.query

  const history = await db.query(`
    SELECT calculated_at, current_rank, trending_score 
    FROM trending_rankings 
    WHERE keyword = $1 AND timeframe = $2
    ORDER BY calculated_at DESC
    LIMIT 48
  `, [keyword, timeframe])

  res.json({
    keyword,
    timeline: history.rows
  })
})
```

**작업 파일**: `trend_be/src/routes/trending.ts`

---

## Phase 2: UI/UX 개선 (2주차)

### 2.1 프론트엔드 컴포넌트 개발

#### 메인 순위 페이지
```tsx
// src/app/page.tsx
'use client'

export default function TrendRankingPage() {
  const [timeframe, setTimeframe] = useState('1h')
  const [rankings, setRankings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const timeframeOptions = [
    { value: '1h', label: '1시간' },
    { value: '6h', label: '6시간' },
    { value: '1d', label: '1일' },
    { value: '3d', label: '3일' },
    { value: '1w', label: '1주일' }
  ]

  return (
    <div className="trend-ranking-container">
      <header className="trend-header">
        <h1>실시간 트렌드 순위</h1>
        <TimeframeSelector 
          value={timeframe}
          options={timeframeOptions}
          onChange={setTimeframe}
        />
      </header>

      <RankingGrid rankings={rankings} isLoading={isLoading} />
    </div>
  )
}
```

#### 순위 카드 컴포넌트
```tsx
// src/components/RankingCard.tsx
interface RankingCardProps {
  ranking: TrendingRanking
  index: number
}

export default function RankingCard({ ranking, index }: RankingCardProps) {
  const trendDirection = getTrendDirection(ranking.current_rank, ranking.previous_rank)
  
  return (
    <div className="ranking-card" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="ranking-header">
        <div className="rank-badge">{ranking.current_rank}</div>
        <TrendIndicator direction={trendDirection} />
      </div>

      <div className="keyword-section">
        <h3 className="keyword">{ranking.keyword}</h3>
        <div className="stats-row">
          <span className="score">점수: {ranking.trending_score.toLocaleString()}</span>
          <span className="mentions">언급: {ranking.mentions_count}</span>
          {ranking.growth_rate > 0 && (
            <span className="growth">+{ranking.growth_rate}%</span>
          )}
        </div>
      </div>

      <div className="sources-section">
        {ranking.sources.map(source => (
          <SourceBadge key={source} source={source} />
        ))}
      </div>
    </div>
  )
}
```

**작업 파일들**: 
- `trend_fe/src/app/page.tsx` (기존 파일 대체)
- `trend_fe/src/components/RankingCard.tsx` (신규)
- `trend_fe/src/components/TimeframeSelector.tsx` (신규)
- `trend_fe/src/components/TrendIndicator.tsx` (신규)

### 2.2 스타일링 시스템

```css
/* src/app/globals.css */

/* 순위 카드 스타일 */
.ranking-card {
  background: var(--glass-strong);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
  animation: fade-in-up 0.6s ease forwards;
  opacity: 0;
  transform: translateY(20px);
}

.ranking-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-elevated);
}

.rank-badge {
  display: flex;
  align-items: center;
  justify-center;
  width: 40px;
  height: 40px;
  background: var(--gradient-primary);
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-size: 18px;
}

.trend-up { color: var(--accent-green); }
.trend-down { color: var(--accent-red); }
.trend-new { color: var(--primary); }

/* 시간대 선택기 */
.timeframe-selector {
  display: flex;
  gap: 8px;
  padding: 4px;
  background: var(--surface);
  border-radius: 12px;
  border: 1px solid var(--border);
}

.timeframe-option {
  padding: 8px 16px;
  border-radius: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.timeframe-option.active {
  background: var(--primary);
  color: white;
}

@keyframes fade-in-up {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**작업 파일**: `trend_fe/src/app/globals.css` (기존 파일에 추가)

---

## Phase 3: 데이터 수집 강화 (3주차)

### 3.1 데이터 수집 로직 개선

#### 메타데이터 수집 강화
```typescript
// src/services/dataCollector.ts
interface EnhancedTrendData {
  keyword: string
  source: string
  mentions: number
  engagement: number      // 좋아요, 댓글, 공유 등
  timestamp: Date
  url?: string
  category?: string
  sentiment?: number     // 감정 점수 (-1 ~ 1)
  metadata: {
    author?: string
    subreddit?: string   // Reddit 전용
    repo_stars?: number  // GitHub 전용
  }
}

class EnhancedDataCollector {
  async collectRedditTrends(): Promise<EnhancedTrendData[]> {
    const posts = await this.redditAPI.getHotPosts()
    
    return posts.map(post => ({
      keyword: this.extractKeywords(post.title),
      source: 'reddit',
      mentions: 1,
      engagement: post.ups + post.num_comments,
      timestamp: new Date(post.created_utc * 1000),
      url: post.url,
      metadata: {
        author: post.author,
        subreddit: post.subreddit
      }
    }))
  }

  async collectHackerNewsTrends(): Promise<EnhancedTrendData[]> {
    const stories = await this.hnAPI.getTopStories()
    
    return stories.map(story => ({
      keyword: this.extractKeywords(story.title),
      source: 'hackernews',
      mentions: 1,
      engagement: story.score + (story.descendants || 0),
      timestamp: new Date(story.time * 1000),
      url: story.url
    }))
  }
}
```

### 3.2 키워드 정규화 시스템

```typescript
// src/services/keywordNormalizer.ts
class KeywordNormalizer {
  private synonyms = new Map([
    ['ChatGPT', ['Chat GPT', 'chatgpt', 'OpenAI GPT']],
    ['React.js', ['React', 'ReactJS', 'react']],
    ['Node.js', ['Node', 'NodeJS', 'node']]
  ])

  normalize(keyword: string): string {
    // 대소문자, 특수문자 정규화
    const cleaned = keyword.trim().toLowerCase()
    
    // 동의어 통합
    for (const [canonical, variants] of this.synonyms) {
      if (variants.some(variant => cleaned.includes(variant.toLowerCase()))) {
        return canonical
      }
    }

    return this.capitalizeFirst(cleaned)
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}
```

**작업 파일들**:
- `trend_be/src/services/enhancedDataCollector.ts`
- `trend_be/src/services/keywordNormalizer.ts`

---

## Phase 4: 고도화 기능 (4주차)

### 4.1 키워드 상세 페이지

```tsx
// src/app/keyword/[keyword]/page.tsx
export default function KeywordDetailPage({ params }: { params: { keyword: string } }) {
  const [history, setHistory] = useState([])
  const [relatedKeywords, setRelatedKeywords] = useState([])

  return (
    <div className="keyword-detail">
      <header className="keyword-header">
        <h1>{decodeURIComponent(params.keyword)}</h1>
        <div className="keyword-stats">
          <CurrentRanking keyword={params.keyword} />
          <TrendChart data={history} />
        </div>
      </header>

      <section className="related-section">
        <h2>연관 키워드</h2>
        <RelatedKeywordGrid keywords={relatedKeywords} />
      </section>

      <section className="source-breakdown">
        <h2>소스별 언급 현황</h2>
        <SourceBreakdownChart keyword={params.keyword} />
      </section>
    </div>
  )
}
```

### 4.2 실시간 업데이트

```typescript
// WebSocket 연결로 실시간 순위 업데이트
const useRealTimeRankings = (timeframe: string) => {
  const [rankings, setRankings] = useState([])

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3001/trending/${timeframe}`)
    
    ws.onmessage = (event) => {
      const updatedRankings = JSON.parse(event.data)
      setRankings(updatedRankings)
    }

    return () => ws.close()
  }, [timeframe])

  return rankings
}
```

---

## 구현 체크리스트

### Phase 1 (1주차) - 핵심 시스템
- [ ] 데이터베이스 스키마 생성
- [ ] 화제성 점수 계산 알고리즘 구현
- [ ] 배치 처리 스케줄러 구현
- [ ] 기본 API 엔드포인트 개발
- [ ] 1시간/1일 시간대 순위 기능

### Phase 2 (2주차) - UI/UX
- [ ] 기존 UI 완전 교체
- [ ] 순위 카드 컴포넌트 개발
- [ ] 시간대 선택기 구현
- [ ] 순위 변동 표시 (화살표)
- [ ] 반응형 그리드 레이아웃

### Phase 3 (3주차) - 데이터 강화
- [ ] 메타데이터 수집 확장
- [ ] 키워드 정규화 시스템
- [ ] 소스별 가중치 조정
- [ ] 데이터 품질 개선

### Phase 4 (4주차) - 고도화
- [ ] 키워드 상세 페이지
- [ ] 트렌드 히스토리 차트
- [ ] 실시간 업데이트 (WebSocket)
- [ ] 연관 키워드 추천

## 기술 스택

**Backend**: Fastify, TypeScript, PostgreSQL, Redis, node-cron
**Frontend**: Next.js, TypeScript, TailwindCSS
**Infrastructure**: Docker, WebSocket
**External APIs**: Reddit API, Hacker News API, GitHub API

## 예상 결과물

완성 후 다음과 같은 기능을 제공하는 트렌드 순위 시스템:

1. **실시간 화제성 순위**: 키워드별 화제성 점수 기반 순위
2. **시간대별 필터**: 1시간~1주일 단위 트렌드 분석  
3. **순위 변동 추적**: 상승/하락/신규/안정 상태 표시
4. **소스별 분석**: Reddit, HackerNews 등 소스별 기여도
5. **키워드 상세 분석**: 개별 키워드의 트렌드 히스토리
6. **실시간 업데이트**: WebSocket 기반 라이브 순위 업데이트

이를 통해 사용자는 단순한 최신 데이터가 아닌, **진짜 화제가 되는 키워드**들을 시간대별로 파악할 수 있게 됩니다.