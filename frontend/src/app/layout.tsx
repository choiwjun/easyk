import type { Metadata } from 'next'
import { Nanum_Gothic } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'

const nanumGothic = Nanum_Gothic({
  weight: ['400', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nanum-gothic',
})

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
      <body className={nanumGothic.className}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
