import Link from 'next/link'

export default function ToolsPage() {
  const tools = [
    {
      id: 'json-formatter',
      name: 'JSON 포맷터',
      description: 'JSON 데이터 정리 및 검증',
      icon: '🔧',
      href: '/tools/json-formatter',
      featured: true
    },
    {
      id: 'variable-generator',
      name: '변수명 생성기',
      description: '다양한 네이밍 컨벤션 변환',
      icon: '🏷️',
      href: '/tools/variable-generator',
      featured: true
    },
    {
      id: 'qr-generator',
      name: 'QR 생성기',
      description: 'QR 코드 생성',
      icon: '📱',
      href: '/tools/qr-generator'
    },
    {
      id: 'base64',
      name: 'Base64',
      description: '인코딩/디코딩',
      icon: '🔄',
      href: '/tools/base64'
    },
    {
      id: 'hash',
      name: '해시 생성기',
      description: 'SHA, MD5 해시',
      icon: '🔐',
      href: '/tools/hash'
    },
    {
      id: 'url-encoder',
      name: 'URL 인코더',
      description: 'URL 인코딩/디코딩',
      icon: '🔗',
      href: '/tools/url-encoder'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-text-primary mb-6">
            개발 도구 모음
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-12">
            일상적인 개발 작업을 빠르고 간편하게 처리하는 실용적인 도구들
          </p>
          
          {/* Quick Access */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/tools/json-formatter" className="btn btn-primary px-8 py-4 text-lg">
              JSON 포맷터 →
            </Link>
            <Link href="/tools/variable-generator" className="btn btn-secondary px-8 py-4 text-lg">
              변수명 생성기 →
            </Link>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Link 
                key={tool.id} 
                href={tool.href} 
                className={`group ${tool.featured ? 'md:col-span-1' : ''}`}
              >
                <div className="card hover:border-primary transition-all duration-300 group-hover:scale-[1.02]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent-success rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-xl">{tool.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-text-muted text-sm">{tool.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">바로 사용 가능</span>
                    <span className="text-primary group-hover:text-accent-success transition-colors">
                      열기 →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-surface/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-8">
            왜 DEVFORGE 도구를 사용하나요?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-text-primary mb-2">즉시 사용</h3>
              <p className="text-text-muted text-sm">설치나 가입 없이 바로 사용할 수 있습니다</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-success to-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-text-primary mb-2">단순함</h3>
              <p className="text-text-muted text-sm">복잡한 설정 없이 핵심 기능만 제공합니다</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-warning to-accent-success rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="font-semibold text-text-primary mb-2">보안</h3>
              <p className="text-text-muted text-sm">모든 처리는 브라우저에서 로컬로 실행됩니다</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}