'use client'

import Link from 'next/link'
import AppLauncher from '@/components/ui/AppLauncher'

export default function Header() {
  return (
    <header className="bg-white/95 border-b border-gray-200/60 sticky top-0 z-50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link
            href="/"
            className="text-xl sm:text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors duration-200 py-2 px-1 -mx-1 rounded-lg hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
            style={{
              fontFamily: '"Space Grotesk", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontWeight: 700,
              // Enhanced touch targets for mobile
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            PlayGround
          </Link>
          
          {/* Navigation Menu */}
          <nav className="hidden sm:flex items-center space-x-6">
            <Link
              href="/fun-tools"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
            >
              재미 도구
            </Link>
            <Link
              href="/dev-tools"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
            >
              개발 도구
            </Link>
            <Link
              href="/info-tools"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
            >
              정보 도구
            </Link>
          </nav>
          
          {/* Mobile-optimized AppLauncher container */}
          <div className="flex items-center space-x-2">
            {/* Mobile Navigation Button */}
            <div className="sm:hidden">
              <button
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                type="button"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            
            <AppLauncher />
          </div>
        </div>
      </div>
    </header>
  )
}
