'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { useLanguage } from '@/contexts/LanguageContext'
import WorkspaceManager from '@/components/WorkspaceManager'
import { workspace } from '@/lib/workspace'

export default function JsonFormatterPage() {
  const { t } = useLanguage()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [showWorkspace, setShowWorkspace] = useState(false)

  const formatJson = async () => {
    if (!input.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const response = await api.post('/api/tools/json-formatter', {
        json: input
      })

      if (response.success) {
        const formatted = response.data.formatted
        setOutput(formatted)
        // Add to history
        if (input && !history.includes(input)) {
          setHistory(prev => [input, ...prev.slice(0, 9)]) // Keep last 10
        }
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

  const saveToWorkspace = async () => {
    const sessionName = prompt('세션 이름을 입력하세요:')
    if (sessionName && input) {
      const sessionId = await workspace.saveSession('json-formatter', {
        input,
        output,
        timestamp: new Date().toISOString()
      }, sessionName)
      alert(`세션이 저장되었습니다: ${sessionName}`)
    }
  }

  const loadFromWorkspace = (data: any) => {
    if (data.input) setInput(data.input)
    if (data.output) setOutput(data.output)
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
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={formatJson}
            disabled={isLoading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {isLoading ? '처리중...' : '포맷팅'}
          </button>
          <button
            onClick={clearAll}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            초기화
          </button>
          <button
            onClick={saveToWorkspace}
            disabled={!input.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            워크스페이스에 저장
          </button>
        </div>

        {/* Quick History */}
        {history.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-2">최근 사용한 JSON:</h3>
            <div className="flex gap-2 flex-wrap">
              {history.map((json, index) => (
                <button
                  key={index}
                  onClick={() => setInput(json)}
                  className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded border border-gray-600 transition-colors max-w-xs truncate"
                  title={json}
                >
                  {json.length > 30 ? `${json.substring(0, 30)}...` : json}
                </button>
              ))}
            </div>
          </div>
        )}

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
              className="w-full h-96 bg-gray-900 border text-white p-4 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ borderColor: 'var(--border)' }}
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
              className="w-full h-96 bg-gray-900 border text-white p-4 rounded-lg font-mono text-sm resize-none focus:outline-none"
              style={{ borderColor: 'var(--border)' }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-gray-900/50 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-white font-medium mb-2">사용법</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• 왼쪽에 JSON 데이터를 입력하세요</li>
            <li>• '포맷팅' 버튼을 클릭하면 오른쪽에 정리된 JSON이 표시됩니다</li>
            <li>• 잘못된 JSON 형식은 에러 메시지가 표시됩니다</li>
          </ul>
        </div>

        {/* Workspace Manager */}
        <WorkspaceManager 
          currentTool="json-formatter"
          onSessionLoad={loadFromWorkspace}
        />
      </div>
    </div>
  )
}