'use client'

interface TimeframeSelectorProps {
  value: string
  onChange: (timeframe: string) => void
  isLoading?: boolean
}

const TIMEFRAME_OPTIONS = [
  { value: '1h', label: '1시간', description: '지난 1시간' },
  { value: '6h', label: '6시간', description: '지난 6시간' },
  { value: '1d', label: '1일', description: '지난 24시간' },
  { value: '3d', label: '3일', description: '지난 3일' },
  { value: '1w', label: '1주일', description: '지난 7일' }
]

export default function TimeframeSelector({ value, onChange, isLoading = false }: TimeframeSelectorProps) {
  return (
    <div className="timeframe-selector">
      <div className="flex flex-wrap justify-center gap-2 p-1 bg-surface rounded-xl border border-border">
        {TIMEFRAME_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            disabled={isLoading}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              ${value === option.value
                ? 'bg-primary text-white shadow-md transform scale-105'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover-lift'}
            `}
          >
            <div className="text-center">
              <div className="font-semibold">{option.label}</div>
              <div className={`text-xs mt-1 ${
                value === option.value ? 'text-white/80' : 'text-text-muted'
              }`}>
                {option.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}