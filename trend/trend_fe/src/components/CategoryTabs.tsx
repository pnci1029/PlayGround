'use client'

import { useState } from 'react'

interface Category {
  id: string
  name: string
  icon: string
  description: string
  color: string
}

const categories: Category[] = [
  { id: 'all', name: '전체', icon: '🌟', description: '모든 카테고리', color: 'bg-gradient-primary' },
  { id: '검색어', name: '검색', icon: '🔍', description: '인기 검색어', color: 'bg-accent-blue' },
  { id: '쇼핑', name: '쇼핑', icon: '🛍️', description: '인기 상품', color: 'bg-accent-green' },
  { id: '영상', name: '영상', icon: '📺', description: 'YouTube 트렌드', color: 'bg-accent-red' },
  { id: 'IT', name: 'IT', icon: '💻', description: '기술 트렌드', color: 'bg-accent-yellow' },
  { id: 'Tech News', name: '테크뉴스', icon: '📰', description: '글로벌 기술 뉴스', color: 'bg-accent-orange' }
]

interface CategoryTabsProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  categoryCounts: { [key: string]: number }
}

export default function CategoryTabs({ selectedCategory, onCategoryChange, categoryCounts }: CategoryTabsProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  return (
    <div className="mb-8">
      <div className="relative overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 pb-4 min-w-max">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id
            const count = categoryCounts[category.id] || 0
            const isHovered = hoveredCategory === category.id
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`
                  relative group flex items-center gap-3 px-6 py-4 rounded-2xl
                  transition-all duration-300 ease-out min-w-fit whitespace-nowrap
                  ${isSelected 
                    ? 'bg-primary text-background scale-105 shadow-2xl shadow-primary/30' 
                    : 'bg-surface/50 hover:bg-surface text-text-primary hover:scale-102'
                  }
                  ${isHovered && !isSelected ? 'shadow-lg shadow-surface/20' : ''}
                `}
              >
                {/* 아이콘 */}
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300
                  ${isSelected ? 'bg-background/20' : 'bg-primary/10'}
                `}>
                  <span className="text-lg">{category.icon}</span>
                </div>
                
                {/* 텍스트 */}
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{category.name}</span>
                    {count > 0 && (
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-bold
                        ${isSelected 
                          ? 'bg-background/30 text-background' 
                          : 'bg-primary/20 text-primary'
                        }
                      `}>
                        {count}
                      </span>
                    )}
                  </div>
                  <span className={`
                    text-xs transition-all duration-300
                    ${isSelected ? 'text-background/80' : 'text-text-muted'}
                  `}>
                    {category.description}
                  </span>
                </div>

                {/* 선택 인디케이터 */}
                {isSelected && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-2 h-2 rounded-full bg-background animate-pulse"></div>
                  </div>
                )}

                {/* 호버 효과 */}
                {isHovered && !isSelected && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-secondary/5 pointer-events-none"></div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}