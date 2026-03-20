'use client'

import { useState } from 'react'
import { config } from '@/lib/config'

interface AppItem {
  name: string
  url: string
  description: string
  icon: string
}

const apps: AppItem[] = [
  {
    name: 'MoodBite',
    url: config.services.moodbite,
    description: 'AI 기반 맛집 추천 서비스',
    icon: '🍽️'
  },
  {
    name: 'Trend',
    url: config.services.trend,
    description: '실시간 트렌드 분석',
    icon: '📈'
  },
  {
    name: 'Blog',
    url: config.services.blog,
    description: '개발 블로그',
    icon: '📝'
  }
]

export default function AppLauncher() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      {/* Mobile-optimized launcher button with enhanced touch target */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-all duration-200 touch-manipulation"
        style={{
          minHeight: '44px',
          minWidth: '44px'
        }}
        aria-label="서비스 런처"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mx-auto transition-transform duration-200 group-hover:scale-110">
          <rect x="4" y="4" width="6" height="6" rx="2" fill="currentColor" />
          <rect x="14" y="4" width="6" height="6" rx="2" fill="currentColor" />
          <rect x="4" y="14" width="6" height="6" rx="2" fill="currentColor" />
          <rect x="14" y="14" width="6" height="6" rx="2" fill="currentColor" />
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
          <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-gray-200/60 backdrop-blur-lg z-20 overflow-hidden">
            <div className="p-5">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                    <rect x="3" y="3" width="6" height="6" rx="1" fill="currentColor" />
                    <rect x="11" y="3" width="6" height="6" rx="1" fill="currentColor" />
                    <rect x="3" y="11" width="6" height="6" rx="1" fill="currentColor" />
                    <rect x="11" y="11" width="6" height="6" rx="1" fill="currentColor" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900" style={{ fontFamily: '"Inter", sans-serif' }}>
                  서비스
                </h3>
              </div>
              
              <div className="grid gap-2">
                {apps.map((app) => (
                  <a
                    key={app.name}
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 active:from-blue-100 active:to-purple-100 transition-all duration-200 border border-transparent hover:border-blue-100 touch-manipulation"
                    style={{ minHeight: '64px' }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mr-4 group-hover:scale-105 transition-transform duration-200">
                      <span className="text-xl">{app.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200" style={{ fontFamily: '"Inter", sans-serif' }}>
                        {app.name}
                      </div>
                      <div className="text-xs text-gray-500 group-hover:text-blue-600 mt-0.5 transition-colors duration-200">
                        {app.description}
                      </div>
                    </div>
                    <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg 
                        width="16" 
                        height="16" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        className="text-blue-400"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
              
            </div>
          </div>
        </>
      )}
    </div>
  )
}