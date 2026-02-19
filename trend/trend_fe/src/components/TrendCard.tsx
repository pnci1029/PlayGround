'use client'

import { TrendData } from '../hooks/useTrends'

interface TrendCardProps {
  trend: TrendData
  index: number
}

export default function TrendCard({ trend, index }: TrendCardProps) {
  const getSourceColor = (source: string) => {
    const colors = {
      hackernews: 'text-orange-400',
      reddit: 'text-red-400',
      github: 'text-gray-300',
      devto: 'text-green-400',
      rss: 'text-yellow-400'
    }
    return colors[source as keyof typeof colors] || 'text-gray-300'
  }

  const getBadgeColor = (source: string) => {
    const colors = {
      hackernews: 'source-badge source-hackernews',
      reddit: 'source-badge source-reddit',
      github: 'source-badge source-github',
      devto: 'source-badge source-devto',
      rss: 'source-badge source-rss'
    }
    return colors[source as keyof typeof colors] || 'source-badge source-github'
  }

  const formatInterest = (interest: number) => {
    if (interest >= 1000000) {
      return `${(interest / 1000000).toFixed(1)}M`
    } else if (interest >= 1000) {
      return `${(interest / 1000).toFixed(1)}K`
    }
    return interest.toString()
  }

  const handleCardClick = () => {
    if (trend.url) {
      window.open(trend.url, '_blank', 'noopener,noreferrer')
    } else {
      // URL이 없으면 구글 검색
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(trend.keyword)}`
      window.open(searchUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const getCardVariant = () => {
    if (trend.rank && trend.rank <= 3) {
      return "trend-card trend-card-featured p-8 cursor-pointer group animate-fade-in hover-lift"
    } else if (trend.rank && trend.rank <= 10) {
      return "trend-card trend-card-elevated p-7 cursor-pointer group animate-fade-in hover-lift"
    }
    return "trend-card p-6 cursor-pointer group animate-fade-in hover-lift"
  }

  return (
    <div 
      className={getCardVariant()}
      onClick={handleCardClick}
      style={{
        animationDelay: `${index * 100}ms`
      }}
    >
      {/* 헤더 섹션 */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          {trend.rank && (
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-primary text-white font-bold text-lg">
              {trend.rank}
            </div>
          )}
          <span className={getBadgeColor(trend.source)}>
            {trend.source.toUpperCase()}
          </span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-text-primary mb-1">
            {formatInterest(trend.interest)}
          </div>
          <div className="text-xs text-text-muted uppercase tracking-wide">
            {trend.source === 'github' ? 'stars' : 
             trend.source === 'reddit' ? 'upvotes' : 
             trend.source === 'hackernews' ? 'points' : 'score'}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-text-primary mb-4 line-clamp-3 group-hover:text-primary transition-all duration-300 leading-relaxed">
          {trend.keyword}
        </h3>

        <div className="flex items-center justify-between">
          <span className="glass px-4 py-2 rounded-full text-sm text-text-secondary font-semibold">
            {trend.category}
          </span>
          <span className="text-sm text-text-muted flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            {trend.region}
          </span>
        </div>
      </div>

      {/* 푸터 섹션 */}
      <div className="pt-4 border-t border-glass-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-accent-green animate-pulse"></span>
            {trend.timestamp.toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          <div className="text-sm text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 font-medium">
            <span>상세보기</span>
            <span className="group-hover:translate-x-1 transition-transform text-lg">→</span>
          </div>
        </div>
      </div>
    </div>
  )
}