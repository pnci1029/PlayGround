'use client'

interface SourceFilterProps {
  selectedSource: string
  onSourceChange: (source: string) => void
  isLoading?: boolean
}

const SOURCES = [
  { id: 'all', name: '전체' },
  { id: 'hackernews', name: 'Hacker News' },
  { id: 'reddit', name: 'Reddit' },
  { id: 'github', name: 'GitHub' },
  { id: 'devto', name: 'Dev.to' },
  { id: 'rss', name: 'RSS' }
]

export default function SourceFilter({ selectedSource, onSourceChange, isLoading }: SourceFilterProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {SOURCES.map((source, index) => (
        <button
          key={source.id}
          onClick={() => !isLoading && onSourceChange(source.id)}
          disabled={isLoading}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover-lift animate-fade-in ${
            selectedSource === source.id
              ? 'bg-gradient-primary text-white shadow-glow'
              : 'btn-secondary hover-glow'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{
            animationDelay: `${index * 50}ms`
          }}
        >
          {source.name}
        </button>
      ))}
    </div>
  )
}