'use client'

import { useState, useRef, useEffect } from 'react'

interface WheelItem {
  text: string
  color: string
}

export default function WheelPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [currentRotation, setCurrentRotation] = useState(0)
  const [wheelItems, setWheelItems] = useState<WheelItem[]>([
    { text: '선택지 1', color: '#FF6B6B' },
    { text: '선택지 2', color: '#4ECDC4' },
    { text: '선택지 3', color: '#45B7D1' },
    { text: '선택지 4', color: '#96CEB4' },
    { text: '선택지 5', color: '#FFEAA7' },
    { text: '선택지 6', color: '#DDA0DD' }
  ])
  const [newItem, setNewItem] = useState('')
  const [history, setHistory] = useState<string[]>([])

  // 색상 팔레트
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFB347', '#98FB98', '#F0E68C', '#FF69B4']

  // 캔버스에 룰렛 그리기
  useEffect(() => {
    drawWheel()
  }, [wheelItems, currentRotation])

  const drawWheel = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 20

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate((currentRotation * Math.PI) / 180)

    const anglePerItem = (2 * Math.PI) / wheelItems.length

    // 룰렛 섹션 그리기
    wheelItems.forEach((item, index) => {
      const startAngle = index * anglePerItem
      const endAngle = startAngle + anglePerItem

      // 섹션 배경
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = item.color
      ctx.fill()
      
      // 섹션 테두리
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 3
      ctx.stroke()

      // 내부 그라데이션 효과
      const gradient = ctx.createRadialGradient(0, 0, radius * 0.3, 0, 0, radius)
      gradient.addColorStop(0, 'rgba(255,255,255,0.3)')
      gradient.addColorStop(1, 'rgba(0,0,0,0.1)')
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()

      // 텍스트
      ctx.save()
      const textAngle = startAngle + anglePerItem / 2
      ctx.rotate(textAngle)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 2
      ctx.fillText(item.text, radius * 0.7, 6)
      ctx.restore()
    })

    ctx.restore()

    // 중앙 원
    ctx.beginPath()
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI)
    ctx.fillStyle = '#2C3E50'
    ctx.fill()
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 3
    ctx.stroke()

    // 화살표 (포인터)
    ctx.beginPath()
    ctx.moveTo(centerX + radius + 10, centerY)
    ctx.lineTo(centerX + radius - 20, centerY - 15)
    ctx.lineTo(centerX + radius - 20, centerY + 15)
    ctx.closePath()
    ctx.fillStyle = '#E74C3C'
    ctx.fill()
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  const spinWheel = () => {
    if (isSpinning || wheelItems.length === 0) return

    setIsSpinning(true)
    setResult(null)

    // 랜덤 회전 각도 (최소 5바퀴 + 랜덤)
    const randomSpins = 5 + Math.random() * 5
    const randomAngle = Math.random() * 360
    const totalRotation = randomSpins * 360 + randomAngle

    const startTime = Date.now()
    const duration = 3000 // 3초
    const startRotation = currentRotation

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // easeOut 곡선
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const rotation = startRotation + totalRotation * easeOut

      setCurrentRotation(rotation % 360)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // 결과 계산
        const normalizedAngle = (360 - (rotation % 360)) % 360
        const anglePerItem = 360 / wheelItems.length
        const selectedIndex = Math.floor(normalizedAngle / anglePerItem)
        const selectedItem = wheelItems[selectedIndex]
        
        setResult(selectedItem.text)
        setHistory(prev => [selectedItem.text, ...prev.slice(0, 9)])
        setIsSpinning(false)
      }
    }

    requestAnimationFrame(animate)
  }

  const addItem = () => {
    if (!newItem.trim() || wheelItems.length >= 12) return
    
    const color = colors[wheelItems.length % colors.length]
    setWheelItems(prev => [...prev, { text: newItem.trim(), color }])
    setNewItem('')
  }

  const removeItem = (index: number) => {
    if (wheelItems.length <= 2) return
    setWheelItems(prev => prev.filter((_, i) => i !== index))
  }

  const clearHistory = () => {
    setHistory([])
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--background)'}}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">룰렛 돌리기</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Wheel Section */}
          <div className="lg:col-span-2 flex flex-col items-center space-y-6 sm:space-y-8">
            
            {/* Canvas Wheel */}
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg">
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="drop-shadow-lg w-full h-auto"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              {/* 중앙 로고/아이콘 */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xl sm:text-2xl font-bold pointer-events-none">
                🎡
              </div>
            </div>

            {/* Result Display */}
            {result && !isSpinning && (
              <div className="text-center animate-bounce px-4">
                <div className="text-2xl sm:text-4xl font-bold text-purple-600 mb-2">🎉 결과</div>
                <div className="text-xl sm:text-3xl font-bold text-gray-900 bg-white px-4 sm:px-6 py-3 rounded-2xl shadow-lg border-2 border-purple-200 break-words">
                  {result}
                </div>
              </div>
            )}

            {/* Spin Button */}
            <button
              onClick={spinWheel}
              disabled={isSpinning || wheelItems.length === 0}
              className={`px-6 sm:px-8 py-3 sm:py-4 text-lg sm:text-xl font-semibold rounded-xl transition-all duration-300 w-full max-w-xs ${
                isSpinning || wheelItems.length === 0
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:scale-105 active:scale-95'
              } shadow-lg hover:shadow-xl`}
            >
              {isSpinning ? '룰렛이 돌아가는 중...' : '🎡 룰렛 돌리기'}
            </button>
          </div>

          {/* Controls Section */}
          <div className="space-y-6">
            
            {/* Add Item */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-medium text-gray-700 mb-4">항목 추가</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem()}
                  placeholder="새 선택지 입력"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  maxLength={20}
                />
                <button
                  onClick={addItem}
                  disabled={!newItem.trim() || wheelItems.length >= 12}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 transition-colors"
                >
                  추가 ({wheelItems.length}/12)
                </button>
              </div>
            </div>

            {/* Current Items */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-medium text-gray-700 mb-4">현재 선택지</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {wheelItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm font-medium">{item.text}</span>
                    </div>
                    {wheelItems.length > 2 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-700">최근 기록</h3>
                  <button
                    onClick={clearHistory}
                    className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                  >
                    초기화
                  </button>
                </div>
                <div className="space-y-2">
                  {history.map((item, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}