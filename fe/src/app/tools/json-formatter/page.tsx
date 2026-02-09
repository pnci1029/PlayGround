'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { useLanguage } from '@/contexts/LanguageContext'

export default function JsonFormatterPage() {
  const { t } = useLanguage()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const formatJson = async () => {
    if (!input.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const response = await api.post('/api/tools/json-formatter', {
        json: input
      })

      if (response.success) {
        setOutput(response.data.formatted)
      } else {
        setError(response.error || t('json.error.invalid'))
      }
    } catch (err) {
      setError('서버 연결 오류')
    } finally {
      setIsLoading(false)
    }
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--background)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t('tools.json.title')}</h1>
          <p className="text-gray-400">{t('tools.json.subtitle')}</p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={formatJson}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {isLoading ? '처리중...' : '포맷팅'}
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

        {/* Input/Output Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              입력 (JSON)
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"name": "example", "data": [1,2,3]}'
              className="w-full h-96 bg-gray-900 border border-border text-white p-4 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Output */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              출력 (포맷된 JSON)
            </label>
            <textarea
              value={output}
              readOnly
              placeholder="포맷된 JSON이 여기에 표시됩니다"
              className="w-full h-96 bg-gray-900 border border-border text-white p-4 rounded-lg font-mono text-sm resize-none focus:outline-none"
            />
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-gray-900/50 border border-border rounded-lg">
          <h3 className="text-white font-medium mb-2">사용법</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• 왼쪽에 JSON 데이터를 입력하세요</li>
            <li>• '포맷팅' 버튼을 클릭하면 오른쪽에 정리된 JSON이 표시됩니다</li>
            <li>• 잘못된 JSON 형식은 에러 메시지가 표시됩니다</li>
          </ul>
        </div>

      </div>
    </div>
  )
}