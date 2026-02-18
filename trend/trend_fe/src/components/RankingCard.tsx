'use client'

import { TrendingRanking } from '../hooks/useTrendingRankings'
import TrendIndicator from './TrendIndicator'

interface RankingCardProps {
  ranking: TrendingRanking
  index: number
}

export default function RankingCard({ ranking, index }: RankingCardProps) {
  const getSourceColor = (source: string) => {
    const colors = {
      hackernews: 'bg-accent-orange text-white',
      reddit: 'bg-accent-red text-white',
      github: 'bg-text-muted text-white',
      devto: 'bg-accent-green text-white',
      rss: 'bg-accent-yellow text-black'
    }
    return colors[source as keyof typeof colors] || 'bg-surface text-text-primary'
  }

  const getCardVariant = () => {
    if (ranking.rank <= 3) {
      return "ranking-card ranking-card-featured hover-lift animate-fade-in"
    } else if (ranking.rank <= 10) {
      return "ranking-card ranking-card-elevated hover-lift animate-fade-in"
    }
    return "ranking-card hover-lift animate-fade-in"
  }

  const formatScore = (score: number) => {
    if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}K`
    }
    return Math.round(score).toString()
  }

  const handleCardClick = () => {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(ranking.keyword)}`
    window.open(searchUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className={getCardVariant()}
      onClick={handleCardClick}
      style={{
        animationDelay: `${index * 50}ms`
      }}
    >
      {/* 헤더 섹션 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* 순위 배지 */}
          <div className={`
            flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg
            ${ranking.rank <= 3 
              ? 'bg-gradient-primary text-white shadow-lg' 
              : 'bg-surface text-text-primary border-2 border-border'
            }
          `}>
            {ranking.rank}
          </div>
          
          {/* 순위 변동 표시 */}
          <TrendIndicator 
            direction={ranking.trend} 
            prevRank={ranking.prevRank}
            currentRank={ranking.rank}
          />
        </div>

        {/* 화제성 점수 */}
        <div className="text-right">
          <div className="text-2xl font-bold text-primary mb-1">
            {formatScore(ranking.score)}
          </div>
          <div className="text-xs text-text-muted uppercase tracking-wide">
            점수
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-text-primary mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-relaxed">
          {ranking.keyword}
        </h3>

        {/* 통계 정보 */}
        <div className="flex flex-wrap gap-3 mb-3">
          <div className="flex items-center gap-1 text-sm text-text-secondary">
            <span className="font-semibold">{ranking.mentions}</span>
            <span>언급</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-text-secondary">
            <span className="font-semibold">{ranking.engagement}</span>
            <span>상호작용</span>
          </div>
          {ranking.growthRate > 0 && (
            <div className="flex items-center gap-1 text-sm text-accent-green">
              <span className="font-semibold">+{ranking.growthRate.toFixed(1)}%</span>
              <span>증가</span>
            </div>
          )}
        </div>

        {/* 소스 배지들 */}
        <div className="flex flex-wrap gap-2">
          {ranking.sources.map((source) => (
            <span
              key={source}
              className={`
                px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                ${getSourceColor(source)}
              `}
            >
              {source}
            </span>
          ))}
        </div>
      </div>

      {/* 푸터 섹션 */}
      <div className="pt-3 border-t border-glass-border">
        <div className="flex items-center justify-between">
          <div className="text-xs text-text-muted">
            #{ranking.rank} 순위
          </div>
          <div className="text-sm text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 font-medium">
            <span>검색하기</span>
            <span className="group-hover:translate-x-1 transition-transform text-lg">→</span>
          </div>
        </div>
      </div>
    </div>
  )
}