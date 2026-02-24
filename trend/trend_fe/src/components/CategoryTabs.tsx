'use client'

interface Category {
  id: string
  name: string
  icon: string
  description: string
}

const categories: Category[] = [
  { id: 'all', name: '전체', icon: '🌟', description: '모든 카테고리' },
  { id: '검색어', name: '검색', icon: '🔍', description: '한국 검색어' },
  { id: '쇼핑', name: '쇼핑', icon: '🛍️', description: '쇼핑 트렌드' },
  { id: '영상', name: '영상', icon: '📺', description: '영상 콘텐츠' },
  { id: 'IT', name: 'IT', icon: '💻', description: 'IT 기술' },
  { id: 'Tech News', name: '기술뉴스', icon: '🔥', description: 'HackerNews' },
  { id: 'Dev Article', name: '개발', icon: '📝', description: '개발 아티클' }
]

interface CategoryTabsProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  categoryCounts: { [key: string]: number }
}

export default function CategoryTabs({ selectedCategory, onCategoryChange, categoryCounts }: CategoryTabsProps) {
  return (
    <div className="trend-tabs">
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id
        const count = categoryCounts[category.id] || 0
        
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`trend-tab ${isSelected ? 'active' : ''}`}
          >
            <div className="trend-tab-icon">
              <span>{category.icon}</span>
            </div>
            
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{category.name}</span>
                {count > 0 && (
                  <span className="trend-tab-count">
                    {count}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                {category.description}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}