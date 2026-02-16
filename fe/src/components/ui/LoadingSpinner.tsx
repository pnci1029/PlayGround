import React from 'react'
import { cn } from '@/lib/utils'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars'
  className?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'spinner', 
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  if (variant === 'spinner') {
    return (
      <svg 
        className={cn(
          'animate-spin',
          sizeClasses[size],
          className
        )}
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    )
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex space-x-1', className)}>
        <div className={cn(
          'rounded-full bg-current animate-pulse',
          size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-2 h-2' : 'w-3 h-3'
        )} style={{ animationDelay: '0ms' }} />
        <div className={cn(
          'rounded-full bg-current animate-pulse',
          size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-2 h-2' : 'w-3 h-3'
        )} style={{ animationDelay: '150ms' }} />
        <div className={cn(
          'rounded-full bg-current animate-pulse',
          size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-2 h-2' : 'w-3 h-3'
        )} style={{ animationDelay: '300ms' }} />
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={cn(
        'rounded-full bg-current animate-pulse',
        sizeClasses[size],
        className
      )} />
    )
  }

  if (variant === 'bars') {
    return (
      <div className={cn('flex items-center space-x-1', className)}>
        <div className={cn(
          'bg-current animate-pulse',
          size === 'sm' ? 'w-0.5 h-2' : size === 'md' ? 'w-0.5 h-3' : size === 'lg' ? 'w-1 h-4' : 'w-1 h-6'
        )} style={{ animationDelay: '0ms' }} />
        <div className={cn(
          'bg-current animate-pulse',
          size === 'sm' ? 'w-0.5 h-3' : size === 'md' ? 'w-0.5 h-4' : size === 'lg' ? 'w-1 h-5' : 'w-1 h-7'
        )} style={{ animationDelay: '100ms' }} />
        <div className={cn(
          'bg-current animate-pulse',
          size === 'sm' ? 'w-0.5 h-2' : size === 'md' ? 'w-0.5 h-3' : size === 'lg' ? 'w-1 h-4' : 'w-1 h-6'
        )} style={{ animationDelay: '200ms' }} />
      </div>
    )
  }

  return null
}

// 전체 화면 로딩 오버레이
export function LoadingOverlay({ 
  isVisible = false, 
  message = '로딩 중...',
  variant = 'spinner',
  size = 'lg'
}: {
  isVisible?: boolean
  message?: string
  variant?: LoadingSpinnerProps['variant']
  size?: LoadingSpinnerProps['size']
}) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-xs w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner 
            variant={variant} 
            size={size}
            className="text-blue-600" 
          />
          <p className="text-gray-700 font-medium text-center">{message}</p>
        </div>
      </div>
    </div>
  )
}

// 인라인 로딩 스켈레톤
export function LoadingSkeleton({ 
  className,
  variant = 'rectangle'
}: { 
  className?: string
  variant?: 'rectangle' | 'circle' | 'text'
}) {
  const baseClasses = 'bg-gray-200 animate-pulse'
  
  if (variant === 'circle') {
    return <div className={cn(baseClasses, 'rounded-full', className)} />
  }
  
  if (variant === 'text') {
    return <div className={cn(baseClasses, 'rounded h-4', className)} />
  }
  
  return <div className={cn(baseClasses, 'rounded-lg', className)} />
}

// 카드 스켈레톤
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <LoadingSkeleton variant="circle" className="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="text" className="w-3/4" />
          <LoadingSkeleton variant="text" className="w-1/2 h-3" />
        </div>
      </div>
      <LoadingSkeleton className="h-20 mb-4" />
      <div className="flex justify-between items-center">
        <LoadingSkeleton className="h-8 w-20" />
        <LoadingSkeleton className="h-8 w-16" />
      </div>
    </div>
  )
}