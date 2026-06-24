'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { StoryCard } from '@/components/StoryCard'
import { Spinner } from '@/components/Spinner'
import type { StoryListItem } from '@/lib/types'

export default function FeedPage() {
  const [sort, setSort] = useState<'recent' | 'popular'>('recent')
  const [stories, setStories] = useState<StoryListItem[] | null>(null)

  useEffect(() => {
    setStories(null)
    api
      .getFeed(sort)
      .then(setStories)
      .catch(() => setStories([]))
  }, [sort])

  return (
    <main className="flex flex-1 flex-col px-6 pb-10 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="text-sm text-gray-400">
          ← 홈
        </Link>
        <div className="flex gap-1 rounded-full bg-card p-1">
          {(['recent', 'popular'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                sort === s ? 'bg-brand text-white' : 'text-gray-400'
              }`}
            >
              {s === 'recent' ? '최신' : '인기'}
            </button>
          ))}
        </div>
      </div>

      <h1 className="text-2xl font-bold">다른 사람들의 이야기</h1>

      <div className="mt-6 flex flex-col gap-3">
        {stories === null ? (
          <Spinner label="불러오는 중…" />
        ) : stories.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 text-center text-sm text-gray-400">
            아직 이야기가 없어요.
            <br />첫 번째 이야기를 만들어보세요!
          </div>
        ) : (
          stories.map((s) => <StoryCard key={s.id} story={s} />)
        )}
      </div>

      <div className="safe-bottom mt-6">
        <Link
          href="/genre"
          className="flex h-14 items-center justify-center rounded-xl bg-brand text-base font-bold text-white"
        >
          나도 이야기 만들기
        </Link>
      </div>
    </main>
  )
}
