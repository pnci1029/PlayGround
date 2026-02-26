'use client'

interface Category {
  id: string
  name: string
  icon: React.ReactNode
  description: string
}

// SVG 아이콘 컴포넌트들
const StarIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

const SearchIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M21.71 20.29L18 16.61A9 9 0 1 0 16.61 18l3.68 3.68a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.39ZM11 18a7 7 0 1 1 7-7 7 7 0 0 1-7 7Z"/>
  </svg>
)

const ShoppingIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
)

const VideoIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-10-7.27L16 14l-5 2.73V8.73z"/>
  </svg>
)

const TechIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z"/>
  </svg>
)

const NewsIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
  </svg>
)

const CodeIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
  </svg>
)

const categories: Category[] = [
  { id: 'all', name: '전체', icon: <StarIcon />, description: '모든 카테고리' },
  { id: '검색어', name: '검색', icon: <SearchIcon />, description: '한국 검색어' },
  { id: '쇼핑', name: '쇼핑', icon: <ShoppingIcon />, description: '쇼핑 트렌드' },
  { id: '영상', name: '영상', icon: <VideoIcon />, description: '영상 콘텐츠' },
  { id: 'IT', name: 'IT', icon: <TechIcon />, description: 'IT 기술' },
  { id: 'Tech News', name: '기술뉴스', icon: <NewsIcon />, description: 'HackerNews' },
  { id: 'Dev Article', name: '개발', icon: <CodeIcon />, description: '개발 아티클' }
]

interface CategoryTabsProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  categoryCounts: { [key: string]: number }
}

export default function CategoryTabs({ selectedCategory, onCategoryChange, categoryCounts }: CategoryTabsProps) {
  const handleKeyDown = (event: React.KeyboardEvent, categoryId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onCategoryChange(categoryId)
    }
  }

  return (
    <div 
      className="trend-tabs" 
      role="tablist" 
      aria-label="트렌드 카테고리 선택"
    >
      {categories.map((category, index) => {
        const isSelected = selectedCategory === category.id
        const count = categoryCounts[category.id] || 0
        
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            onKeyDown={(e) => handleKeyDown(e, category.id)}
            className={`trend-tab ${isSelected ? 'active' : ''}`}
            role="tab"
            aria-selected={isSelected}
            aria-controls={`tabpanel-${category.id}`}
            tabIndex={isSelected ? 0 : -1}
            aria-label={`${category.name} 카테고리${count > 0 ? `, ${count}개 항목` : ''}`}
          >
            <div className="trend-tab-icon" aria-hidden="true">
              {category.icon}
            </div>
            
            <div className="trend-tab-content">
              <div className="trend-tab-header">
                <span className="trend-tab-name">{category.name}</span>
                {count > 0 && (
                  <span 
                    className="trend-tab-count"
                    aria-label={`${count}개`}
                  >
                    {count}
                  </span>
                )}
              </div>
              <div className="trend-tab-description">
                {category.description}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}