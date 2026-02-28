'use client'

interface TrendIndicatorProps {
  direction: 'up' | 'down' | 'new' | 'stable'
  prevRank?: number
  currentRank: number
}

export default function TrendIndicator({ direction, prevRank, currentRank }: TrendIndicatorProps) {
  const getIndicatorContent = () => {
    switch (direction) {
      case 'up':
        return {
          icon: '↗',
          color: 'text-accent-green',
          bgColor: 'bg-accent-green/10',
          label: `+${prevRank! - currentRank}`
        }
      case 'down':
        return {
          icon: '↘',
          color: 'text-accent-red',
          bgColor: 'bg-accent-red/10',
          label: `${currentRank - prevRank!}`
        }
      case 'new':
        return {
          icon: 'NEW',
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          label: 'NEW'
        }
      case 'stable':
        return {
          icon: '→',
          color: 'text-text-muted',
          bgColor: 'bg-surface',
          label: '—'
        }
    }
  }

  const { icon, color, bgColor, label } = getIndicatorContent()

  return (
    <div className={`
      flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold
      ${bgColor} ${color} transition-all duration-200
    `}>
      <span>{direction === 'new' ? icon : icon + ' ' + label}</span>
    </div>
  )
}