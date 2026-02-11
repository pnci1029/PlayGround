import type { Metadata } from "next";
import "./globals.css";
import Header from '@/components/layout/Header'
import { LanguageProvider } from '@/contexts/LanguageContext'

export const metadata: Metadata = {
  title: "PlayGround",
  description: "다양한 웹 도구 모음",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-screen antialiased bg-white text-gray-900 overflow-x-hidden">
        <LanguageProvider>
          <Header />
          <main className="relative pt-16">
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
