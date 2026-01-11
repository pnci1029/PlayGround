import Link from 'next/link'

export default function ToolsPage() {
  const tools = [
    {
      id: 'json-formatter',
      name: 'JSON 포맷터',
      description: 'JSON 데이터를 깔끔하게 포맷팅하고 검증',
      icon: '🔧',
      color: 'blue',
      path: '/tools/json-formatter'
    },
    {
      id: 'variable-generator',
      name: '변수명 생성기',
      description: '다양한 명명 규칙으로 변수명 자동 생성',
      icon: '📝',
      color: 'green',
      path: '/tools/variable-generator'
    },
    {
      id: 'url-encoder',
      name: 'URL 인코더/디코더',
      description: 'URL 인코딩 및 디코딩 도구',
      icon: '🔗',
      color: 'purple',
      path: '/tools/url-encoder'
    },
    {
      id: 'base64',
      name: 'Base64 인코더',
      description: 'Base64 인코딩/디코딩',
      icon: '🔐',
      color: 'orange',
      path: '/tools/base64'
    },
    {
      id: 'hash-generator',
      name: '해시 생성기',
      description: 'MD5, SHA-1, SHA-256 해시 생성',
      icon: '#️⃣',
      color: 'red',
      path: '/tools/hash-generator'
    },
    {
      id: 'qr-generator',
      name: 'QR 코드 생성기',
      description: '텍스트를 QR 코드로 변환',
      icon: '📱',
      color: 'indigo',
      path: '/tools/qr-generator'
    }
  ]

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600',
      indigo: 'bg-indigo-100 text-indigo-600'
    }
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            개발 도구 모음
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            개발 작업에 필요한 다양한 도구들을 사용할 수 있습니다.
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.path}
                className="card group cursor-pointer transform hover:scale-105 transition-all duration-200"
              >
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${getColorClasses(tool.color)}`}>
                  <span className="text-2xl">{tool.icon}</span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {tool.name}
                </h3>
                
                <p className="text-gray-600 mb-6">
                  {tool.description}
                </p>
                
                <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                  사용하기
                  <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            곧 추가될 도구들
          </h2>
          <p className="text-gray-600 mb-8">
            더 많은 유용한 도구들이 추가될 예정입니다
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="font-semibold text-gray-700 mb-2">색상 팔레트 생성기</h3>
              <p className="text-sm text-gray-500">조화로운 색상 조합 생성</p>
            </div>
            
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="font-semibold text-gray-700 mb-2">차트 생성기</h3>
              <p className="text-sm text-gray-500">데이터 시각화 도구</p>
            </div>
            
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="font-semibold text-gray-700 mb-2">정규식 테스터</h3>
              <p className="text-sm text-gray-500">정규표현식 테스트 및 검증</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}