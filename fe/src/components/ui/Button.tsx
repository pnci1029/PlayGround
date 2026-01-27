import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    leftIcon,
    rightIcon,
    children, 
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      // Base button styles
      "relative inline-flex items-center justify-center font-medium",
      "transition-all duration-200 outline-none cursor-pointer user-select-none",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
      
      // Size variants
      {
        'px-3 py-2 text-sm rounded-lg': size === 'sm',
        'px-4 py-3 text-base rounded-lg': size === 'md',
        'px-6 py-4 text-lg rounded-xl': size === 'lg',
      },
      
      // Variant styles
      {
        // Primary - Linear inspired gradient
        'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:from-blue-500 hover:to-blue-600 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm': 
          variant === 'primary',
        
        // Secondary - Clean elevated style
        'bg-white/5 text-white border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5': 
          variant === 'secondary',
        
        // Ghost - Minimal hover effect
        'bg-transparent text-white/70 hover:bg-white/5 hover:text-white': 
          variant === 'ghost',
        
        // Danger - Error state
        'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md hover:from-red-500 hover:to-red-600 hover:-translate-y-0.5 hover:shadow-lg': 
          variant === 'danger',
      },
      
      className
    )

    return (
      <button
        className={baseClasses}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
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
        )}
        
        {/* Left icon */}
        {leftIcon && !isLoading && (
          <span className="mr-2 flex items-center">
            {leftIcon}
          </span>
        )}
        
        {/* Button content */}
        <span className="flex items-center">
          {children}
        </span>
        
        {/* Right icon */}
        {rightIcon && (
          <span className="ml-2 flex items-center">
            {rightIcon}
          </span>
        )}
        
        {/* Ripple effect */}
        <span className="absolute inset-0 overflow-hidden rounded-lg">
          <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity hover:opacity-100 rounded-lg" />
        </span>
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }