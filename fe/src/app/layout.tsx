import type { Metadata } from "next";
import "./globals.css";
import Header from '@/components/common/Header'
import { LanguageProvider } from '@/contexts/LanguageContext'

export const metadata: Metadata = {
  title: "DEVFORGE - Developer Tools Collection",
  description: "개발자를 위한 실용적인 도구 모음. 복잡한 작업을 간단하게 만드는 편리한 유틸리티들",
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
