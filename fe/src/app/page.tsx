import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{background: 'var(--background)'}}>
      {/* Hero Section */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-10 leading-tight">
              내가 필요해서 만든 모든 것
            </h1>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20" style={{background: 'var(--background)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* JSON Formatter */}
            <Link href="/tools/json-formatter" className="group">
              <div className="card group-hover:shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">JSON 포맷터</h3>
                <p className="text-gray-400 text-sm mb-4">JSON 데이터 정리와 검증</p>
                <div className="flex items-center text-purple-400 font-medium group-hover:text-purple-300 text-sm">
                  사용하기 →
                </div>
              </div>
            </Link>

            {/* Variable Generator */}
            <Link href="/tools/variable-generator" className="group">
              <div className="card group-hover:shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">변수명 생성기</h3>
                <p className="text-gray-400 text-sm mb-4">다양한 네이밍 컨벤션으로 변환</p>
                <div className="flex items-center text-purple-400 font-medium group-hover:text-purple-300 text-sm">
                  사용하기 →
                </div>
              </div>
            </Link>

            {/* Canvas */}
            <Link href="/canvas" className="group">
              <div className="card group-hover:shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">그림판</h3>
                <p className="text-gray-400 text-sm mb-4">간단한 드로잉 도구</p>
                <div className="flex items-center text-purple-400 font-medium group-hover:text-purple-300 text-sm">
                  사용하기 →
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>


    </div>
  )
}