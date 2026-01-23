'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useEffect } from 'react'
import AIAssistant from '@/components/AIAssistant'
import WorkflowChain from '@/components/WorkflowChain'
import PerformanceDashboard from '@/components/PerformanceDashboard'

const AnimatedText = ({ texts }: { texts: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [texts.length])

  return (
    <span className="text-primary font-bold transition-all duration-1000 ease-in-out">
      {texts[currentIndex]}
    </span>
  )
}

const FloatingPreview = ({ children, delay = 0, className = '' }: { children: React.ReactNode, delay?: number, className?: string }) => {
  return (
    <div 
      className={`floating-element opacity-20 hover:opacity-60 transition-opacity duration-500 ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  )
}

export default function HomePage() {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  
  const valueTexts = [
    'AI로 코딩 워크플로우를 혁신하세요',
    '개발 생산성을 10배 향상시키세요', 
    '스마트한 도구로 시간을 절약하세요',
    '차세대 개발자 경험을 만나보세요'
  ]

  // 도구 데이터
  const tools = [
    { name: 'JSON 포맷터', href: '/tools/json-formatter', category: '개발', keywords: ['json', 'format', '포맷', '정리'] },
    { name: '변수명 생성기', href: '/tools/variable-generator', category: '개발', keywords: ['variable', '변수', 'naming', '네이밍'] },
    { name: '디지털 캔버스', href: '/canvas', category: '크리에이티브', keywords: ['canvas', '캔버스', 'draw', '그리기'] },
    { name: '스마트 채팅', href: '/chat', category: 'AI', keywords: ['chat', '채팅', 'ai', '대화'] },
    { name: 'URL 인코더', href: '/tools/url-encoder', category: '유틸', keywords: ['url', 'encode', '인코딩', '변환'] },
    { name: 'Base64', href: '/tools/base64', category: '유틸', keywords: ['base64', '인코딩', 'encoding'] },
    { name: '해시 생성기', href: '/tools/hash', category: '보안', keywords: ['hash', '해시', 'sha', 'md5'] },
    { name: 'QR 생성기', href: '/tools/qr-generator', category: '유틸', keywords: ['qr', 'code', '코드', '생성'] }
  ]

  // 필터링된 도구들
  const filteredTools = tools.filter(tool => 
    searchTerm === '' || 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    // 키보드 단축키 핸들러
    const handleKeyDown = (e: any) => {
      // "/" 키로 검색 포커스
      if (e.key === '/' && !isSearchFocused) {
        e.preventDefault()
        const searchInput = document.querySelector('.search-input') as HTMLInputElement
        searchInput?.focus()
      }
      // Escape로 검색 해제
      if (e.key === 'Escape') {
        setSearchTerm('')
        const searchInput = document.querySelector('.search-input') as HTMLInputElement
        searchInput?.blur()
      }
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSearchFocused])

  return (
    <div className="min-h-screen relative">
      {/* 동적 배경 */}
      <div 
        className="fixed inset-0 opacity-30 transition-all duration-500 ease-out"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 212, 170, 0.1), transparent 80%)`
        }}
      />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="hero-gradient absolute inset-0"></div>
        
        {/* 떠다니는 프리뷰 요소들 */}
        <FloatingPreview delay={0} className="absolute top-20 left-10 md:left-20">
          <div className="card card-small w-48 h-32">
            <div className="text-xs text-text-muted mb-2">JSON Formatter</div>
            <div className="font-mono text-xs text-primary">{`{
  "name": "user",
  "tools": [...]
}`}</div>
          </div>
        </FloatingPreview>
        
        <FloatingPreview delay={1} className="absolute top-32 right-10 md:right-20">
          <div className="card card-small w-40 h-24">
            <div className="text-xs text-text-muted mb-2">QR Generator</div>
            <div className="w-12 h-12 bg-white rounded grid grid-cols-4 gap-px">
              {Array.from({length: 16}).map((_, i) => (
                <div key={i} className={`${Math.random() > 0.5 ? 'bg-black' : 'bg-white'} rounded-sm`} />
              ))}
            </div>
          </div>
        </FloatingPreview>
        
        <FloatingPreview delay={2} className="absolute bottom-32 left-16">
          <div className="card card-small w-44 h-28">
            <div className="text-xs text-text-muted mb-2">Hash Generator</div>
            <div className="font-mono text-xs text-tertiary">SHA256: a1b2c3d4...</div>
            <div className="font-mono text-xs text-accent mt-1">MD5: 5e6f7g8h...</div>
          </div>
        </FloatingPreview>
        
        <FloatingPreview delay={1.5} className="absolute bottom-20 right-16">
          <div className="card card-small w-36 h-24">
            <div className="text-xs text-text-muted mb-2">Canvas</div>
            <div className="w-full h-12 bg-gradient-to-r from-primary to-secondary rounded opacity-50" />
          </div>
        </FloatingPreview>
        
        {/* 메인 콘텐츠 */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            {/* 브랜드명 */}
            <div className="mb-8">
              <h1 className="text-6xl md:text-8xl font-black text-text-primary mb-4">
                DEVFORGE
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-primary to-primary-light mx-auto rounded-full" />
            </div>
            
            {/* 가치 제안 */}
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
                <AnimatedText texts={valueTexts} />
              </h2>
              <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
                AI 기반 차세대 개발도구로 당신의 워크플로우를 혁신하세요
              </p>
            </div>
            
            {/* 검색바 */}
            <div className="search-container mb-12">
              <input
                type="text"
                placeholder="무엇을 도와드릴까요? (/ 키를 눌러 빠른 검색)"
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <div className="search-icon">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* 검색 결과 드롭다운 */}
              {searchTerm && isSearchFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-elevated border border-border-bright rounded-2xl backdrop-filter backdrop-blur-20 z-50">
                  <div className="p-4">
                    <div className="text-sm text-text-muted mb-3">
                      "{searchTerm}" 검색 결과 ({filteredTools.length}개)
                    </div>
                    {filteredTools.length > 0 ? (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {filteredTools.map((tool, index) => (
                          <Link 
                            key={tool.href} 
                            href={tool.href}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors group"
                          >
                            <div className="w-2 h-2 bg-primary rounded-full opacity-60 group-hover:opacity-100" />
                            <div className="flex-1">
                              <div className="font-medium text-white text-sm">{tool.name}</div>
                              <div className="text-xs text-text-secondary">{tool.category}</div>
                            </div>
                            <div className="text-primary text-xs group-hover:text-accent">→</div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-text-muted">
                        <div className="text-2xl mb-2">🔍</div>
                        <div>검색 결과가 없습니다</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* CTA 버튼들 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/tools/json-formatter" className="btn btn-primary px-8 py-4 text-lg ripple-effect scale-on-hover">
                JSON 포맷터 시작하기
              </Link>
              <Link href="/tools" className="btn btn-secondary px-8 py-4 text-lg ripple-effect scale-on-hover">
                모든 도구 보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 카테고리별 도구 섹션 */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* 섹션 헤더 */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">AI-Powered</span> Developer Tools
            </h2>
            <p className="text-text-secondary text-lg max-w-3xl mx-auto">
              워크플로우를 혁신하는 차세대 개발도구. 인공지능이 당신의 생산성을 10배 향상시킵니다.
            </p>
          </div>
          
          {/* Bento Box 그리드 레이아웃 */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-auto">
            
            {/* JSON AI Formatter - Flagship Tool */}
            <Link href="/tools/json-formatter" className="group md:col-span-2 lg:row-span-2">
              <div className="card card-large relative overflow-hidden group-hover:scale-[1.02] transition-all duration-300">
                <div className="absolute top-4 right-4 text-xs bg-gradient-to-r from-accent-success to-primary px-3 py-1 rounded-full text-white font-semibold">
                  🚀 AI Enhanced
                </div>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-text-primary mb-2">AI JSON 포맷터</h3>
                    <p className="text-text-secondary mb-3">자동 오류 감지 및 스마트 구조 개선</p>
                    <div className="flex gap-2">
                      <span className="text-xs bg-surface-elevated px-2 py-1 rounded text-accent-success">자동완성</span>
                      <span className="text-xs bg-surface-elevated px-2 py-1 rounded text-primary">실시간 검증</span>
                    </div>
                  </div>
                </div>
                
                {/* AI Features Preview */}
                <div className="bg-surface-elevated rounded-xl p-4 mb-4 border border-border-bright">
                  <div className="text-text-muted text-sm mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent-success rounded-full animate-pulse"></div>
                    AI 스마트 기능
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-accent-success">✓</span>
                      <span className="text-text-secondary">자동 구문 오류 수정</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-accent-success">✓</span>
                      <span className="text-text-secondary">스키마 자동 생성</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-accent-success">✓</span>
                      <span className="text-text-secondary">최적화된 구조 제안</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent-success rounded-full animate-pulse"></div>
                    <span className="text-text-muted text-sm">AI 활성화</span>
                  </div>
                  <div className="flex items-center text-primary font-semibold group-hover:text-accent-success transition-colors">
                    체험하기 <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* AI Variable Generator - Medium Card */}
            <Link href="/tools/variable-generator" className="group md:col-span-2">
              <div className="card card-medium group-hover:border-primary transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent-success rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">AI 변수명 생성기</h3>
                    <p className="text-text-secondary text-sm">컨텍스트 기반 스마트 네이밍</p>
                  </div>
                </div>
                
                <div className="bg-surface-elevated rounded-lg p-3 mb-3 border border-border">
                  <div className="font-mono text-sm space-y-1">
                    <div className="text-text-muted text-xs">입력: "사용자 계정 정보"</div>
                    <div className="text-accent-success">✓ userAccountInfo</div>
                    <div className="text-accent-success">✓ user_account_data</div>
                    <div className="text-accent-success">✓ accountDetails</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-text-muted text-xs">AI 다중 제안</span>
                  </div>
                  <span className="text-primary text-sm font-medium group-hover:text-accent-success transition-colors">체험하기 →</span>
                </div>
              </div>
            </Link>
            
            {/* Canvas - Small Card */}
            <Link href="/canvas" className="group">
              <div className="card card-small">
                <div className="w-10 h-10 bg-gradient-to-br from-tertiary to-primary rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="text-md font-semibold text-white mb-2">디지털 캔버스</h3>
                <p className="text-text-secondary text-xs mb-3">자유로운 그리기</p>
                <div className="w-full h-8 bg-gradient-to-r from-primary/30 to-secondary/30 rounded opacity-60" />
                <div className="text-primary text-xs mt-2 group-hover:text-accent">그리기 →</div>
              </div>
            </Link>

            {/* Chat - Small Card */}
            <Link href="/chat" className="group">
              <div className="card card-small">
                <div className="w-10 h-10 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-md font-semibold text-white mb-2">스마트 채팅</h3>
                <p className="text-text-secondary text-xs mb-3">AI와 대화하기</p>
                <div className="flex gap-1 mb-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-tertiary rounded-full animate-pulse" style={{animationDelay: '0.2s'}} />
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{animationDelay: '0.4s'}} />
                </div>
                <div className="text-primary text-xs group-hover:text-accent">채팅하기 →</div>
              </div>
            </Link>
            
            {/* URL Encoder - Medium Card */}
            <Link href="/tools/url-encoder" className="group md:col-span-2">
              <div className="card card-medium">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-secondary rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">URL 인코더/디코더</h3>
                    <p className="text-text-secondary text-sm">URL을 안전하게 변환</p>
                  </div>
                </div>
                
                <div className="bg-surface-elevated rounded-lg p-3 mb-3 font-mono text-xs">
                  <div className="text-text-muted mb-1">Before:</div>
                  <div className="text-secondary">hello world!</div>
                  <div className="text-text-muted mb-1 mt-2">After:</div>
                  <div className="text-primary">hello%20world%21</div>
                </div>
                
                <div className="text-primary text-sm group-hover:text-accent">인코딩하기 →</div>
              </div>
            </Link>
            
            {/* Base64 - Small Card */}
            <Link href="/tools/base64" className="group">
              <div className="card card-small">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
                <h3 className="text-md font-semibold text-white mb-2">Base64</h3>
                <p className="text-text-secondary text-xs mb-3">인코딩/디코딩</p>
                <div className="font-mono text-xs text-tertiary mb-2">SGVsbG8gV29ybGQh</div>
                <div className="text-primary text-xs group-hover:text-accent">변환하기 →</div>
              </div>
            </Link>

            {/* Hash Generator - Small Card */}
            <Link href="/tools/hash" className="group">
              <div className="card card-small">
                <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-md font-semibold text-white mb-2">해시 생성기</h3>
                <p className="text-text-secondary text-xs mb-3">SHA, MD5 해시</p>
                <div className="font-mono text-xs text-secondary mb-2">a1b2c3d4...</div>
                <div className="text-primary text-xs group-hover:text-accent">생성하기 →</div>
              </div>
            </Link>

            {/* QR Generator - Small Card */}
            <Link href="/tools/qr-generator" className="group">
              <div className="card card-small">
                <div className="w-10 h-10 bg-gradient-to-br from-tertiary to-accent rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <h3 className="text-md font-semibold text-white mb-2">QR 생성기</h3>
                <p className="text-text-secondary text-xs mb-3">QR 코드 생성</p>
                <div className="w-12 h-12 bg-white rounded grid grid-cols-4 gap-px mb-2">
                  {Array.from({length: 16}).map((_, i) => (
                    <div key={i} className={`${Math.random() > 0.5 ? 'bg-black' : 'bg-white'} rounded-sm`} />
                  ))}
                </div>
                <div className="text-primary text-xs group-hover:text-accent">생성하기 →</div>
              </div>
            </Link>
            
          </div>
          
          {/* 가치 제안 섹션 */}
          <div className="mt-16 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">🔥</div>
                <div className="text-text-secondary">AI 기반 자동화</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-success mb-2">🚀</div>
                <div className="text-text-secondary">10x 생산성 향상</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-warning mb-2">⚡</div>
                <div className="text-text-secondary">실시간 처리</div>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* AI 워크플로우 체인 섹션 */}
      <WorkflowChain />

      {/* 성과 측정 대시보드 */}
      <PerformanceDashboard />

      {/* AI 어시스턴트 */}
      <AIAssistant />

    </div>
  )
}