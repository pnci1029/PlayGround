'use client'

import { Button } from '../ui/Button'

interface CTASectionProps {
  onCommandPaletteToggle: () => void
  renderIcon: (iconName: string) => React.ReactNode
}

export default function CTASection({ onCommandPaletteToggle, renderIcon }: CTASectionProps) {
  return (
    <section className="py-36 text-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-8 sm:px-10 lg:px-16 max-w-6xl relative">
        <div className="mb-16 flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight text-center">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              도구 사용하기
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed text-center px-4">
            개발 도구를 사용해보세요
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-16 max-w-4xl mx-auto">
          <Button 
            size="lg"
            className="px-14 py-7 text-lg font-bold relative group overflow-hidden w-full sm:w-auto"
            onClick={() => window.location.href = '/tools/json-formatter'}
          >
            <span className="relative z-10">시작하기</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
          
          <Button 
            variant="secondary"
            size="lg"
            className="px-14 py-7 text-lg font-bold group w-full sm:w-auto"
            onClick={onCommandPaletteToggle}
          >
            <div className="w-4 h-4 mr-2 inline-block">{renderIcon('command')}</div>
            도구 찾기
            <kbd className="ml-3 px-2 py-1 text-sm bg-white/10 rounded border border-white/20">⌘K</kbd>
          </Button>
        </div>
        
      </div>
    </section>
  )
}