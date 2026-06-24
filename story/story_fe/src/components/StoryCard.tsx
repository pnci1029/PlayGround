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
        <span className="text-xs font-medium text-brand">{GENRE_NAME[story.genre] ?? story.genre}</span>
        <span className="text-xs text-gray-500">조회 {story.view_count}</span>
      </div>
      <h3 className="mb-1 line-clamp-1 text-lg font-semibold">{story.title}</h3>
      <p className="line-clamp-2 text-sm leading-6 text-gray-400">{story.logline}</p>
    </Link>
  )
}
