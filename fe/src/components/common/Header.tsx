'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Header() {
  const { language, setLanguage, t } = useLanguage()
  return (
    <header className="bg-black/80 border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          {/*<div className="flex items-center">*/}
          {/*  <Link */}
          {/*    href="/" */}
          {/*    className="text-2xl font-bold text-white hover:text-blue-400 transition-all duration-300 hover:scale-105 relative group"*/}
          {/*  >*/}
          {/*    <span className="relative z-10">DEVFORGE</span>*/}
          {/*    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent-success/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -m-2"></div>*/}
          {/*  </Link>*/}
          {/*</div>*/}

          {/* Navigation & Language Toggle */}
          {/*<div className="hidden md:flex items-center space-x-4">*/}
          {/*  <nav className="flex space-x-2">*/}
          {/*    <Link*/}
          {/*      href="/"*/}
          {/*      className="text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg font-medium transition-all duration-300"*/}
          {/*    >*/}
          {/*      {t('nav.home')}*/}
          {/*    </Link>*/}
          {/*    <Link*/}
          {/*      href="/tools"*/}
          {/*      className="text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg font-medium transition-all duration-300"*/}
          {/*    >*/}
          {/*      {t('nav.tools')}*/}
          {/*    </Link>*/}
          {/*    <Link*/}
          {/*      href="/canvas"*/}
          {/*      className="text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg font-medium transition-all duration-300"*/}
          {/*    >*/}
          {/*      {t('nav.canvas')}*/}
          {/*    </Link>*/}
          {/*    <Link*/}
          {/*      href="/chat"*/}
          {/*      className="text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg font-medium transition-all duration-300"*/}
          {/*    >*/}
          {/*      {t('nav.chat')}*/}
          {/*    </Link>*/}
          {/*  </nav>*/}

          {/*  /!* Language Toggle *!/*/}
          {/*  <div className="flex items-center border border-white/20 rounded-xl p-1 hover:border-blue-400/50 transition-colors duration-300">*/}
          {/*    <button*/}
          {/*      onClick={() => setLanguage('ko')}*/}
          {/*      className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-300 ${*/}
          {/*        language === 'ko' */}
          {/*          ? 'bg-blue-500 text-white shadow-md' */}
          {/*          : 'text-white/70 hover:text-white hover:bg-white/10'*/}
          {/*      }`}*/}
          {/*    >*/}
          {/*      한국어*/}
          {/*    </button>*/}
          {/*    <button*/}
          {/*      onClick={() => setLanguage('en')}*/}
          {/*      className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-300 ${*/}
          {/*        language === 'en' */}
          {/*          ? 'bg-blue-500 text-white shadow-md' */}
          {/*          : 'text-white/70 hover:text-white hover:bg-white/10'*/}
          {/*      }`}*/}
          {/*    >*/}
          {/*      English*/}
          {/*    </button>*/}
          {/*  </div>*/}
          {/*</div>*/}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-text-muted hover:text-primary hover:bg-surface p-2 rounded-md transition-all duration-300 group">
              <svg className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
