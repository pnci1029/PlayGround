'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import CommandPalette, { useCommandPalette, Command } from '@/components/ui/CommandPalette'
import { cn, debounce, copyToClipboard } from '@/lib/utils'

// Enhanced typing animation component
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
        }, 50 + Math.random() * 50) // Varying speed for natural feel
        return () => clearTimeout(timeout)
      } else {
        const timeout = setTimeout(() => {
          setIsTyping(false)
        }, 2000) // Pause at end
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

// Enhanced floating preview with better interaction
const FloatingPreview = ({ children, delay = 0, className = '' }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2
    })
  }, [])
  
  return (
    <div 
      className={cn(
        "floating-element opacity-30 hover:opacity-80 transition-all duration-500",
        "transform hover:scale-105 cursor-pointer",
        "hover:z-10 relative",
        className
      )}
      style={{ 
        animationDelay: `${delay}s`,
        transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePosition({ x: 0, y: 0 })}
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
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const commandPalette = useCommandPalette()
  
  const valueTexts = [
    'World-class developer tools',
    'Built with passion and precision', 
    'Inspired by Linear, Arc, and Raycast',
    'The future of development utilities'
  ]

  // Enhanced tool data with more metadata
  const tools = [
    { 
      name: 'JSON Formatter', 
      href: '/tools/json-formatter', 
      category: 'Development', 
      keywords: ['json', 'format', 'validate', 'pretty'], 
      description: 'Format, validate and beautify JSON data',
      icon: '🔧',
      status: 'active',
      lastUsed: '2 min ago'
    },
    { 
      name: 'Variable Generator', 
      href: '/tools/variable-generator', 
      category: 'Development', 
      keywords: ['variable', 'naming', 'camelcase', 'snake'], 
      description: 'Generate variable names in different conventions',
      icon: '📝',
      status: 'active',
      lastUsed: '5 min ago'
    },
    { 
      name: 'Smart Canvas', 
      href: '/canvas', 
      category: 'Creative', 
      keywords: ['canvas', 'draw', 'design', 'sketch'], 
      description: 'Digital canvas with advanced drawing tools',
      icon: '🎨',
      status: 'beta',
      lastUsed: '1 hour ago'
    },
    { 
      name: 'AI Assistant', 
      href: '/chat', 
      category: 'AI', 
      keywords: ['chat', 'ai', 'assistant', 'help'], 
      description: 'Intelligent coding assistant and chat',
      icon: '🤖',
      status: 'active',
      lastUsed: '10 min ago'
    },
    { 
      name: 'URL Encoder', 
      href: '/tools/url-encoder', 
      category: 'Utilities', 
      keywords: ['url', 'encode', 'decode', 'percent'], 
      description: 'Encode and decode URLs safely',
      icon: '🔗',
      status: 'active',
      lastUsed: '30 min ago'
    },
    { 
      name: 'Base64 Converter', 
      href: '/tools/base64', 
      category: 'Utilities', 
      keywords: ['base64', 'encode', 'decode', 'binary'], 
      description: 'Convert text and files to Base64',
      icon: '📄',
      status: 'active',
      lastUsed: '15 min ago'
    },
    { 
      name: 'Hash Generator', 
      href: '/tools/hash', 
      category: 'Security', 
      keywords: ['hash', 'sha', 'md5', 'crypto'], 
      description: 'Generate secure hashes and checksums',
      icon: '🔐',
      status: 'active',
      lastUsed: '1 hour ago'
    },
    { 
      name: 'QR Generator', 
      href: '/tools/qr-generator', 
      category: 'Utilities', 
      keywords: ['qr', 'code', 'generate', 'barcode'], 
      description: 'Create QR codes for any text or URL',
      icon: '📱',
      status: 'active',
      lastUsed: '45 min ago'
    }
  ]

  // Enhanced filtering and command palette setup
  const filteredTools = useMemo(() => {
    if (!searchTerm) return tools
    
    const searchLower = searchTerm.toLowerCase()
    return tools.filter(tool => 
      tool.name.toLowerCase().includes(searchLower) ||
      tool.description.toLowerCase().includes(searchLower) ||
      tool.category.toLowerCase().includes(searchLower) ||
      tool.keywords.some(keyword => keyword.toLowerCase().includes(searchLower))
    )
  }, [tools, searchTerm])
  
  // Command palette commands
  const commands: Command[] = useMemo(() => [
    ...tools.map(tool => ({
      id: tool.href,
      label: tool.name,
      description: tool.description,
      category: tool.category,
      icon: <span className="text-lg">{tool.icon}</span>,
      action: () => window.location.href = tool.href
    })),
    {
      id: 'copy-url',
      label: 'Copy Current URL',
      description: 'Copy the current page URL to clipboard',
      category: 'Utilities',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
      shortcut: '⌘C',
      action: () => copyToClipboard(window.location.href)
    },
    {
      id: 'toggle-theme',
      label: 'Toggle Theme',
      description: 'Switch between light and dark theme',
      category: 'Settings',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
      shortcut: '⌘T',
      action: () => {/* Theme toggle logic */}
    }
  ], [tools])

  // Enhanced mouse tracking with performance optimization
  const debouncedMouseMove = useCallback(
    debounce((e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }, 16), // ~60fps
    []
  )
  
  useEffect(() => {
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    
    // Enhanced keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // "/" key to focus search
      if (e.key === '/' && !isSearchFocused) {
        e.preventDefault()
        const searchInput = document.querySelector('.search-input') as HTMLInputElement
        searchInput?.focus()
        setIsSearchFocused(true)
      }
      
      // Escape to clear search and blur
      if (e.key === 'Escape') {
        if (isSearchFocused) {
          setSearchTerm('')
          const searchInput = document.querySelector('.search-input') as HTMLInputElement
          searchInput?.blur()
          setIsSearchFocused(false)
        }
      }
      
      // Number keys for quick tool access
      if (e.key >= '1' && e.key <= '9' && !isSearchFocused) {
        const toolIndex = parseInt(e.key) - 1
        if (toolIndex < tools.length) {
          window.location.href = tools[toolIndex].href
        }
      }
    }
    
    window.addEventListener('mousemove', debouncedMouseMove)
    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      clearInterval(timeInterval)
      window.removeEventListener('mousemove', debouncedMouseMove)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSearchFocused, debouncedMouseMove, tools])

  return (
    <>
      {/* Command Palette */}
      <CommandPalette 
        commands={commands}
        isOpen={commandPalette.isOpen}
        onClose={commandPalette.close}
        placeholder="Search tools, run commands..."
      />
      
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
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
        
        {/* 떠다니는 프리뷰 요소들 - 개선된 위치 설정 */}
        <FloatingPreview delay={0} className="hidden lg:block absolute top-24 left-8 xl:left-16">
          <div className="card card-small w-44 h-28">
            <div className="text-xs text-text-muted mb-2">JSON Formatter</div>
            <div className="font-mono text-xs text-primary">{`{
  "name": "user",
  "tools": [...]
}`}</div>
          </div>
        </FloatingPreview>
        
        <FloatingPreview delay={1} className="hidden lg:block absolute top-40 right-8 xl:right-16">
          <div className="card card-small w-36 h-24">
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
          <div className="card card-small w-40 h-26">
            <div className="text-xs text-text-muted mb-2">Hash Generator</div>
            <div className="font-mono text-xs text-tertiary">SHA256: a1b2c3d4...</div>
            <div className="font-mono text-xs text-accent mt-1">MD5: 5e6f7g8h...</div>
          </div>
        </FloatingPreview>
        
        <FloatingPreview delay={1.5} className="hidden xl:block absolute bottom-32 right-12">
          <div className="card card-small w-32 h-22">
            <div className="text-xs text-text-muted mb-2">Canvas</div>
            <div className="w-full h-10 bg-gradient-to-r from-primary to-secondary rounded opacity-50" />
          </div>
        </FloatingPreview>
        
        {/* 메인 콘텐츠 */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <div className="max-w-4xl mx-auto">
            {/* 브랜드명 */}
            <div className="mb-10">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-text-primary mb-6">
                DEVFORGE
              </h1>
              <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-primary to-primary-light mx-auto rounded-full" />
            </div>
            
            {/* 가치 제안 */}
            <div className="mb-16">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary mb-6">
                <TypewriterText texts={valueTexts} />
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                개발자의 일상을 조금 더 편리하게 만드는 실용적인 도구들
              </p>
            </div>
            
            {/* 검색바 */}
            <div className="search-container mb-16 max-w-2xl mx-auto">
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
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center max-w-lg mx-auto">
              <Link href="/tools/json-formatter" className="btn btn-primary px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg ripple-effect scale-on-hover w-full sm:w-auto">
                JSON 포맷터 시작하기
              </Link>
              <Link href="/tools" className="btn btn-secondary px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg ripple-effect scale-on-hover w-full sm:w-auto">
                모든 도구 보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Revolutionary Tools Showcase - Inspired by Linear, Figma, and Arc */}
      <section className="py-20 lg:py-32 relative">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl">
          
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 mb-8 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-white/80 tracking-wide">Featured Tools</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Powerful
              </span>
              {' & '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Beautiful
              </span>
            </h2>
            
            <p className="text-xl text-white/70 max-w-4xl mx-auto leading-relaxed">
              Every tool is crafted with precision, designed for performance, 
              and built to transform your development workflow.
            </p>
          </div>
          
          {/* Revolutionary Bento Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 auto-rows-auto max-w-7xl mx-auto">
            
            {/* JSON Formatter - Hero Tool */}
            <div 
              className="group sm:col-span-2 xl:col-span-2 xl:row-span-2 cursor-pointer"
              onClick={() => window.location.href = '/tools/json-formatter'}
              onMouseEnter={() => setSelectedTool('json-formatter')}
              onMouseLeave={() => setSelectedTool(null)}
            >
              <Card 
                variant="elevated" 
                size="lg" 
                className={cn(
                  "h-full relative overflow-hidden transition-all duration-500",
                  "group-hover:scale-[1.02] group-hover:border-blue-500/50",
                  selectedTool === 'json-formatter' && "border-blue-500/30 shadow-xl shadow-blue-500/20"
                )}
              >
                {/* Status Badge */}
                <div className="absolute top-6 right-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400 font-semibold bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
                    ✨ Most Popular
                  </span>
                </div>
                
                {/* Header */}
                <div className="flex items-start gap-6 mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl">🔧</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center border-2 border-black">
                      <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      JSON Formatter
                    </h3>
                    <p className="text-white/60 mb-4 text-base leading-relaxed">
                      Format, validate, and beautify JSON data with intelligent parsing and error detection
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">
                        Formatting
                      </span>
                      <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full border border-green-500/30">
                        Validation
                      </span>
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
                        Minification
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Live Preview */}
                <div className="bg-black/40 border border-white/10 rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-white/70 text-sm font-medium">Live Preview</span>
                  </div>
                  
                  <div className="font-mono text-sm">
                    <div className="text-white/50 mb-2">Input:</div>
                    <div className="text-red-300 mb-4">{`{"name":"user","data":[1,2,3]}`}</div>
                    
                    <div className="text-white/50 mb-2">Output:</div>
                    <div className="text-green-300 leading-relaxed">
{`{
  "name": "user",
  "data": [
    1,
    2,
    3
  ]
}`}
                    </div>
                  </div>
                </div>
                
                {/* Stats & CTA */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">2.1K</div>
                      <div className="text-xs text-white/50">Uses today</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">99%</div>
                      <div className="text-xs text-white/50">Accuracy</div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="group-hover:bg-blue-500 group-hover:text-white transition-colors"
                  >
                    Try Now 
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </Card>
            </div>

            {/* Variable Generator - Enhanced Medium Card */}
            <div 
              className="group sm:col-span-2 lg:col-span-2 xl:col-span-2 cursor-pointer"
              onClick={() => window.location.href = '/tools/variable-generator'}
              onMouseEnter={() => setSelectedTool('variable-generator')}
              onMouseLeave={() => setSelectedTool(null)}
            >
              <Card 
                variant="elevated" 
                size="md" 
                className={cn(
                  "h-full transition-all duration-500",
                  "group-hover:border-purple-500/50 group-hover:-translate-y-1",
                  selectedTool === 'variable-generator' && "border-purple-500/30 shadow-lg shadow-purple-500/20"
                )}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                      Variable Generator
                    </h3>
                    <p className="text-white/60 text-sm">
                      Convert naming conventions instantly
                    </p>
                  </div>
                </div>
                
                {/* Interactive Preview */}
                <div className="bg-black/40 border border-white/10 rounded-lg p-4 mb-4">
                  <div className="font-mono text-sm space-y-2">
                    <div className="text-white/50 text-xs mb-3">Input: "user account info"</div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span className="text-purple-300">userAccountInfo</span>
                      <span className="text-xs text-white/40">(camelCase)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span className="text-blue-300">user_account_info</span>
                      <span className="text-xs text-white/40">(snake_case)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span className="text-cyan-300">USER_ACCOUNT_INFO</span>
                      <span className="text-xs text-white/40">(CONSTANT_CASE)</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30">
                      Smart Rules
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-white/60 hover:text-purple-400">
                    Generate →
                  </Button>
                </div>
              </Card>
            </div>
            
            {/* Smart Canvas - Compact but Powerful */}
            <div 
              className="group cursor-pointer"
              onClick={() => window.location.href = '/canvas'}
              onMouseEnter={() => setSelectedTool('canvas')}
              onMouseLeave={() => setSelectedTool(null)}
            >
              <Card 
                variant="elevated" 
                size="sm" 
                className={cn(
                  "h-full transition-all duration-500 relative overflow-hidden",
                  "group-hover:border-cyan-500/50 group-hover:-translate-y-1",
                  selectedTool === 'canvas' && "border-cyan-500/30 shadow-lg shadow-cyan-500/20"
                )}
              >
                <div className="absolute top-2 right-2">
                  <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full border border-cyan-500/30">
                    Beta
                  </span>
                </div>
                
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xl">🎨</span>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  Smart Canvas
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  AI-powered digital drawing
                </p>
                
                {/* Mini Canvas Preview */}
                <div className="w-full h-12 bg-black/40 rounded-lg border border-white/10 mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 animate-pulse" />
                  <div className="absolute top-2 left-2 w-2 h-2 bg-cyan-400 rounded-full" />
                  <div className="absolute top-4 left-6 w-1 h-1 bg-blue-400 rounded-full" />
                  <div className="absolute bottom-2 right-3 w-1.5 h-1.5 bg-purple-400 rounded-full" />
                </div>
                
                <Button variant="ghost" size="sm" className="w-full text-white/60 hover:text-cyan-400">
                  Create →
                </Button>
              </Card>
            </div>

            {/* AI Assistant - Enhanced Small Card */}
            <div 
              className="group cursor-pointer"
              onClick={() => window.location.href = '/chat'}
              onMouseEnter={() => setSelectedTool('chat')}
              onMouseLeave={() => setSelectedTool(null)}
            >
              <Card 
                variant="elevated" 
                size="sm" 
                className={cn(
                  "h-full transition-all duration-500",
                  "group-hover:border-green-500/50 group-hover:-translate-y-1",
                  selectedTool === 'chat' && "border-green-500/30 shadow-lg shadow-green-500/20"
                )}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xl">🤖</span>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
                  AI Assistant
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  Intelligent coding helper
                </p>
                
                {/* Chat Activity Indicator */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0s'}} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                  </div>
                  <span className="text-xs text-white/50">Thinking...</span>
                </div>
                
                <Button variant="ghost" size="sm" className="w-full text-white/60 hover:text-green-400">
                  Chat →
                </Button>
              </Card>
            </div>
            
            {/* URL Encoder - Enhanced Medium Card */}
            <div 
              className="group sm:col-span-2 lg:col-span-2 xl:col-span-2 cursor-pointer"
              onClick={() => window.location.href = '/tools/url-encoder'}
              onMouseEnter={() => setSelectedTool('url-encoder')}
              onMouseLeave={() => setSelectedTool(null)}
            >
              <Card 
                variant="elevated" 
                size="md" 
                className={cn(
                  "h-full transition-all duration-500",
                  "group-hover:border-orange-500/50 group-hover:-translate-y-1",
                  selectedTool === 'url-encoder' && "border-orange-500/30 shadow-lg shadow-orange-500/20"
                )}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🔗</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">
                      URL Encoder/Decoder
                    </h3>
                    <p className="text-white/60 text-sm">
                      Safe URL encoding and decoding
                    </p>
                  </div>
                </div>
                
                {/* Live Transformation Preview */}
                <div className="bg-black/40 border border-white/10 rounded-lg p-4 mb-4">
                  <div className="space-y-3">
                    <div>
                      <div className="text-white/50 text-xs mb-1">Input:</div>
                      <div className="font-mono text-sm text-orange-300">hello world!</div>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-px bg-gradient-to-r from-orange-500/50 to-red-500/50" />
                      <div className="mx-2 text-orange-400">↓</div>
                      <div className="w-8 h-px bg-gradient-to-r from-red-500/50 to-orange-500/50" />
                    </div>
                    
                    <div>
                      <div className="text-white/50 text-xs mb-1">Output:</div>
                      <div className="font-mono text-sm text-green-300">hello%20world%21</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded border border-orange-500/30">
                    Bidirectional
                  </span>
                  <Button variant="ghost" size="sm" className="text-white/60 hover:text-orange-400">
                    Encode →
                  </Button>
                </div>
              </Card>
            </div>
            
            {/* Base64 Converter - Compact */}
            <div 
              className="group cursor-pointer"
              onClick={() => window.location.href = '/tools/base64'}
              onMouseEnter={() => setSelectedTool('base64')}
              onMouseLeave={() => setSelectedTool(null)}
            >
              <Card 
                variant="elevated" 
                size="sm" 
                className={cn(
                  "h-full transition-all duration-500",
                  "group-hover:border-indigo-500/50 group-hover:-translate-y-1",
                  selectedTool === 'base64' && "border-indigo-500/30 shadow-lg shadow-indigo-500/20"
                )}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xl">📄</span>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                  Base64
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  Binary safe encoding
                </p>
                
                <div className="bg-black/40 border border-white/10 rounded p-2 mb-4">
                  <div className="font-mono text-xs text-indigo-300">SGVsbG8gV29ybGQh</div>
                </div>
                
                <Button variant="ghost" size="sm" className="w-full text-white/60 hover:text-indigo-400">
                  Convert →
                </Button>
              </Card>
            </div>

            {/* Hash Generator - Security Focused */}
            <div 
              className="group cursor-pointer"
              onClick={() => window.location.href = '/tools/hash'}
              onMouseEnter={() => setSelectedTool('hash')}
              onMouseLeave={() => setSelectedTool(null)}
            >
              <Card 
                variant="elevated" 
                size="sm" 
                className={cn(
                  "h-full transition-all duration-500",
                  "group-hover:border-red-500/50 group-hover:-translate-y-1",
                  selectedTool === 'hash' && "border-red-500/30 shadow-lg shadow-red-500/20"
                )}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xl">🔐</span>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                  Hash Generator
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  Cryptographic hashing
                </p>
                
                <div className="space-y-1 mb-4">
                  <div className="font-mono text-xs text-red-300">SHA256: ••••</div>
                  <div className="font-mono text-xs text-pink-300">MD5: ••••</div>
                </div>
                
                <Button variant="ghost" size="sm" className="w-full text-white/60 hover:text-red-400">
                  Generate →
                </Button>
              </Card>
            </div>

            {/* QR Generator - Modern Design */}
            <div 
              className="group cursor-pointer"
              onClick={() => window.location.href = '/tools/qr-generator'}
              onMouseEnter={() => setSelectedTool('qr-generator')}
              onMouseLeave={() => setSelectedTool(null)}
            >
              <Card 
                variant="elevated" 
                size="sm" 
                className={cn(
                  "h-full transition-all duration-500",
                  "group-hover:border-emerald-500/50 group-hover:-translate-y-1",
                  selectedTool === 'qr-generator' && "border-emerald-500/30 shadow-lg shadow-emerald-500/20"
                )}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xl">📱</span>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  QR Generator
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  Smart QR codes
                </p>
                
                {/* Modern QR Preview */}
                <div className="w-12 h-12 bg-white rounded-lg border border-emerald-500/20 mb-4 relative overflow-hidden group-hover:bg-emerald-50 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10" />
                  <div className="grid grid-cols-4 gap-px p-1 h-full">
                    <div className="bg-black rounded-sm" />
                    <div className="bg-transparent" />
                    <div className="bg-black rounded-sm" />
                    <div className="bg-transparent" />
                    <div className="bg-transparent" />
                    <div className="bg-black rounded-sm" />
                    <div className="bg-black rounded-sm" />
                    <div className="bg-transparent" />
                    <div className="bg-black rounded-sm" />
                    <div className="bg-transparent" />
                    <div className="bg-transparent" />
                    <div className="bg-black rounded-sm" />
                    <div className="bg-transparent" />
                    <div className="bg-black rounded-sm" />
                    <div className="bg-black rounded-sm" />
                    <div className="bg-transparent" />
                  </div>
                </div>
                
                <Button variant="ghost" size="sm" className="w-full text-white/60 hover:text-emerald-400">
                  Create →
                </Button>
              </Card>
            </div>
            
          </div>
          
          {/* Feature Highlights - World-class presentation */}
          <div className="mt-32 text-center">
            <h3 className="text-3xl font-bold text-white mb-16">Why DEVFORGE?</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="text-lg font-semibold text-white mb-2">Lightning Fast</div>
                <div className="text-white/60 text-sm">Instant results with optimized algorithms</div>
              </div>
              
              <div className="group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🎨</span>
                </div>
                <div className="text-lg font-semibold text-white mb-2">Beautiful UI</div>
                <div className="text-white/60 text-sm">Pixel-perfect design inspired by top apps</div>
              </div>
              
              <div className="group">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🔒</span>
                </div>
                <div className="text-lg font-semibold text-white mb-2">Privacy First</div>
                <div className="text-white/60 text-sm">All processing happens locally in your browser</div>
              </div>
              
              <div className="group">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🚀</span>
                </div>
                <div className="text-lg font-semibold text-white mb-2">Always Free</div>
                <div className="text-white/60 text-sm">No subscriptions, no limits, just pure utility</div>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* Revolutionary CTA Section */}
      <section className="py-32 text-center relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-5xl relative">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              Ready to{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                transform
              </span>
              {' '}your workflow?
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Join thousands of developers who've already discovered the power of beautiful, fast, and intelligent development tools.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Button 
              size="lg"
              className="px-12 py-6 text-lg font-bold relative group overflow-hidden"
              onClick={() => window.location.href = '/tools/json-formatter'}
            >
              <span className="relative z-10">Start Building</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
            
            <Button 
              variant="secondary"
              size="lg"
              className="px-12 py-6 text-lg font-bold group"
              onClick={commandPalette.toggle}
            >
              <span className="mr-2">🚀</span>
              Open Command Palette
              <kbd className="ml-3 px-2 py-1 text-sm bg-white/10 rounded border border-white/20">⌘K</kbd>
            </Button>
          </div>
          
          {/* Social Proof */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-black text-blue-400 mb-2">10K+</div>
              <div className="text-white/60 text-sm">Monthly Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-purple-400 mb-2">50K+</div>
              <div className="text-white/60 text-sm">Tools Used Daily</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-cyan-400 mb-2">99.9%</div>
              <div className="text-white/60 text-sm">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/10">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-8 md:mb-0">
              <div className="text-2xl font-black text-white">DEVFORGE</div>
              <div className="w-px h-6 bg-white/20" />
              <div className="text-white/60 text-sm">World-class developer tools</div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                All systems operational
              </div>
              <div className="text-white/50 text-sm">
                Made with ❤️ by developers, for developers
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
    </>
  )
}
