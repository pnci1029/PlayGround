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
            className="text-xl font-bold text-white hover:text-blue-400 hover:scale-105 transition-all duration-200 ease-out"
          >
            DEVFORGE
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/tools"
              className="relative text-sm font-medium text-white/70 hover:text-white transition-all duration-200 ease-out group"
            >
              <span className="relative z-10 px-3 py-2">도구</span>
              <span className="absolute inset-0 bg-white/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200 ease-out"></span>
            </Link>
            <Link
              href="/canvas"
              className="relative text-sm font-medium text-white/70 hover:text-white transition-all duration-200 ease-out group"
            >
              <span className="relative z-10 px-3 py-2">그림판</span>
              <span className="absolute inset-0 bg-white/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200 ease-out"></span>
            </Link>
            <Link
              href="/chat"
              className="relative text-sm font-medium text-white/70 hover:text-white transition-all duration-200 ease-out group"
            >
              <span className="relative z-10 px-3 py-2">AI 채팅</span>
              <span className="absolute inset-0 bg-white/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200 ease-out"></span>
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center border border-white/10 rounded-xl overflow-hidden bg-white/5 hover:border-white/20 transition-all duration-200">
              <button
                onClick={() => setLanguage('ko')}
                className={`px-4 py-2 text-xs font-medium transition-all duration-200 ease-out ${
                  language === 'ko' 
                    ? 'bg-white text-black shadow-lg transform scale-105' 
                    : 'text-white/70 hover:text-white hover:bg-white/20 hover:scale-105'
                }`}
              >
                한국어
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 text-xs font-medium transition-all duration-200 ease-out ${
                  language === 'en' 
                    ? 'bg-white text-black shadow-lg transform scale-105' 
                    : 'text-white/70 hover:text-white hover:bg-white/20 hover:scale-105'
                }`}
              >
                English
              </button>
            </div>

            <button
              className="md:hidden text-white/70 hover:text-white p-2 transition-all duration-200 ease-out hover:scale-110 hover:bg-white/10 rounded-lg"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6 transition-transform duration-200" style={{ transform: isMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      <div className={`md:hidden transition-all duration-300 ease-out overflow-hidden ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-black/95 backdrop-blur-xl border-b border-white/5">
          <div className="px-6 py-6 space-y-2">
            <Link
              href="/tools"
              className="block text-white/70 hover:text-white py-3 px-4 text-sm font-medium transition-all duration-200 ease-out hover:bg-white/10 rounded-lg hover:translate-x-2"
              onClick={() => setIsMenuOpen(false)}
            >
              도구
            </Link>
            <Link
              href="/canvas"
              className="block text-white/70 hover:text-white py-3 px-4 text-sm font-medium transition-all duration-200 ease-out hover:bg-white/10 rounded-lg hover:translate-x-2"
              onClick={() => setIsMenuOpen(false)}
            >
              그림판
            </Link>
            <Link
              href="/chat"
              className="block text-white/70 hover:text-white py-3 px-4 text-sm font-medium transition-all duration-200 ease-out hover:bg-white/10 rounded-lg hover:translate-x-2"
              onClick={() => setIsMenuOpen(false)}
            >
              AI 채팅
            </Link>

            <div className="pt-4 border-t border-white/10 mt-4">
              <div className="flex border border-white/10 rounded-xl overflow-hidden bg-white/5 hover:border-white/20 transition-all duration-200">
                <button
                  onClick={() => setLanguage('ko')}
                  className={`flex-1 py-3 px-4 text-xs font-medium transition-all duration-200 ease-out ${
                    language === 'ko' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-white/70 hover:text-white hover:bg-white/20 hover:scale-105'
                  }`}
                >
                  한국어
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-3 px-4 text-xs font-medium transition-all duration-200 ease-out ${
                    language === 'en' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-white/70 hover:text-white hover:bg-white/20 hover:scale-105'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
