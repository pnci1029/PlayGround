'use client'

import React from 'react'

interface ToolCardProps {
  title: string
  href: string
  category: string
  icon: React.ReactNode
  status?: 'active' | 'beta' | 'coming-soon'
  isExternal?: boolean
}

export default function ToolCard({ 
  title, 
  href, 
  category, 
  icon, 
  status = 'active', 
  isExternal = false 
}: ToolCardProps) {
  
  const handleClick = () => {
    if (status === 'active' || status === 'beta') {
      if (isExternal) {
        window.open(href, '_blank')
      } else {
        window.location.href = href
      }
    }
  }

  const isDisabled = status === 'coming-soon'

  return (
    <div
      onClick={handleClick}
      className={`
        group relative bg-white border-2 border-gray-200 rounded-xl p-6 
        transition-all duration-300 ease-in-out
        ${isDisabled 
          ? 'cursor-not-allowed opacity-60' 
          : 'cursor-pointer hover:border-blue-300 hover:shadow-lg hover:-translate-y-1'
        }
      `}
    >
      {/* 상태 배지 */}
      {status === 'beta' && (
        <div className="absolute top-3 right-3">
          <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">
            Beta
          </span>
        </div>
      )}
      
      {status === 'coming-soon' && (
        <div className="absolute top-3 right-3">
          <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full font-medium">
            곧 출시
          </span>
        </div>
      )}

      {/* 아이콘 */}
      <div className={`
        w-12 h-12 flex items-center justify-center rounded-lg mb-4
        ${isDisabled 
          ? 'bg-gray-100 text-gray-400' 
          : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
        }
        transition-colors duration-300
      `}>
        {icon}
      </div>

      {/* 제목 */}
      <h3 className={`
        font-semibold text-lg mb-2
        ${isDisabled 
          ? 'text-gray-500' 
          : 'text-gray-900 group-hover:text-blue-700'
        }
        transition-colors duration-300
      `}>
        {title}
      </h3>

      {/* 카테고리 */}
      <p className={`
        text-sm font-medium
        ${isDisabled 
          ? 'text-gray-400' 
          : 'text-gray-600'
        }
      `}>
        {category}
      </p>

      {/* 외부 링크 표시 */}
      {isExternal && !isDisabled && (
        <div className="absolute top-3 left-3">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      )}

      {/* 호버 효과용 배경 그라데이션 */}
      {!isDisabled && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
    </div>
  )
}