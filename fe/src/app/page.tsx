'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function HomePage() {
  const { t } = useLanguage()
  return (
    <div className="min-h-screen" style={{background: 'var(--background)'}}>
      {/* Hero Section */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-10 leading-tight">
              {t('home.title')}
            </h1>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20" style={{background: 'var(--background)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* JSON Formatter */}
            <Link href="/tools/json-formatter" className="group">
              <div className="card group-hover:shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{t('tools.json.title')}</h3>
                <p className="text-gray-400 text-sm mb-4">{t('tools.json.subtitle')}</p>
                <div className="flex items-center text-purple-400 font-medium group-hover:text-purple-300 text-sm">
                  {t('home.tools.subtitle')} →
                </div>
              </div>
            </Link>

            {/* Variable Generator */}
            <Link href="/tools/variable-generator" className="group">
              <div className="card group-hover:shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{t('tools.variable.title')}</h3>
                <p className="text-gray-400 text-sm mb-4">{t('tools.variable.subtitle')}</p>
                <div className="flex items-center text-purple-400 font-medium group-hover:text-purple-300 text-sm">
                  {t('home.tools.subtitle')} →
                </div>
              </div>
            </Link>

            {/* Canvas */}
            <Link href="/canvas" className="group">
              <div className="card group-hover:shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{t('home.canvas.title')}</h3>
                <p className="text-gray-400 text-sm mb-4">{t('home.canvas.subtitle')}</p>
                <div className="flex items-center text-purple-400 font-medium group-hover:text-purple-300 text-sm">
                  {t('home.tools.subtitle')} →
                </div>
              </div>
            </Link>

            {/* Chat */}
            <Link href="/chat" className="group">
              <div className="card group-hover:shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{t('home.chat.title')}</h3>
                <p className="text-gray-400 text-sm mb-4">{t('home.chat.subtitle')}</p>
                <div className="flex items-center text-purple-400 font-medium group-hover:text-purple-300 text-sm">
                  {t('home.tools.subtitle')} →
                </div>
              </div>
            </Link>

            {/* URL Encoder */}
            <Link href="/tools/url-encoder" className="group">
              <div className="card group-hover:shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">URL 인코더</h3>
                <p className="text-gray-400 text-sm mb-4">URL을 안전하게 인코딩/디코딩</p>
                <div className="flex items-center text-purple-400 font-medium group-hover:text-purple-300 text-sm">
                  {t('home.tools.subtitle')} →
                </div>
              </div>
            </Link>

            {/* Base64 */}
            <Link href="/tools/base64" className="group">
              <div className="card group-hover:shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Base64</h3>
                <p className="text-gray-400 text-sm mb-4">Base64 인코딩/디코딩</p>
                <div className="flex items-center text-purple-400 font-medium group-hover:text-purple-300 text-sm">
                  {t('home.tools.subtitle')} →
                </div>
              </div>
            </Link>

            {/* Hash Generator */}
            <Link href="/tools/hash" className="group">
              <div className="card group-hover:shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">해시 생성기</h3>
                <p className="text-gray-400 text-sm mb-4">SHA-1, SHA-256, SHA-512 해시</p>
                <div className="flex items-center text-purple-400 font-medium group-hover:text-purple-300 text-sm">
                  {t('home.tools.subtitle')} →
                </div>
              </div>
            </Link>

            {/* QR Generator */}
            <Link href="/tools/qr-generator" className="group">
              <div className="card group-hover:shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">QR 생성기</h3>
                <p className="text-gray-400 text-sm mb-4">텍스트를 QR 코드로 변환</p>
                <div className="flex items-center text-purple-400 font-medium group-hover:text-purple-300 text-sm">
                  {t('home.tools.subtitle')} →
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>


    </div>
  )
}