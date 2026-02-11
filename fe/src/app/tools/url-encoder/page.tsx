'use client'

import { useState } from 'react'

export default function UrlEncoderPage() {
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

  const getCharacterInfo = (text: string) => {
    if (!text) return { chars: 0, encoded: 0 }
    const encoded = encodeURIComponent(text)
    return {
      chars: text.length,
      encoded: encoded.length
    }
  }

  const inputInfo = getCharacterInfo(input)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-text-primary mb-4">URL 인코더/디코더</h1>
          <p className="text-text-secondary text-xl">URL을 안전하게 인코딩하거나 디코딩하여 웹에서 사용하세요</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Input Section */}
          <div className="space-y-6">
            <div className="card hover:border-primary transition-all duration-300 hover:scale-[1.02]">
              <h2 className="text-xl font-semibold text-text-primary mb-4">텍스트 입력</h2>
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="URL 또는 텍스트를 입력하세요...&#10;예: https://example.com/검색?q=한글 키워드"
                className="w-full h-32 bg-surface border border-border text-text-primary p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-colors font-mono text-sm"
              />
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-text-muted text-sm">
                  {inputInfo.chars} 문자 → {inputInfo.encoded} 인코딩 문자
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              <button
                onClick={handleEncode}
                disabled={!input.trim()}
                className="btn btn-primary flex-1"
              >
                URL 인코딩
              </button>
              <button
                onClick={handleDecode}
                disabled={!input.trim()}
                className="btn btn-secondary flex-1"
              >
                URL 디코딩
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
            <div className="card hover:border-primary transition-all duration-300 hover:scale-[1.02]">
              <h2 className="text-xl font-semibold text-text-primary mb-4">결과</h2>
              
              <div className="space-y-4">
                {/* Encoded Output */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-text-secondary text-sm font-medium">URL 인코딩 결과</label>
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
                    placeholder="인코딩된 URL이 여기에 표시됩니다..."
                    className="w-full h-24 bg-surface-elevated border border-border text-text-primary p-3 rounded-lg font-mono text-sm resize-none focus:outline-none"
                  />
                </div>

                {/* Decoded Output */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-text-secondary text-sm font-medium">URL 디코딩 결과</label>
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
                    placeholder="디코딩된 텍스트가 여기에 표시됩니다..."
                    className="w-full h-24 bg-surface-elevated border border-border text-text-primary p-3 rounded-lg font-mono text-sm resize-none focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12">
          <div className="card bg-surface/50 hover:bg-surface/70 transition-colors duration-300">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-text-primary">URL 인코딩이 필요한 이유</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent-success rounded-xl flex items-center justify-center mx-auto mb-3 hover:scale-110 transition-transform duration-300">
                  <span className="text-xl font-bold text-blue-600">WEB</span>
                </div>
                <h4 className="font-medium text-text-primary mb-2">웹 호환성</h4>
                <p className="text-text-muted">브라우저와 서버 간 안전한 데이터 전송</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-success to-accent-warning rounded-xl flex items-center justify-center mx-auto mb-3 hover:scale-110 transition-transform duration-300">
                  <span className="text-xl font-bold text-green-600">ABC</span>
                </div>
                <h4 className="font-medium text-text-primary mb-2">특수문자 처리</h4>
                <p className="text-text-muted">한글, 공백, 특수기호를 URL에 포함</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-warning to-primary rounded-xl flex items-center justify-center mx-auto mb-3 hover:scale-110 transition-transform duration-300">
                  <span className="text-xl font-bold text-purple-600">RFC</span>
                </div>
                <h4 className="font-medium text-text-primary mb-2">표준 준수</h4>
                <p className="text-text-muted">RFC 3986 URL 표준 규격 준수</p>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="bg-surface-elevated rounded-lg p-4 border border-border hover:border-primary transition-all duration-300 hover:scale-[1.01]">
                <h4 className="font-medium text-text-primary mb-2">인코딩 예시</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-muted">공백</span>
                    <code className="text-primary">%20</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">한글 (가)</span>
                    <code className="text-primary">%EA%B0%80</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">&</span>
                    <code className="text-primary">%26</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">=</span>
                    <code className="text-primary">%3D</code>
                  </div>
                </div>
              </div>
              
              <div className="bg-surface-elevated rounded-lg p-4 border border-border hover:border-primary transition-all duration-300 hover:scale-[1.01]">
                <h4 className="font-medium text-text-primary mb-2">활용 사례</h4>
                <ul className="text-text-muted space-y-1">
                  <li>• API 요청 URL 생성</li>
                  <li>• 검색 쿼리 매개변수</li>
                  <li>• 파일명이 포함된 URL</li>
                  <li>• 소셜 미디어 공유 링크</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}