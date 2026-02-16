import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  glow?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md',
    interactive = false,
    glow = false,
    children, 
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base card styles
          "relative rounded-xl transition-all duration-300",
          
          // Size variants
          {
            'p-4': size === 'sm',
            'p-6': size === 'md', 
            'p-8': size === 'lg',
          },
          
          // Variant styles
          {
            // Default - Clean elevated style
            'bg-white/5 border border-white/10 backdrop-blur-md': variant === 'default',
            
            // Elevated - More prominent
            'bg-white/10 border border-white/20 backdrop-blur-lg shadow-lg': variant === 'elevated',
            
            // Outlined - Minimalist border
            'bg-transparent border border-white/20': variant === 'outlined',
            
            // Glass - Maximum transparency
            'bg-white/[0.02] border border-white/5 backdrop-blur-xl': variant === 'glass',
          },
          
          // Interactive states
          {
            'hover:bg-white/10 hover:border-white/30 hover:-translate-y-1 hover:shadow-xl cursor-pointer': interactive,
          },
          
          // Glow effect
          {
            'shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30': glow,
          },
          
          className
        )}
        {...props}
      >
        {children}
        
        {/* Subtle shimmer effect for elevated cards */}
        {variant === 'elevated' && (
          <div className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full animate-shimmer" />
          </div>
        )}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Card composition components
const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-6", className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-white",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-white/70", className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-6", className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }