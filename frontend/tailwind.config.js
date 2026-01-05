/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Design System 색상 팔레트
        primary: {
          DEFAULT: '#1E5BA0', // 신뢰 파랑
          dark: '#16447a',
        },
        success: '#2BAD7B', // 긍정 녹색
        warning: '#F59E0B', // 경고 주황
        error: '#DC2626', // 거절 빨강
        info: '#3B82F6', // 정보 파랑
        // Background colors
        'background-light': '#f2f4f6',
        'background-dark': '#191220',
        // Surface colors
        'surface-light': '#ffffff',
        'surface-dark': '#2a2435',
        // Text colors
        'text-primary': '#191f28',
        'text-secondary': '#4e5968',
        'text-muted': '#8b95a1',
      },
      fontFamily: {
        sans: ['var(--font-nanum-gothic)', 'Nanum Gothic', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'DEFAULT': '0.25rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04), 0 8px 16px rgba(0, 0, 0, 0.04)',
        'soft-hover': '0 4px 12px rgba(0, 0, 0, 0.08), 0 12px 24px rgba(0, 0, 0, 0.08)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
