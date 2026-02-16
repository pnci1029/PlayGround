'use client'

interface LiveIndicatorProps {
  isConnected: boolean
  lastUpdate: Date | null
  activeUsers?: number
}

export default function LiveIndicator({ isConnected, lastUpdate, activeUsers }: LiveIndicatorProps) {
  return (
    <div className="flex items-center gap-6 animate-fade-in">
      {/* 연결 상태 */}
      <div className={`glass flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
        isConnected 
          ? 'border-accent-green/30' 
          : 'border-accent-red/30'
      }`}>
        <div className={`w-3 h-3 rounded-full relative ${
          isConnected ? 'bg-accent-green animate-pulse-glow' : 'bg-accent-red'
        }`}>
          {isConnected && (
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-accent-green animate-ping opacity-30"></div>
          )}
        </div>
        <span className={isConnected ? 'text-accent-green' : 'text-accent-red'}>
          {isConnected ? '🔴 LIVE 연결' : '❌ 연결 끊김'}
        </span>
      </div>

      {/* 활성 사용자 수 */}
      {isConnected && activeUsers !== undefined && (
        <div className="glass px-4 py-2.5 rounded-xl text-sm font-semibold text-primary flex items-center gap-2">
          <span className="text-lg">👥</span>
          <span>{activeUsers}명 접속 중</span>
        </div>
      )}

      {/* 마지막 업데이트 시간 */}
      {lastUpdate && (
        <div className="text-sm text-text-muted flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
          <span>
            마지막 업데이트: <span className="text-text-secondary font-medium">
              {lastUpdate.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </span>
          </span>
        </div>
      )}
    </div>
  )
}