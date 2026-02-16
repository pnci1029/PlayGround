/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // CSS Variables for Dark Theme
        background: "var(--background)",
        'background-secondary': "var(--background-secondary)",
        'background-tertiary': "var(--background-tertiary)",
        surface: "var(--surface)",
        'surface-elevated': "var(--surface-elevated)",
        'surface-hover': "var(--surface-hover)",
        
        foreground: "var(--foreground)",
        'text-primary': "var(--text-primary)",
        'text-secondary': "var(--text-secondary)",
        'text-muted': "var(--text-muted)",
        
        primary: "var(--primary)",
        'primary-hover': "var(--primary-hover)",
        secondary: "var(--secondary)",
        tertiary: "var(--tertiary)",
        'accent-orange': "var(--accent-orange)",
        'accent-green': "var(--accent-green)",
        'accent-red': "var(--accent-red)",
        
        border: "var(--border)",
        'border-bright': "var(--border-bright)",
        
        // Glass morphism colors
        'glass-bg': "var(--glass-bg)",
        'glass-border': "var(--glass-border)",
      },
      backgroundImage: {
        'gradient-primary': "var(--gradient-primary)",
        'gradient-secondary': "var(--gradient-secondary)",
        'gradient-bg': "var(--gradient-bg)",
      },
      boxShadow: {
        'glass': "var(--shadow-sm)",
        'elevated': "var(--shadow-md)",
        'floating': "var(--shadow-lg)",
        'glow': "var(--shadow-glow)",
      },
      backdropBlur: {
        'glass': '20px',
        'strong': '24px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'bounce-slow': 'bounce 3s infinite',
        'fade-in': 'fadeInUp 0.6s ease-out',
        'shimmer': 'shimmer 2s ease-in-out infinite',
      },
      keyframes: {
        'fadeInUp': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)' },
          '50%': { boxShadow: '0 0 25px rgba(255, 255, 255, 0.2)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%) skewX(-12deg)' },
          '100%': { transform: 'translateX(200%) skewX(-12deg)' },
        },
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}