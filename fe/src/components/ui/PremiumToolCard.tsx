'use client'

import React from 'react'

interface PremiumToolCardProps {
  title: string
  href: string
  category: string
  icon: React.ReactNode
  status?: 'active' | 'beta' | 'coming-soon'
  isExternal?: boolean
  description?: string
}

export default function PremiumToolCard({ 
  title, 
  href, 
  category, 
  icon, 
  status = 'active', 
  isExternal = false,
  description
}: PremiumToolCardProps) {
  
  const handleClick = () => {
    if (status === 'active' || status === 'beta') {
      if (isExternal) {
        window.open(href, '_blank', 'noopener,noreferrer')
      } else {
        window.location.href = href
      }
    }
  }

  const isDisabled = status === 'coming-soon'
  const isClickable = !isDisabled

  return (
    <div
      onClick={handleClick}
      className={`
        group relative
        bg-white rounded-2xl border border-gray-100
        transition-all duration-300 ease-out
        ${isClickable 
          ? 'cursor-pointer hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 hover:-translate-y-1' 
          : 'cursor-not-allowed'
        }
        ${isDisabled ? 'opacity-50' : ''}
      `}
      style={{
        boxShadow: isClickable ? '0 4px 12px rgba(0, 0, 0, 0.05)' : '0 2px 4px rgba(0, 0, 0, 0.02)'
      }}
    >
      
      {/* 상태 배지 */}
      <div className="absolute top-4 right-4 z-10">
        {status === 'beta' && (
          <div className="bg-orange-50 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-orange-100">
            Beta
          </div>
        )}
        {status === 'coming-soon' && (
          <div className="bg-gray-50 text-gray-500 text-xs font-semibold px-2.5 py-1 rounded-full border border-gray-100">
            곧 출시
          </div>
        )}
        {isExternal && status === 'active' && (
          <div className="bg-blue-50 text-blue-600 p-1.5 rounded-full">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        )}
      </div>

      {/* 메인 컨테이너 */}
      <div className="p-6">
        
        {/* 아이콘 영역 */}
        <div className="mb-6">
          <div className={`
            w-16 h-16 rounded-xl flex items-center justify-center
            transition-all duration-300 ease-out
            ${isDisabled 
              ? 'bg-gray-50 text-gray-400' 
              : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100 group-hover:scale-110'
            }
          `}>
            <div className="w-8 h-8">
              {icon}
            </div>
          </div>
        </div>

        {/* 텍스트 영역 */}
        <div className="space-y-3">
          
          {/* 제목 */}
          <h3 className={`
            text-lg font-semibold leading-tight
            transition-colors duration-300
            ${isDisabled 
              ? 'text-gray-500' 
              : 'text-gray-900 group-hover:text-blue-700'
            }
          `}>
            {title}
          </h3>

          {/* 설명 (있는 경우) */}
          {description && (
            <p className={`
              text-sm leading-relaxed
              ${isDisabled ? 'text-gray-400' : 'text-gray-500'}
            `}>
              {description}
            </p>
          )}

          {/* 카테고리 */}
          <div className="flex items-center justify-between">
            <span className={`
              text-xs font-medium px-3 py-1 rounded-full
              ${isDisabled 
                ? 'bg-gray-50 text-gray-400 border border-gray-100' 
                : 'bg-gray-50 text-gray-600 border border-gray-100'
              }
            `}>
              {category}
            </span>
            
            {/* 화살표 아이콘 */}
            {isClickable && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* 호버 시 그라데이션 오버레이 */}
      {isClickable && (
        <div 
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(147, 197, 253, 0.05) 100%)'
          }}
        />
      )}

      {/* 포커스 링 */}
      {isClickable && (
        <div className="absolute inset-0 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none ring-2 ring-blue-500 ring-offset-2" />
      )}
      
    </div>
  )
}