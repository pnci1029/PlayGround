import Link from 'next/link'
import { GENRE_NAME } from '@/lib/genres'
import type { StoryListItem } from '@/lib/types'

export function StoryCard({ story }: { story: StoryListItem }) {
  return (
    <Link
      href={`/reader/${story.id}`}
      className="block rounded-2xl bg-card p-5 transition active:scale-[0.99]"
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-brand">{GENRE_NAME[story.genre] ?? story.genre}</span>
        <span className="text-xs text-gray-500">조회 {story.view_count}</span>
      </div>
      <h3 className="mb-1 line-clamp-1 text-lg font-bold">{story.title}</h3>
      <p className="line-clamp-2 text-sm leading-6 text-gray-400">{story.logline}</p>
      {story.keywords?.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {story.keywords.map((k) => (
            <span key={k} className="rounded-md bg-brand/15 px-2 py-0.5 text-xs text-brand">
              {k}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  )
}
