import type { Metadata } from "next";
import "./globals.css";
import Header from '@/components/common/Header'

export const metadata: Metadata = {
  title: "MyTools - 개인 웹 도구 모음",
  description: "다양한 웹 도구들을 한곳에서 사용할 수 있는 개인 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">
        <Header />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
