'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { cn, isHotkey } from '@/lib/utils'

export interface Command {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
  shortcut?: string
  action: () => void
  category?: string
}

export interface CommandPaletteProps {
  commands: Command[]
  isOpen: boolean
  onClose: () => void
  placeholder?: string
  className?: string
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  commands,
  isOpen,
  onClose,
  placeholder = "Type a command or search...",
  className
}) => {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Filter and group commands
  const filteredCommands = useMemo(() => {
    if (!search) return commands

    const searchLower = search.toLowerCase()
    return commands.filter(command =>
      command.label.toLowerCase().includes(searchLower) ||
      command.description?.toLowerCase().includes(searchLower) ||
      command.category?.toLowerCase().includes(searchLower)
    )
  }, [commands, search])

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {}
    
    filteredCommands.forEach(command => {
      const category = command.category || 'Other'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(command)
    })
    
    return groups
  }, [filteredCommands])

  // Reset state when opening/closing
  useEffect(() => {
    if (isOpen) {
      setSearch('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return

    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      )
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      )
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      const selectedCommand = filteredCommands[selectedIndex]
      if (selectedCommand) {
        selectedCommand.action()
        onClose()
      }
      return
    }
  }, [isOpen, filteredCommands, selectedIndex, onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Reset selected index when filtered commands change
  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredCommands])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Command Palette */}
      <div className={cn(
        "fixed left-1/2 top-1/4 -translate-x-1/2 z-50",
        "w-full max-w-2xl mx-4",
        "bg-black/90 backdrop-blur-xl border border-white/20",
        "rounded-2xl shadow-2xl",
        "animate-in slide-in-from-top-4 duration-300",
        className
      )}>
        {/* Search Input */}
        <div className="relative border-b border-white/10">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent text-white placeholder-white/50 pl-12 pr-4 py-4 text-lg outline-none"
            autoFocus
          />
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="text-center py-8 text-white/50">
              <div className="text-2xl mb-2">🔍</div>
              <div>No commands found</div>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, categoryCommands]) => (
              <div key={category} className="mb-4 last:mb-0">
                {/* Category Header */}
                {Object.keys(groupedCommands).length > 1 && (
                  <div className="px-3 py-2 text-xs font-semibold text-white/50 uppercase tracking-wider">
                    {category}
                  </div>
                )}
                
                {/* Commands in Category */}
                <div className="space-y-1">
                  {categoryCommands.map((command, commandIndex) => {
                    const globalIndex = filteredCommands.indexOf(command)
                    const isSelected = globalIndex === selectedIndex
                    
                    return (
                      <div
                        key={command.id}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all duration-150",
                          isSelected 
                            ? "bg-blue-600/20 text-white border border-blue-500/30" 
                            : "text-white/80 hover:bg-white/5 hover:text-white"
                        )}
                        onClick={() => {
                          command.action()
                          onClose()
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        {/* Command Icon */}
                        {command.icon && (
                          <div className="flex-shrink-0 w-5 h-5 text-white/70">
                            {command.icon}
                          </div>
                        )}
                        
                        {/* Command Content */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {command.label}
                          </div>
                          {command.description && (
                            <div className="text-sm text-white/50 truncate">
                              {command.description}
                            </div>
                          )}
                        </div>
                        
                        {/* Keyboard Shortcut */}
                        {command.shortcut && (
                          <div className="flex-shrink-0 text-xs text-white/50 font-mono bg-white/10 px-2 py-1 rounded">
                            {command.shortcut}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with tips */}
        <div className="border-t border-white/10 px-4 py-3 text-xs text-white/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-xs">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-xs">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-xs">Esc</kbd>
                Close
              </span>
            </div>
            <div>
              {filteredCommands.length} {filteredCommands.length === 1 ? 'command' : 'commands'}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Hook for managing command palette state
export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open command palette
      if (isHotkey(e, 'cmd+k') || isHotkey(e, 'ctrl+k')) {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev),
  }
}

export default CommandPalette