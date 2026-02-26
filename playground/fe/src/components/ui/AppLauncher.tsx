'use client'

import { useState } from 'react'
import { config } from '@/lib/config'

interface AppItem {
  name: string
  url: string
  description: string
  icon: string
  category: 'services' | 'tools' | 'community' | 'games'
}

const apps: AppItem[] = [
  {
    name: 'MoodBite',
    url: config.services.moodbite,
    description: '감정 기반 음식 추천',
    icon: '🍽️',
    category: 'services'
  },
  {
    name: 'Trend',
    url: config.services.trend,
    description: '실시간 트렌드 분석',
    icon: '📈',
    category: 'services'
  },
  {
    name: 'Blog',
    url: config.services.blog,
    description: '개인 블로그',
    icon: '📝',
    category: 'services'
  }
]

const categories = {
  services: '서비스',
  tools: '도구',
  community: '커뮤니티',
  games: '게임'
}

export default function AppLauncher() {
  const [isOpen, setIsOpen] = useState(false)

  const groupedApps = apps.reduce((acc, app) => {
    if (!acc[app.category]) acc[app.category] = []
    acc[app.category].push(app)
    return acc
  }, {} as Record<string, AppItem[]>)

  return (
    <div className="relative">
      {/* 런처 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
        aria-label="앱 런처"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
          <rect x="3" y="3" width="6" height="6" rx="1" fill="currentColor" />
          <rect x="11" y="3" width="6" height="6" rx="1" fill="currentColor" />
          <rect x="3" y="11" width="6" height="6" rx="1" fill="currentColor" />
          <rect x="11" y="11" width="6" height="6" rx="1" fill="currentColor" />
        </svg>
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <>
          {/* 백드롭 */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 메뉴 컨텐츠 */}
          <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">앱 런처</h3>
              
              {Object.entries(groupedApps).map(([category, categoryApps]) => (
                <div key={category} className="mb-4 last:mb-0">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    {categories[category as keyof typeof categories]}
                  </h4>
                  
                  <div className="space-y-1">
                    {categoryApps.map((app) => (
                      <a
                        key={app.name}
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 group"
                      >
                        <span className="text-2xl mr-3">{app.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {app.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {app.description}
                          </div>
                        </div>
                        <svg 
                          width="16" 
                          height="16" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          className="text-gray-400 group-hover:text-gray-600 transition-colors"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* 향후 확장 영역 표시 */}
              <div className="border-t border-gray-100 pt-3 mt-3">
                <div className="text-xs text-gray-400 text-center">
                  더 많은 서비스가 곧 추가됩니다
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}