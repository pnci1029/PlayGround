'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Usage } from '@/lib/types'

// 오늘 남은 생성 횟수 배지. usage prop을 주면 그 값을, 없으면 직접 fetch.
export function QuotaBadge({ usage }: { usage?: Usage }) {
  const [u, setU] = useState<Usage | null>(usage ?? null)

  useEffect(() => {
    if (usage) {
      setU(usage)
      return
    }
    api.getUsage().then(setU).catch(() => {})
  }, [usage])

  if (!u) return null

  // 베타: 작성 수 무제한
  if (u.unlimited) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brand/20 px-3 py-1 text-xs font-bold text-brand">
        베타 · 무제한
      </span>
    )
  }

  const out = u.remaining <= 0
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
        out ? 'bg-gray-700 text-gray-300' : 'bg-brand/20 text-brand'
      }`}
    >
      오늘 {u.used}/{u.limit}개 생성
    </span>
  )
}
