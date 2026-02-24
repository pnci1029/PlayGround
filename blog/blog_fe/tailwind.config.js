/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        'primary-soft': '#dbeafe',
        'text-primary': '#1f2937',
        'text-secondary': '#6b7280',
        'text-muted': '#9ca3af',
        'text-inverse': '#ffffff',
        'code-bg': '#f8fafc',
        'quote-border': '#e2e8f0',
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
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
        display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'reading': ['18px', { lineHeight: '1.7' }],
        'code': ['16px', { lineHeight: '1.6' }],
        'caption': ['14px', { lineHeight: '1.5' }],
      },
      maxWidth: {
        'reading': '680px',
      },
      spacing: {
        'reading': '680px',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#1f2937',
            lineHeight: '1.7',
          }
        }
      }
    },
  },
  plugins: [],
}