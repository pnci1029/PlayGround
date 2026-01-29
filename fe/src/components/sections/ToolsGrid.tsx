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
          <div className="inline-flex items-center gap-3 mb-10 px-8 py-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-white/80 tracking-wide">도구</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-10 leading-tight text-center">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              도구
            </span>
          </h2>
          
          <p className="text-xl text-white/70 max-w-4xl mx-auto leading-relaxed text-center px-4">
            개발 도구 모음
          </p>
        </div>
        
        {/* Enhanced Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 auto-rows-fr w-full max-w-7xl mx-auto px-4">
          
          {/* JSON Formatter - Featured Tool */}
          <ToolCard
            tool={tools[0]} // JSON Formatter
            size="lg"
            featured={true}
            selectedTool={selectedTool}
            onSelect={handleToolSelect}
            onNavigate={handleToolNavigation}
            renderIcon={renderIcon}
            className="md:col-span-2 lg:col-span-2 xl:col-span-2"
          />

          {/* Variable Generator */}
          <ToolCard
            tool={tools[1]} // Variable Generator
            size="md"
            selectedTool={selectedTool}
            onSelect={handleToolSelect}
            onNavigate={handleToolNavigation}
            renderIcon={renderIcon}
            className="md:col-span-1 lg:col-span-1 xl:col-span-1"
          />
          
          {/* 그림판 */}
          <ToolCard
            tool={tools[2]} // Canvas
            size="sm"
            selectedTool={selectedTool}
            onSelect={handleToolSelect}
            onNavigate={handleToolNavigation}
            renderIcon={renderIcon}
          />

          {/* AI Assistant */}
          <ToolCard
            tool={tools[3]} // AI Assistant
            size="sm"
            selectedTool={selectedTool}
            onSelect={handleToolSelect}
            onNavigate={handleToolNavigation}
            renderIcon={renderIcon}
          />
          
          {/* URL Encoder */}
          <ToolCard
            tool={tools[4]} // URL Encoder
            size="md"
            selectedTool={selectedTool}
            onSelect={handleToolSelect}
            onNavigate={handleToolNavigation}
            renderIcon={renderIcon}
            className="md:col-span-1 lg:col-span-1 xl:col-span-1"
          />
          
          {/* Base64 Converter */}
          <ToolCard
            tool={tools[5]} // Base64
            size="sm"
            selectedTool={selectedTool}
            onSelect={handleToolSelect}
            onNavigate={handleToolNavigation}
            renderIcon={renderIcon}
          />

          {/* Hash Generator */}
          <ToolCard
            tool={tools[6]} // Hash Generator
            size="sm"
            selectedTool={selectedTool}
            onSelect={handleToolSelect}
            onNavigate={handleToolNavigation}
            renderIcon={renderIcon}
          />

          {/* QR Generator */}
          <ToolCard
            tool={tools[7]} // QR Generator
            size="sm"
            selectedTool={selectedTool}
            onSelect={handleToolSelect}
            onNavigate={handleToolNavigation}
            renderIcon={renderIcon}
          />
          
        </div>
        
      </div>
    </section>
  )
}