'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ToolsPage() {
  const router = useRouter()
  
  useEffect(() => {
    // 메인 페이지로 리다이렉트
    router.replace('/')
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <p className="text-text-secondary">메인 페이지로 이동 중...</p>
      </div>
    </div>
  )
}