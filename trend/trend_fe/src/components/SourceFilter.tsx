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
    <div className="flex flex-wrap gap-2 mb-6">
      {SOURCES.map((source) => (
        <button
          key={source.id}
          onClick={() => !isLoading && onSourceChange(source.id)}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            selectedSource === source.id
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700 hover:border-orange-400'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
        >
          {source.name}
        </button>
      ))}
    </div>
  )
}