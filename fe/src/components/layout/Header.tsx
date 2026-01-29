'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* 로고 */}
          <Link href="/" className="flex-shrink-0 text-xl font-bold text-white hover:text-blue-400 transition-colors">
            DEVFORGE
          </Link>

          {/* 데스크탑 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/tools" className="text-white/70 hover:text-white transition-colors">
              도구
            </Link>
            <Link href="/tools/json-formatter" className="text-white/70 hover:text-white transition-colors">
              JSON 포맷터
            </Link>
            <Link href="/canvas" className="text-white/70 hover:text-white transition-colors">
              그림판
            </Link>
            <Link href="/chat" className="text-white/70 hover:text-white transition-colors">
              AI 채팅
            </Link>
          </nav>

          {/* 우측 버튼들 */}
          <div className="flex items-center space-x-4">
            {/* 데스크탑 CTA 버튼 */}
            <Link
              href="/tools/json-formatter"
              className="hidden md:inline-flex bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              시작하기
            </Link>

            {/* 모바일 햄버거 메뉴 */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="메뉴"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/90 backdrop-blur-md border-b border-white/10">
          <div className="px-4 py-4 space-y-4">
            <Link
              href="/tools"
              className="block text-white/70 hover:text-white transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              도구
            </Link>
            <Link
              href="/tools/json-formatter"
              className="block text-white/70 hover:text-white transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              JSON 포맷터
            </Link>
            <Link
              href="/canvas"
              className="block text-white/70 hover:text-white transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              그림판
            </Link>
            <Link
              href="/chat"
              className="block text-white/70 hover:text-white transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              AI 채팅
            </Link>
            <div className="pt-4 border-t border-white/10">
              <Link
                href="/tools/json-formatter"
                className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                시작하기
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
