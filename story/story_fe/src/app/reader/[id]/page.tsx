'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { api, ApiError, messageOf } from '@/lib/api'
import { GENRE_NAME } from '@/lib/genres'
import { getDeviceId } from '@/lib/device'
import { Spinner } from '@/components/Spinner'
import type { StoryDetail, Chapter } from '@/lib/types'

export default function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [story, setStory] = useState<StoryDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fontSize, setFontSize] = useState(17)
  const [bookmarked, setBookmarked] = useState(false)
  const [reported, setReported] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [isAuthor, setIsAuthor] = useState(false)
  const [shareMsg, setShareMsg] = useState<string | null>(null)

  useEffect(() => {
    api
      .getStory(id)
      .then((s) => {
        setStory(s)
        setBookmarked(Boolean(s.bookmarked))
        setIsPublic(Boolean(s.is_public))
        setIsAuthor(s.author_uid === getDeviceId())
      })
      .catch((e) => setError(e instanceof ApiError ? messageOf(e.code) : messageOf('UNKNOWN')))
  }, [id])

  async function setVisibility(next: boolean) {
    try {
      const r = await api.setVisibility(id, next)
      setIsPublic(r.isPublic)
    } catch {
      /* 무시 */
    }
  }

  async function toggleBookmark() {
    try {
      const r = await api.toggleBookmark(id)
      setBookmarked(r.bookmarked)
    } catch {
      /* 무시 */
    }
  }

  async function share() {
    const url = `${window.location.origin}/reader/${id}`
    // 모바일: OS 공유 시트(카카오톡 등). 데스크톱/미지원: 클립보드 복사.
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: story?.title ?? 'Story', text: story?.logline ?? '', url })
        return
      } catch {
        return // 사용자가 공유 취소
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setShareMsg('링크가 복사됐어요')
    } catch {
      setShareMsg(url)
    }
    setTimeout(() => setShareMsg(null), 2000)
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
            onClick={share}
            className="flex h-8 items-center rounded-lg border border-line px-3 text-xs font-medium text-gray-300 transition"
          >
            공유
          </button>
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

      {isAuthor && (
        <div className="mt-5 flex items-center justify-between rounded-xl border border-line bg-card px-4 py-3">
          <div>
            <p className="text-sm font-medium">{isPublic ? '공개됨' : '나만 볼 수 있어요'}</p>
            <p className="mt-0.5 text-xs text-gray-500">
              {isPublic ? '피드에 노출되고 있어요' : '공개하면 다른 사람도 읽을 수 있어요'}
            </p>
          </div>
          <button
            onClick={() => setVisibility(!isPublic)}
            className={`h-9 shrink-0 rounded-lg px-4 text-sm font-semibold transition ${
              isPublic
                ? 'border border-line text-gray-300'
                : 'bg-brand text-[#1a1410]'
            }`}
          >
            {isPublic ? '비공개로' : '공개하기'}
          </button>
        </div>
      )}

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

      <div className="safe-bottom mt-12 flex flex-col gap-3">
        <Link
          href={`/create?parent=${story.id}`}
          className="flex h-12 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-[#1a1410]"
        >
          이 이야기의 속편 쓰기
        </Link>
        <div className="flex gap-3">
          <Link
            href="/genre"
            className="flex h-12 flex-1 items-center justify-center rounded-xl border border-line text-sm font-medium text-gray-300"
          >
            새 이야기
          </Link>
          <Link
            href="/feed"
            className="flex h-12 flex-1 items-center justify-center rounded-xl border border-line text-sm font-medium text-gray-300"
          >
            피드
          </Link>
        </div>
      </div>

      <button
        onClick={report}
        disabled={reported}
        className="mt-6 self-center text-xs text-gray-600 underline disabled:no-underline"
      >
        {reported ? '신고가 접수되었어요' : '이 이야기 신고하기'}
      </button>

      {shareMsg && (
        <div className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center">
          <span className="rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-[#1a1410] shadow-lg">
            {shareMsg}
          </span>
        </div>
      )}
    </main>
  )
}
