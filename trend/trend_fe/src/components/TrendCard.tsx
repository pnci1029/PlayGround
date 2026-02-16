'use client'

import { TrendData } from '../hooks/useTrends'

interface TrendCardProps {
  trend: TrendData
  index: number
}

export default function TrendCard({ trend, index }: TrendCardProps) {
  const getSourceIcon = (source: string) => {
    const icons = {
      hackernews: '🔶',
      reddit: '🤖', 
      github: '⭐',
      devto: '💻',
      rss: '📡'
    }
    return icons[source as keyof typeof icons] || '📊'
  }

  const getSourceColor = (source: string) => {
    const colors = {
      hackernews: 'bg-orange-100 text-orange-800',
      reddit: 'bg-red-100 text-red-800',
      github: 'bg-gray-100 text-gray-800',
      devto: 'bg-blue-100 text-blue-800',
      rss: 'bg-green-100 text-green-800'
    }
    return colors[source as keyof typeof colors] || 'bg-gray-100 text-gray-800'
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

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-200 group"
      onClick={handleCardClick}
      style={{
        animationDelay: `${index * 100}ms`
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {trend.rank && (
            <span className="text-2xl font-bold text-blue-600">
              #{trend.rank}
            </span>
          )}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(trend.source)}`}>
            {getSourceIcon(trend.source)} {trend.source.toUpperCase()}
          </span>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            {formatInterest(trend.interest)}
          </div>
          <div className="text-xs text-gray-500">
            {trend.source === 'github' ? 'stars' : 
             trend.source === 'reddit' ? 'upvotes' : 
             trend.source === 'hackernews' ? 'points' : 'score'}
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-3 group-hover:text-blue-600 transition-colors">
        {trend.keyword}
      </h3>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
          {trend.category}
        </span>
        <span className="text-xs">
          {trend.region}
        </span>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {trend.timestamp.toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          <div className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
            클릭하여 확인 →
          </div>
        </div>
      </div>
    </div>
  )
}