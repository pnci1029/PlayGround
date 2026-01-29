'use client'

import { useState, useEffect, useMemo } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import CommandPalette, { useCommandPalette, Command } from '@/components/ui/CommandPalette'
import { copyToClipboard } from '@/lib/utils'
import { renderIcon } from '@/components/ui/Icons'
import HeroSection from '@/components/sections/HeroSection'
import ToolsGrid from '@/components/sections/ToolsGrid'
import Footer from '@/components/sections/Footer'

export default function HomePage() {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const commandPalette = useCommandPalette()

  // Enhanced tool data with professional icons
  const tools = [
    { 
      name: 'JSON Formatter', 
      href: '/tools/json-formatter', 
      category: 'Development', 
      keywords: ['json', 'format', 'validate', 'pretty'], 
      description: 'Format, validate and beautify JSON data',
      icon: 'code',
      status: 'active',
      lastUsed: '2 min ago'
    },
    { 
      name: 'Variable Generator', 
      href: '/tools/variable-generator', 
      category: 'Development', 
      keywords: ['variable', 'naming', 'camelcase', 'snake'], 
      description: 'Generate variable names in different conventions',
      icon: 'edit',
      status: 'active',
      lastUsed: '5 min ago'
    },
    { 
      name: '그림판', 
      href: '/canvas', 
      category: 'Creative', 
      keywords: ['canvas', 'draw', 'design', 'sketch'], 
      description: '그림 그리기',
      icon: 'palette',
      status: 'beta',
      lastUsed: '1 hour ago'
    },
    { 
      name: 'AI Assistant', 
      href: '/chat', 
      category: 'AI', 
      keywords: ['chat', 'ai', 'assistant', 'help'], 
      description: 'AI 채팅',
      icon: 'brain',
      status: 'active',
      lastUsed: '10 min ago'
    },
    { 
      name: 'URL Encoder', 
      href: '/tools/url-encoder', 
      category: 'Utilities', 
      keywords: ['url', 'encode', 'decode', 'percent'], 
      description: 'Encode and decode URLs safely',
      icon: 'link',
      status: 'active',
      lastUsed: '30 min ago'
    },
    { 
      name: 'Base64 Converter', 
      href: '/tools/base64', 
      category: 'Utilities', 
      keywords: ['base64', 'encode', 'decode', 'binary'], 
      description: 'Convert text and files to Base64',
      icon: 'file-text',
      status: 'active',
      lastUsed: '15 min ago'
    },
    { 
      name: 'Hash Generator', 
      href: '/tools/hash', 
      category: 'Security', 
      keywords: ['hash', 'sha', 'md5', 'crypto'], 
      description: '해시 생성',
      icon: 'shield',
      status: 'active',
      lastUsed: '1 hour ago'
    },
    { 
      name: 'QR Generator', 
      href: '/tools/qr-generator', 
      category: 'Utilities', 
      keywords: ['qr', 'code', 'generate', 'barcode'], 
      description: 'Create QR codes for any text or URL',
      icon: 'qr-code',
      status: 'active',
      lastUsed: '45 min ago'
    }
  ]

  // Enhanced filtering and command palette setup
  const filteredTools = useMemo(() => {
    if (!searchTerm) return tools
    
    const searchLower = searchTerm.toLowerCase()
    return tools.filter(tool => 
      tool.name.toLowerCase().includes(searchLower) ||
      tool.description.toLowerCase().includes(searchLower) ||
      tool.category.toLowerCase().includes(searchLower) ||
      tool.keywords.some(keyword => keyword.toLowerCase().includes(searchLower))
    )
  }, [tools, searchTerm])
  
  // Command palette commands
  const commands: Command[] = useMemo(() => [
    ...tools.map(tool => ({
      id: tool.href,
      label: tool.name,
      description: tool.description,
      category: tool.category,
      icon: <div className="w-4 h-4">{renderIcon(tool.icon)}</div>,
      action: () => window.location.href = tool.href
    })),
    {
      id: 'copy-url',
      label: 'Copy Current URL',
      description: 'Copy the current page URL to clipboard',
      category: 'Utilities',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
      shortcut: '⌘C',
      action: () => copyToClipboard(window.location.href)
    },
    {
      id: 'toggle-theme',
      label: 'Toggle Theme',
      description: 'Switch between light and dark theme',
      category: 'Settings',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
      shortcut: '⌘T',
      action: () => {/* Theme toggle logic */}
    }
  ], [tools])
  
  useEffect(() => {
    // Essential keyboard shortcuts only
    const handleKeyDown = (e: KeyboardEvent) => {
      // "/" key to focus search
      if (e.key === '/' && !isSearchFocused) {
        e.preventDefault()
        const searchInput = document.querySelector('.search-input') as HTMLInputElement
        searchInput?.focus()
        setIsSearchFocused(true)
      }
      
      // Escape to clear search and blur
      if (e.key === 'Escape') {
        if (isSearchFocused) {
          setSearchTerm('')
          const searchInput = document.querySelector('.search-input') as HTMLInputElement
          searchInput?.blur()
          setIsSearchFocused(false)
        }
      }
      
      // Number keys for quick tool access
      if (e.key >= '1' && e.key <= '9' && !isSearchFocused) {
        const toolIndex = parseInt(e.key) - 1
        if (toolIndex < tools.length) {
          window.location.href = tools[toolIndex].href
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSearchFocused, tools])

  return (
    <>
      {/* Command Palette */}
      <CommandPalette 
        commands={commands}
        isOpen={commandPalette.isOpen}
        onClose={commandPalette.close}
        placeholder="Search tools, run commands..."
      />
      
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
        
        <HeroSection 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isSearchFocused={isSearchFocused}
          setIsSearchFocused={setIsSearchFocused}
          filteredTools={filteredTools}
          renderIcon={renderIcon}
        />
        
        <ToolsGrid 
          tools={tools}
          renderIcon={renderIcon}
        />
        
        <Footer />
        
      </div>
    </>
  )
}