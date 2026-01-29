import type { Metadata } from "next";
import "./globals.css";
import Header from '@/components/layout/Header'
import { LanguageProvider } from '@/contexts/LanguageContext'

export const metadata: Metadata = {
  title: "DEVFORGE - World-Class Developer Tools",
  description: "Transform your development workflow with beautiful, fast, and intelligent tools. Inspired by Linear, Arc, and Raycast.",
  keywords: ["developer tools", "json formatter", "variable generator", "productivity", "development utilities"],
  authors: [{ name: "DEVFORGE Team" }],
  creator: "DEVFORGE",
  publisher: "DEVFORGE",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://devforge.dev",
    title: "DEVFORGE - World-Class Developer Tools",
    description: "Transform your development workflow with beautiful, fast, and intelligent tools.",
    siteName: "DEVFORGE",
  },
  twitter: {
    card: "summary_large_image",
    title: "DEVFORGE - World-Class Developer Tools",
    description: "Transform your development workflow with beautiful, fast, and intelligent tools.",
    creator: "@devforge",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-screen antialiased bg-black text-white overflow-x-hidden">
        <LanguageProvider>
          <Header />
          <main className="relative">
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
