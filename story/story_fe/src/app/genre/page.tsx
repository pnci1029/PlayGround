'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GENRES } from '@/lib/genres'

export default function GenrePage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <main className="flex flex-1 flex-col px-6 pb-10 pt-6">
      <Link href="/" className="mb-4 text-sm text-gray-400">
        ← 홈
      </Link>
      <h1 className="text-2xl font-bold leading-snug">
        어떤 장르의 이야기를
        <br />
        만들어볼까요?
      </h1>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {GENRES.map((g) => {
          const on = selected === g.id
          return (
            <button
              key={g.id}
              onClick={() => setSelected(g.id)}
              className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 transition active:scale-[0.98] ${
                on ? 'border-brand bg-brand/15' : 'border-transparent bg-card'
              }`}
            >
              <span className="text-4xl">{g.emoji}</span>
              <span className={`text-base font-bold ${on ? 'text-brand' : 'text-white'}`}>
                {g.name}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex-1" />

      <button
        disabled={!selected}
        onClick={() => router.push(`/create?genre=${selected}`)}
        className="safe-bottom mt-6 flex h-14 items-center justify-center rounded-xl bg-brand text-base font-bold text-white transition active:scale-[0.99] disabled:bg-gray-700 disabled:text-gray-400"
      >
        다음
      </button>
    </main>
  )
}
