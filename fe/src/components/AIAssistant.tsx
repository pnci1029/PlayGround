'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Suggestion {
  id: string
  tool: string
  reason: string
  href: string
  confidence: number
}

export default function AIAssistant() {
  const [isVisible, setIsVisible] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [currentSuggestion, setCurrentSuggestion] = useState(0)

  useEffect(() => {
    // 페이지 로드 후 3초 뒤에 AI 어시스턴트 활성화
    const timer = setTimeout(() => {
      setIsVisible(true)
      generateSuggestions()
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const generateSuggestions = () => {
    const smartSuggestions: Suggestion[] = [
      {
        id: '1',
        tool: 'JSON 포맷터',
        reason: '복잡한 API 응답을 정리하시나요?',
        href: '/tools/json-formatter',
        confidence: 0.95
      },
      {
        id: '2', 
        tool: 'AI 변수명 생성기',
        reason: '변수명 고민하는 시간을 절약해보세요',
        href: '/tools/variable-generator',
        confidence: 0.88
      },
      {
        id: '3',
        tool: 'QR 생성기',
        reason: '프로젝트 배포 링크를 공유하시나요?',
        href: '/tools/qr-generator', 
        confidence: 0.82
      }
    ]
    
    setSuggestions(smartSuggestions)
  }

  if (!isVisible || suggestions.length === 0) return null

  const currentSug = suggestions[currentSuggestion]

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      <div className="bg-surface-elevated border border-border-bright rounded-2xl p-4 shadow-lg backdrop-blur-24 w-80 transform transition-all duration-500 ease-out">
        {/* AI Assistant Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent-success rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h4 className="text-text-primary font-semibold text-sm">AI 어시스턴트</h4>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-accent-success rounded-full animate-pulse"></div>
              <span className="text-text-muted text-xs">활성화됨</span>
            </div>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="ml-auto text-text-muted hover:text-text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Suggestion Card */}
        <div className="bg-surface rounded-xl p-3 border border-border mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
              {Math.round(currentSug.confidence * 100)}% 일치
            </span>
          </div>
          <p className="text-text-secondary text-sm mb-2">{currentSug.reason}</p>
          <h5 className="text-text-primary font-semibold">{currentSug.tool} 추천</h5>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link 
            href={currentSug.href}
            className="flex-1 bg-gradient-to-r from-primary to-primary-light text-white text-center py-2 px-4 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300"
          >
            사용하기
          </Link>
          <button
            onClick={() => setCurrentSuggestion((prev) => (prev + 1) % suggestions.length)}
            className="px-3 py-2 bg-surface-hover border border-border rounded-lg text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Suggestion Indicators */}
        <div className="flex justify-center gap-1 mt-3">
          {suggestions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSuggestion(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSuggestion ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}