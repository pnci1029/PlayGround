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
          
          {/* Mobile-optimized AppLauncher container */}
          <div className="flex items-center">
            <AppLauncher />
          </div>
        </div>
      </div>
    </header>
  )
}
