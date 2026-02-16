import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Trend - 실시간 트렌드 대시보드",
  description: "전 세계 실시간 트렌드를 무료로 확인하세요. HackerNews, Reddit, GitHub, Dev.to 등 다양한 소스를 실시간으로 수집합니다.",
  keywords: "트렌드, 실시간, HackerNews, Reddit, GitHub, Dev.to, 무료",
  authors: [{ name: "PlayGround Team" }],
  openGraph: {
    title: "Trend - 실시간 트렌드 대시보드",
    description: "전 세계 실시간 트렌드를 무료로 확인하세요",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trend - 실시간 트렌드 대시보드",
    description: "전 세계 실시간 트렌드를 무료로 확인하세요",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  )
}