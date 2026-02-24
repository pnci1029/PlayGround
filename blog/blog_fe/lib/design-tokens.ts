export const designTokens = {
  colors: {
    primary: {
      DEFAULT: '#2563eb',
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      muted: '#9ca3af',
      inverse: '#ffffff',
    },
    surface: {
      DEFAULT: '#ffffff',
      elevated: '#f9fafb',
      muted: '#f3f4f6',
    },
    code: {
      bg: '#f8fafc',
      border: '#e2e8f0',
    },
    quote: {
      border: '#e2e8f0',
      bg: '#f8fafc',
    }
  },
  
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
      display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      xs: ['12px', { lineHeight: '1.4' }],
      sm: ['14px', { lineHeight: '1.5' }],
      base: ['16px', { lineHeight: '1.6' }],
      reading: ['18px', { lineHeight: '1.7' }],
      lg: ['20px', { lineHeight: '1.6' }],
      xl: ['24px', { lineHeight: '1.5' }],
      '2xl': ['30px', { lineHeight: '1.4' }],
      '3xl': ['36px', { lineHeight: '1.3' }],
      '4xl': ['48px', { lineHeight: '1.2' }],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },

  spacing: {
    reading: {
      maxWidth: '680px',
      margin: '0 auto',
      padding: '0 1.5rem',
    },
    section: {
      sm: '2rem',
      md: '3rem', 
      lg: '4rem',
      xl: '6rem',
    }
  },

  borderRadius: {
    sm: '4px',
    DEFAULT: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },

  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
  }
} as const;

// CSS Custom Properties for runtime theming
export const cssVariables = {
  '--color-primary': designTokens.colors.primary.DEFAULT,
  '--color-primary-soft': designTokens.colors.primary[100],
  '--color-text-primary': designTokens.colors.text.primary,
  '--color-text-secondary': designTokens.colors.text.secondary,
  '--color-text-muted': designTokens.colors.text.muted,
  '--color-surface': designTokens.colors.surface.DEFAULT,
  '--color-surface-elevated': designTokens.colors.surface.elevated,
  '--color-code-bg': designTokens.colors.code.bg,
  '--color-quote-border': designTokens.colors.quote.border,
  
  '--font-sans': designTokens.typography.fontFamily.sans.join(', '),
  '--font-mono': designTokens.typography.fontFamily.mono.join(', '),
  '--font-display': designTokens.typography.fontFamily.display.join(', '),
  
  '--reading-max-width': designTokens.spacing.reading.maxWidth,
  '--animation-duration': designTokens.animation.duration.normal,
  '--animation-easing': designTokens.animation.easing.DEFAULT,
} as const;

// Type-safe design token access
export type ColorTokens = typeof designTokens.colors;
export type TypographyTokens = typeof designTokens.typography;
export type SpacingTokens = typeof designTokens.spacing;

// Utility functions for design tokens
export const token = {
  color: (path: string) => {
    const keys = path.split('.');
    let value: any = designTokens.colors;
    for (const key of keys) {
      value = value?.[key];
    }
    return value || path;
  },
  
  fontSize: (size: keyof typeof designTokens.typography.fontSize) => {
    return designTokens.typography.fontSize[size];
  },
  
  fontFamily: (family: keyof typeof designTokens.typography.fontFamily) => {
    return designTokens.typography.fontFamily[family].join(', ');
  }
};