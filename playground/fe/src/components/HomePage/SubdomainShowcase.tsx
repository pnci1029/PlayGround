'use client'

import React, { useState, useEffect } from 'react'
import { config } from '@/lib/config'

interface SubdomainService {
  title: string
  description: string
  url: string
  color: string
  gradient: string
  icon: React.ReactNode
  preview: React.ReactNode
}

const services: SubdomainService[] = [
  {
    title: '실시간 트렌드',
    description: '전 세계 트렌딩 키워드를 실시간으로 확인하세요',
    url: config.services.trend,
    color: 'from-blue-500 to-cyan-500',
    gradient: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    preview: (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">AI</span>
          <div className="flex items-center space-x-1">
            <div className="w-16 h-2 bg-blue-200 rounded-full overflow-hidden">
              <div className="w-12 h-full bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-xs text-green-600">+847%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">React</span>
          <div className="flex items-center space-x-1">
            <div className="w-16 h-2 bg-blue-200 rounded-full overflow-hidden">
              <div className="w-10 h-full bg-blue-500 rounded-full"></div>
            </div>
            <span className="text-xs text-green-600">+234%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Next.js</span>
          <div className="flex items-center space-x-1">
            <div className="w-16 h-2 bg-blue-200 rounded-full overflow-hidden">
              <div className="w-8 h-full bg-blue-500 rounded-full"></div>
            </div>
            <span className="text-xs text-green-600">+156%</span>
          </div>
        </div>
      </div>
    )
  },
  {
    title: '무드바이트',
    description: '당신의 기분에 맞는 완벽한 음식을 추천해드려요',
    url: config.services.moodbite,
    color: 'from-orange-500 to-red-500',
    gradient: 'bg-gradient-to-br from-orange-50 to-red-50',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    preview: (
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-orange-600 text-lg">🍕</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">피자</div>
            <div className="text-xs text-gray-500">기분 좋을 때</div>
          </div>
          <div className="text-xs text-orange-600 animate-bounce">추천!</div>
        </div>
        <div className="flex items-center space-x-2 opacity-75">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 text-lg">🥗</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">샐러드</div>
            <div className="text-xs text-gray-500">건강한 기분</div>
          </div>
        </div>
        <div className="flex items-center space-x-2 opacity-50">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-purple-600 text-lg">🍰</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">케이크</div>
            <div className="text-xs text-gray-500">달콤한 기분</div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: '개발자 블로그',
    description: '최신 기술 트렌드와 개발 팁을 공유하는 공간',
    url: config.services.blog,
    color: 'from-purple-500 to-pink-500',
    gradient: 'bg-gradient-to-br from-purple-50 to-pink-50',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    preview: (
      <div className="space-y-3">
        <div className="border-l-4 border-purple-500 pl-3">
          <div className="text-sm font-medium line-clamp-2">React 19의 새로운 기능들</div>
          <div className="text-xs text-gray-500">5분 전</div>
        </div>
        <div className="border-l-4 border-pink-400 pl-3 opacity-75">
          <div className="text-sm font-medium line-clamp-2">TypeScript 최적화 팁</div>
          <div className="text-xs text-gray-500">1시간 전</div>
        </div>
        <div className="border-l-4 border-purple-300 pl-3 opacity-50">
          <div className="text-sm font-medium line-clamp-2">Next.js 15 완전 정복</div>
          <div className="text-xs text-gray-500">3시간 전</div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t">
          <span>📝 47개 글</span>
          <span>👀 2.3k 조회</span>
        </div>
      </div>
    )
  },
  {
    title: '실시간 채팅',
    description: '익명으로 자유롭게 대화를 나누어보세요',
    url: '/chat',
    color: 'from-green-500 to-teal-500',
    gradient: 'bg-gradient-to-br from-green-50 to-teal-50',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    preview: (
      <div className="space-y-2">
        <div className="flex items-start space-x-2">
          <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <div className="text-xs text-gray-900">안녕하세요! 😊</div>
            </div>
            <div className="text-xs text-gray-400 mt-1">친절한고양이123</div>
          </div>
        </div>
        <div className="flex items-start space-x-2 opacity-75">
          <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <div className="text-xs text-gray-900">React 질문있어요!</div>
            </div>
            <div className="text-xs text-gray-400 mt-1">개발자토끼456</div>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400 pt-2">
          <span className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            <span>23명 접속 중</span>
          </span>
          <span>💬 실시간</span>
        </div>
      </div>
    )
  }
]

export default function SubdomainShowcase() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [animatingCards, setAnimatingCards] = useState<Set<number>>(new Set())

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * services.length)
      setAnimatingCards(prev => new Set([...prev, randomIndex]))
      
      setTimeout(() => {
        setAnimatingCards(prev => {
          const newSet = new Set(prev)
          newSet.delete(randomIndex)
          return newSet
        })
      }, 2000)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleCardClick = (url: string) => {
    if (url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      window.location.href = url
    }
  }

  return (
    <div className="py-16 sm:py-20 lg:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            모든 서비스를 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> 한눈에</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            각 서비스들이 실시간으로 어떻게 동작하는지 미리 체험해보세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {services.map((service, index) => (
            <div
              key={service.title}
              className={`group relative cursor-pointer transition-all duration-500 transform ${
                hoveredIndex === index ? 'scale-105 z-10' : 'scale-100'
              } ${animatingCards.has(index) ? 'animate-pulse' : ''}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleCardClick(service.url)}
            >
              <div className={`${service.gradient} rounded-2xl p-6 sm:p-8 h-full border border-gray-100 shadow-sm transition-all duration-500 ${
                hoveredIndex === index ? 'shadow-2xl border-transparent' : 'hover:shadow-lg hover:border-gray-200'
              }`}>
                {/* 헤더 */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} text-white mb-4 shadow-lg transform transition-transform duration-300 ${
                      hoveredIndex === index ? 'rotate-12 scale-110' : ''
                    }`}>
                      {service.icon}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* 미리보기 */}
                <div className={`bg-white/60 backdrop-blur-sm rounded-xl p-4 transition-all duration-500 ${
                  hoveredIndex === index ? 'bg-white/80 transform translate-y-0' : 'transform translate-y-2'
                }`}>
                  {service.preview}
                </div>

                {/* 호버 시 나타나는 액션 버튼 */}
                <div className={`absolute inset-0 flex items-center justify-center bg-black/0 rounded-2xl transition-all duration-300 ${
                  hoveredIndex === index ? 'bg-black/5' : ''
                }`}>
                  <div className={`transform transition-all duration-300 ${
                    hoveredIndex === index ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
                  }`}>
                    <div className={`bg-white shadow-xl rounded-full px-6 py-3 flex items-center space-x-2 border-2 border-transparent bg-gradient-to-r ${service.color} bg-clip-border`}>
                      <span className="text-white font-semibold">체험하기</span>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 장식적 요소 */}
                <div className={`absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br ${service.color} rounded-full opacity-20 animate-ping ${
                  animatingCards.has(index) ? 'opacity-60' : ''
                }`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* 하단 CTA */}
        <div className="text-center mt-12 sm:mt-16">
          <div className="inline-flex items-center space-x-2 bg-gray-50 rounded-full px-6 py-3 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>모든 서비스가 실시간으로 연동되어 작동합니다</span>
          </div>
        </div>
      </div>
    </div>
  )
}