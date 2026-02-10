'use client'

import { useRef, useState, useEffect, MouseEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import SaveModal from '@/components/canvas/SaveModal'

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
    ctx.fillStyle = '#1a1a1a'
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
      const response = await fetch(`http://localhost:8085/api/artworks/${artworkId}`)
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

    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const saveArtwork = async (title: string, description: string, authorName: string) => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsSaving(true)
    try {
      // Canvas를 Blob으로 변환
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
        }, 'image/png', 0.9)
      })

      // Canvas 데이터 추출 (향후 편집용)
      const canvasData = {
        width: canvas.width,
        height: canvas.height,
        imageData: canvas.toDataURL('image/png')
      }

      // FormData 생성
      const formData = new FormData()
      formData.append('file', blob, 'artwork.png')
      formData.append('title', title)
      formData.append('description', description)
      formData.append('author_name', authorName)
      formData.append('canvas_data', JSON.stringify(canvasData))
      formData.append('width', canvas.width.toString())
      formData.append('height', canvas.height.toString())

      // API 호출 (편집 모드면 PUT, 새 작품이면 POST)
      const url = editId 
        ? `http://localhost:8085/api/artworks/${editId}`
        : 'http://localhost:8085/api/artworks'
      
      const response = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('저장에 실패했습니다')
      }

      const result = await response.json()
      console.log('Artwork saved:', result)
      
      // 성공 알림
      alert('작품이 성공적으로 저장되었습니다!')
      setShowSaveModal(false)

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
            <h1 className="text-3xl font-bold text-white">
              {editId ? '작품 편집' : '실시간 그림판'}
            </h1>
            {editId && loadedArtwork && (
              <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                편집 중: {loadedArtwork.title}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <p className="text-gray-400">
              {editId ? '기존 작품을 편집하고 있습니다' : '그림을 그리고 저장할 수 있습니다'}
            </p>
          </div>
        </div>

        {/* Tools Panel */}
        <div className="mb-6 p-4 bg-gray-900 border border-border rounded-lg">
          <div className="flex flex-wrap items-center gap-6">
            
            {/* Tool Selection */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">도구:</label>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentTool('pen')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    currentTool === 'pen' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  펜
                </button>
                <button
                  onClick={() => setCurrentTool('eraser')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    currentTool === 'eraser' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  지우개
                </button>
              </div>
            </div>

            {/* Brush Size */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">크기:</label>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-gray-400 w-6">{brushSize}</span>
            </div>

            {/* Color Picker */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">색상:</label>
              <div className="flex gap-1">
                {colors.map((colorOption) => (
                  <button
                    key={colorOption}
                    onClick={() => setColor(colorOption)}
                    className={`w-6 h-6 rounded border-2 ${
                      color === colorOption ? 'border-white' : 'border-gray-600'
                    }`}
                    style={{ backgroundColor: colorOption }}
                  />
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={() => setShowSaveModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm transition-colors"
            >
              {editId ? '업데이트' : '저장'}
            </button>

            {/* Clear Button */}
            <button
              onClick={clearCanvas}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm transition-colors"
            >
              전체 지우기
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="border border-border rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full cursor-crosshair bg-gray-900"
            style={{ maxHeight: '70vh' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-gray-900/50 border border-border rounded-lg">
          <h3 className="text-white font-medium mb-2">사용법</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• 마우스를 드래그하여 그림을 그립니다</li>
            <li>• 펜/지우개 도구를 선택할 수 있습니다</li>
            <li>• 브러시 크기와 색상을 조절할 수 있습니다</li>
            <li>• <span className="text-green-400">'저장' 버튼</span>으로 작품을 저장할 수 있습니다</li>
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