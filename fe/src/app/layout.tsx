import type { Metadata } from "next";
import "./globals.css";
import Header from '@/components/common/Header'
import { LanguageProvider } from '@/contexts/LanguageContext'

export const metadata: Metadata = {
  title: "DEVFORGE - AI-Powered Developer Tools",
  description: "차세대 AI 기반 개발자 도구 플랫폼. 코딩 워크플로우를 혁신하는 스마트 도구들",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">
        <LanguageProvider>
          <Header />
          <main>
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
