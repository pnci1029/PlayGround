import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              MyTools
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            <Link href="/" className="nav-link">
              홈
            </Link>
            <Link href="/tools" className="nav-link">
              도구
            </Link>
            <Link href="/canvas" className="nav-link">
              그림판
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-500 hover:text-gray-600">
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