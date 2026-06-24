'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { StoryCard } from '@/components/StoryCard'
import { Spinner } from '@/components/Spinner'
import type { StoryListItem } from '@/lib/types'

type Tab = 'written' | 'saved'

export default function MinePage() {
  const [tab, setTab] = useState<Tab>('written')
  const [stories, setStories] = useState<StoryListItem[] | null>(null)

  useEffect(() => {
    setStories(null)
    const fetcher = tab === 'written' ? api.getMine() : api.getBookmarked()
    fetcher.then(setStories).catch(() => setStories([]))
  }, [tab])

  return (
    <main className="flex flex-1 flex-col px-6 pb-10 pt-6">
      <Link href="/" className="mb-4 text-sm text-gray-400">
        ← 홈
      </Link>
      <h1 className="text-2xl font-bold">내 이야기</h1>

      <div className="mt-4 flex gap-1 rounded-full bg-card p-1">
        {(
          [
            ['written', '내가 쓴 글'],
            ['saved', '저장한 글'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-full py-2 text-sm font-bold ${
              tab === key ? 'bg-brand text-white' : 'text-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {stories === null ? (
          <Spinner label="불러오는 중…" />
        ) : stories.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 text-center text-sm text-gray-400">
            {tab === 'written' ? (
              <>
                아직 쓴 이야기가 없어요.
                <br />첫 이야기를 만들어보세요!
              </>
            ) : (
              <>
                저장한 이야기가 없어요.
                <br />
                마음에 든 글을 북마크해보세요.
              </>
            )}
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
          새 이야기 만들기
        </Link>
      </div>
    </main>
  )
}
