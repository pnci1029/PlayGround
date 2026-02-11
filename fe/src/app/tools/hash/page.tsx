'use client'

import { useState } from 'react'

export default function HashPage() {
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState({
    sha1: '',
    sha256: '',
    sha512: ''
  })

  const generateHashes = async () => {
    if (!input.trim()) return

    const encoder = new TextEncoder()
    const data = encoder.encode(input)

    try {
      // SHA-1
      const sha1Buffer = await crypto.subtle.digest('SHA-1', data)
      const sha1Hash = Array.from(new Uint8Array(sha1Buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      // SHA-256
      const sha256Buffer = await crypto.subtle.digest('SHA-256', data)
      const sha256Hash = Array.from(new Uint8Array(sha256Buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      // SHA-512
      const sha512Buffer = await crypto.subtle.digest('SHA-512', data)
      const sha512Hash = Array.from(new Uint8Array(sha512Buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      setHashes({
        sha1: sha1Hash,
        sha256: sha256Hash,
        sha512: sha512Hash
      })
    } catch (error) {
      console.error('해시 생성 오류:', error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const clearAll = () => {
    setInput('')
    setHashes({
      sha1: '',
      sha256: '',
      sha512: ''
    })
  }

  const hashTypes = [
    { 
      key: 'sha1' as keyof typeof hashes, 
      name: 'SHA-1', 
      description: '160비트 해시 (40자리 16진수)',
      icon: 'SHA1',
      warning: '보안상 취약하여 새로운 용도로는 권장하지 않음'
    },
    { 
      key: 'sha256' as keyof typeof hashes, 
      name: 'SHA-256', 
      description: '256비트 해시 (64자리 16진수)',
      icon: 'SHA256',
      warning: ''
    },
    { 
      key: 'sha512' as keyof typeof hashes, 
      name: 'SHA-512', 
      description: '512비트 해시 (128자리 16진수)',
      icon: 'SHA512',
      warning: ''
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-text-primary mb-4">해시 생성기</h1>
          <p className="text-text-secondary text-xl">텍스트의 무결성을 검증하는 다양한 해시값을 생성하세요</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Input Section */}
          <div className="space-y-6">
            <div className="card hover:border-primary transition-all duration-300 hover:scale-[1.02]">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">텍스트 입력</h2>
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="해시를 생성할 텍스트를 입력하세요..."
                className="w-full h-32 bg-surface border border-border text-text-primary p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-colors font-mono text-sm"
              />
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-text-muted text-sm">{input.length} 문자</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              <button
                onClick={generateHashes}
                disabled={!input.trim()}
                className="btn btn-primary flex-1"
              >
                해시 생성
              </button>
              <button
                onClick={clearAll}
                className="btn btn-secondary"
              >
                초기화
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <div className="card hover:border-primary transition-all duration-300 hover:scale-[1.02]">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">해시 결과</h2>
              
              <div className="space-y-4">
                {hashTypes.map(({ key, name, description, icon, warning }) => (
                  <div key={key} className="bg-surface-elevated rounded-lg p-4 border border-border hover:border-primary transition-all duration-300 hover:scale-[1.01]">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{icon}</span>
                        <div>
                          <label className="text-text-secondary text-base font-medium">{name}</label>
                          <p className="text-text-muted text-xs">{description}</p>
                          {warning && <p className="text-accent-warning text-xs mt-1">{warning}</p>}
                        </div>
                      </div>
                      {hashes[key] && (
                        <button
                          onClick={() => copyToClipboard(hashes[key])}
                          className="text-primary hover:text-accent-success text-sm transition-colors"
                          title="클립보드에 복사"
                        >
                          복사
                        </button>
                      )}
                    </div>
                    <textarea
                      value={hashes[key]}
                      readOnly
                      placeholder={`${name} 해시값이 여기에 표시됩니다...`}
                      className="w-full h-16 bg-surface border border-border text-text-primary p-3 rounded-lg font-mono text-xs resize-none focus:outline-none break-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12">
          <div className="card bg-surface/50 hover:bg-surface/70 transition-colors duration-300">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold text-text-primary">해시 함수의 활용</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-base">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent-success rounded-xl flex items-center justify-center mx-auto mb-3 hover:scale-110 transition-transform duration-300">
                  <span className="text-xl">🛡️</span>
                </div>
                <h4 className="font-medium text-text-primary mb-2">무결성 검증</h4>
                <p className="text-text-muted">파일이나 데이터가 변조되지 않았는지 확인</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-success to-accent-warning rounded-xl flex items-center justify-center mx-auto mb-3 hover:scale-110 transition-transform duration-300">
                  <span className="text-xl">🔑</span>
                </div>
                <h4 className="font-medium text-text-primary mb-2">패스워드 저장</h4>
                <p className="text-text-muted">안전한 패스워드 해싱과 검증</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-warning to-primary rounded-xl flex items-center justify-center mx-auto mb-3 hover:scale-110 transition-transform duration-300">
                  <span className="text-xl font-semibold">Stats</span>
                </div>
                <h4 className="font-medium text-text-primary mb-2">디지털 서명</h4>
                <p className="text-text-muted">블록체인과 암호화폐에서 거래 검증</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}