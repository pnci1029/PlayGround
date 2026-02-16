'use client'

interface LiveIndicatorProps {
  isConnected: boolean
  lastUpdate: Date | null
  activeUsers?: number
}

export default function LiveIndicator({ isConnected, lastUpdate, activeUsers }: LiveIndicatorProps) {
  return (
    <div className="flex items-center gap-4">
      {/* 연결 상태 */}
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
        isConnected 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500 animate-pulse-glow' : 'bg-red-500'
        }`} />
        {isConnected ? '실시간 연결' : '연결 끊김'}
      </div>

      {/* 활성 사용자 수 */}
      {isConnected && activeUsers !== undefined && (
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          👥 {activeUsers}명 접속 중
        </div>
      )}

      {/* 마지막 업데이트 시간 */}
      {lastUpdate && (
        <div className="text-sm text-gray-600">
          마지막 업데이트: {lastUpdate.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </div>
      )}
    </div>
  )
}