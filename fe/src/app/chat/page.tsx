'use client'

import { useState, useEffect, useRef } from 'react'

interface ChatMessage {
  type: 'message' | 'user_join' | 'user_leave' | 'user_list'
  message?: string
  nickname?: string
  timestamp: number
  userId?: string
  userCount?: number
  users?: string[]
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const [activeUsers, setActiveUsers] = useState<string[]>([])
  const [userCount, setUserCount] = useState(0)
  const [myNickname, setMyNickname] = useState('')
  
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    connectWebSocket()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const connectWebSocket = () => {
    try {
      setConnectionStatus('connecting')
      const ws = new WebSocket('ws://localhost:8084')
      wsRef.current = ws

      ws.onopen = () => {
        setConnectionStatus('connected')
        console.log('채팅 서버에 연결되었습니다')
      }

      ws.onmessage = (event) => {
        try {
          const data: ChatMessage = JSON.parse(event.data)
          handleWebSocketMessage(data)
        } catch (error) {
          console.error('Chat message parse error:', error)
        }
      }

      ws.onclose = () => {
        setConnectionStatus('disconnected')
        console.log('채팅 서버 연결이 끊어졌습니다')
      }

      ws.onerror = (error) => {
        console.error('Chat WebSocket error:', error)
        setConnectionStatus('disconnected')
        console.log('채팅 서버에 연결할 수 없습니다 (오프라인 모드)')
      }
    } catch (error) {
      console.error('Failed to connect to chat:', error)
      setConnectionStatus('disconnected')
    }
  }

  const handleWebSocketMessage = (data: ChatMessage) => {
    switch (data.type) {
      case 'user_list':
        if (data.users) {
          setActiveUsers(data.users)
          setUserCount(data.userCount || 0)
        }
        break
        
      case 'message':
        setMessages(prev => [...prev, data])
        break
        
      case 'user_join':
        setMessages(prev => [...prev, {
          ...data,
          message: `${data.nickname}님이 입장했습니다.`,
          type: 'user_join'
        }])
        if (data.users) {
          setActiveUsers(data.users)
          setUserCount(data.userCount || 0)
        }
        break
        
      case 'user_leave':
        setMessages(prev => [...prev, {
          ...data,
          message: `${data.nickname}님이 퇴장했습니다.`,
          type: 'user_leave'
        }])
        if (data.users) {
          setActiveUsers(data.users)
          setUserCount(data.userCount || 0)
        }
        break
    }
  }

  const sendMessage = () => {
    if (!inputMessage.trim()) return

    const myMessage: ChatMessage = {
      type: 'message',
      message: inputMessage.trim(),
      nickname: myNickname || '나',
      timestamp: Date.now(),
      userId: 'me'
    }

    // WebSocket이 연결되어 있으면 서버로 전송
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        message: inputMessage.trim()
      }))
    } else {
      // 오프라인 모드: 로컬에서만 표시
      setMessages(prev => [...prev, myMessage])
    }

    setInputMessage('')
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--background)'}}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">익명 채팅방</h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-400">자유롭게 대화를 나누어보세요</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-400">
                  {connectionStatus === 'connected' ? '연결됨' : 
                   connectionStatus === 'connecting' ? '연결 중...' : '연결 끊김'}
                </span>
              </div>
              {connectionStatus === 'connected' && (
                <span className="text-sm text-gray-400">
                  참여자: {userCount}명
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 채팅 영역 */}
          <div className="lg:col-span-3">
            <div className="bg-gray-900/80 backdrop-blur-md border border-border rounded-lg">
              {/* 메시지 영역 */}
              <div 
                ref={chatContainerRef}
                className="h-[600px] overflow-y-auto p-4 space-y-3"
                style={{ minHeight: '400px', maxHeight: '70vh' }}
              >
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 mt-8">
                    <p>아직 메시지가 없습니다.</p>
                    <p className="text-sm mt-2">첫 번째 메시지를 보내보세요! 🎉</p>
                    {connectionStatus === 'disconnected' && (
                      <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600/30 rounded-lg">
                        <p className="text-yellow-400 text-xs">
                          🔥 채팅 서버가 오프라인입니다. 메시지는 로컬에서만 표시됩니다.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.userId === 'me' ? 'justify-end' : 'justify-start'}`}>
                      {msg.type === 'message' ? (
                        <div className={`max-w-xs lg:max-w-md ${
                          msg.userId === 'me' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-800 text-gray-100'
                        } rounded-lg p-3`}>
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {msg.nickname}
                            </span>
                            <span className="text-xs opacity-75">
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.message}
                          </p>
                        </div>
                      ) : (
                        <div className="w-full text-center">
                          <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                            {msg.message}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 입력 영역 */}
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={connectionStatus === 'connected' ? "메시지를 입력하세요..." : "오프라인 모드 - 로컬 메시지만 가능"}
                    className="flex-1 bg-gray-800 border border-border text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={500}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    전송
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter로 전송 • 최대 500자
                </p>
              </div>
            </div>
          </div>

          {/* 사이드바 - 참여자 목록 */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/80 backdrop-blur-md border border-border rounded-lg p-4">
              <h3 className="text-white font-medium mb-3">
                참여자 ({userCount}명)
              </h3>
              <div className="space-y-2">
                {activeUsers.length > 0 ? (
                  activeUsers.map((user, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-300">{user}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">참여자 정보를 불러오는 중...</p>
                )}
              </div>
            </div>

            {/* 채팅 규칙 */}
            <div className="mt-4 bg-gray-900/60 backdrop-blur-md border border-border rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">채팅 규칙</h3>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• 서로 존중하며 대화해요</li>
                <li>• 스팸이나 도배는 금지</li>
                <li>• 개인정보 공유 주의</li>
                <li>• 즐겁게 대화해요! 😊</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}