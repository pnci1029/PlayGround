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
    description: '',
    icon: '🍽️',
    category: 'services'
  },
  {
    name: 'Trend',
    url: config.services.trend,
    description: '',
    icon: '📈',
    category: 'services'
  },
  {
    name: 'Blog',
    url: config.services.blog,
    description: '',
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
      {/* Mobile-optimized launcher button with enhanced touch target */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-all duration-200 touch-manipulation"
        style={{
          minHeight: '44px',
          minWidth: '44px'
        }}
        aria-label="앱 런처"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-5 h-5 mx-auto">
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
          
          {/* Mobile-optimized menu content with responsive positioning */}
          <div className="absolute top-full right-0 mt-2 w-80 sm:w-80 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
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
                        className="flex items-center p-3 sm:p-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors duration-150 group touch-manipulation"
                        style={{ minHeight: '52px' }}
                      >
                        <span className="text-2xl mr-3">{app.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {app.name}
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
              
            </div>
          </div>
        </>
      )}
    </div>
  )
}