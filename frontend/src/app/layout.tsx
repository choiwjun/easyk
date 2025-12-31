import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'easyK - 외국인 정착 지원 플랫폼',
  description: '외국인과 전문가를 연결하는 신뢰 기반 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
