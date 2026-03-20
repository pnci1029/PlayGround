'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Tool {
  name: string
  url: string
  description: string
  icon: string
  color: string
}

const tools: Tool[] = [
  {
    name: '재미 도구',
    url: '/fun-tools',
    description: '엔터테인먼트 & 창작 도구',
    icon: '🎮',
    color: 'from-pink-500 to-rose-500'
  },
  {
    name: '개발 도구',
    url: '/dev-tools', 
    description: '개발 및 프로그래밍 도구',
    icon: '⚡',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    name: '정보 도구',
    url: '/info-tools',
    description: '정보 분석 및 유틸리티',
    icon: '📊',
    color: 'from-indigo-500 to-purple-500'
  }
]

export default function ToolsDropdown() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-all duration-200 touch-manipulation"
        style={{
          minHeight: '44px',
          minWidth: '44px'
        }}
        aria-label="도구 메뉴"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          className="mx-auto transition-transform duration-200 group-hover:scale-110"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Content */}
          <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-gray-200/60 backdrop-blur-lg z-20 overflow-hidden">
            <div className="p-5">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center mr-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white">
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                    />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900" style={{ fontFamily: '"Inter", sans-serif' }}>
                  도구
                </h3>
              </div>
              
              <div className="grid gap-3">
                {tools.map((tool) => (
                  <Link
                    key={tool.name}
                    href={tool.url}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center p-4 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200 touch-manipulation"
                    style={{ minHeight: '68px' }}
                  >
                    <div className={`w-11 h-11 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center mr-4 group-hover:scale-105 transition-transform duration-200 shadow-sm`}>
                      <span className="text-xl filter drop-shadow-sm">{tool.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors duration-200" style={{ fontFamily: '"Inter", sans-serif' }}>
                        {tool.name}
                      </div>
                      <div className="text-xs text-gray-500 group-hover:text-gray-600 mt-0.5 transition-colors duration-200">
                        {tool.description}
                      </div>
                    </div>
                    <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg 
                        width="16" 
                        height="16" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        className="text-gray-400"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
              
            </div>
          </div>
        </>
      )}
    </div>
  )
}