'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function HashPage() {
  const { t } = useLanguage()
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState({
    md5: '',
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
        md5: 'MD5는 브라우저에서 지원되지 않습니다',
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
      md5: '',
      sha1: '',
      sha256: '',
      sha512: ''
    })
  }

  const hashTypes = [
    { key: 'sha1' as keyof typeof hashes, name: 'SHA-1', description: '160비트 (40자리)' },
    { key: 'sha256' as keyof typeof hashes, name: 'SHA-256', description: '256비트 (64자리)' },
    { key: 'sha512' as keyof typeof hashes, name: 'SHA-512', description: '512비트 (128자리)' },
  ]

  return (
    <div className="min-h-screen" style={{background: 'var(--background)'}}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">해시 생성기</h1>
          <p className="text-gray-400">텍스트의 다양한 해시값을 생성합니다</p>
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
              placeholder="해시를 생성할 텍스트를 입력하세요..."
              className="w-full h-32 bg-gray-900 border text-white p-4 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              style={{ borderColor: 'var(--border)' }}
            />
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={generateHashes}
              disabled={!input.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              해시 생성
            </button>
            <button
              onClick={clearAll}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              지우기
            </button>
          </div>

          {/* Hash Results */}
          <div className="space-y-4">
            {hashTypes.map(({ key, name, description }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">
                      {name}
                    </label>
                    <p className="text-xs text-gray-500">{description}</p>
                  </div>
                  {hashes[key] && (
                    <button
                      onClick={() => copyToClipboard(hashes[key])}
                      className="text-xs text-purple-400 hover:text-purple-300"
                    >
                      복사
                    </button>
                  )}
                </div>
                <textarea
                  value={hashes[key]}
                  readOnly
                  placeholder={`${name} 해시값이 여기에 표시됩니다...`}
                  className="w-full h-16 bg-gray-900 border text-white p-4 rounded-lg font-mono text-sm focus:outline-none resize-none break-all"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="mt-8 p-4 bg-gray-900/50 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-white font-medium mb-2">해시 함수란?</h3>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>• 해시 함수는 임의의 길이 데이터를 고정된 길이의 해시값으로 변환합니다</li>
              <li>• 같은 입력은 항상 같은 해시값을 생성합니다</li>
              <li>• 해시값으로부터 원본 데이터를 복원하는 것은 불가능합니다</li>
              <li>• 파일 무결성 검증, 패스워드 저장 등에 사용됩니다</li>
              <li>• SHA-256, SHA-512는 현재 안전한 것으로 간주되는 해시 함수입니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}