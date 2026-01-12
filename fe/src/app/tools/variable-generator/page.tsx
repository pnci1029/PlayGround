'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

interface GeneratedVariable {
  camelCase: string
  PascalCase: string
  snake_case: string
  kebab_case: string
  UPPER_SNAKE_CASE: string
  lowercase: string
  UPPERCASE: string
}

export default function VariableGeneratorPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState<GeneratedVariable | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const generateVariables = async () => {
    if (!input.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const response = await api.post('/api/tools/variable-generator', {
        text: input
      })

      if (response.success) {
        setOutput(response.data.variables)
      } else {
        setError(response.error || '변수명 생성 실패')
      }
    } catch (err) {
      setError('서버 연결 오류')
    } finally {
      setIsLoading(false)
    }
  }

  const clearAll = () => {
    setInput('')
    setOutput(null)
    setError('')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--background)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">변수명 생성기</h1>
          <p className="text-gray-400">텍스트를 다양한 네이밍 컨벤션으로 변환합니다</p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={generateVariables}
            disabled={isLoading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {isLoading ? '생성중...' : '생성하기'}
          </button>
          <button
            onClick={clearAll}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            초기화
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* Input */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            입력 텍스트
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateVariables()}
            placeholder="예: user profile data"
            className="w-full bg-gray-900 border text-white p-4 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ borderColor: 'var(--border)' }}
          />
        </div>

        {/* Output */}
        {output && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {Object.entries(output).map(([convention, value]) => (
              <div
                key={convention}
                className="bg-gray-900 border rounded-lg p-4 transition-all duration-300"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-400">{convention}</h3>
                  <button
                    onClick={() => copyToClipboard(value)}
                    className="text-gray-500 hover:text-purple-400 transition-colors"
                    title="클립보드에 복사"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <code className="text-white font-mono text-sm break-all">{value}</code>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="p-4 bg-gray-900/50 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-white font-medium mb-2">지원하는 네이밍 컨벤션</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• <strong>camelCase</strong>: JavaScript, Java 등에서 사용</li>
            <li>• <strong>PascalCase</strong>: 클래스명, 컴포넌트명에 사용</li>
            <li>• <strong>snake_case</strong>: Python, Ruby 등에서 사용</li>
            <li>• <strong>kebab-case</strong>: CSS, HTML 속성에서 사용</li>
            <li>• <strong>UPPER_SNAKE_CASE</strong>: 상수명에서 사용</li>
          </ul>
        </div>
      </div>
    </div>
  )
}