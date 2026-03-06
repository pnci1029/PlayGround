// Tools 관련 타입 정의

export interface Tool {
  title: string
  href: string
  category: string
  icon: React.ReactNode
  status: 'active' | 'beta' | 'coming-soon'
  description: string
  isExternal?: boolean
  badges?: ('NEW' | 'HOT' | 'TRENDING')[]
  visitCount?: number
}

export interface ToolCategories {
  [key: string]: Tool[]
}

export interface ToolStats {
  badges: ('NEW' | 'HOT' | 'TRENDING')[]
  visitCount?: number
  lastUsed?: string
}

export interface ToolStatsMap {
  [toolTitle: string]: ToolStats
}

export interface SortableCategoryProps {
  categoryName: string
  tools: Tool[]
  isOpen: boolean
  onToggle: () => void
  isDraggedOver: boolean
  draggedId: string | null
  toolStats: ToolStatsMap
}

export interface HeroSectionProps {
  filteredTools: Tool[]
}