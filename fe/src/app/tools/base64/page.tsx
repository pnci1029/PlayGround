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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-4">Base64 인코더/디코더</h1>
          <p className="text-text-secondary text-lg">텍스트를 Base64로 안전하게 인코딩하거나 디코딩하세요</p>
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
                placeholder="인코딩하거나 디코딩할 텍스트를 입력하세요..."
                className="w-full h-32 bg-surface border border-border text-text-primary p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-colors font-mono text-sm"
              />
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-text-muted text-sm">{inputStats.chars} 문자, {inputStats.bytes} 바이트</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              <button
                onClick={handleEncode}
                disabled={!input.trim()}
                className="btn btn-primary flex-1"
              >
                Base64 인코딩 🔐
              </button>
              <button
                onClick={handleDecode}
                disabled={!input.trim()}
                className="btn btn-secondary flex-1"
              >
                Base64 디코딩 📖
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
                    <label className="text-text-secondary text-sm font-medium">Base64 인코딩 결과</label>
                    {encoded && (
                      <button
                        onClick={() => copyToClipboard(encoded)}
                        className="text-primary hover:text-accent-success text-sm transition-colors"
                        title="클립보드에 복사"
                      >
                        복사 📋
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
                    <label className="text-text-secondary text-sm font-medium">Base64 디코딩 결과</label>
                    {decoded && (
                      <button
                        onClick={() => copyToClipboard(decoded)}
                        className="text-primary hover:text-accent-success text-sm transition-colors"
                        title="클립보드에 복사"
                      >
                        복사 📋
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

        {/* Info Section */}
        <div className="mt-12">
          <div className="card bg-surface/50 hover:bg-surface/70 transition-colors duration-300">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-text-primary">Base64 인코딩이란?</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent-success rounded-xl flex items-center justify-center mx-auto mb-3 hover:scale-110 transition-transform duration-300">
                  <span className="text-xl">🔐</span>
                </div>
                <h4 className="font-medium text-text-primary mb-2">안전한 전송</h4>
                <p className="text-text-muted">바이너리 데이터를 안전한 ASCII 문자로 변환</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-success to-accent-warning rounded-xl flex items-center justify-center mx-auto mb-3 hover:scale-110 transition-transform duration-300">
                  <span className="text-xl">📧</span>
                </div>
                <h4 className="font-medium text-text-primary mb-2">이메일 & 웹</h4>
                <p className="text-text-muted">이메일, URL, HTML에서 데이터 전송 시 활용</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-warning to-primary rounded-xl flex items-center justify-center mx-auto mb-3 hover:scale-110 transition-transform duration-300">
                  <span className="text-xl">🌍</span>
                </div>
                <h4 className="font-medium text-text-primary mb-2">유니코드 지원</h4>
                <p className="text-text-muted">한글과 특수문자도 안전하게 처리</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}