'use client'

interface SourceFilterProps {
  selectedSource: string
  onSourceChange: (source: string) => void
  isLoading?: boolean
}

const SOURCES = [
  { id: 'all', name: '전체', icon: '🌐' },
  { id: 'hackernews', name: 'Hacker News', icon: '🔶' },
  { id: 'reddit', name: 'Reddit', icon: '🤖' },
  { id: 'github', name: 'GitHub', icon: '⭐' },
  { id: 'devto', name: 'Dev.to', icon: '💻' },
  { id: 'rss', name: 'RSS', icon: '📡' }
]

export default function SourceFilter({ selectedSource, onSourceChange, isLoading }: SourceFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {SOURCES.map((source) => (
        <button
          key={source.id}
          onClick={() => !isLoading && onSourceChange(source.id)}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            selectedSource === source.id
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-blue-200'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
        >
          <span className="mr-2">{source.icon}</span>
          {source.name}
        </button>
      ))}
    </div>
  )
}