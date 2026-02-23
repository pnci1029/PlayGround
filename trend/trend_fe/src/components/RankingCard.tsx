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
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const searchUrl = ranking.url || `https://www.google.com/search?q=${encodeURIComponent(ranking.keyword)}`
      window.open(searchUrl, '_blank', 'noopener,noreferrer')
    } else {
      router.push(`/detail/${encodeURIComponent(ranking.keyword)}`)
    }
  }

  const getRankBadge = () => {
    if (ranking.rank <= 3) {
      const badges = {
        1: { emoji: '🥇', className: 'trend-rank-gold' },
        2: { emoji: '🥈', className: 'trend-rank-silver' },
        3: { emoji: '🥉', className: 'trend-rank-bronze' }
      }
      const badge = badges[ranking.rank as keyof typeof badges]
      return (
        <div className={`trend-rank-badge ${badge.className}`}>
          <span>{badge.emoji}</span>
          <span>#{ranking.rank}</span>
        </div>
      )
    }
    
    return (
      <div className="trend-rank-badge trend-rank-default">
        <span>#{ranking.rank}</span>
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

  const getCategoryClass = () => {
    const classes = {
      '검색어': 'trend-category-search',
      '쇼핑': 'trend-category-shopping',
      '영상': 'trend-category-video',
      'IT': 'trend-category-tech',
      'Tech News': 'trend-category-news',
      'Dev Article': 'trend-category-news'
    }
    return classes[ranking.category as keyof typeof classes] || ''
  }

  return (
    <div
      className={`trend-card ${getCategoryClass()} trend-fade-in`}
      onClick={handleCardClick}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        {getRankBadge()}
        
        <div className="trend-category-badge">
          <span>{getSourceIcon()}</span>
          <span>{ranking.category}</span>
        </div>
      </div>

      <div className="trend-keyword">
        {translatedKeyword}
      </div>

      <div className="trend-stats">
        <div className="trend-interest">
          <div className="trend-interest-dot"></div>
          <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>관심도</span>
          <span className="trend-interest-value">
            {Math.round(ranking.score).toLocaleString()}
          </span>
        </div>
        
        <div style={{ opacity: 0, transition: 'opacity 0.3s ease' }} className="trend-more-icon">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </div>
    </div>
  )
}