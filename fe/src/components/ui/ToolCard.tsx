'use client'

import { useState } from 'react'
import { Card } from './Card'
import { Button } from './Button'
import { cn } from '@/lib/utils'

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

interface ToolCardProps {
  tool: Tool
  size?: 'sm' | 'md' | 'lg'
  featured?: boolean
  className?: string
  selectedTool?: string | null
  onSelect?: (toolId: string) => void
  onNavigate?: (href: string) => void
  renderIcon: (iconName: string) => React.ReactNode
}

export default function ToolCard({
  tool,
  size = 'md',
  featured = false,
  className,
  selectedTool,
  onSelect,
  onNavigate,
  renderIcon
}: ToolCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const handleClick = () => {
    if (onNavigate) {
      onNavigate(tool.href)
    } else {
      window.location.href = tool.href
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const getColorScheme = (icon: string) => {
    const schemes = {
      code: 'blue',
      edit: 'blue', 
      palette: 'cyan',
      brain: 'green',
      link: 'orange',
      'file-text': 'indigo',
      shield: 'red',
      'qr-code': 'emerald',
      zap: 'blue',
      lock: 'green',
      rocket: 'orange'
    }
    return schemes[icon as keyof typeof schemes] || 'blue'
  }

  const colorScheme = getColorScheme(tool.icon)
  const isSelected = selectedTool === tool.href.replace('/tools/', '').replace('/', '')

  if (featured) {
    return (
      <div 
        className={cn(
          "group md:col-span-2 lg:col-span-2 xl:col-span-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-xl",
          className
        )}
        role="button"
        tabIndex={0}
        aria-label={`${tool.name} - ${tool.description}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => {
          setIsHovered(true)
          onSelect?.(tool.href.replace('/tools/', '').replace('/', ''))
        }}
        onMouseLeave={() => {
          setIsHovered(false)
          onSelect?.(null)
        }}
      >
        <Card 
          variant="elevated" 
          size="lg" 
          className={cn(
            "h-full relative overflow-hidden transition-all duration-500",
            "group-hover:scale-[1.02] group-hover:border-blue-500/50",
            isSelected && "border-blue-500/30 shadow-xl shadow-blue-500/20"
          )}
        >
          {/* Header */}
          <div className="flex items-start gap-6 mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <div className="w-10 h-10 text-white">{renderIcon(tool.icon)}</div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center border-2 border-black">
                <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2 transition-colors tool-card-title">
                {tool.name}
              </h3>
              <p className="text-white/60 mb-4 text-base leading-relaxed">
                {tool.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {tool.keywords.slice(0, 3).map((keyword) => (
                  <span key={keyword} className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Live Preview - JSON Formatter specific */}
          {tool.icon === 'code' && (
            <div className="bg-black/40 border border-white/10 rounded-xl p-6 mb-6 interactive-card hover-glow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white/70 text-sm font-medium">미리보기</span>
              </div>
              
              <div className="font-mono text-sm">
                <div className="text-white/50 mb-2">Input:</div>
                <div className="text-red-300 mb-4">{`{"name":"user","data":[1,2,3]}`}</div>
                
                <div className="text-white/50 mb-2">Output:</div>
                <div className="text-green-300 leading-relaxed">
{`{
  "name": "user",
  "data": [
    1,
    2,
    3
  ]
}`}
                </div>
              </div>
            </div>
          )}
          
          {/* Stats & CTA */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-lg font-medium text-blue-400">{tool.name}</div>
                <div className="text-xs text-white/50">즉시 처리</div>
              </div>
            </div>
            
            <Button 
              variant="secondary" 
              size="sm"
              className="group-hover:bg-blue-500 group-hover:text-white transition-colors"
            >
              {tool.name}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "group cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-xl",
        `focus:ring-${colorScheme}-500`,
        className
      )}
      role="button"
      tabIndex={0}
      aria-label={`${tool.name} - ${tool.description}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => {
        setIsHovered(true)
        onSelect?.(tool.href.replace('/tools/', '').replace('/', ''))
      }}
      onMouseLeave={() => {
        setIsHovered(false)
        onSelect?.(null)
      }}
    >
      <Card 
        variant="elevated" 
        size={size} 
        className={cn(
          "h-full transition-all duration-500",
          `group-hover:border-${colorScheme}-500/50 group-hover:-translate-y-1`,
          isSelected && `border-${colorScheme}-500/30 shadow-lg shadow-${colorScheme}-500/20`,
          size === 'sm' && "relative overflow-hidden"
        )}
      >
        {tool.status === 'beta' && (
          <div className="absolute top-2 right-2">
            <span className={`text-xs bg-${colorScheme}-500/20 text-${colorScheme}-300 px-2 py-1 rounded-full border border-${colorScheme}-500/30`}>
              Beta
            </span>
          </div>
        )}
        
        {size === 'md' ? (
          <>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 bg-gradient-to-br from-${colorScheme}-500 to-${colorScheme}-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <div className="w-8 h-8 text-white">{renderIcon(tool.icon)}</div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-white/60 text-sm">
                  {tool.description}
                </p>
              </div>
            </div>
            
            {/* Interactive Preview for Variable Generator */}
            {tool.icon === 'edit' && (
              <div className="bg-black/40 border border-white/10 rounded-lg p-4 mb-4 interactive-card">
                <div className="font-mono text-sm space-y-2">
                  <div className="text-white/50 text-xs mb-3">Input: "user account info"</div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-blue-300">userAccountInfo</span>
                    <span className="text-xs text-white/40">(camelCase)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-blue-300">user_account_info</span>
                    <span className="text-xs text-white/40">(snake_case)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-cyan-300">USER_ACCOUNT_INFO</span>
                    <span className="text-xs text-white/40">(CONSTANT_CASE)</span>
                  </div>
                </div>
              </div>
            )}

            {/* URL Encoder Preview */}
            {tool.icon === 'link' && (
              <div className="bg-black/40 border border-white/10 rounded-lg p-4 mb-4 interactive-card">
                <div className="space-y-3">
                  <div>
                    <div className="text-white/50 text-xs mb-1">Input:</div>
                    <div className="font-mono text-sm text-orange-300">hello world!</div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-px bg-gradient-to-r from-orange-500/50 to-red-500/50" />
                    <div className="mx-2 text-orange-400">↓</div>
                    <div className="w-8 h-px bg-gradient-to-r from-red-500/50 to-orange-500/50" />
                  </div>
                  
                  <div>
                    <div className="text-white/50 text-xs mb-1">Output:</div>
                    <div className="font-mono text-sm text-green-300">hello%20world%21</div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-xs bg-${colorScheme}-500/20 text-${colorScheme}-300 px-2 py-1 rounded border border-${colorScheme}-500/30`}>
                  {tool.category === 'Development' ? '규칙' : tool.category}
                </span>
              </div>
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-blue-400">
                {tool.icon === 'edit' ? 'Generate →' : tool.icon === 'link' ? 'Encode →' : 'Open →'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className={`w-12 h-12 bg-gradient-to-br from-${colorScheme}-500 to-${colorScheme}-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <div className="w-6 h-6 text-white">{renderIcon(tool.icon)}</div>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
              {tool.name}
            </h3>
            <p className="text-white/60 text-sm mb-4">
              {tool.description}
            </p>
            
            {/* Canvas Preview */}
            {tool.icon === 'palette' && (
              <div className="w-full h-12 bg-black/40 rounded-lg border border-white/10 mb-4 relative overflow-hidden hover-border">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-blue-500/20 animate-pulse" />
                <div className="absolute top-2 left-2 w-2 h-2 bg-cyan-400 rounded-full" />
                <div className="absolute top-4 left-6 w-1 h-1 bg-blue-400 rounded-full" />
                <div className="absolute bottom-2 right-3 w-1.5 h-1.5 bg-blue-400 rounded-full" />
              </div>
            )}

            {/* AI Chat Activity */}
            {tool.icon === 'brain' && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0s'}} />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                </div>
                <span className="text-xs text-white/50">Thinking...</span>
              </div>
            )}

            {/* Base64 Preview */}
            {tool.icon === 'file-text' && (
              <div className="bg-black/40 border border-white/10 rounded p-2 mb-4 interactive-card">
                <div className="font-mono text-xs text-indigo-300">SGVsbG8gV29ybGQh</div>
              </div>
            )}

            {/* Hash Preview */}
            {tool.icon === 'shield' && (
              <div className="space-y-1 mb-4">
                <div className="font-mono text-xs text-red-300">SHA256: ••••</div>
                <div className="font-mono text-xs text-pink-300">MD5: ••••</div>
              </div>
            )}

            {/* QR Preview */}
            {tool.icon === 'qr-code' && (
              <div className="w-12 h-12 bg-white rounded-lg border border-emerald-500/20 mb-4 relative overflow-hidden group-hover:bg-emerald-50 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10" />
                <div className="grid grid-cols-4 gap-px p-1 h-full">
                  <div className="bg-black rounded-sm" />
                  <div className="bg-transparent" />
                  <div className="bg-black rounded-sm" />
                  <div className="bg-transparent" />
                  <div className="bg-transparent" />
                  <div className="bg-black rounded-sm" />
                  <div className="bg-black rounded-sm" />
                  <div className="bg-transparent" />
                  <div className="bg-black rounded-sm" />
                  <div className="bg-transparent" />
                  <div className="bg-transparent" />
                  <div className="bg-black rounded-sm" />
                  <div className="bg-transparent" />
                  <div className="bg-black rounded-sm" />
                  <div className="bg-black rounded-sm" />
                  <div className="bg-transparent" />
                </div>
              </div>
            )}
            
            <Button variant="ghost" size="sm" className="w-full text-white/60 hover:text-blue-400">
              {tool.icon === 'palette' ? 'Create →' : 
               tool.icon === 'brain' ? 'Chat →' :
               tool.icon === 'file-text' ? 'Convert →' :
               tool.icon === 'shield' ? 'Generate →' :
               tool.icon === 'qr-code' ? 'Create →' : 'Open →'}
            </Button>
          </>
        )}
      </Card>
    </div>
  )
}