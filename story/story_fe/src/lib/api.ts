import { getDeviceId } from './device'
import type { GeneratedStory, StoryDetail, StoryListItem, Usage } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8004/api'

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code)
  }
}

// 에러 코드 → 사용자 메시지
export function messageOf(code: string): string {
  switch (code) {
    case 'DAILY_LIMIT':
      return '오늘 생성 한도(3개)를 모두 사용했어요. 내일 다시 시도해 주세요.'
    case 'UNSAFE_INPUT':
    case 'UNSAFE_OUTPUT':
      return '안전 정책에 의해 생성할 수 없는 내용이에요. 다른 키워드로 시도해 주세요.'
    case 'INVALID_KEYWORDS':
      return '키워드는 1~5개, 각 20자 이내로 입력해 주세요.'
    case 'GENERATION_FAILED':
      return '생성에 실패했어요. 잠시 후 다시 시도해 주세요.'
    default:
      return '문제가 발생했어요. 다시 시도해 주세요.'
  }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Story-Uid': getDeviceId(),
      ...(init?.headers ?? {}),
    },
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json?.success === false) {
    throw new ApiError(res.status, json?.error ?? 'UNKNOWN')
  }
  return json.data as T
}

export const api = {
  getUsage: () => req<Usage>('/usage'),

  generateStory: (genre: string, keywords: string[]) =>
    req<GeneratedStory>('/stories', {
      method: 'POST',
      body: JSON.stringify({ genre, keywords }),
    }),

  getFeed: (sort: 'recent' | 'popular' = 'recent') =>
    req<StoryListItem[]>(`/stories?sort=${sort}&limit=30`),

  getStory: (id: string) => req<StoryDetail>(`/stories/${id}`),

  getMine: () => req<StoryListItem[]>('/stories/mine'),

  getBookmarked: () => req<StoryListItem[]>('/stories/bookmarked'),

  toggleBookmark: (id: string) =>
    req<{ bookmarked: boolean }>(`/stories/${id}/bookmark`, { method: 'POST' }),

  reportStory: (id: string, reason?: string) =>
    req<{ reported: boolean }>(`/stories/${id}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
}
