'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api, ApiError, messageOf } from '@/lib/api'
import { GENRE_NAME } from '@/lib/genres'
import { QuotaBadge } from '@/components/QuotaBadge'
import { Spinner } from '@/components/Spinner'

function CreateInner() {
  const router = useRouter()
  const genre = useSearchParams().get('genre') ?? ''

  const [keywords, setKeywords] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addKeyword() {
    const k = input.trim()
    if (!k || keywords.includes(k) || keywords.length >= 5 || k.length > 20) return
    setKeywords([...keywords, k])
    setInput('')
  }

  async function generate() {
    if (keywords.length === 0 || busy) return
    setBusy(true)
    setError(null)
    try {
      const story = await api.generateStory(genre, keywords)
      router.push(`/reader/${story.id}`)
    } catch (e) {
      setError(e instanceof ApiError ? messageOf(e.code) : messageOf('UNKNOWN'))
      setBusy(false)
    }
  }

  if (busy) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <Spinner label="AI가 이야기를 쓰고 있어요…" />
        <p className="text-xs text-gray-500">보통 10~20초 정도 걸려요</p>
      </main>
    )
  }

  return (
    <main className="flex flex-1 flex-col px-6 pb-10 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/genre" className="text-sm text-gray-400">
          ← 장르
        </Link>
        <QuotaBadge />
      </div>

      <h1 className="text-2xl font-bold leading-snug">
        이야기에 담을
        <br />
        키워드를 입력해 주세요
      </h1>
      <p className="mt-2 text-sm text-brand">선택한 장르: {GENRE_NAME[genre] ?? '미선택'}</p>

      <div className="mt-8 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
          maxLength={20}
          placeholder="키워드 입력 (최대 5개)"
          className="h-12 flex-1 rounded-xl bg-card px-4 text-white placeholder:text-gray-500 outline-none"
        />
        <button
          onClick={addKeyword}
          className="h-12 w-12 rounded-xl bg-brand text-xl font-bold text-white"
          aria-label="키워드 추가"
        >
          +
        </button>
      </div>

      {keywords.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {keywords.map((k) => (
            <button
              key={k}
              onClick={() => setKeywords(keywords.filter((x) => x !== k))}
              className="flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-sm text-white"
            >
              {k} <span className="text-white/80">✕</span>
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="flex-1" />

      <button
        disabled={keywords.length === 0}
        onClick={generate}
        className="safe-bottom mt-6 flex h-14 items-center justify-center rounded-xl bg-brand text-base font-bold text-white transition active:scale-[0.99] disabled:bg-gray-700 disabled:text-gray-400"
      >
        이야기 생성하기
      </button>
    </main>
  )
}

export default function CreatePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <CreateInner />
    </Suspense>
  )
}
