'use client'

import React from 'react'
import { config } from '@/lib/config'

interface SubdomainService {
  title: string
  description: string
  url: string
  icon: React.ReactNode
  badge?: 'BETA' | 'SOON'
}

const services: SubdomainService[] = [
  {
    title: '실시간 트렌드',
    description: '',
    url: config.services.trend,
    badge: 'BETA',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )
  },
  {
    title: '무드바이트',
    description: '',
    url: config.services.moodbite,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    )
  },
  {
    title: '개발자 블로그',
    description: '',
    url: config.services.blog,
    badge: 'SOON',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  {
    title: '실시간 채팅',
    description: '',
    url: '/chat',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  }
]

export default function SubdomainShowcase() {
  const handleCardClick = (url: string, badge?: string) => {
    // SOON 배지가 있으면 클릭 무효화
    if (badge === 'SOON') {
      return
    }
    
    if (url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      window.location.href = url
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">

      {/* Mobile-optimized services grid with better spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {services.map((service, index) => (
          <div
            key={service.title}
            className={`group relative touch-manipulation ${service.badge === 'SOON' ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
            onClick={() => handleCardClick(service.url, service.badge)}
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            {/* Mobile-optimized card with enhanced touch targets */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/60 hover:border-gray-300/80 hover:shadow-xl hover:shadow-gray-200/20 active:shadow-lg active:scale-[0.98] transition-all duration-300 group-hover:-translate-y-1"
                 style={{ minHeight: '120px' }}>
              {/* Subtle background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Badge */}
              {service.badge && (
                <div className="absolute -top-2 -right-2 z-10">
                  <span 
                    className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full shadow-sm ${
                      service.badge === 'BETA' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-orange-500 text-white'
                    }`}
                  >
                    {service.badge}
                  </span>
                </div>
              )}
              
              <div className="relative text-center">
                {/* Mobile-optimized icon container with proper spacing */}
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 group-hover:from-gray-100 group-hover:to-gray-200 group-hover:text-gray-800 transition-all duration-300 mb-4 sm:mb-6 shadow-sm">
                  {service.icon}
                </div>
                
                {/* Mobile-optimized typography with responsive sizing */}
                <h3 
                  className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 group-hover:text-gray-800 transition-colors duration-200"
                  style={{
                    fontFamily: '"Space Grotesk", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    fontWeight: 600
                  }}
                >
                  {service.title}
                </h3>
                
                {/* Mobile-optimized hover indicator with responsive positioning */}
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-800 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6L16 12l-6 6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}