'use client'

import { useRef, useState, useEffect, MouseEvent } from 'react'

export default function CanvasPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser'>('pen')
  const [brushSize, setBrushSize] = useState(5)
  const [color, setColor] = useState('#ffffff')
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const [activeUsers, setActiveUsers] = useState(1)
  const wsRef = useRef<WebSocket | null>(null)

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

  const connectWebSocket = () => {
    try {
      setConnectionStatus('connecting')
      const ws = new WebSocket('ws://localhost:8083')
      wsRef.current = ws

      ws.onopen = () => {
        setConnectionStatus('connected')
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleWebSocketMessage(data)
        } catch (error) {
          console.error('WebSocket message parse error:', error)
        }
      }

      ws.onclose = () => {
        setConnectionStatus('disconnected')
        
        // 자동 재연결 (5초 후)
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.CLOSED) {
            connectWebSocket()
          }
        }, 5000)
      }

      ws.onerror = (error) => {
        console.error('Canvas WebSocket error:', error)
        setConnectionStatus('disconnected')
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      setConnectionStatus('disconnected')
    }
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
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'draw',
        data: {
          x, y, prevX, prevY,
          color,
          brushSize,
          tool: currentTool
        }
      }))
    }
  }

  const sendClearEvent = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'clear'
      }))
    }
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

    // WebSocket으로 그리기 데이터 전송
    sendDrawEvent(x, y, lastX, lastY)

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

    // WebSocket으로 클리어 이벤트 전송
    sendClearEvent()
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
          <h1 className="text-3xl font-bold text-white mb-2">실시간 그림판</h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-400">다른 사용자와 함께 그림을 그려보세요</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-sm text-gray-400">
                {connectionStatus === 'connected' ? '연결됨' : 
                 connectionStatus === 'connecting' ? '연결 중...' : '오프라인'}
              </span>
            </div>
          </div>
        </div>

        {/* Tools Panel */}
        <div className="mb-6 p-4 bg-gray-900 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
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
        <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)' }}>
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
        <div className="mt-6 p-4 bg-gray-900/50 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-white font-medium mb-2">사용법</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• 마우스를 드래그하여 그림을 그립니다</li>
            <li>• 펜/지우개 도구를 선택할 수 있습니다</li>
            <li>• 브러시 크기와 색상을 조절할 수 있습니다</li>
            <li>• '전체 지우기' 버튼으로 캔버스를 초기화합니다</li>
            <li className="text-yellow-400">• 실시간 협업 기능은 곧 추가될 예정입니다</li>
          </ul>
        </div>
      </div>
    </div>
  )
}