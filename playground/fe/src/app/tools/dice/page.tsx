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
    
    const finalResult = Math.floor(Math.random() * 6) + 1
    
    // CSS 애니메이션 완료 후 올바른 면으로 설정
    setTimeout(() => {
      setIsRolling(false) // 애니메이션 중단
      // 약간의 지연 후 올바른 면 표시
      setTimeout(() => {
        setResult(finalResult)
      }, 100)
    }, 3000) // CSS 애니메이션과 정확히 맞춤
    
    // 굴리는 동안 랜덤 숫자 표시 (시각적 효과만)
    let rollCount = 0
    const maxRolls = 20
    
    const showRolls = () => {
      if (rollCount >= maxRolls) return
      
      // 마지막 1초 전까지만 랜덤 표시
      if (rollCount < 15) {
        const faceToShow = Math.floor(Math.random() * 6) + 1
        setResult(faceToShow)
      }
      
      rollCount++
      
      let nextDelay
      if (rollCount < 8) {
        nextDelay = 100
      } else if (rollCount < 15) {
        nextDelay = 150 + (rollCount - 8) * 20
      } else {
        nextDelay = 200 // 마지막엔 표시 중단
      }
      
      setTimeout(showRolls, nextDelay)
    }
    
    showRolls()
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
              className={`dice-container ${isRolling ? 'rolling' : ''} ${result && !isRolling ? `show-${result}` : ''}`}
              onClick={rollDice}
              style={{
                width: '120px',
                height: '120px',
                position: 'relative',
                transformStyle: 'preserve-3d',
                transition: isRolling ? 'none' : 'transform 0.6s ease-out',
                cursor: isRolling ? 'not-allowed' : 'pointer'
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
          
          {/* 멈춤 상태 표시 */}
          {isRolling && result === null && (
            <div className="text-center px-4">
              <div className="text-2xl text-gray-500 animate-pulse">🎲</div>
              <p className="text-gray-500 text-sm">결과 확인 중...</p>
            </div>
          )}

          {/* 클릭 힌트 */}
          {!isRolling && (
            <div className="text-center">
              <p className="text-gray-500 text-base">주사위를 클릭해서 굴려보세요!</p>
            </div>
          )}
        </div>

        {/* Dice Styles */}
        <style jsx>{`
          .dice-container {
            transform-style: preserve-3d;
          }

          .rolling {
            animation: rollAndMove 3s ease-out;
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

          @keyframes rollAndMove {
            0% { 
              transform: translateX(0px) translateY(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1);
            }
            15% { 
              transform: translateX(80px) translateY(-20px) rotateX(180deg) rotateY(360deg) rotateZ(180deg) scale(1.1);
            }
            30% { 
              transform: translateX(-60px) translateY(-10px) rotateX(360deg) rotateY(720deg) rotateZ(360deg) scale(0.9);
            }
            45% { 
              transform: translateX(40px) translateY(-15px) rotateX(540deg) rotateY(1080deg) rotateZ(540deg) scale(1.05);
            }
            60% { 
              transform: translateX(-30px) translateY(-5px) rotateX(720deg) rotateY(1440deg) rotateZ(720deg) scale(0.95);
            }
            75% { 
              transform: translateX(15px) translateY(-8px) rotateX(900deg) rotateY(1800deg) rotateZ(900deg) scale(1.02);
            }
            85% { 
              transform: translateX(-8px) translateY(-3px) rotateX(1000deg) rotateY(2000deg) rotateZ(1000deg) scale(0.98);
            }
            95% { 
              transform: translateX(3px) translateY(-1px) rotateX(1080deg) rotateY(2160deg) rotateZ(1080deg) scale(1.01);
            }
            100% { 
              transform: translateX(0px) translateY(0px) rotateX(1080deg) rotateY(2160deg) rotateZ(1080deg) scale(1);
            }
          }
        `}</style>
      </div>
    </div>
  )
}