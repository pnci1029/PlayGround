'use client'

import React, { useState, useEffect } from 'react'
import PremiumToolCard from '@/components/ui/PremiumToolCard'
import { toolCategories } from '@/lib/tools-data'

export default function ToolCategoryGrid() {
  // 아코디언 상태 관리
  const [openCategories, setOpenCategories] = useState<string[]>(['개발 도구'])
  
  // localStorage에서 상태 복원
  useEffect(() => {
    const saved = localStorage.getItem('openCategories')
    if (saved) {
      setOpenCategories(JSON.parse(saved))
    }
  }, [])
  
  // 상태 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('openCategories', JSON.stringify(openCategories))
  }, [openCategories])
  
  const toggleCategory = (categoryName: string) => {
    setOpenCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      {Object.entries(toolCategories).map(([categoryName, tools]) => {
        const isOpen = openCategories.includes(categoryName)
        const toolCount = tools.length
        
        return (
          <section key={categoryName} className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:border-gray-200 hover:shadow-md">
            
            {/* 아코디언 헤더 - 클릭 가능한 영역 */}
            <div 
              onClick={() => toggleCategory(categoryName)}
              className="p-4 sm:p-6 cursor-pointer select-none transition-all duration-200 hover:bg-gray-50 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-sans group-hover:text-blue-600 transition-colors duration-200">
                    {categoryName}
                  </h2>
                  <span className="bg-blue-50 text-blue-600 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full border border-blue-100">
                    {toolCount}개
                  </span>
                </div>
                
                {/* 화살표 아이콘 */}
                <div className={`transform transition-transform duration-300 ${
                  isOpen ? 'rotate-90' : 'rotate-0'
                }`}>
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    className="text-gray-400 group-hover:text-blue-600 transition-colors duration-200"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 아코디언 컨텐츠 - 애니메이션 포함 */}
            <div className={`transition-all duration-500 ease-out overflow-hidden ${
              isOpen 
                ? 'max-h-[2000px] opacity-100' 
                : 'max-h-0 opacity-0'
            }`}>
              <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="h-px bg-gray-100 mb-4 sm:mb-6"></div>
                
                {/* 도구 카드 그리드 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {tools.map((tool, index) => (
                    <PremiumToolCard
                      key={`${categoryName}-${index}`}
                      title={tool.title}
                      href={tool.href}
                      category={tool.category}
                      icon={tool.icon}
                      status={tool.status}
                      isExternal={tool.isExternal || false}
                      description={tool.description}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}