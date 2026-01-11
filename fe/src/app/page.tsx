import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            내가 필요해서 만든 <span className="text-blue-600">모든 것</span>
          </h1>
          <div className="flex justify-center">
            <Link href="/tools" className="btn btn-primary">
              도구
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* JSON Formatter */}
            <div className="card">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">JSON 포맷터</h3>
              <p className="text-gray-600 mb-4">JSON 정리</p>
              <Link href="/tools/json-formatter" className="text-blue-600 hover:text-blue-700 font-medium">
                →
              </Link>
            </div>

            {/* Variable Generator */}
            <div className="card">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">변수명 생성기</h3>
              <p className="text-gray-600 mb-4">변수명 만들기</p>
              <Link href="/tools/variable-generator" className="text-blue-600 hover:text-blue-700 font-medium">
                →
              </Link>
            </div>

            {/* Canvas */}
            <div className="card">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">그림판</h3>
              <p className="text-gray-600 mb-4">그림 그리기</p>
              <Link href="/canvas" className="text-blue-600 hover:text-blue-700 font-medium">
                →
              </Link>
            </div>
          </div>
        </div>
      </section>


    </div>
  )
}