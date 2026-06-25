'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api, ApiError, messageOf } from '@/lib/api'
import { GENRES } from '@/lib/genres'
import { Spinner } from '@/components/Spinner'

function WriteInner() {
  const router = useRouter()
  const sp = useSearchParams()
  const initialGenre = sp.get('genre') ?? GENRES[0]?.id ?? ''

  const [genre, setGenre] = useState(initialGenre)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = title.trim().length >= 1 && content.trim().length >= 20 && !busy

  async function save() {
    if (!canSubmit) return
    setBusy(true)
    setError(null)
    try {
      const r = await api.createManual({
        title: title.trim(),
        content: content.trim(),
        genre,
        isPublic,
      })
      router.push(`/reader/${r.id}`)
    } catch (e) {
      setError(e instanceof ApiError ? messageOf(e.code) : messageOf('UNKNOWN'))
      setBusy(false)
    }
  }

  if (busy) return <Spinner label="저장하는 중…" />

  return (
    <main className="flex flex-1 flex-col px-6 pb-10 pt-6">
      <button onClick={() => router.back()} className="mb-5 self-start text-sm text-gray-400">
        ← 뒤로
      </button>

      <h1 className="text-[1.7rem] font-bold leading-snug">직접 쓰기</h1>
      <p className="mt-2 text-sm text-gray-400">AI 없이 제목과 본문을 직접 써서 등록해요.</p>

      <label className="mt-6 mb-2 text-xs text-gray-500">장르</label>
      <select
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
        className="h-11 rounded-xl border border-line bg-card px-3 text-[15px] text-white outline-none focus:border-brand/60"
      >
        {GENRES.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>

      <label className="mt-5 mb-2 text-xs text-gray-500">제목</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={200}
        placeholder="제목을 입력하세요"
        className="h-12 rounded-xl border border-line bg-card px-4 text-[15px] text-white placeholder:text-gray-500 outline-none focus:border-brand/60"
      />

      <label className="mt-5 mb-2 text-xs text-gray-500">본문</label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={20000}
        rows={14}
        placeholder="이야기를 자유롭게 적어주세요. (20자 이상)"
        className="w-full resize-none rounded-2xl border border-line bg-card p-4 text-[15px] leading-7 text-white placeholder:text-gray-500 outline-none focus:border-brand/60"
      />
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>{content.trim().length < 20 ? '20자 이상 적어주세요' : '준비됐어요'}</span>
        <span>{content.length}/20000</span>
      </div>

      <button
        onClick={() => setIsPublic((v) => !v)}
        className="mt-4 flex items-center justify-between rounded-xl border border-line bg-card px-4 py-3 text-left"
      >
        <div>
          <p className="text-sm font-medium">{isPublic ? '바로 공개' : '나만 보기'}</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {isPublic ? '등록하면 피드에 노출돼요' : '등록 후 리더에서 공개로 바꿀 수 있어요'}
          </p>
        </div>
        <span
          className={`flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition ${
            isPublic ? 'justify-end bg-brand' : 'justify-start bg-line'
          }`}
        >
          <span className="h-5 w-5 rounded-full bg-white" />
        </span>
      </button>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="flex-1" />

      <button
        disabled={!canSubmit}
        onClick={save}
        className="safe-bottom mt-6 flex h-14 items-center justify-center rounded-xl bg-brand text-base font-semibold text-[#1a1410] transition active:scale-[0.99] disabled:bg-line disabled:text-gray-500"
      >
        등록하기
      </button>
    </main>
  )
}

export default function WritePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <WriteInner />
    </Suspense>
  )
}
