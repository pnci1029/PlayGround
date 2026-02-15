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
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingText, setEditingText] = useState('')

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

    // 중앙 원 (클릭 가능한 버튼처럼 디자인)
    const gradient = ctx.createRadialGradient(centerX, centerY - 5, 0, centerX, centerY, 35)
    gradient.addColorStop(0, isSpinning ? '#95a5a6' : '#3498db')
    gradient.addColorStop(1, isSpinning ? '#7f8c8d' : '#2980b9')
    
    ctx.beginPath()
    ctx.arc(centerX, centerY, 35, 0, 2 * Math.PI)
    ctx.fillStyle = gradient
    ctx.fill()
    
    // 중앙 원 테두리
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 4
    ctx.stroke()
    
    // 내부 하이라이트 (3D 효과)
    const innerGradient = ctx.createRadialGradient(centerX - 8, centerY - 8, 0, centerX, centerY, 25)
    innerGradient.addColorStop(0, 'rgba(255,255,255,0.4)')
    innerGradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.beginPath()
    ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI)
    ctx.fillStyle = innerGradient
    ctx.fill()

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
        setIsSpinning(false)
      }
    }

    requestAnimationFrame(animate)
  }

  const removeItem = (index: number) => {
    if (wheelItems.length <= 2) return
    setWheelItems(prev => prev.filter((_, i) => i !== index))
  }

  // 캔버스 클릭 처리
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSpinning) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const x = (event.clientX - rect.left) * scaleX
    const y = (event.clientY - rect.top) * scaleY

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 20

    // 중심점에서의 거리 계산
    const dx = x - centerX
    const dy = y - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)

    // 중앙 원 클릭 시 룰렛 돌리기 (더 넓은 영역)
    if (distance <= 35) {
      spinWheel()
      return
    }

    // 바깥 영역 클릭 시 무시
    if (distance > radius) return

    // 클릭한 각도 계산 (현재 회전 고려)
    let angle = Math.atan2(dy, dx)
    angle = angle < 0 ? angle + 2 * Math.PI : angle // 0-2π 범위로 정규화
    
    // 현재 회전 적용
    angle -= (currentRotation * Math.PI) / 180
    angle = angle < 0 ? angle + 2 * Math.PI : angle

    // 어떤 섹션인지 찾기
    const anglePerItem = (2 * Math.PI) / wheelItems.length
    const sectionIndex = Math.floor(angle / anglePerItem)

    if (sectionIndex >= 0 && sectionIndex < wheelItems.length) {
      startEditingItem(sectionIndex)
    }
  }

  // 캔버스 우클릭 처리 (삭제)
  const handleCanvasRightClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault() // 기본 컨텍스트 메뉴 방지
    
    if (isSpinning || wheelItems.length <= 2) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const x = (event.clientX - rect.left) * scaleX
    const y = (event.clientY - rect.top) * scaleY

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 20

    // 중심점에서의 거리 계산
    const dx = x - centerX
    const dy = y - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)

    // 중앙 원이나 바깥 영역 클릭 시 무시
    if (distance < 35 || distance > radius) return

    // 클릭한 각도 계산 (현재 회전 고려)
    let angle = Math.atan2(dy, dx)
    angle = angle < 0 ? angle + 2 * Math.PI : angle
    
    // 현재 회전 적용
    angle -= (currentRotation * Math.PI) / 180
    angle = angle < 0 ? angle + 2 * Math.PI : angle

    // 어떤 섹션인지 찾기
    const anglePerItem = (2 * Math.PI) / wheelItems.length
    const sectionIndex = Math.floor(angle / anglePerItem)

    if (sectionIndex >= 0 && sectionIndex < wheelItems.length) {
      removeItem(sectionIndex)
    }
  }

  // 아이템 편집 시작 (인라인)
  const startEditingItem = (index: number) => {
    if (isSpinning) return
    setEditingIndex(index)
    setEditingText(wheelItems[index].text)
  }

  // 편집 완료
  const finishEditingItem = () => {
    if (editingIndex !== null && editingText.trim()) {
      setWheelItems(prev => prev.map((item, i) => 
        i === editingIndex ? { ...item, text: editingText.trim() } : item
      ))
    }
    setEditingIndex(null)
    setEditingText('')
  }

  // 편집 취소
  const cancelEditing = () => {
    setEditingIndex(null)
    setEditingText('')
  }

  // 빠른 아이템 추가 (상단 +버튼용)
  const quickAddItem = () => {
    if (wheelItems.length >= 12) return
    
    const color = colors[wheelItems.length % colors.length]
    const newItemText = `선택지 ${wheelItems.length + 1}`
    setWheelItems(prev => [...prev, { text: newItemText, color }])
    
    // 새로 추가된 아이템을 바로 편집 모드로
    setTimeout(() => {
      setEditingIndex(wheelItems.length)
      setEditingText(newItemText)
    }, 100)
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
              {/* 상단 +버튼 */}
              <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-10">
                <button
                  onClick={quickAddItem}
                  disabled={isSpinning || wheelItems.length >= 12}
                  className={`relative w-12 h-12 rounded-full text-xl font-bold transition-all duration-300 border-2 ${
                    isSpinning || wheelItems.length >= 12
                      ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:scale-105 active:scale-95'
                  } shadow-md hover:shadow-lg`}
                  title={wheelItems.length >= 12 ? '최대 12개까지 가능합니다' : '새 선택지 추가'}
                >
                  <span>+</span>
                </button>
              </div>

              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="drop-shadow-lg w-full h-auto cursor-pointer"
                style={{ maxWidth: '100%', height: 'auto' }}
                onClick={handleCanvasClick}
                onContextMenu={handleCanvasRightClick}
              />
              
              {/* 중앙 버튼 아이콘 */}
              <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-lg font-bold pointer-events-none transition-all duration-200 ${
                isSpinning ? 'text-gray-200 animate-pulse' : 'drop-shadow-sm'
              }`}>
                {isSpinning ? '🌀' : '▶'}
              </div>
              
              {/* 인라인 편집 입력창 */}
              {editingIndex !== null && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && finishEditingItem()}
                    onKeyDown={(e) => e.key === 'Escape' && cancelEditing()}
                    onBlur={finishEditingItem}
                    className="px-3 py-1 text-center border-2 border-blue-500 rounded-lg bg-white shadow-lg focus:outline-none text-sm font-medium"
                    style={{ width: '120px' }}
                    maxLength={15}
                    autoFocus
                  />
                </div>
              )}
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
            
            {/* 클릭 힌트 */}
            {!isSpinning && (
              <div className="text-center">
                <p className="text-gray-500 text-base">중앙 버튼을 클릭해서 룰렛을 돌려보세요!</p>
                <p className="text-gray-400 text-sm mt-1">섹션 좌클릭: 편집 | 우클릭: 삭제 | 상단 +: 추가</p>
              </div>
            )}
          </div>

          {/* Right Panel - Current Items Only */}
          <div className="space-y-6">
            
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
          </div>
        </div>

      </div>
    </div>
  )
}