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
      <Link href="/" className="mb-5 text-sm text-gray-400">
        ← 홈
      </Link>
      <h1 className="text-[1.7rem] font-bold leading-snug">
        어떤 장르로
        <br />
        써볼까요?
      </h1>

      <div className="mt-7 grid grid-cols-2 gap-3">
        {GENRES.map((g) => {
          const on = selected === g.id
          return (
            <button
              key={g.id}
              onClick={() => setSelected(g.id)}
              className={`flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition active:scale-[0.98] ${
                on ? 'border-brand bg-brand/10' : 'border-line bg-card'
              }`}
            >
              <span className={`text-lg font-semibold ${on ? 'text-brand' : 'text-white'}`}>
                {g.name}
              </span>
              <span className="text-xs text-gray-500">{g.desc}</span>
            </button>
          )
        })}
      </div>

      <div className="flex-1" />

      <button
        disabled={!selected}
        onClick={() => router.push(`/create?genre=${selected}`)}
        className="safe-bottom mt-6 flex h-14 items-center justify-center rounded-xl bg-brand text-base font-semibold text-[#1a1410] transition active:scale-[0.99] disabled:bg-line disabled:text-gray-500"
      >
        다음
      </button>
    </main>
  )
}
