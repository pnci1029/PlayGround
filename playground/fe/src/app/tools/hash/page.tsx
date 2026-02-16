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
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">해시 생성기</h1>
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
            <div className="card">
              <h2 className="text-lg font-medium text-gray-700 mb-4">결과</h2>
              
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


      </div>
    </div>
  )
}