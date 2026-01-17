'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function UrlEncoderPage() {
  const { t } = useLanguage()
  const [input, setInput] = useState('')
  const [encoded, setEncoded] = useState('')
  const [decoded, setDecoded] = useState('')

  const handleEncode = () => {
    if (!input.trim()) return
    try {
      const result = encodeURIComponent(input)
      setEncoded(result)
    } catch (error) {
      setEncoded('인코딩 오류')
    }
  }

  const handleDecode = () => {
    if (!input.trim()) return
    try {
      const result = decodeURIComponent(input)
      setDecoded(result)
    } catch (error) {
      setDecoded('디코딩 오류')
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

  return (
    <div className="min-h-screen" style={{background: 'var(--background)'}}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">URL 인코더/디코더</h1>
          <p className="text-gray-400">URL을 안전하게 인코딩하거나 디코딩합니다</p>
        </div>

        <div className="space-y-6">
          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              입력 텍스트
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="URL 또는 텍스트를 입력하세요..."
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
              인코딩
            </button>
            <button
              onClick={handleDecode}
              disabled={!input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              디코딩
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
                  인코딩 결과
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
                placeholder="인코딩된 결과가 여기에 표시됩니다..."
                className="w-full h-32 bg-gray-900 border text-white p-4 rounded-lg font-mono text-sm focus:outline-none resize-none"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>

            {/* Decoded Output */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  디코딩 결과
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
                placeholder="디코딩된 결과가 여기에 표시됩니다..."
                className="w-full h-32 bg-gray-900 border text-white p-4 rounded-lg font-mono text-sm focus:outline-none resize-none"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>
          </div>

          {/* Info */}
          <div className="mt-8 p-4 bg-gray-900/50 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-white font-medium mb-2">사용법</h3>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>• URL 인코딩: 특수문자를 %XX 형식으로 변환합니다</li>
              <li>• URL 디코딩: %XX 형식을 원래 문자로 복원합니다</li>
              <li>• 복사 버튼으로 결과를 클립보드에 복사할 수 있습니다</li>
              <li>• 한글, 공백, 특수문자가 포함된 URL에 유용합니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}