'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingRanking } from '../hooks/useTrendingRankings'
import { useTranslation } from '../hooks/useTranslation'

interface RankingCardProps {
  ranking: TrendingRanking
  index: number
}

export default function RankingCard({ ranking, index }: RankingCardProps) {
  const { translateText } = useTranslation()
  const [translatedKeyword, setTranslatedKeyword] = useState(ranking.keyword)
  const router = useRouter()

  useEffect(() => {
    const translate = async () => {
      const translated = await translateText(ranking.keyword)
      setTranslatedKeyword(translated)
    }
    translate()
  }, [ranking.keyword, translateText])

  const handleCardClick = (e: React.MouseEvent) => {
    // Ctrl/Cmd + 클릭 시 외부 링크로 이동
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const searchUrl = ranking.url || `https://www.google.com/search?q=${encodeURIComponent(ranking.keyword)}`
      window.open(searchUrl, '_blank', 'noopener,noreferrer')
    } else {
      // 일반 클릭 시 상세 페이지로 이동
      router.push(`/detail/${encodeURIComponent(ranking.keyword)}`)
    }
  }

  const getCategoryColor = () => {
    const colors = {
      '검색어': 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
      '쇼핑': 'from-green-500/20 to-emerald-500/20 border-green-500/30',
      '영상': 'from-red-500/20 to-pink-500/20 border-red-500/30',
      'IT': 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
      'Tech News': 'from-purple-500/20 to-indigo-500/20 border-purple-500/30',
      'Dev Article': 'from-teal-500/20 to-cyan-500/20 border-teal-500/30'
    }
    return colors[ranking.category as keyof typeof colors] || 'from-gray-500/20 to-gray-600/20 border-gray-500/30'
  }

  const getRankBadge = () => {
    if (ranking.rank <= 3) {
      const badges = {
        1: { emoji: '🥇', bg: 'bg-gradient-to-r from-yellow-400 to-yellow-600', text: 'text-white' },
        2: { emoji: '🥈', bg: 'bg-gradient-to-r from-gray-300 to-gray-500', text: 'text-white' },
        3: { emoji: '🥉', bg: 'bg-gradient-to-r from-amber-600 to-amber-800', text: 'text-white' }
      }
      const badge = badges[ranking.rank as keyof typeof badges]
      return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${badge.bg} ${badge.text} shadow-lg`}>
          <span>{badge.emoji}</span>
          <span className="font-bold">#{ranking.rank}</span>
        </div>
      )
    }
    
    return (
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-surface border border-border font-bold text-text-primary">
        {ranking.rank}
      </div>
    )
  }

  const getSourceIcon = () => {
    const icons = {
      'korean_search': '🔍',
      'shopping': '🛍️',
      'youtube': '📺',
      'tech': '💻',
      'hackernews': '🔥',
      'reddit': '📱',
      'github': '⭐',
      'devto': '📝',
      'rss': '📡'
    }
    return icons[ranking.source as keyof typeof icons] || '📊'
  }

  return (
    <div
      className={`
        group cursor-pointer relative overflow-hidden rounded-2xl
        bg-gradient-to-br ${getCategoryColor()}
        backdrop-blur-sm border transition-all duration-500
        hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10
        animate-fade-in-up
      `}
      onClick={handleCardClick}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* 카드 내용 */}
      <div className="relative p-6 z-10">
        <div className="flex items-start justify-between mb-4">
          {/* 순위 배지 */}
          {getRankBadge()}
          
          {/* 카테고리 + 소스 */}
          <div className="flex items-center gap-2">
            <span className="text-lg">{getSourceIcon()}</span>
            <span className="text-xs font-medium text-text-muted bg-surface/50 px-3 py-1 rounded-full">
              {ranking.category}
            </span>
          </div>
        </div>

        {/* 키워드 */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-text-primary leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
            {translatedKeyword}
          </h3>
        </div>

        {/* 통계 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
              <span className="text-sm font-medium text-text-secondary">관심도</span>
            </div>
            <span className="text-lg font-bold text-primary">
              {Math.round(ranking.score).toLocaleString()}
            </span>
          </div>
          
          {/* 더보기 아이콘 */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </div>
      </div>

      {/* 호버 효과 */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      
      {/* 상위 3위 특별 효과 */}
      {ranking.rank <= 3 && (
        <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
          <div className="w-full h-full rounded-full bg-gradient-radial from-primary to-transparent animate-ping"></div>
        </div>
      )}
    </div>
  )
}