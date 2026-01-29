'use client'

import Link from 'next/link'

interface HeroSectionProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  isSearchFocused: boolean
  setIsSearchFocused: (value: boolean) => void
  filteredTools: any[]
  renderIcon: (iconName: string) => React.ReactNode
}

export default function HeroSection({
  searchTerm,
  setSearchTerm,
  isSearchFocused,
  setIsSearchFocused,
  filteredTools,
  renderIcon
}: HeroSectionProps) {
  return (
    <section className="relative py-20 lg:py-32">
      {/* 메인 콘텐츠 */}
      <div className="w-full max-w-4xl mx-auto px-6 sm:px-8 text-center">
        {/* 브랜드명 */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            DEVFORGE
          </h1>
          <p className="text-lg sm:text-xl text-white/70 mb-8">
            개발자를 위한 간단한 도구 모음
          </p>
        </div>

        {/* 검색바 */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="도구 검색... (/ 키로 빠른 검색)"
              className="search-input hover-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            <div className="search-icon">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* 검색 결과 드롭다운 */}
            {searchTerm && isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/5 border border-white/20 rounded-xl backdrop-blur-md z-50">
                <div className="p-4">
                  <div className="text-sm text-white/60 mb-3">
                    검색 결과 ({filteredTools.length}개)
                  </div>
                  {filteredTools.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {filteredTools.map((tool) => (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors group"
                        >
                          <div className="w-2 h-2 bg-blue-400 rounded-full" />
                          <div className="flex-1">
                            <div className="font-medium text-white text-sm">{tool.name}</div>
                          </div>
                          <div className="text-white/40 text-xs">→</div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-white/60">
                      검색 결과가 없습니다
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/tools/json-formatter"
            className="btn btn-primary px-6 py-3 text-base"
          >
            JSON 포맷터
          </Link>
          <Link
            href="/tools"
            className="btn btn-secondary px-6 py-3 text-base"
          >
            모든 도구
          </Link>
        </div>
      </div>
    </section>
  )
}
