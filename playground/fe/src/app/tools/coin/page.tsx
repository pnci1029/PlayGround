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
    
    const coinResult = Math.random() > 0.5 ? 'heads' : 'tails'
    
    // CSS 애니메이션 완료 후 올바른 면으로 설정
    setTimeout(() => {
      setIsFlipping(false) // 애니메이션 중단
      // 약간의 지연 후 올바른 면 표시
      setTimeout(() => {
        setResult(coinResult)
        setFlipCount(prev => prev + 1)
      }, 100)
    }, 2000) // 더 빠른 2초 애니메이션
    
    // 빠르게 회전하는 동안 랜덤 면 표시 (시각적 효과만)
    let flipCount = 0
    const maxFlips = 20 // 더 많은 회전
    
    const showFlips = () => {
      if (flipCount >= maxFlips) return
      
      // 마지막 0.5초 전까지만 랜덤 표시
      if (flipCount < 15) {
        const randomPreview = Math.random() > 0.5 ? 'heads' : 'tails'
        setResult(randomPreview)
      }
      
      flipCount++
      
      let nextDelay
      if (flipCount < 8) {
        nextDelay = 80 // 빠르게 시작
      } else if (flipCount < 15) {
        nextDelay = 100 + (flipCount - 8) * 15 // 조금씩 느려짐
      } else {
        nextDelay = 200 // 마지막엔 표시 중단
      }
      
      setTimeout(showFlips, nextDelay)
    }
    
    showFlips()
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
              className={`coin ${isFlipping ? 'flipping' : ''} ${result && !isFlipping ? `show-${result}` : 'show-heads'}`}
              onClick={flipCoin}
              style={{
                cursor: isFlipping ? 'not-allowed' : 'pointer'
              }}
            >
              {/* 앞면 (학) */}
              <div className="coin-side heads">
                <div className="coin-inner">
                  <div className="coin-crane">🕊️</div>
                  <div className="coin-bank">한국은행</div>
                  <div className="coin-border"></div>
                </div>
              </div>
              
              {/* 뒷면 (100원) */}
              <div className="coin-side tails">
                <div className="coin-inner">
                  <div className="coin-value-large">100</div>
                  <div className="coin-taegeuk">☯</div>
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
                {result === 'heads' ? '학 (앞면)' : '100원 (뒷면)'}
              </div>
            </div>
          )}

          {/* 클릭 힌트 */}
          {!isFlipping && (
            <div className="text-center">
              <p className="text-gray-500 text-base">동전을 클릭해서 던져보세요!</p>
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
            animation: flipAndThrow 2s ease-out;
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

          .coin-crane {
            font-size: 1.8rem;
            margin-bottom: 6px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            transform: scale(1.2);
          }

          .coin-bank {
            font-size: 0.7rem;
            font-weight: normal;
            opacity: 0.9;
            letter-spacing: 1px;
          }

          .coin-value-large {
            font-size: 2.2rem;
            font-weight: bold;
            margin-bottom: 4px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            letter-spacing: 2px;
          }

          .coin-taegeuk {
            font-size: 1.2rem;
            opacity: 0.8;
            filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
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

          @keyframes flipAndThrow {
            0% { 
              transform: translateY(0px) rotateY(0deg) scale(1);
            }
            20% { 
              transform: translateY(-100px) rotateY(720deg) scale(1.1);
            }
            40% { 
              transform: translateY(-160px) rotateY(1440deg) scale(0.85);
            }
            60% { 
              transform: translateY(-180px) rotateY(2160deg) scale(0.8);
            }
            80% { 
              transform: translateY(-100px) rotateY(2880deg) scale(1.05);
            }
            95% { 
              transform: translateY(-10px) rotateY(3420deg) scale(1.02);
            }
            100% { 
              transform: translateY(0px) rotateY(3600deg) scale(1);
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