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
      hackernews: 'bg-orange-900 text-orange-200',
      reddit: 'bg-red-900 text-red-200',
      github: 'bg-gray-800 text-gray-200',
      devto: 'bg-green-900 text-green-200',
      rss: 'bg-yellow-900 text-yellow-200'
    }
    return colors[source as keyof typeof colors] || 'bg-gray-800 text-gray-200'
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
      className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-gray-600 group"
      onClick={handleCardClick}
      style={{
        animationDelay: `${index * 100}ms`
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {trend.rank && (
            <span className="text-2xl font-bold text-orange-400">
              #{trend.rank}
            </span>
          )}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(trend.source)}`}>
            {trend.source.toUpperCase()}
          </span>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-white">
            {formatInterest(trend.interest)}
          </div>
          <div className="text-xs text-gray-400">
            {trend.source === 'github' ? 'stars' : 
             trend.source === 'reddit' ? 'upvotes' : 
             trend.source === 'hackernews' ? 'points' : 'score'}
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-white mb-3 line-clamp-3 group-hover:text-orange-400 transition-colors">
        {trend.keyword}
      </h3>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-200">
          {trend.category}
        </span>
        <span className="text-xs">
          {trend.region}
        </span>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {trend.timestamp.toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          <div className="text-xs text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
            클릭하여 확인 →
          </div>
        </div>
      </div>
    </div>
  )
}