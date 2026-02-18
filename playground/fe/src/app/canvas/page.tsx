'use client'

import { useRef, useState, useEffect, MouseEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import SaveModal from '@/components/canvas/SaveModal'
import { apiUrls, logger } from '@/lib/config'

export default function CanvasPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser'>('pen')
  const [brushSize, setBrushSize] = useState(5)
  const [color, setColor] = useState('#ffffff')
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const [activeUsers, setActiveUsers] = useState(1)
  const wsRef = useRef<WebSocket | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loadedArtwork, setLoadedArtwork] = useState<any>(null)
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Canvas 크기 설정
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // 기본 설정
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // WebSocket 연결
    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  // 편집 모드일 때 기존 작품 로드
  useEffect(() => {
    if (editId) {
      loadArtworkForEdit(editId)
    }
  }, [editId])

  const loadArtworkForEdit = async (artworkId: string) => {
    try {
      const response = await fetch(apiUrls.artwork(artworkId))
      if (response.ok) {
        const artwork = await response.json()
        setLoadedArtwork(artwork)

        // Canvas에 기존 작품 로드
        if (artwork.canvas_data && artwork.canvas_data.imageData) {
          const canvas = canvasRef.current
          if (!canvas) return

          const ctx = canvas.getContext('2d')
          if (!ctx) return

          const img = new Image()
          img.onload = () => {
            // Canvas 크기를 작품 크기로 설정
            canvas.width = artwork.width || 800
            canvas.height = artwork.height || 600

            // 기존 이미지 그리기
            ctx.drawImage(img, 0, 0)
          }
          img.src = artwork.canvas_data.imageData
        }
      }
    } catch (error) {
      console.error('Failed to load artwork for editing:', error)
    }
  }

  const connectWebSocket = () => {
    // WebSocket 연결 비활성화 (실시간 협업 기능은 나중에 추가)
    setConnectionStatus('disconnected')
  }

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'init':
        // 초기 그림 데이터 로드
        if (data.data && Array.isArray(data.data)) {
          data.data.forEach((event: any) => {
            if (event.type === 'draw') {
              drawFromEvent(event.data)
            }
          })
        }
        break

      case 'draw':
        drawFromEvent(data.data)
        break

      case 'clear':
        clearCanvas()
        break

      case 'user_join':
      case 'user_leave':
        // 사용자 수 업데이트는 서버에서 별도로 관리
        break
    }
  }

  const drawFromEvent = (drawData: any) => {
    if (!drawData) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 다른 사용자의 그림을 캔버스에 그리기
    const { x, y, prevX, prevY, color, brushSize, tool } = drawData

    ctx.beginPath()
    ctx.moveTo(prevX, prevY)

    if (tool === 'pen') {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color
    } else {
      ctx.globalCompositeOperation = 'destination-out'
    }

    ctx.lineWidth = brushSize
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const sendDrawEvent = (x: number, y: number, prevX: number, prevY: number) => {
    // WebSocket 비활성화 - 실시간 협업 기능은 나중에 추가
    return
  }

  const sendClearEvent = () => {
    // WebSocket 비활성화 - 실시간 협업 기능은 나중에 추가
    return
  }

  let lastX = 0
  let lastY = 0

  const startDrawing = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    lastX = x
    lastY = y
    setIsDrawing(true)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (currentTool === 'pen') {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color
    } else {
      ctx.globalCompositeOperation = 'destination-out'
    }

    ctx.lineWidth = brushSize
    ctx.lineTo(x, y)
    ctx.stroke()

    // 현재 좌표를 이전 좌표로 업데이트
    lastX = x
    lastY = y
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const saveArtwork = async (title: string, description: string, authorName: string) => {
    logger.log('🎨 저장 시작:', { title, description, authorName })

    const canvas = canvasRef.current
    if (!canvas) {
      console.error('❌ Canvas를 찾을 수 없음')
      return
    }

    console.log('📏 Canvas 크기:', { width: canvas.width, height: canvas.height })

    setIsSaving(true)
    try {
      // Canvas 데이터 추출
      console.log('🖼️ Canvas 데이터 추출 중...')
      const imageData = canvas.toDataURL('image/png')
      console.log('📊 이미지 데이터 크기:', imageData.length, 'bytes')

      const canvasData = {
        id: editId || Date.now().toString(),
        title,
        description,
        author_name: authorName,
        width: canvas.width,
        height: canvas.height,
        imageData: imageData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('💾 localStorage 저장 중...')
      // 임시로 localStorage에 저장 (백엔드 복구 전까지)
      const existingArtworks = JSON.parse(localStorage.getItem('artworks') || '[]')
      console.log('📚 기존 작품 개수:', existingArtworks.length)

      if (editId) {
        // 기존 작품 업데이트
        console.log('✏️ 기존 작품 업데이트:', editId)
        const index = existingArtworks.findIndex((art: any) => art.id === editId)
        if (index !== -1) {
          existingArtworks[index] = { ...existingArtworks[index], ...canvasData }
          console.log('✅ 작품 업데이트 완료')
        } else {
          console.error('❌ 편집할 작품을 찾을 수 없음')
        }
      } else {
        // 새 작품 추가
        console.log('➕ 새 작품 추가')
        existingArtworks.unshift(canvasData)
      }

      localStorage.setItem('artworks', JSON.stringify(existingArtworks))
      console.log('✅ localStorage 저장 완료, 총 작품 수:', existingArtworks.length)

      // 성공 알림
      console.log('🎉 저장 성공!')
      alert('작품이 성공적으로 저장되었습니다!\n(현재 임시 저장 모드)')
      setShowSaveModal(false)

      // 백엔드 API 시도 (실패해도 무시)
      try {
        const formData = new FormData()
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob)
          }, 'image/png', 0.9)
        })
        formData.append('file', blob, 'artwork.png')
        formData.append('title', title)
        formData.append('description', description)
        formData.append('author_name', authorName)
        formData.append('canvas_data', JSON.stringify(canvasData))
        formData.append('width', canvas.width.toString())
        formData.append('height', canvas.height.toString())

        const url = editId
          ? apiUrls.artwork(editId)
          : apiUrls.artworks

        await fetch(url, {
          method: editId ? 'PUT' : 'POST',
          body: formData
        })
      } catch (apiError) {
        console.log('API 저장 실패 (임시 저장은 성공):', apiError)
      }

    } catch (error) {
      console.error('Save error:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const colors = [
    '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500'
  ]

  return (
    <div className="min-h-screen" style={{background: 'var(--background)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-5xl font-bold text-gray-900">
              {editId ? '작품 편집' : '실시간 그림판'}
            </h1>
            {editId && loadedArtwork && (
              <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                편집 중: {loadedArtwork.title}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <p className="text-gray-600">
              {editId ? '기존 작품을 편집하고 있습니다' : '그림을 그리고 저장할 수 있습니다'}
            </p>
          </div>
        </div>

        {/* Tools Panel */}
        <div className="mb-6 p-4 bg-white border border-gray-300 rounded-lg">
          <div className="flex flex-wrap items-center gap-6">

            {/* Tool Selection */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">도구:</label>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentTool('pen')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    currentTool === 'pen' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  펜
                </button>
                <button
                  onClick={() => setCurrentTool('eraser')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    currentTool === 'eraser' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  지우개
                </button>
              </div>
            </div>

            {/* Brush Size */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">크기:</label>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-gray-600 w-6">{brushSize}</span>
            </div>

            {/* Color Picker */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">색상:</label>
              <div className="flex gap-1">
                {colors.map((colorOption) => (
                  <button
                    key={colorOption}
                    onClick={() => setColor(colorOption)}
                    className={`w-6 h-6 rounded border-2 ${
                      color === colorOption ? 'border-blue-500' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: colorOption }}
                  />
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={() => setShowSaveModal(true)}
              className="px-6 py-2 rounded transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{ 
                border: '2px solid #000000',
                color: '#000000',
                fontWeight: 'normal',
                fontSize: '14px'
              }}
            >
              💾 저장
            </button>

            {/* Clear Button */}
            <button
              onClick={clearCanvas}
              className="px-6 py-2 rounded transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{ 
                border: '2px solid #000000',
                color: '#000000',
                fontWeight: 'normal',
                fontSize: '14px'
              }}
            >
              🗑️ 삭제
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="border border-border rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full cursor-crosshair bg-white"
            style={{ maxHeight: '70vh' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-white/50 border border-border rounded-lg">
          <h3 className="text-gray-900 font-medium mb-2">사용법</h3>
          <ul className="text-gray-600 text-sm space-y-1">
            <li>• 마우스를 드래그하여 그림을 그립니다</li>
            <li>• 펜/지우개 도구를 선택할 수 있습니다</li>
            <li>• 브러시 크기와 색상을 조절할 수 있습니다</li>
            <li>• <span className="text-green-600">'저장' 버튼</span>으로 작품을 저장할 수 있습니다</li>
            <li>• '전체 지우기' 버튼으로 캔버스를 초기화합니다</li>
            <li>• 저장된 작품은 갤러리에서 확인하고 편집할 수 있습니다</li>
          </ul>
        </div>
      </div>

      {/* Save Modal */}
      <SaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={saveArtwork}
        isLoading={isSaving}
        isEdit={!!editId}
        defaultValues={loadedArtwork ? {
          title: loadedArtwork.title,
          description: loadedArtwork.description || '',
          authorName: loadedArtwork.author_name
        } : undefined}
      />
    </div>
  )
}
