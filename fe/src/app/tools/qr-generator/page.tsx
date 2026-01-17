'use client'

import { useState, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import QRCode from 'qrcode'

export default function QRGeneratorPage() {
  const { t } = useLanguage()
  const [input, setInput] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [options, setOptions] = useState({
    size: 400,
    margin: 2,
    darkColor: '#000000',
    lightColor: '#FFFFFF',
    errorCorrectionLevel: 'M' as 'L' | 'M' | 'Q' | 'H'
  })
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateQR = async () => {
    if (!input.trim()) return

    setIsGenerating(true)
    try {
      const qrOptions = {
        width: options.size,
        margin: options.margin,
        color: {
          dark: options.darkColor,
          light: options.lightColor,
        },
        errorCorrectionLevel: options.errorCorrectionLevel,
      }

      const dataUrl = await QRCode.toDataURL(input, qrOptions)
      setQrDataUrl(dataUrl)
    } catch (error) {
      console.error('QR 코드 생성 오류:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQR = () => {
    if (!qrDataUrl) return

    const link = document.createElement('a')
    link.download = 'qr-code.png'
    link.href = qrDataUrl
    link.click()
  }

  const clearAll = () => {
    setInput('')
    setQrDataUrl('')
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--background)'}}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">QR 코드 생성기</h1>
          <p className="text-gray-400">텍스트나 URL을 QR 코드로 변환합니다</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input & Settings */}
          <div className="space-y-6">
            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                텍스트/URL 입력
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="QR 코드로 변환할 텍스트나 URL을 입력하세요..."
                className="w-full h-32 bg-gray-900 border text-white p-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                style={{ borderColor: 'var(--border)' }}
                maxLength={2048}
              />
              <p className="text-xs text-gray-500 mt-1">
                {input.length}/2048 문자
              </p>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">설정</h3>
              
              {/* Size */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  크기: {options.size}px
                </label>
                <input
                  type="range"
                  min="200"
                  max="800"
                  step="50"
                  value={options.size}
                  onChange={(e) => setOptions({...options, size: Number(e.target.value)})}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Margin */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  여백: {options.margin}
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={options.margin}
                  onChange={(e) => setOptions({...options, margin: Number(e.target.value)})}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Error Correction Level */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  오류 복구 레벨
                </label>
                <select
                  value={options.errorCorrectionLevel}
                  onChange={(e) => setOptions({...options, errorCorrectionLevel: e.target.value as 'L' | 'M' | 'Q' | 'H'})}
                  className="w-full bg-gray-900 border text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <option value="L">L (낮음, ~7%)</option>
                  <option value="M">M (중간, ~15%)</option>
                  <option value="Q">Q (높음, ~25%)</option>
                  <option value="H">H (최고, ~30%)</option>
                </select>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    전경색 (어두운 색)
                  </label>
                  <input
                    type="color"
                    value={options.darkColor}
                    onChange={(e) => setOptions({...options, darkColor: e.target.value})}
                    className="w-full h-10 bg-gray-900 border rounded-lg cursor-pointer"
                    style={{ borderColor: 'var(--border)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    배경색 (밝은 색)
                  </label>
                  <input
                    type="color"
                    value={options.lightColor}
                    onChange={(e) => setOptions({...options, lightColor: e.target.value})}
                    className="w-full h-10 bg-gray-900 border rounded-lg cursor-pointer"
                    style={{ borderColor: 'var(--border)' }}
                  />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              <button
                onClick={generateQR}
                disabled={!input.trim() || isGenerating}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {isGenerating ? '생성 중...' : 'QR 코드 생성'}
              </button>
              <button
                onClick={clearAll}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                지우기
              </button>
            </div>
          </div>

          {/* QR Code Display */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">QR 코드 미리보기</h3>
            
            <div className="bg-gray-900 border rounded-lg p-6 flex items-center justify-center min-h-[400px]" style={{ borderColor: 'var(--border)' }}>
              {qrDataUrl ? (
                <div className="text-center">
                  <img src={qrDataUrl} alt="Generated QR Code" className="mx-auto rounded-lg" />
                  <button
                    onClick={downloadQR}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    PNG 다운로드
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <div className="w-16 h-16 border-2 border-dashed border-gray-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p>텍스트를 입력하고 'QR 코드 생성' 버튼을 클릭하세요</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-12 p-4 bg-gray-900/50 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-white font-medium mb-2">QR 코드란?</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• QR(Quick Response) 코드는 2차원 바코드의 한 종류입니다</li>
            <li>• URL, 텍스트, 연락처, Wi-Fi 정보 등 다양한 정보를 저장할 수 있습니다</li>
            <li>• 스마트폰 카메라로 쉽게 스캔하여 정보에 접근할 수 있습니다</li>
            <li>• 오류 복구 레벨이 높을수록 코드가 손상되어도 복구 가능성이 높아집니다</li>
            <li>• 최대 2,048자까지 저장 가능합니다</li>
          </ul>
        </div>
      </div>
    </div>
  )
}