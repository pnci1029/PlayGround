'use client'

import { useState, useRef, useEffect } from 'react'

interface Player {
  name: string
  color: string
}

interface Prize {
  name: string
  color: string
}

interface LadderLine {
  fromColumn: number
  row: number
}

export default function LadderPage() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [players, setPlayers] = useState<Player[]>([
    { name: '참가자1', color: '#FF6B6B' },
    { name: '참가자2', color: '#4ECDC4' }
  ])
  const [prizes, setPrizes] = useState<Prize[]>([
    { name: '상품1', color: '#FF6B6B' },
    { name: '상품2', color: '#4ECDC4' }
  ])
  const [ladderLines, setLadderLines] = useState<LadderLine[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [results, setResults] = useState<Array<{player: string, prize: string}> | null>(null)
  const [animationPath, setAnimationPath] = useState<number[]>([])
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [showPath, setShowPath] = useState(false)

  // 색상 팔레트
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFB347', '#98FB98', '#F0E68C', '#FF69B4']

  const ladderHeight = 400
  const ladderRows = 8

  // 자동으로 사다리 생성
  useEffect(() => {
    generateLadder()
  }, [players.length])

  const generateLadder = () => {
    const lines: LadderLine[] = []
    const numColumns = players.length
    
    if (numColumns < 2) return
    
    for (let row = 1; row <= ladderRows; row++) {
      // 각 행마다 30-70% 확률로 다리 생성
      const shouldHaveBridge = Math.random() > 0.4
      
      if (shouldHaveBridge) {
        // 랜덤하게 다리를 배치하되, 겹치지 않게
        const availableColumns = Array.from({length: numColumns - 1}, (_, i) => i)
        const numBridges = Math.floor(Math.random() * Math.min(2, availableColumns.length)) + 1
        
        for (let i = 0; i < numBridges; i++) {
          if (availableColumns.length === 0) break
          
          const randomIndex = Math.floor(Math.random() * availableColumns.length)
          const column = availableColumns[randomIndex]
          
          lines.push({ fromColumn: column, row })
          
          // 인접한 컬럼들 제거 (겹침 방지)
          availableColumns.splice(randomIndex, 1)
          const leftIndex = availableColumns.indexOf(column - 1)
          const rightIndex = availableColumns.indexOf(column + 1)
          if (leftIndex !== -1) availableColumns.splice(leftIndex, 1)
          if (rightIndex !== -1) availableColumns.splice(rightIndex, 1)
        }
      }
    }
    
    setLadderLines(lines)
  }

  const addPlayer = () => {
    if (players.length >= 10) return
    
    const newPlayer = {
      name: `참가자${players.length + 1}`,
      color: colors[players.length % colors.length]
    }
    const newPrize = {
      name: `상품${prizes.length + 1}`,
      color: colors[prizes.length % colors.length]
    }
    
    setPlayers(prev => [...prev, newPlayer])
    setPrizes(prev => [...prev, newPrize])
  }

  const removePlayer = () => {
    if (players.length <= 2) return
    
    setPlayers(prev => prev.slice(0, -1))
    setPrizes(prev => prev.slice(0, -1))
  }

  const updatePlayerName = (index: number, name: string) => {
    setPlayers(prev => prev.map((p, i) => i === index ? {...p, name} : p))
  }

  const updatePrizeName = (index: number, name: string) => {
    setPrizes(prev => prev.map((p, i) => i === index ? {...p, name} : p))
  }

  const tracePath = (startColumn: number): number => {
    let currentColumn = startColumn
    
    for (let row = 1; row <= ladderRows; row++) {
      // 현재 컬럼에서 오른쪽으로 가는 다리가 있는지 확인
      const rightBridge = ladderLines.find(line => 
        line.fromColumn === currentColumn && line.row === row
      )
      
      // 현재 컬럼에서 왼쪽으로 오는 다리가 있는지 확인
      const leftBridge = ladderLines.find(line => 
        line.fromColumn === currentColumn - 1 && line.row === row
      )
      
      if (rightBridge) {
        currentColumn += 1
      } else if (leftBridge) {
        currentColumn -= 1
      }
    }
    
    return currentColumn
  }

  const startGame = () => {
    if (isPlaying) return
    
    setIsPlaying(true)
    setResults(null)
    setShowPath(false)
    setCurrentPlayerIndex(0)
    
    // 각 플레이어의 결과 계산
    const gameResults = players.map((player, index) => {
      const finalColumn = tracePath(index)
      return {
        player: player.name,
        prize: prizes[finalColumn].name
      }
    })
    
    // 애니메이션으로 하나씩 경로 표시
    animateResults(gameResults)
  }

  const animateResults = (gameResults: Array<{player: string, prize: string}>) => {
    let currentIndex = 0
    
    const showNextPath = () => {
      if (currentIndex >= players.length) {
        setResults(gameResults)
        setIsPlaying(false)
        return
      }
      
      setCurrentPlayerIndex(currentIndex)
      
      // 현재 플레이어의 경로 계산
      const path = calculateAnimationPath(currentIndex)
      setAnimationPath(path)
      setShowPath(true)
      
      setTimeout(() => {
        setShowPath(false)
        currentIndex++
        setTimeout(showNextPath, 300)
      }, 1500)
    }
    
    showNextPath()
  }

  const calculateAnimationPath = (startColumn: number): number[] => {
    const path = [startColumn]
    let currentColumn = startColumn
    
    for (let row = 1; row <= ladderRows; row++) {
      const rightBridge = ladderLines.find(line => 
        line.fromColumn === currentColumn && line.row === row
      )
      const leftBridge = ladderLines.find(line => 
        line.fromColumn === currentColumn - 1 && line.row === row
      )
      
      if (rightBridge) {
        currentColumn += 1
      } else if (leftBridge) {
        currentColumn -= 1
      }
      
      path.push(currentColumn)
    }
    
    return path
  }

  const reset = () => {
    generateLadder()
    setResults(null)
    setShowPath(false)
    setAnimationPath([])
  }

  const svgWidth = Math.max(400, players.length * 80 + 100)
  const columnWidth = (svgWidth - 100) / Math.max(1, players.length - 1 || 1)

  return (
    <div className="min-h-screen" style={{background: 'var(--background)'}}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">사다리타기</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          
          {/* Ladder Section */}
          <div className="lg:col-span-3 flex flex-col items-center space-y-6 sm:space-y-8">
            
            {/* SVG Ladder */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-100 overflow-x-auto w-full">
              <svg 
                ref={svgRef}
                width={svgWidth} 
                height={ladderHeight + 120}
                className="w-full h-auto"
                style={{ minWidth: '400px' }}
              >
                {/* 참가자 이름 */}
                {players.map((player, index) => (
                  <g key={`player-${index}`}>
                    <rect
                      x={50 + index * columnWidth - 30}
                      y={20}
                      width={60}
                      height={30}
                      rx={15}
                      fill={player.color}
                      opacity={currentPlayerIndex === index && showPath ? 1 : 0.8}
                      stroke={currentPlayerIndex === index && showPath ? '#000' : 'transparent'}
                      strokeWidth={currentPlayerIndex === index && showPath ? 2 : 0}
                    />
                    <text
                      x={50 + index * columnWidth}
                      y={40}
                      textAnchor="middle"
                      fill="white"
                      fontSize="12"
                      fontWeight="bold"
                    >
                      {player.name}
                    </text>
                  </g>
                ))}

                {/* 수직 라인 */}
                {players.map((_, index) => (
                  <line
                    key={`vertical-${index}`}
                    x1={50 + index * columnWidth}
                    y1={60}
                    x2={50 + index * columnWidth}
                    y2={60 + ladderHeight}
                    stroke="#64748b"
                    strokeWidth={3}
                    opacity={0.8}
                  />
                ))}

                {/* 가로 다리 */}
                {ladderLines.map((line, index) => {
                  const y = 60 + (line.row / (ladderRows + 1)) * ladderHeight
                  const x1 = 50 + line.fromColumn * columnWidth
                  const x2 = 50 + (line.fromColumn + 1) * columnWidth
                  
                  return (
                    <line
                      key={`ladder-${index}`}
                      x1={x1}
                      y1={y}
                      x2={x2}
                      y2={y}
                      stroke="#64748b"
                      strokeWidth={3}
                      opacity={0.8}
                    />
                  )
                })}

                {/* 애니메이션 경로 */}
                {showPath && animationPath.length > 1 && (
                  <g>
                    <path
                      d={animationPath.map((col, idx) => {
                        const x = 50 + col * columnWidth
                        const y = 60 + (idx / (animationPath.length - 1)) * ladderHeight
                        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`
                      }).join(' ')}
                      stroke={players[currentPlayerIndex]?.color || '#FF6B6B'}
                      strokeWidth={4}
                      fill="none"
                      opacity={0.9}
                    >
                      <animate
                        attributeName="stroke-dasharray"
                        values="0,1000;1000,0"
                        dur="1.5s"
                        repeatCount="1"
                      />
                    </path>
                    
                    {/* 움직이는 점 */}
                    <circle r="6" fill={players[currentPlayerIndex]?.color || '#FF6B6B'}>
                      <animateMotion
                        dur="1.5s"
                        repeatCount="1"
                        path={animationPath.map((col, idx) => {
                          const x = 50 + col * columnWidth
                          const y = 60 + (idx / (animationPath.length - 1)) * ladderHeight
                          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`
                        }).join(' ')}
                      />
                    </circle>
                  </g>
                )}

                {/* 상품 이름 */}
                {prizes.map((prize, index) => (
                  <g key={`prize-${index}`}>
                    <rect
                      x={50 + index * columnWidth - 30}
                      y={ladderHeight + 80}
                      width={60}
                      height={30}
                      rx={15}
                      fill={prize.color}
                      opacity={0.8}
                    />
                    <text
                      x={50 + index * columnWidth}
                      y={ladderHeight + 100}
                      textAnchor="middle"
                      fill="white"
                      fontSize="12"
                      fontWeight="bold"
                    >
                      {prize.name}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* Results */}
            {results && !isPlaying && (
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 w-full max-w-md">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 text-center">🎉 결과</h3>
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700 text-sm sm:text-base truncate mr-2">{result.player}</span>
                      <span className="text-sm flex-shrink-0">→</span>
                      <span className="font-bold text-purple-600 text-sm sm:text-base truncate ml-2">{result.prize}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full max-w-md">
              <button
                onClick={startGame}
                disabled={isPlaying || players.length < 2}
                className={`flex-1 px-4 sm:px-6 py-3 text-base sm:text-lg font-semibold rounded-xl transition-all duration-300 ${
                  isPlaying || players.length < 2
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 hover:scale-105 active:scale-95'
                } shadow-lg hover:shadow-xl`}
              >
                {isPlaying ? '게임 진행 중...' : '🪜 사다리 타기 시작!'}
              </button>
              
              <button
                onClick={reset}
                disabled={isPlaying}
                className="flex-1 px-4 sm:px-6 py-3 text-base sm:text-lg font-semibold rounded-xl bg-gray-500 text-white hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                🔄 새 사다리
              </button>
            </div>
          </div>

          {/* Controls Section */}
          <div className="space-y-6">
            
            {/* Player Controls */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-700">참가자</h3>
                <span className="text-sm text-gray-500">{players.length}/10명</span>
              </div>
              
              <div className="space-y-3 mb-4">
                {players.map((player, index) => (
                  <input
                    key={index}
                    type="text"
                    value={player.name}
                    onChange={(e) => updatePlayerName(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    style={{ borderLeft: `4px solid ${player.color}` }}
                    maxLength={8}
                  />
                ))}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={addPlayer}
                  disabled={players.length >= 10 || isPlaying}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors text-sm"
                >
                  + 추가
                </button>
                <button
                  onClick={removePlayer}
                  disabled={players.length <= 2 || isPlaying}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 transition-colors text-sm"
                >
                  - 제거
                </button>
              </div>
            </div>

            {/* Prize Controls */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-700">상품</h3>
                <span className="text-sm text-gray-500">{prizes.length}개</span>
              </div>
              
              <div className="space-y-3">
                {prizes.map((prize, index) => (
                  <input
                    key={index}
                    type="text"
                    value={prize.name}
                    onChange={(e) => updatePrizeName(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    style={{ borderLeft: `4px solid ${prize.color}` }}
                    maxLength={8}
                  />
                ))}
              </div>
            </div>

            {/* Game Info */}
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2">게임 규칙</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 2~10명까지 참가 가능</li>
                <li>• 자동으로 공정한 사다리 생성</li>
                <li>• 애니메이션으로 경로 확인</li>
                <li>• 각자의 상품이 결정됩니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}