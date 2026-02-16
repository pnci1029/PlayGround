'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { renderPremiumIcon } from '@/components/ui/PremiumIcons'

export default function NotFoundPage() {
  useEffect(() => {
    document.title = '404 - 페이지를 찾을 수 없습니다 | PlayGround'
  }, [])
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fafbfc' }}>
      <div className="max-w-md w-full mx-4 text-center">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* 404 아이콘 */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center animate-in zoom-in-50 duration-700 delay-200">
            <div className="text-4xl animate-pulse">
              {renderPremiumIcon('help-circle', 'w-10 h-10 text-blue-500')}
            </div>
          </div>
          
          {/* 404 텍스트 */}
          <div className="mb-6">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              404
            </h1>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              페이지를 찾을 수 없습니다
            </h2>
            <p className="text-gray-500 leading-relaxed">
              요청하신 페이지가 존재하지 않거나<br/>
              이동되었을 수 있습니다
            </p>
          </div>

          {/* 액션 버튼들 */}
          <div className="space-y-3">
            <Link 
              href="/"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-500 hover:to-blue-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm inline-block"
            >
              {renderPremiumIcon('home', 'w-5 h-5 inline mr-2')}
              홈으로 돌아가기
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="w-full bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm"
            >
              {renderPremiumIcon('arrow-left', 'w-5 h-5 inline mr-2')}
              이전 페이지로
            </button>
          </div>

          {/* 도움말 섹션 */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-400 mb-4">
              또는 다음 도구들을 확인해보세요
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <Link 
                href="/tools/json-formatter"
                className="bg-gray-50 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center justify-center"
              >
                {renderPremiumIcon('code', 'w-4 h-4 mr-1')}
                JSON 포맷터
              </Link>
              
              <Link 
                href="/canvas"
                className="bg-gray-50 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center justify-center"
              >
                {renderPremiumIcon('palette', 'w-4 h-4 mr-1')}
                캔버스
              </Link>
              
              <Link 
                href="/tools/qr-generator"
                className="bg-gray-50 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center justify-center"
              >
                {renderPremiumIcon('qr-code', 'w-4 h-4 mr-1')}
                QR 생성기
              </Link>
              
              <Link 
                href="/gallery"
                className="bg-gray-50 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center justify-center"
              >
                {renderPremiumIcon('grid', 'w-4 h-4 mr-1')}
                갤러리
              </Link>
            </div>
          </div>
        </div>

        {/* 하단 텍스트 */}
        <p className="mt-6 text-xs text-gray-400">
          문제가 계속되면 관리자에게 문의해주세요
        </p>
      </div>
    </div>
  )
}