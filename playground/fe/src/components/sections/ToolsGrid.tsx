'use client'

import { useState } from 'react'
import ToolCard from '../ui/ToolCard'
import { Button } from '../ui/Button'

interface Tool {
  name: string
  href: string
  category: string
  keywords: string[]
  description: string
  icon: string
  status: string
  lastUsed: string
}

interface ToolsGridProps {
  tools: Tool[]
  renderIcon: (iconName: string) => React.ReactNode
}

export default function ToolsGrid({ tools, renderIcon }: ToolsGridProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

  const handleToolNavigation = (href: string) => {
    window.location.href = href
  }

  const handleToolSelect = (toolId: string | null) => {
    setSelectedTool(toolId)
  }

  return (
    <section className="py-24 lg:py-36 relative">
      <div className="container mx-auto px-8 sm:px-10 lg:px-16 max-w-7xl">

        {/* Section Header */}
        <div className="text-center mb-24 flex flex-col items-center">
          {/*<div className="inline-flex items-center gap-3 mb-10 px-8 py-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">*/}
          {/*  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />*/}
          {/*  <span className="text-sm font-semibold text-white/80 tracking-wide">도구</span>*/}
          {/*</div>*/}

          {/*<h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-10 leading-tight text-center">*/}
          {/*  <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">*/}
          {/*    도구*/}
          {/*  </span>*/}
          {/*</h2>*/}

          {/*<p className="text-xl text-white/70 max-w-4xl mx-auto leading-relaxed text-center px-4">*/}
          {/*  개발 도구 모음*/}
          {/*</p>*/}
        </div>

        {/* Enhanced Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 auto-rows-fr w-full max-w-7xl mx-auto px-4">

          {/* JSON Formatter - Featured Tool */}
          <ToolCard
            title={tools[0]?.name || ''}
            href={tools[0]?.href || ''}
            category={tools[0]?.category || ''}
            icon={null}
            status='active'
            isExternal={false}
          />

          {/* Variable Generator */}
          <ToolCard
            title={tools[1]?.name || ''}
            href={tools[1]?.href || ''}
            category={tools[1]?.category || ''}
            icon={null}
            status='active'
            isExternal={false}
          />

          {/* 그림판 */}
          <ToolCard
            title={tools[2]?.name || ''}
            href={tools[2]?.href || ''}
            category={tools[2]?.category || ''}
            icon={null}
            status='active'
            isExternal={false}
          />

          {/* AI Assistant */}
          <ToolCard
            title={tools[3]?.name || ''}
            href={tools[3]?.href || ''}
            category={tools[3]?.category || ''}
            icon={null}
            status='active'
            isExternal={false}
          />

          {/* URL Encoder */}
          <ToolCard
            title={tools[4]?.name || ''}
            href={tools[4]?.href || ''}
            category={tools[4]?.category || ''}
            icon={null}
            status='active'
            isExternal={false}
          />

          {/* Base64 Converter */}
          <ToolCard
            title={tools[5]?.name || ''}
            href={tools[5]?.href || ''}
            category={tools[5]?.category || ''}
            icon={null}
            status='active'
            isExternal={false}
          />

          {/* Hash Generator */}
          <ToolCard
            title={tools[6]?.name || ''}
            href={tools[6]?.href || ''}
            category={tools[6]?.category || ''}
            icon={null}
            status='active'
            isExternal={false}
          />

          {/* QR Generator */}
          <ToolCard
            title={tools[7]?.name || ''}
            href={tools[7]?.href || ''}
            category={tools[7]?.category || ''}
            icon={null}
            status='active'
            isExternal={false}
          />

        </div>

      </div>
    </section>
  )
}
