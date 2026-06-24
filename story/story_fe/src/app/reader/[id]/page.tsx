'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { api, ApiError, messageOf } from '@/lib/api'
import { GENRE_NAME } from '@/lib/genres'
import { Spinner } from '@/components/Spinner'
import type { StoryDetail, Chapter } from '@/lib/types'

export default function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [story, setStory] = useState<StoryDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fontSize, setFontSize] = useState(17)
  const [bookmarked, setBookmarked] = useState(false)
  const [reported, setReported] = useState(false)

  useEffect(() => {
    api
      .getStory(id)
      .then((s) => {
        setStory(s)
        setBookmarked(Boolean(s.bookmarked))
      })
      .catch((e) => setError(e instanceof ApiError ? messageOf(e.code) : messageOf('UNKNOWN')))
  }, [id])

  async function toggleBookmark() {
    try {
      const r = await api.toggleBookmark(id)
      setBookmarked(r.bookmarked)
    } catch {
      /* 무시 */
    }
  }

  async function report() {
    if (reported) return
    if (!confirm('이 이야기를 신고할까요?')) return
    try {
      await api.reportStory(id)
      setReported(true)
    } catch {
      /* 무시 */
    }
  }

  if (error) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
        <p className="text-gray-400">{error}</p>
        <Link href="/feed" className="text-brand">
          피드로 가기
        </Link>
      </main>
    )
  }

  if (!story) return <Spinner label="불러오는 중…" />

  const chapters: Chapter[] =
    story.chapters && story.chapters.length > 0
      ? story.chapters
      : [{ title: '', body: story.content }]

  return (
    <main className="flex flex-1 flex-col px-6 pb-10 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/feed" className="text-sm text-gray-400">
          ← 피드
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleBookmark}
            className={`flex h-8 items-center rounded-lg border px-3 text-xs font-medium transition ${
              bookmarked ? 'border-brand bg-brand/15 text-brand' : 'border-line text-gray-300'
            }`}
          >
            {bookmarked ? '저장됨' : '저장'}
          </button>
          <button
            onClick={() => setFontSize((s) => Math.max(13, s - 2))}
            className="h-8 w-8 rounded-lg border border-line text-sm text-gray-300"
          >
            가-
          </button>
          <button
            onClick={() => setFontSize((s) => Math.min(26, s + 2))}
            className="h-8 w-8 rounded-lg border border-line text-base text-gray-300"
          >
            가+
          </button>
        </div>
      </div>

      <span className="text-xs font-medium text-brand">{GENRE_NAME[story.genre] ?? story.genre}</span>
      <h1 className="mt-1.5 font-serif text-[1.7rem] font-bold leading-snug">{story.title}</h1>
      {story.logline && <p className="mt-2 text-sm leading-6 text-gray-400">{story.logline}</p>}

      <article className="mt-8 space-y-9">
        {chapters.map((c, i) => (
          <section key={i}>
            {c.title && <h2 className="mb-3 font-serif text-lg font-bold text-brand">{c.title}</h2>}
            <p className="whitespace-pre-wrap font-serif leading-[1.9]" style={{ fontSize }}>
              {c.body}
            </p>
          </section>
        ))}
      </article>

      <div className="safe-bottom mt-12 flex gap-3">
        <Link
          href="/genre"
          className="flex h-12 flex-1 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-[#1a1410]"
        >
          새 이야기 만들기
        </Link>
        <Link
          href="/feed"
          className="flex h-12 flex-1 items-center justify-center rounded-xl border border-line text-sm font-medium text-gray-300"
        >
          다른 이야기
        </Link>
      </div>

      <button
        onClick={report}
        disabled={reported}
        className="mt-6 self-center text-xs text-gray-600 underline disabled:no-underline"
      >
        {reported ? '신고가 접수되었어요' : '이 이야기 신고하기'}
      </button>
    </main>
  )
}
