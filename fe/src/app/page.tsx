'use client'

import React, { useState, useEffect } from 'react'
import PremiumToolCard from '@/components/ui/PremiumToolCard'
import { renderPremiumIcon } from '@/components/ui/PremiumIcons'

export default function HomePage() {
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
  
  // 프리미엄 도구 데이터 - FreeTools.org 스타일
  const toolCategories = {
    '개발 도구': [
      {
        title: 'JSON Formatter',
        href: '/tools/json-formatter',
        category: '개발 도구',
        icon: renderPremiumIcon('code'),
        status: 'active' as const,
        description: 'JSON 데이터를 깔끔하게 포맷하고 유효성을 검사합니다'
      },
      {
        title: 'Variable Generator',
        href: '/tools/variable-generator', 
        category: '개발 도구',
        icon: renderPremiumIcon('edit'),
        status: 'active' as const,
        description: '다양한 명명 규칙으로 변수명을 자동 생성합니다'
      },
      {
        title: 'URL Encoder',
        href: '/tools/url-encoder',
        category: '개발 도구', 
        icon: renderPremiumIcon('link'),
        status: 'active' as const,
        description: 'URL을 안전하게 인코딩하고 디코딩합니다'
      },
      {
        title: 'Base64 Converter',
        href: '/tools/base64',
        category: '개발 도구',
        icon: renderPremiumIcon('file-text'),
        status: 'active' as const,
        description: '텍스트와 파일을 Base64로 변환합니다'
      },
      {
        title: 'Hash Generator',
        href: '/tools/hash',
        category: '개발 도구',
        icon: renderPremiumIcon('shield'),
        status: 'active' as const,
        description: 'SHA256, MD5 등 다양한 해시를 생성합니다'
      },
      {
        title: 'QR Code Generator',
        href: '/tools/qr-generator',
        category: '개발 도구',
        icon: renderPremiumIcon('qr-code'),
        status: 'active' as const,
        description: '텍스트와 URL을 QR 코드로 변환합니다'
      }
    ],
    
    '창작 도구': [
      {
        title: '캔버스',
        href: '/canvas',
        category: '창작 도구',
        icon: renderPremiumIcon('palette'),
        status: 'beta' as const,
        description: '자유롭게 그림을 그리고 창작할 수 있는 디지털 캔버스'
      },
      {
        title: '갤러리',
        href: '/gallery',
        category: '창작 도구', 
        icon: renderPremiumIcon('grid'),
        status: 'active' as const,
        description: '작품들을 아름답게 정리하고 감상할 수 있는 갤러리'
      }
    ],

    '생활 도구': [
      {
        title: '오늘의 한끼',
        href: 'http://moodbite.localhost:3000',
        category: '생활 도구',
        icon: renderPremiumIcon('food'),
        status: 'active' as const,
        isExternal: true,
        description: '기분에 맞는 음식을 추천받아보세요'
      }
    ],
    
    '재미 도구': [
      {
        title: '주사위 굴리기',
        href: '/tools/dice',
        category: '재미 도구',
        icon: renderPremiumIcon('dice'),
        status: 'coming-soon' as const,
        description: '랜덤한 숫자로 재미있는 게임을 즐겨보세요'
      },
      {
        title: '사다리타기',
        href: '/tools/ladder',
        category: '재미 도구',
        icon: renderPremiumIcon('ladder'),
        status: 'coming-soon' as const,
        description: '공정한 선택을 위한 전통적인 사다리타기 게임'
      },
      {
        title: '룰렛 돌리기',
        href: '/tools/wheel',
        category: '재미 도구',
        icon: renderPremiumIcon('wheel'),
        status: 'coming-soon' as const,
        description: '원형 룰렛으로 랜덤한 선택을 만들어보세요'
      },
      {
        title: '동전 던지기',
        href: '/tools/coin',
        category: '재미 도구',
        icon: renderPremiumIcon('coin'),
        status: 'coming-soon' as const,
        description: '간단한 동전 던지기로 yes/no 결정을 내려보세요'
      }
    ],

    '커뮤니케이션': [
      {
        title: '실시간 채팅',
        href: '/chat',
        category: '커뮤니케이션',
        icon: renderPremiumIcon('brain'),
        status: 'active' as const,
        description: '실시간으로 다른 사용자들과 채팅할 수 있습니다'
      }
    ]
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafbfc' }}>
      
      {/* 히어로 섹션 */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-20 lg:py-24">
          <div className="text-center">
            <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight font-sans">
              PlayGround
            </h1>
            <p className="text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-sans">
              개발부터 재미까지, 다양한 웹 도구를 한 곳에서
            </p>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="space-y-10">
          {Object.entries(toolCategories).map(([categoryName, tools]) => {
            const isOpen = openCategories.includes(categoryName)
            const toolCount = tools.length
            
            return (
              <section key={categoryName} className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:border-gray-200 hover:shadow-md">
                
                {/* 아코디언 헤더 - 클릭 가능한 영역 */}
                <div 
                  onClick={() => toggleCategory(categoryName)}
                  className="p-6 cursor-pointer select-none transition-all duration-200 hover:bg-gray-50 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <h2 className="text-2xl font-bold text-gray-900 font-sans group-hover:text-blue-600 transition-colors duration-200">
                        {categoryName}
                      </h2>
                      <span className="bg-blue-50 text-blue-600 text-sm font-medium px-3 py-1 rounded-full border border-blue-100">
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
                  <div className="px-6 pb-6">
                    <div className="h-px bg-gray-100 mb-6"></div>
                    
                    {/* 도구 카드 그리드 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {tools.map((tool, index) => (
                        <PremiumToolCard
                          key={`${categoryName}-${index}`}
                          title={tool.title}
                          href={tool.href}
                          category={tool.category}
                          icon={tool.icon}
                          status={tool.status}
                          isExternal={tool.isExternal}
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

        {/* 하단 정보 섹션 */}
        <div className="mt-32 pt-16 border-t border-gray-200">
          <div className="text-center space-y-4">
            <p className="text-gray-500 text-base font-sans">
              개인 프로젝트 · 지속적인 개선 중
            </p>
            <div className="flex justify-center space-x-2 text-sm text-gray-600 font-sans">
              <span>Made with</span>
              <span className="text-red-500">♥</span>
              <span>by Developer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}