/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design System 색상 팔레트
        primary: {
          DEFAULT: '#1E5BA0', // 신뢰 파랑
          dark: '#164A81',
          darker: '#0D3A5C',
        },
        success: '#2BAD7B', // 긍정 녹색
        warning: '#F59E0B', // 경고 주황
        error: '#DC2626', // 거절 빨강
        info: '#3B82F6', // 정보 파랑
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
