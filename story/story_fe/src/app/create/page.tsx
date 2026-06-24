'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api, ApiError, messageOf } from '@/lib/api'
import { GENRE_NAME } from '@/lib/genres'
import { QuotaBadge } from '@/components/QuotaBadge'
import { Spinner } from '@/components/Spinner'

const EXAMPLES: Record<string, string> = {
  scifi: '예) 기억을 사고파는 가게에서 일하는 청년이, 팔려나간 자신의 기억과 마주친다.',
  fantasy: '예) 오래된 등대에 사는 말하는 까마귀가, 사라진 등대지기의 비밀을 들려준다.',
  mystery: '예) 밤기차에서 한 승객이 사라지고, 옆자리 승객만이 그를 기억한다.',
}

function CreateInner() {
  const router = useRouter()
  const genre = useSearchParams().get('genre') ?? ''

  const [premise, setPremise] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trimmed = premise.trim()
  const canSubmit = trimmed.length >= 5 && !busy

  async function generate() {
    if (!canSubmit) return
    setBusy(true)
    setError(null)
    try {
      const story = await api.generateStory(genre, trimmed)
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
      <div className="mb-5 flex items-center justify-between">
        <Link href="/genre" className="text-sm text-gray-400">
          ← 장르
        </Link>
        <QuotaBadge />
      </div>

      <h1 className="text-[1.7rem] font-bold leading-snug">
        어떤 이야기인가요?
      </h1>
      <p className="mt-2 text-sm text-brand">{GENRE_NAME[genre] ?? '미선택'}</p>

      <textarea
        value={premise}
        onChange={(e) => setPremise(e.target.value)}
        maxLength={500}
        rows={6}
        placeholder={EXAMPLES[genre] ?? '떠오른 줄거리를 한두 문장으로 적어주세요.'}
        className="mt-6 w-full resize-none rounded-2xl border border-line bg-card p-4 text-[15px] leading-7 text-white placeholder:text-gray-500 outline-none focus:border-brand/60"
      />
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>한두 문장이면 충분해요</span>
        <span>{trimmed.length}/500</span>
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="flex-1" />

      <button
        disabled={!canSubmit}
        onClick={generate}
        className="safe-bottom mt-6 flex h-14 items-center justify-center rounded-xl bg-brand text-base font-semibold text-[#1a1410] transition active:scale-[0.99] disabled:bg-line disabled:text-gray-500"
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
