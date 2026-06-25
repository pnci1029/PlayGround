'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api, ApiError, messageOf } from '@/lib/api'
import { GENRE_NAME, findGenre } from '@/lib/genres'
import { QuotaBadge } from '@/components/QuotaBadge'
import { Spinner } from '@/components/Spinner'
import { GenerationProgress } from '@/components/GenerationProgress'

const EXAMPLES: Record<string, string> = {
  scifi: '예) 기억을 사고파는 가게에서 일하는 청년이, 팔려나간 자신의 기억과 마주친다.',
  fantasy: '예) 오래된 등대에 사는 말하는 까마귀가, 사라진 등대지기의 비밀을 들려준다.',
  mystery: '예) 밤기차에서 한 승객이 사라지고, 옆자리 승객만이 그를 기억한다.',
}

function CreateInner() {
  const router = useRouter()
  const sp = useSearchParams()
  const genre = sp.get('genre') ?? ''
  const parentId = sp.get('parent')
  const isSequel = !!parentId

  const [premise, setPremise] = useState('')
  const [subGenres, setSubGenres] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const subs = isSequel ? [] : findGenre(genre)?.subs ?? []
  const trimmed = premise.trim()
  // 속편은 방향 입력이 선택 → 비워도 생성 가능
  const canSubmit = (isSequel || trimmed.length >= 5) && !busy

  async function generate() {
    if (!canSubmit) return
    setBusy(true)
    setError(null)
    try {
      const story = isSequel
        ? await api.generateSequel(parentId!, trimmed || undefined)
        : await api.generateStory(genre, trimmed, subGenres)
      router.push(`/reader/${story.id}`)
    } catch (e) {
      setError(e instanceof ApiError ? messageOf(e.code) : messageOf('UNKNOWN'))
      setBusy(false)
    }
  }

  if (busy) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <GenerationProgress isSequel={isSequel} />
      </main>
    )
  }

  return (
    <main className="flex flex-1 flex-col px-6 pb-10 pt-6">
      <div className="mb-5 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-sm text-gray-400">
          ← 뒤로
        </button>
        <QuotaBadge />
      </div>

      <h1 className="text-[1.7rem] font-bold leading-snug">
        {isSequel ? '속편 쓰기' : '어떤 이야기인가요?'}
      </h1>
      <p className="mt-2 text-sm text-brand">
        {isSequel ? '이전 이야기를 이어갑니다' : GENRE_NAME[genre] ?? '미선택'}
      </p>

      {subs.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs text-gray-500">세부 장르 (복수 선택 가능)</p>
          <div className="flex flex-wrap gap-2">
            {subs.map((s) => {
              const on = subGenres.includes(s)
              return (
                <button
                  key={s}
                  onClick={() =>
                    setSubGenres(on ? subGenres.filter((x) => x !== s) : [...subGenres, s])
                  }
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    on ? 'border-brand bg-brand/15 text-brand' : 'border-line text-gray-300'
                  }`}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <textarea
        value={premise}
        onChange={(e) => setPremise(e.target.value)}
        maxLength={500}
        rows={6}
        placeholder={
          isSequel
            ? '어떻게 이어갈지 적어주세요. (선택 — 비워두면 AI가 알아서 이어가요)'
            : EXAMPLES[genre] ?? '떠오른 줄거리를 한두 문장으로 적어주세요.'
        }
        className="mt-6 w-full resize-none rounded-2xl border border-line bg-card p-4 text-[15px] leading-7 text-white placeholder:text-gray-500 outline-none focus:border-brand/60"
      />
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>{isSequel ? '방향을 적으면 더 잘 이어져요' : '한두 문장이면 충분해요'}</span>
        <span>{trimmed.length}/500</span>
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="flex-1" />

      <button
        disabled={!canSubmit}
        onClick={generate}
        className="safe-bottom mt-6 flex h-14 items-center justify-center rounded-xl bg-brand text-base font-semibold text-[#1a1410] transition active:scale-[0.99] disabled:bg-line disabled:text-gray-500"
      >
        {isSequel ? '속편 생성하기' : '이야기 생성하기'}
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
