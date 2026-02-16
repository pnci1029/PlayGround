import React from 'react'
import { cn } from '@/lib/utils'

export interface ErrorStateProps {
  title?: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'minimal' | 'card'
  className?: string
}

export function ErrorState({ 
  title = "문제가 발생했습니다",
  message = "다시 시도해주세요",
  action,
  variant = 'default',
  className 
}: ErrorStateProps) {
  if (variant === 'minimal') {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-gray-500 text-sm mb-4">{message}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {action.label}
          </button>
        )}
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className={cn(
        'bg-white rounded-2xl border border-red-100 p-6 text-center',
        className
      )}>
        {/* 에러 아이콘 */}
        <div className="w-12 h-12 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 mb-4">{message}</p>
        
        {action && (
          <button
            onClick={action.onClick}
            className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            {action.label}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      'text-center py-12 px-4',
      className
    )}>
      {/* 에러 아이콘 */}
      <div className="w-16 h-16 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">{message}</p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="bg-red-50 text-red-600 hover:bg-red-100 px-6 py-3 rounded-xl font-medium transition-colors duration-200"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

// 특정 에러 타입들
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="네트워크 연결 오류"
      message="인터넷 연결을 확인하고 다시 시도해주세요"
      action={onRetry ? { label: '다시 시도', onClick: onRetry } : undefined}
      variant="card"
    />
  )
}

export function NotFoundError({ message = "요청하신 페이지를 찾을 수 없습니다" }) {
  return (
    <ErrorState
      title="페이지를 찾을 수 없습니다"
      message={message}
    />
  )
}

export function LoadError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="데이터를 불러올 수 없습니다"
      message="잠시 후 다시 시도해주세요"
      action={onRetry ? { label: '새로고침', onClick: onRetry } : undefined}
    />
  )
}

// 폼 에러 표시
export function FieldError({ 
  message, 
  className 
}: { 
  message: string
  className?: string 
}) {
  return (
    <div className={cn('flex items-center space-x-1 text-red-600 text-sm mt-1', className)}>
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{message}</span>
    </div>
  )
}

// 에러 바운더리용 폴백 컴포넌트
export function ErrorBoundaryFallback({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error
  resetErrorBoundary: () => void 
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <ErrorState
          title="앱에서 오류가 발생했습니다"
          message="예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요."
          action={{ label: '새로고침', onClick: resetErrorBoundary }}
        />
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 bg-white rounded-lg border p-4">
            <summary className="cursor-pointer font-medium text-gray-700 mb-2">
              에러 세부사항 (개발 모드)
            </summary>
            <pre className="text-xs text-gray-500 overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}