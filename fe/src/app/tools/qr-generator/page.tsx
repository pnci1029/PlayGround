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
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-text-primary mb-4">QR 코드 생성기</h1>
          <p className="text-text-secondary text-xl">텍스트나 URL을 QR 코드로 간단히 변환하세요</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Input Section */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">텍스트 입력</h2>
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="QR 코드로 변환할 텍스트나 URL을 입력하세요..."
                className="w-full h-32 bg-surface border border-border text-text-primary p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                maxLength={2048}
              />
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-text-muted text-sm">{input.length}/2048 문자</span>
              </div>
            </div>

            {/* Settings */}
            <div className="card">
              <h2 className="text-xl font-semibold text-text-primary mb-4">설정</h2>
              
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
              <h2 className="text-xl font-semibold text-text-primary mb-4">미리보기</h2>
              
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
                      PNG 다운로드 📥
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

        {/* Info Section */}
        <div className="mt-12">
          <div className="card bg-surface/50">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-text-primary">QR 코드 사용 팁</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent-success rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-blue-600">URL</span>
                </div>
                <h4 className="font-medium text-text-primary mb-2">URL 공유</h4>
                <p className="text-text-muted">웹사이트 링크를 쉽게 공유하세요</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-success to-accent-warning rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-green-600">TEL</span>
                </div>
                <h4 className="font-medium text-text-primary mb-2">연락처</h4>
                <p className="text-text-muted">전화번호나 이메일을 빠르게 전달</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-warning to-primary rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-purple-600">SMS</span>
                </div>
                <h4 className="font-medium text-text-primary mb-2">모바일 최적화</h4>
                <p className="text-text-muted">스마트폰으로 쉽게 스캔 가능</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}