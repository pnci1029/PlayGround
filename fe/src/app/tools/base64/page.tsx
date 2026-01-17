'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Base64Page() {
  const { t } = useLanguage()
  const [input, setInput] = useState('')
  const [encoded, setEncoded] = useState('')
  const [decoded, setDecoded] = useState('')

  const handleEncode = () => {
    if (!input.trim()) return
    try {
      const result = btoa(unescape(encodeURIComponent(input)))
      setEncoded(result)
    } catch (error) {
      setEncoded('인코딩 오류')
    }
  }

  const handleDecode = () => {
    if (!input.trim()) return
    try {
      const result = decodeURIComponent(escape(atob(input)))
      setDecoded(result)
    } catch (error) {
      setDecoded('디코딩 오류 - 유효하지 않은 Base64')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const clearAll = () => {
    setInput('')
    setEncoded('')
    setDecoded('')
  }

  const getStats = (text: string) => {
    if (!text) return { chars: 0, bytes: 0 }
    return {
      chars: text.length,
      bytes: new Blob([text]).size
    }
  }

  const inputStats = getStats(input)

  return (
    <div className="min-h-screen" style={{background: 'var(--background)'}}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Base64 인코더/디코더</h1>
          <p className="text-gray-400">텍스트를 Base64로 인코딩하거나 디코딩합니다</p>
        </div>

        <div className="space-y-6">
          {/* Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                입력 텍스트
              </label>
              <div className="text-xs text-gray-500">
                {inputStats.chars} 문자, {inputStats.bytes} 바이트
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="인코딩하거나 디코딩할 텍스트를 입력하세요..."
              className="w-full h-32 bg-gray-900 border text-white p-4 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              style={{ borderColor: 'var(--border)' }}
            />
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleEncode}
              disabled={!input.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Base64 인코딩
            </button>
            <button
              onClick={handleDecode}
              disabled={!input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Base64 디코딩
            </button>
            <button
              onClick={clearAll}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              지우기
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Encoded Output */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Base64 인코딩 결과
                </label>
                {encoded && (
                  <button
                    onClick={() => copyToClipboard(encoded)}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    복사
                  </button>
                )}
              </div>
              <textarea
                value={encoded}
                readOnly
                placeholder="Base64 인코딩 결과가 여기에 표시됩니다..."
                className="w-full h-32 bg-gray-900 border text-white p-4 rounded-lg font-mono text-sm focus:outline-none resize-none break-all"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>

            {/* Decoded Output */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Base64 디코딩 결과
                </label>
                {decoded && (
                  <button
                    onClick={() => copyToClipboard(decoded)}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    복사
                  </button>
                )}
              </div>
              <textarea
                value={decoded}
                readOnly
                placeholder="Base64 디코딩 결과가 여기에 표시됩니다..."
                className="w-full h-32 bg-gray-900 border text-white p-4 rounded-lg font-mono text-sm focus:outline-none resize-none"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>
          </div>

          {/* Info */}
          <div className="mt-8 p-4 bg-gray-900/50 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-white font-medium mb-2">Base64란?</h3>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>• Base64는 바이너리 데이터를 64개의 안전한 ASCII 문자로 인코딩하는 방법입니다</li>
              <li>• 이메일, URL, HTML 등에서 바이너리 데이터를 안전하게 전송할 때 사용합니다</li>
              <li>• 한글과 특수문자도 안전하게 인코딩할 수 있습니다</li>
              <li>• 인코딩 시 데이터 크기가 약 33% 증가합니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}