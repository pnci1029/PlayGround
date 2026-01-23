'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Header() {
  const { language, setLanguage, t } = useLanguage()
  return (
    <header className="bg-black border-b border-gray-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-white">
              DEVFORGE
            </Link>
          </div>

          {/* Navigation & Language Toggle */}
          <div className="hidden md:flex items-center space-x-4">
            <nav className="flex space-x-1">
              <Link href="/" className="text-gray-400 hover:text-white px-4 py-2 rounded-md font-medium transition-colors duration-200">
                {t('nav.home')}
              </Link>
              <Link href="/tools" className="text-gray-400 hover:text-white px-4 py-2 rounded-md font-medium transition-colors duration-200">
                {t('nav.tools')}
              </Link>
              <Link href="/canvas" className="text-gray-400 hover:text-white px-4 py-2 rounded-md font-medium transition-colors duration-200">
                {t('nav.canvas')}
              </Link>
              <Link href="/chat" className="text-gray-400 hover:text-white px-4 py-2 rounded-md font-medium transition-colors duration-200">
                {t('nav.chat')}
              </Link>
            </nav>
            
            {/* Language Toggle */}
            <div className="flex items-center border border-gray-700 rounded-lg p-1">
              <button
                onClick={() => setLanguage('ko')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  language === 'ko' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                한국어
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  language === 'en' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-400 hover:text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}