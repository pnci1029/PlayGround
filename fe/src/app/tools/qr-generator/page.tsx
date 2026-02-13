'use client'

import { useState, useRef } from 'react'
import QRCode from 'qrcode'

export default function QRGeneratorPage() {
  const [input, setInput] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [options, setOptions] = useState({
    size: 400,
    margin: 2,
    darkColor: '#000000',
    lightColor: '#FFFFFF'
  })

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
        errorCorrectionLevel: 'M' as const
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
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">QR 코드 생성기</h1>
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
                placeholder="텍스트나 URL 입력"
                className="w-full h-32 bg-surface border border-border text-text-primary p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                maxLength={2048}
              />
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-500 text-sm">{input.length}/2048 문자</span>
              </div>
            </div>

            {/* Settings */}
            <div className="card">
              <h2 className="text-lg font-medium text-gray-700 mb-4">설정</h2>
              
              <div className="space-y-4">
                {/* Size */}
                <div>
                  <label className="block text-text-secondary text-sm font-medium mb-2">
                    크기: {options.size}px
                  </label>
                  <input
                    type="range"
                    min="200"
                    max="600"
                    step="50"
                    value={options.size}
                    onChange={(e) => setOptions({...options, size: Number(e.target.value)})}
                    className="w-full h-2 bg-surface-elevated rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-text-secondary text-sm font-medium mb-2">전경색</label>
                    <input
                      type="color"
                      value={options.darkColor}
                      onChange={(e) => setOptions({...options, darkColor: e.target.value})}
                      className="w-full h-10 bg-surface border border-border rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-text-secondary text-sm font-medium mb-2">배경색</label>
                    <input
                      type="color"
                      value={options.lightColor}
                      onChange={(e) => setOptions({...options, lightColor: e.target.value})}
                      className="w-full h-10 bg-surface border border-border rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              <button
                onClick={generateQR}
                disabled={!input.trim() || isGenerating}
                className="btn btn-primary flex-1"
              >
                {isGenerating ? '생성 중...' : 'QR 코드 생성'}
              </button>
              <button
                onClick={clearAll}
                className="btn btn-secondary"
              >
                초기화
              </button>
            </div>
          </div>

          {/* QR Code Display */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-medium text-gray-700 mb-4">미리보기</h2>
              
              <div className="bg-surface-elevated rounded-lg p-8 flex items-center justify-center min-h-[400px]">
                {qrDataUrl ? (
                  <div className="text-center">
                    <img 
                      src={qrDataUrl} 
                      alt="Generated QR Code" 
                      className="mx-auto rounded-lg shadow-lg max-w-full" 
                    />
                    <button
                      onClick={downloadQR}
                      className="btn btn-primary mt-6"
                    >
                      PNG 다운로드
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-text-muted">
                    <div className="w-20 h-20 border-2 border-dashed border-border rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600">QR</span>
                    </div>
                    <p>텍스트를 입력하고 생성 버튼을 클릭하세요</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}