'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

const TypewriterText = ({ texts }: { texts: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    const currentFullText = texts[currentIndex]

    if (isTyping) {
      if (charIndex < currentFullText.length) {
        const timeout = setTimeout(() => {
          setCurrentText(currentFullText.slice(0, charIndex + 1))
          setCharIndex(charIndex + 1)
        }, 50 + Math.random() * 50)
        return () => clearTimeout(timeout)
      } else {
        const timeout = setTimeout(() => {
          setIsTyping(false)
        }, 2000)
        return () => clearTimeout(timeout)
      }
    } else {
      if (charIndex > 0) {
        const timeout = setTimeout(() => {
          setCurrentText(currentFullText.slice(0, charIndex - 1))
          setCharIndex(charIndex - 1)
        }, 30)
        return () => clearTimeout(timeout)
      } else {
        setCurrentIndex((prev) => (prev + 1) % texts.length)
        setIsTyping(true)
      }
    }
  }, [texts, currentIndex, charIndex, isTyping])

  return (
    <span className="text-blue-400 font-bold relative">
      {currentText}
      <span className="animate-pulse text-blue-400">|</span>
    </span>
  )
}

const FloatingPreview = ({
  children,
  delay = 0,
  className = ''
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) => {
  return (
    <div
      className={cn(
        "floating-element opacity-30 hover:opacity-80 transition-opacity duration-300",
        "hover:scale-105 transition-transform duration-300",
        "relative",
        className
      )}
      style={{
        animationDelay: `${delay}s`
      }}
    >
      {children}
    </div>
  )
}

interface HeroSectionProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  isSearchFocused: boolean
  setIsSearchFocused: (value: boolean) => void
  filteredTools: any[]
  renderIcon: (iconName: string) => React.ReactNode
}

export default function HeroSection({
  searchTerm,
  setSearchTerm,
  isSearchFocused,
  setIsSearchFocused,
  filteredTools,
  renderIcon
}: HeroSectionProps) {
  const valueTexts = [
    '개발자 도구',
    '간단한 도구',
    '빠른 처리',
    '편리한 사용'
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="hero-gradient absolute inset-0"></div>

      {/* 떠다니는 프리뷰 요소들 */}
      <FloatingPreview delay={0} className="hidden lg:block absolute top-24 left-8 xl:left-16">
        <div className="card card-small interactive-card w-44 h-28">
          <div className="text-xs text-text-muted mb-2">JSON Formatter</div>
          <div className="font-mono text-xs text-primary">{`{
  "name": "user",
  "tools": [...]
}`}</div>
        </div>
      </FloatingPreview>

      <FloatingPreview delay={1} className="hidden lg:block absolute top-40 right-8 xl:right-16">
        <div className="card card-small interactive-card w-36 h-24">
          <div className="text-xs text-text-muted mb-2">QR Generator</div>
          <div className="w-10 h-10 bg-white rounded grid grid-cols-4 gap-px">
            <div className="bg-black rounded-sm" />
            <div className="bg-white rounded-sm" />
            <div className="bg-black rounded-sm" />
            <div className="bg-white rounded-sm" />
            <div className="bg-white rounded-sm" />
            <div className="bg-black rounded-sm" />
            <div className="bg-black rounded-sm" />
            <div className="bg-white rounded-sm" />
            <div className="bg-black rounded-sm" />
            <div className="bg-white rounded-sm" />
            <div className="bg-white rounded-sm" />
            <div className="bg-black rounded-sm" />
            <div className="bg-white rounded-sm" />
            <div className="bg-black rounded-sm" />
            <div className="bg-black rounded-sm" />
            <div className="bg-white rounded-sm" />
          </div>
        </div>
      </FloatingPreview>

      <FloatingPreview delay={2} className="hidden xl:block absolute bottom-40 left-12">
        <div className="card card-small interactive-card w-40 h-26">
          <div className="text-xs text-text-muted mb-2">Hash Generator</div>
          <div className="font-mono text-xs text-tertiary">SHA256: a1b2c3d4...</div>
          <div className="font-mono text-xs text-accent mt-1">MD5: 5e6f7g8h...</div>
        </div>
      </FloatingPreview>

      <FloatingPreview delay={1.5} className="hidden xl:block absolute bottom-32 right-12">
        <div className="card card-small interactive-card w-32 h-22">
          <div className="text-xs text-text-muted mb-2">Canvas</div>
          <div className="w-full h-10 bg-gradient-to-r from-primary to-secondary rounded opacity-50" />
        </div>
      </FloatingPreview>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
        <div className="w-full max-w-5xl mx-auto">
          {/* 브랜드명 */}
          <div className="mb-12 flex flex-col items-center justify-center">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-text-primary mb-8 text-center">
              DEVFORGE
            </h1>
            <div className="w-28 sm:w-36 h-1.5 bg-gradient-to-r from-primary to-primary-light mx-auto rounded-full" />
          </div>

          {/* 가치 제안 */}
          <div className="mb-18 flex flex-col items-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary mb-8 text-center">
              <TypewriterText texts={valueTexts} />
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-text-secondary max-w-4xl mx-auto leading-relaxed text-center px-4">
              개발 도구
            </p>
          </div>

          {/* 검색바 */}
          <div className="search-container mb-20 max-w-3xl mx-auto flex justify-center">
            <div className="w-full max-w-2xl relative">
              <input
                type="text"
                placeholder="무엇을 도와드릴까요? (/ 키를 눌러 빠른 검색)"
                className="search-input hover-border"
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
                  <div className="p-6">
                    <div className="text-sm text-text-muted mb-4 text-center">
                      "{searchTerm}" 검색 결과 ({filteredTools.length}개)
                    </div>
                    {filteredTools.length > 0 ? (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {filteredTools.map((tool, index) => (
                          <Link
                            key={tool.href}
                            href={tool.href}
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-hover transition-colors group"
                          >
                            <div className="w-3 h-3 bg-primary rounded-full opacity-60 group-hover:opacity-100" />
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
                        <div className="w-8 h-8 mx-auto mb-3 opacity-50">{renderIcon('search')}</div>
                        <div>검색 결과가 없습니다</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center items-center w-full max-w-2xl mx-auto px-4">
            <Link
              href="/tools/json-formatter"
              className="btn btn-primary btn-enhanced px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg ripple-effect w-full sm:flex-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center"
              aria-label="JSON 포맷터 도구 시작하기"
            >
              JSON 포맷터 시작하기
            </Link>
            <Link
              href="/tools"
              className="btn btn-secondary btn-enhanced px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg ripple-effect w-full sm:flex-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-center"
              aria-label="모든 개발 도구 목록 보기"
            >
              모든 도구 보기
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
