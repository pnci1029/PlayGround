'use client'

import { useState } from 'react'

export default function DicePage() {
  const [isRolling, setIsRolling] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [history, setHistory] = useState<number[]>([])

  const rollDice = () => {
    if (isRolling) return
    
    setIsRolling(true)
    setResult(null)
    
    // 롤링 애니메이션 지속 시간
    const rollDuration = 2000
    
    setTimeout(() => {
      const diceResult = Math.floor(Math.random() * 6) + 1
      setResult(diceResult)
      setHistory(prev => [diceResult, ...prev.slice(0, 9)]) // 최근 10개까지 저장
      setIsRolling(false)
    }, rollDuration)
  }

  const clearHistory = () => {
    setHistory([])
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--background)'}}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">주사위 굴리기</h1>
        </div>

        {/* Main Dice Container */}
        <div className="flex flex-col items-center space-y-8 sm:space-y-12">
          
          {/* 3D Dice */}
          <div className="relative" style={{ perspective: '1000px' }}>
            <div 
              className={`dice-container ${isRolling ? 'rolling' : ''} ${result ? `show-${result}` : ''}`}
              style={{
                width: '120px',
                height: '120px',
                position: 'relative',
                transformStyle: 'preserve-3d',
                transition: isRolling ? 'none' : 'transform 0.6s ease-out',
              }}
            >
              {/* 주사위 각 면 */}
              <div className="dice-face dice-1">
                <div className="dot center"></div>
              </div>
              <div className="dice-face dice-2">
                <div className="dot top-left"></div>
                <div className="dot bottom-right"></div>
              </div>
              <div className="dice-face dice-3">
                <div className="dot top-left"></div>
                <div className="dot center"></div>
                <div className="dot bottom-right"></div>
              </div>
              <div className="dice-face dice-4">
                <div className="dot top-left"></div>
                <div className="dot top-right"></div>
                <div className="dot bottom-left"></div>
                <div className="dot bottom-right"></div>
              </div>
              <div className="dice-face dice-5">
                <div className="dot top-left"></div>
                <div className="dot top-right"></div>
                <div className="dot center"></div>
                <div className="dot bottom-left"></div>
                <div className="dot bottom-right"></div>
              </div>
              <div className="dice-face dice-6">
                <div className="dot top-left"></div>
                <div className="dot top-right"></div>
                <div className="dot middle-left"></div>
                <div className="dot middle-right"></div>
                <div className="dot bottom-left"></div>
                <div className="dot bottom-right"></div>
              </div>
            </div>
          </div>

          {/* Result Display */}
          {result && !isRolling && (
            <div className="text-center animate-bounce px-4">
              <div className="text-4xl sm:text-6xl font-bold text-blue-600 mb-2">{result}</div>
              <p className="text-gray-600 text-base sm:text-lg">결과가 나왔습니다!</p>
            </div>
          )}

          {/* Roll Button */}
          <button
            onClick={rollDice}
            disabled={isRolling}
            className={`px-6 sm:px-8 py-3 sm:py-4 text-lg sm:text-xl font-semibold rounded-xl transition-all duration-300 w-full max-w-xs ${
              isRolling 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 active:scale-95'
            } shadow-lg hover:shadow-xl`}
          >
            {isRolling ? '주사위 굴리는 중...' : '🎲 주사위 굴리기'}
          </button>

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
                {history.map((num, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 bg-white border border-gray-200 rounded-md flex items-center justify-center text-sm font-medium shadow-sm"
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dice Styles */}
        <style jsx>{`
          .dice-container {
            transform-style: preserve-3d;
          }

          .rolling {
            animation: rollDice 2s ease-out infinite;
          }

          .dice-face {
            position: absolute;
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
            padding: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }

          .dice-1 { transform: rotateY(0deg) translateZ(60px); }
          .dice-2 { transform: rotateY(90deg) translateZ(60px); }
          .dice-3 { transform: rotateY(180deg) translateZ(60px); }
          .dice-4 { transform: rotateY(-90deg) translateZ(60px); }
          .dice-5 { transform: rotateX(90deg) translateZ(60px); }
          .dice-6 { transform: rotateX(-90deg) translateZ(60px); }

          .dot {
            width: 16px;
            height: 16px;
            background: #374151;
            border-radius: 50%;
            position: absolute;
          }

          .center { top: 50%; left: 50%; transform: translate(-50%, -50%); }
          .top-left { top: 20px; left: 20px; }
          .top-right { top: 20px; right: 20px; }
          .middle-left { top: 50%; left: 20px; transform: translateY(-50%); }
          .middle-right { top: 50%; right: 20px; transform: translateY(-50%); }
          .bottom-left { bottom: 20px; left: 20px; }
          .bottom-right { bottom: 20px; right: 20px; }

          .show-1 { transform: rotateY(0deg) rotateX(0deg); }
          .show-2 { transform: rotateY(-90deg) rotateX(0deg); }
          .show-3 { transform: rotateY(-180deg) rotateX(0deg); }
          .show-4 { transform: rotateY(90deg) rotateX(0deg); }
          .show-5 { transform: rotateY(0deg) rotateX(-90deg); }
          .show-6 { transform: rotateY(0deg) rotateX(90deg); }

          @keyframes rollDice {
            0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
            25% { transform: rotateX(90deg) rotateY(180deg) rotateZ(90deg); }
            50% { transform: rotateX(180deg) rotateY(360deg) rotateZ(180deg); }
            75% { transform: rotateX(270deg) rotateY(540deg) rotateZ(270deg); }
            100% { transform: rotateX(360deg) rotateY(720deg) rotateZ(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}