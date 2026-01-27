import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Animation utilities
export const animations = {
  // Entrance animations
  slideInUp: 'animate-in slide-in-from-bottom-4 duration-300',
  slideInDown: 'animate-in slide-in-from-top-4 duration-300',
  slideInLeft: 'animate-in slide-in-from-left-4 duration-300',
  slideInRight: 'animate-in slide-in-from-right-4 duration-300',
  fadeIn: 'animate-in fade-in duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-300',
  
  // Exit animations
  slideOutUp: 'animate-out slide-out-to-top-4 duration-200',
  slideOutDown: 'animate-out slide-out-to-bottom-4 duration-200',
  slideOutLeft: 'animate-out slide-out-to-left-4 duration-200',
  slideOutRight: 'animate-out slide-out-to-right-4 duration-200',
  fadeOut: 'animate-out fade-out duration-200',
  scaleOut: 'animate-out zoom-out-95 duration-200',
}

// Responsive utilities
export const responsive = {
  mobile: 'max-w-sm mx-auto px-4',
  tablet: 'max-w-2xl mx-auto px-6',
  desktop: 'max-w-7xl mx-auto px-8',
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
}

// Color utilities
export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
}

// Typography utilities
export const typography = {
  heading: {
    h1: 'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight',
    h2: 'text-3xl md:text-4xl font-bold tracking-tight',
    h3: 'text-2xl md:text-3xl font-semibold tracking-tight',
    h4: 'text-xl md:text-2xl font-semibold tracking-tight',
    h5: 'text-lg md:text-xl font-semibold tracking-tight',
    h6: 'text-base md:text-lg font-semibold tracking-tight',
  },
  body: {
    large: 'text-lg leading-7',
    base: 'text-base leading-6',
    small: 'text-sm leading-5',
    xs: 'text-xs leading-4',
  },
  code: {
    inline: 'px-1.5 py-0.5 rounded-md bg-white/10 text-sm font-mono',
    block: 'p-4 rounded-lg bg-white/5 border border-white/10 font-mono text-sm overflow-x-auto',
  },
}

// Shadow utilities
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  glow: 'shadow-lg shadow-blue-500/25',
  glowHover: 'hover:shadow-xl hover:shadow-blue-500/25',
}

// Glass morphism utilities
export const glass = {
  light: 'bg-white/5 backdrop-blur-md border border-white/10',
  medium: 'bg-white/10 backdrop-blur-lg border border-white/20',
  heavy: 'bg-white/20 backdrop-blur-xl border border-white/30',
}

// Format utilities
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Keyboard utilities
export function isHotkey(event: KeyboardEvent, hotkey: string): boolean {
  const keys = hotkey.toLowerCase().split('+')
  const eventKey = event.key.toLowerCase()
  
  const modifiers = {
    'cmd': event.metaKey,
    'ctrl': event.ctrlKey,
    'alt': event.altKey,
    'shift': event.shiftKey,
  }
  
  const mainKey = keys[keys.length - 1]
  const requiredModifiers = keys.slice(0, -1)
  
  // Check if the main key matches
  if (eventKey !== mainKey) return false
  
  // Check if all required modifiers are pressed
  for (const mod of requiredModifiers) {
    if (!modifiers[mod as keyof typeof modifiers]) return false
  }
  
  // Check if any unnecessary modifiers are pressed
  for (const [mod, pressed] of Object.entries(modifiers)) {
    if (pressed && !requiredModifiers.includes(mod)) return false
  }
  
  return true
}

// Copy to clipboard utility
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'absolute'
      textArea.style.left = '-999999px'
      document.body.prepend(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        return true
      } catch (error) {
        return false
      } finally {
        textArea.remove()
      }
    }
  } catch (error) {
    return false
  }
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null
      func(...args)
    }
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Random utilities
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function isValidJSON(jsonString: string): boolean {
  try {
    JSON.parse(jsonString)
    return true
  } catch {
    return false
  }
}

// Local storage utilities
export function setLocalStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error setting localStorage:', error)
  }
}

export function getLocalStorage<T>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue ?? null
  } catch (error) {
    console.error('Error getting localStorage:', error)
    return defaultValue ?? null
  }
}

export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing localStorage:', error)
  }
}