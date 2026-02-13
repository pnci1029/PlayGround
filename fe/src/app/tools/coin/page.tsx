'use client'

import { useState } from 'react'

export default function CoinPage() {
  const [isFlipping, setIsFlipping] = useState(false)
  const [result, setResult] = useState<'heads' | 'tails' | null>(null)
  const [history, setHistory] = useState<('heads' | 'tails')[]>([])
  const [flipCount, setFlipCount] = useState(0)

  const flipCoin = () => {
    if (isFlipping) return
    
    setIsFlipping(true)
    setResult(null)
    
    // 플립 애니메이션 지속 시간
    const flipDuration = 2500
    
    setTimeout(() => {
      const coinResult = Math.random() > 0.5 ? 'heads' : 'tails'
      setResult(coinResult)
      setHistory(prev => [coinResult, ...prev.slice(0, 9)]) // 최근 10개까지 저장
      setFlipCount(prev => prev + 1)
      setIsFlipping(false)
    }, flipDuration)
  }

  const clearHistory = () => {
    setHistory([])
    setFlipCount(0)
  }

  const headsCount = history.filter(r => r === 'heads').length
  const tailsCount = history.filter(r => r === 'tails').length

  return (
    <div className="min-h-screen" style={{background: 'var(--background)'}}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">동전 던지기</h1>
        </div>

        {/* Main Coin Container */}
        <div className="flex flex-col items-center space-y-8 sm:space-y-12">
          
          {/* 3D Coin */}
          <div className="coin-container" style={{ perspective: '1000px' }}>
            <div 
              className={`coin ${isFlipping ? 'flipping' : ''} ${result ? `show-${result}` : 'show-heads'}`}
            >
              {/* 앞면 (Heads) */}
              <div className="coin-side heads">
                <div className="coin-inner">
                  <div className="coin-symbol">👑</div>
                  <div className="coin-text">HEADS</div>
                  <div className="coin-border"></div>
                </div>
              </div>
              
              {/* 뒷면 (Tails) */}
              <div className="coin-side tails">
                <div className="coin-inner">
                  <div className="coin-symbol">🌟</div>
                  <div className="coin-text">TAILS</div>
                  <div className="coin-border"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Result Display */}
          {result && !isFlipping && (
            <div className="text-center animate-bounce px-4">
              <div className="text-4xl sm:text-6xl font-bold mb-2" style={{
                color: result === 'heads' ? '#d97706' : '#7c3aed'
              }}>
                {result === 'heads' ? '👑 앞면' : '🌟 뒷면'}
              </div>
              <p className="text-gray-600 text-base sm:text-lg">
                {result === 'heads' ? 'Heads!' : 'Tails!'}
              </p>
            </div>
          )}

          {/* Flip Button */}
          <button
            onClick={flipCoin}
            disabled={isFlipping}
            className={`px-6 sm:px-8 py-3 sm:py-4 text-lg sm:text-xl font-semibold rounded-xl transition-all duration-300 w-full max-w-xs ${
              isFlipping 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-gradient-to-r from-amber-500 to-purple-600 text-white hover:from-amber-600 hover:to-purple-700 hover:scale-105 active:scale-95'
            } shadow-lg hover:shadow-xl`}
          >
            {isFlipping ? '동전이 돌아가는 중...' : '🪙 동전 던지기'}
          </button>

          {/* Statistics */}
          {flipCount > 0 && (
            <div className="w-full max-w-md space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-700">통계</h3>
                  <span className="text-sm text-gray-500">총 {flipCount}회</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">👑</span>
                      <span className="font-medium text-amber-600">앞면</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-amber-600">{headsCount}</span>
                      <span className="text-sm text-gray-500">
                        ({flipCount > 0 ? Math.round((headsCount / flipCount) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🌟</span>
                      <span className="font-medium text-purple-600">뒷면</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-purple-600">{tailsCount}</span>
                      <span className="text-sm text-gray-500">
                        ({flipCount > 0 ? Math.round((tailsCount / flipCount) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-700">최근 기록</h3>
                <button
                  onClick={clearHistory}
                  className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
                  초기화
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.map((flip, index) => (
                  <div
                    key={index}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm border-2 ${
                      flip === 'heads' 
                        ? 'bg-amber-50 border-amber-200 text-amber-600' 
                        : 'bg-purple-50 border-purple-200 text-purple-600'
                    }`}
                  >
                    {flip === 'heads' ? '👑' : '🌟'}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Coin Styles */}
        <style jsx>{`
          .coin-container {
            width: 150px;
            height: 150px;
          }

          .coin {
            position: relative;
            width: 150px;
            height: 150px;
            transform-style: preserve-3d;
            transition: transform 0.6s ease-out;
          }

          .flipping {
            animation: flipCoin 2.5s ease-out;
          }

          .coin-side {
            position: absolute;
            width: 150px;
            height: 150px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            backface-visibility: hidden;
            border: 4px solid #d1d5db;
            box-shadow: 
              0 8px 16px rgba(0,0,0,0.1),
              inset 0 2px 4px rgba(255,255,255,0.3),
              inset 0 -2px 4px rgba(0,0,0,0.1);
          }

          .heads {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
            transform: rotateY(0deg);
          }

          .tails {
            background: linear-gradient(135deg, #a855f7 0%, #9333ea 50%, #7c3aed 100%);
            transform: rotateY(180deg);
          }

          .coin-inner {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          }

          .coin-symbol {
            font-size: 3rem;
            margin-bottom: 8px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
          }

          .coin-text {
            font-size: 0.9rem;
            font-weight: bold;
            letter-spacing: 1px;
          }

          .coin-border {
            position: absolute;
            top: 8px;
            left: 8px;
            right: 8px;
            bottom: 8px;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            pointer-events: none;
          }

          .show-heads { transform: rotateY(0deg); }
          .show-tails { transform: rotateY(180deg); }

          @keyframes flipCoin {
            0% { 
              transform: rotateY(0deg) rotateX(0deg) scale(1);
            }
            25% { 
              transform: rotateY(450deg) rotateX(180deg) scale(0.8);
            }
            50% { 
              transform: rotateY(900deg) rotateX(360deg) scale(0.6);
            }
            75% { 
              transform: rotateY(1350deg) rotateX(540deg) scale(0.8);
            }
            100% { 
              transform: rotateY(1800deg) rotateX(720deg) scale(1);
            }
          }

          /* 모바일 최적화 */
          @media (max-width: 640px) {
            .coin-container {
              width: 120px;
              height: 120px;
            }
            
            .coin, .coin-side {
              width: 120px;
              height: 120px;
            }
            
            .coin-symbol {
              font-size: 2.5rem;
            }
            
            .coin-text {
              font-size: 0.8rem;
            }
          }
        `}</style>
      </div>
    </div>
  )
}