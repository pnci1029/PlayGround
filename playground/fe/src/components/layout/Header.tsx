'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-lg bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200"
          >
            PlayGround
          </Link>
        </div>
      </div>
    </header>
  )
}
