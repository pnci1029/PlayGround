'use client'

import { useState, useEffect } from 'react'
import { TrendingRanking } from '../hooks/useTrendingRankings'
import { useTranslation } from '../hooks/useTranslation'

interface RankingCardProps {
  ranking: TrendingRanking
  index: number
}

export default function RankingCard({ ranking, index }: RankingCardProps) {
  const { translateText } = useTranslation()
  const [translatedKeyword, setTranslatedKeyword] = useState(ranking.keyword)

  useEffect(() => {
    const translate = async () => {
      const translated = await translateText(ranking.keyword)
      setTranslatedKeyword(translated)
    }
    translate()
  }, [ranking.keyword, translateText])

  const handleCardClick = () => {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(ranking.keyword)}`
    window.open(searchUrl, '_blank', 'noopener,noreferrer')
  }

  const getTrendIcon = () => {
    switch (ranking.trend) {
      case 'up': return '↗'
      case 'down': return '↘'
      case 'new': return '⭐'
      default: return '→'
    }
  }

  const getTrendColor = () => {
    switch (ranking.trend) {
      case 'up': return 'text-accent-green'
      case 'down': return 'text-accent-red'
      case 'new': return 'text-accent-yellow'
      default: return 'text-text-muted'
    }
  }

  return (
    <div
      className="ranking-card group cursor-pointer"
      onClick={handleCardClick}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="flex items-center justify-between">
        {/* 순위 + 키워드 */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`
            flex items-center justify-center w-10 h-10 rounded-lg font-bold
            ${ranking.rank <= 3 ? 'bg-primary text-background' : 'bg-surface text-text-primary'}
          `}>
            {ranking.rank}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-text-primary truncate group-hover:text-primary transition-colors">
              {translatedKeyword}
            </h3>
          </div>
        </div>

        {/* 점수 + 트렌드 */}
        <div className="flex items-center gap-3 ml-4">
          <div className={`text-lg font-bold ${getTrendColor()}`}>
            {getTrendIcon()}
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-primary">
              {Math.round(ranking.score)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}