'use client'

import Link from 'next/link'
import AppLauncher from '@/components/ui/AppLauncher'

export default function Header() {
  return (
    <header className="bg-white/95 border-b border-gray-200/60 sticky top-0 z-50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors duration-200"
            style={{
              fontFamily: '"Space Grotesk", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontWeight: 700
            }}
          >
            PlayGround
          </Link>
          
          <AppLauncher />
        </div>
      </div>
    </header>
  )
}
