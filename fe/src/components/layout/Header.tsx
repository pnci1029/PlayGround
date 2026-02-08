'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { language, setLanguage } = useLanguage()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <Link 
            href="/" 
            className="text-xl font-bold text-white hover:text-white/80 transition-colors duration-150"
          >
            DEVFORGE
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/tools" 
              className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-150"
            >
              도구
            </Link>
            <Link 
              href="/canvas" 
              className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-150"
            >
              그림판
            </Link>
            <Link 
              href="/chat" 
              className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-150"
            >
              AI 채팅
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center border border-white/10 rounded-xl overflow-hidden bg-white/5">
              <button
                onClick={() => setLanguage('ko')}
                className={`px-4 py-2 text-xs font-medium transition-all duration-150 ${
                  language === 'ko' 
                    ? 'bg-white text-black' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                한국어
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 text-xs font-medium transition-all duration-150 ${
                  language === 'en' 
                    ? 'bg-white text-black' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                English
              </button>
            </div>

            <button
              className="md:hidden text-white/70 hover:text-white p-2 transition-colors duration-150"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
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

      {isMenuOpen && (
        <div className="md:hidden bg-black/90 backdrop-blur-xl border-b border-white/5">
          <div className="px-6 py-6 space-y-1">
            <Link
              href="/tools"
              className="block text-white/70 hover:text-white py-3 text-sm font-medium transition-colors duration-150"
              onClick={() => setIsMenuOpen(false)}
            >
              도구
            </Link>
            <Link
              href="/canvas"
              className="block text-white/70 hover:text-white py-3 text-sm font-medium transition-colors duration-150"
              onClick={() => setIsMenuOpen(false)}
            >
              그림판
            </Link>
            <Link
              href="/chat"
              className="block text-white/70 hover:text-white py-3 text-sm font-medium transition-colors duration-150"
              onClick={() => setIsMenuOpen(false)}
            >
              AI 채팅
            </Link>
            
            <div className="pt-4 border-t border-white/10 mt-4">
              <div className="flex border border-white/10 rounded-xl overflow-hidden bg-white/5">
                <button
                  onClick={() => setLanguage('ko')}
                  className={`flex-1 py-3 px-4 text-xs font-medium transition-all duration-150 ${
                    language === 'ko' 
                      ? 'bg-white text-black' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  한국어
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-3 px-4 text-xs font-medium transition-all duration-150 ${
                    language === 'en' 
                      ? 'bg-white text-black' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
