'use client'

import { useState, useEffect, useRef } from 'react'
import { apiUrls, logger } from '@/lib/config'

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
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  
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
      // HTTPS에서는 WebSocket 연결을 시도하지 않음 (Mixed Content 제한)
      if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
        setConnectionStatus('disconnected')
        logger.log('🔒 HTTPS에서는 보안상 WebSocket 연결을 지원하지 않습니다')
        return
      }
      
      const ws = new WebSocket(apiUrls.chat.websocket)
      wsRef.current = ws

      ws.onopen = () => {
        setConnectionStatus('connected')
        logger.log('✅ 채팅 서버에 연결되었습니다')
      }

      ws.onmessage = (event) => {
        try {
          const data: ChatMessage = JSON.parse(event.data)
          handleWebSocketMessage(data)
        } catch (error) {
          logger.error('Chat message parse error:', error)
        }
      }

      ws.onclose = () => {
        setConnectionStatus('disconnected')
        logger.log('🔌 채팅 서버 연결이 끊어졌습니다')
      }

      ws.onerror = () => {
        setConnectionStatus('disconnected')
        logger.log('📡 채팅 서버 오프라인 - 로컬 모드로 전환')
      }
    } catch (error) {
      logger.error('Failed to connect to chat:', error)
      setConnectionStatus('disconnected')
    }
  }

  const handleWebSocketMessage = (data: ChatMessage) => {
    switch (data.type) {
      case 'user_list':
        if (data.users) {
          setActiveUsers(data.users)
          setUserCount(data.userCount || 0)
          // 내 닉네임 찾기 (마지막에 추가된 사용자가 나)
          if (data.users.length > 0 && !myNickname) {
            setMyNickname(data.users[data.users.length - 1])
          }
        }
        break
        
      case 'message':
        // 내가 보낸 메시지인지 확인
        const messageWithOwnership = {
          ...data,
          userId: data.nickname === myNickname ? 'me' : data.userId
        }
        setMessages(prev => [...prev, messageWithOwnership])
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

    // WebSocket이 연결되어 있으면 서버로 전송
    if (wsRef.current?.readyState === WebSocket.OPEN && myNickname) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        message: inputMessage.trim(),
        nickname: myNickname
      }))
    } else {
      // 오프라인 모드: 로컬에서만 표시
      const myMessage: ChatMessage = {
        type: 'message',
        message: inputMessage.trim(),
        nickname: myNickname || '나',
        timestamp: Date.now(),
        userId: 'me'
      }
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

  // 이전 메시지 더 불러오기
  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMoreMessages || messages.length === 0) return

    setIsLoadingMore(true)
    try {
      // 현재 메시지 목록에서 가장 오래된 메시지의 타임스탬프를 가져옴
      const oldestMessage = messages.find(msg => msg.type === 'message')
      if (!oldestMessage) return

      const response = await fetch(
        `${apiUrls.chat.history}?before=${oldestMessage.timestamp}&limit=50`
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.messages.length > 0) {
          // 기존 메시지 앞에 새로운 메시지들 추가
          setMessages(prev => [...data.messages, ...prev])
          setHasMoreMessages(data.hasMore)
          
          logger.log(`📥 이전 메시지 ${data.messages.length}개 로드됨`)
        } else {
          setHasMoreMessages(false)
        }
      } else {
        logger.error('이전 메시지 로드 실패:', response.status)
      }
    } catch (error) {
      logger.error('이전 메시지 로드 오류:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--background)'}}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">익명 채팅방</h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-600">자유롭게 대화를 나누어보세요</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-600">
                  {connectionStatus === 'connected' ? '연결됨' : 
                   connectionStatus === 'connecting' ? '연결 중...' : '연결 끊김'}
                </span>
              </div>
              {connectionStatus === 'connected' && (
                <span className="text-sm text-gray-600">
                  참여자: {userCount}명
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 채팅 영역 */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-md border border-border rounded-lg">
              {/* 메시지 영역 */}
              <div 
                ref={chatContainerRef}
                className="h-[600px] overflow-y-auto p-4 space-y-3"
                style={{ minHeight: '400px', maxHeight: '70vh' }}
              >
{/* 이전 메시지 더보기 버튼 */}
                {messages.length > 0 && hasMoreMessages && (
                  <div className="text-center mb-4">
                    <button
                      onClick={loadMoreMessages}
                      disabled={isLoadingMore}
                      className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors border border-gray-200"
                    >
                      {isLoadingMore ? '불러오는 중...' : '이전 메시지 더보기'}
                    </button>
                  </div>
                )}

                {messages.length === 0 ? (
                  <div className="text-center text-gray-600 mt-8">
                    <p>아직 메시지가 없습니다.</p>
                    <p className="text-sm mt-2">첫 번째 메시지를 보내보세요!</p>
                    {connectionStatus === 'disconnected' && (
                      <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600/30 rounded-lg">
                        <p className="text-yellow-400 text-xs">
                          채팅 서버가 오프라인입니다. 메시지는 로컬에서만 표시됩니다.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  messages
                    .filter(msg => msg.type === 'message') // 실제 채팅 메시지만 표시
                    .map((msg, index) => (
                    <div key={index} className={`flex ${msg.userId === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md ${
                        msg.userId === 'me' 
                          ? 'bg-gray-100 border border-gray-300' 
                          : 'bg-white border border-gray-200'
                      } rounded-lg p-3 shadow-sm`}>
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-800">
                            {msg.nickname}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                          {msg.message}
                        </p>
                      </div>
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
                    className="flex-1 bg-gray-50 border border-border text-gray-900 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={500}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim()}
                    className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 border border-gray-300 px-6 py-2 rounded-lg transition-colors"
                  >
                    <span style={{ color: '#000000', fontWeight: 'normal' }}>전송</span>
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
            <div className="bg-white/80 backdrop-blur-md border border-border rounded-lg p-4">
              <h3 className="text-gray-900 font-medium mb-3">
                참여자 ({userCount}명)
              </h3>
              <div className="space-y-2">
                {activeUsers.length > 0 ? (
                  activeUsers.map((user, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{user}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">참여자 정보를 불러오는 중...</p>
                )}
              </div>
            </div>

            {/* 채팅 규칙 */}
            <div className="mt-4 bg-white/60 backdrop-blur-md border border-border rounded-lg p-4">
              <h3 className="text-gray-900 font-medium mb-2">채팅 규칙</h3>
              <ul className="text-xs text-gray-600 space-y-1">
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