import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tech Journal',
  description: 'Personal tech blog and reading notes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-surface text-text-primary">
        {children}
      </body>
    </html>
  )
}