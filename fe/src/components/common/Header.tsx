import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-black border-b border-gray-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-white">
              MyTools
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            <Link href="/" className="text-gray-400 hover:text-white px-4 py-2 rounded-md font-medium transition-colors duration-200">
              홈
            </Link>
            <Link href="/tools" className="text-gray-400 hover:text-white px-4 py-2 rounded-md font-medium transition-colors duration-200">
              도구
            </Link>
            <Link href="/canvas" className="text-gray-400 hover:text-white px-4 py-2 rounded-md font-medium transition-colors duration-200">
              그림판
            </Link>
          </nav>

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