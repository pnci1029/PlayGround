'use client'

import { useState } from 'react'

export default function Base64Page() {
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
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">Base64 인코더/디코더</h1>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Input Section */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-medium text-gray-700 mb-4">입력</h2>
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="텍스트 입력"
                className="w-full h-32 bg-surface border border-border text-text-primary p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-colors font-mono text-sm"
              />
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-500 text-sm">{inputStats.chars} 문자</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              <button
                onClick={handleEncode}
                disabled={!input.trim()}
                className="btn btn-primary flex-1"
              >
                Base64 인코딩
              </button>
              <button
                onClick={handleDecode}
                disabled={!input.trim()}
                className="btn btn-secondary flex-1"
              >
                Base64 디코딩
              </button>
            </div>
            
            <button
              onClick={clearAll}
              className="btn btn-ghost w-full"
            >
              전체 초기화
            </button>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-medium text-gray-700 mb-4">결과</h2>
              
              <div className="space-y-4">
                {/* Encoded Output */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-base font-medium text-gray-700">인코딩</label>
                    {encoded && (
                      <button
                        onClick={() => copyToClipboard(encoded)}
                        className="text-primary hover:text-accent-success text-sm transition-colors"
                        title="클립보드에 복사"
                      >
                        복사
                      </button>
                    )}
                  </div>
                  <textarea
                    value={encoded}
                    readOnly
                    placeholder="Base64 인코딩 결과가 여기에 표시됩니다..."
                    className="w-full h-24 bg-surface-elevated border border-border text-text-primary p-3 rounded-lg font-mono text-sm resize-none focus:outline-none"
                  />
                </div>

                {/* Decoded Output */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-base font-medium text-gray-700">디코딩</label>
                    {decoded && (
                      <button
                        onClick={() => copyToClipboard(decoded)}
                        className="text-primary hover:text-accent-success text-sm transition-colors"
                        title="클립보드에 복사"
                      >
                        복사
                      </button>
                    )}
                  </div>
                  <textarea
                    value={decoded}
                    readOnly
                    placeholder="Base64 디코딩 결과가 여기에 표시됩니다..."
                    className="w-full h-24 bg-surface-elevated border border-border text-text-primary p-3 rounded-lg font-mono text-sm resize-none focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}