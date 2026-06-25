import Link from 'next/link'
import { GENRE_NAME } from '@/lib/genres'
import type { StoryListItem } from '@/lib/types'

export function StoryCard({ story }: { story: StoryListItem }) {
  return (
    <Link
      href={`/reader/${story.id}`}
      className="block rounded-2xl border border-line bg-card p-5 transition active:scale-[0.99]"
    >
      <div className="mb-1.5 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-medium text-brand">
          {GENRE_NAME[story.genre] ?? story.genre}
          {story.is_ai && (
            <span className="rounded bg-brand/20 px-1.5 py-0.5 text-[10px] text-brand">AI 생성</span>
          )}
          {!story.is_public && (
            <span className="rounded bg-gray-700 px-1.5 py-0.5 text-[10px] text-gray-300">비공개</span>
          )}
        </span>
        <span className="text-xs text-gray-500">조회 {story.view_count}</span>
      </div>
      <h3 className="mb-1 line-clamp-1 text-lg font-semibold">{story.title}</h3>
      <p className="line-clamp-2 text-sm leading-6 text-gray-400">{story.logline}</p>
    </Link>
  )
}
