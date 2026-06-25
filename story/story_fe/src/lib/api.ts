import { getDeviceId } from './device'
import type {
  GeneratedStory,
  ManualSaveResult,
  StoryDetail,
  StoryListItem,
  UpdateResult,
  Usage,
} from './types'

// API base (stock_screener 방식): 항상 상대경로 '/api'.
// 프록시는 next.config.js rewrites가 처리(API_PROXY_TARGET ?? story-api.chhong.kr).
// → Vercel env에 의존하지 않아 누락돼도 안 깨짐.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api'

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
    case 'INVALID_PREMISE':
      return '줄거리는 5자 이상 500자 이내로 적어주세요.'
    case 'INVALID_INPUT':
      return '제목(1자 이상)과 본문(20자 이상)을 확인해 주세요.'
    case 'FORBIDDEN':
      return '내가 쓴 글만 수정할 수 있어요.'
    case 'SAVE_FAILED':
      return '저장에 실패했어요. 잠시 후 다시 시도해 주세요.'
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

  generateStory: (genre: string, premise: string, subGenres?: string[]) =>
    req<GeneratedStory>('/stories', {
      method: 'POST',
      body: JSON.stringify({
        genre,
        premise,
        subGenre: subGenres && subGenres.length ? subGenres : undefined,
      }),
    }),

  generateSequel: (parentId: string, premise?: string) =>
    req<GeneratedStory>(`/stories/${parentId}/sequel`, {
      method: 'POST',
      body: JSON.stringify({ premise: premise || undefined }),
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

  setVisibility: (id: string, isPublic: boolean) =>
    req<{ isPublic: boolean }>(`/stories/${id}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublic }),
    }),

  // 직접 작성 (AI 없이)
  createManual: (input: { title: string; content: string; genre: string; isPublic?: boolean }) =>
    req<ManualSaveResult>('/stories/manual', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  // AI 글 수정 (작성자)
  updateStory: (id: string, patch: { title?: string; content?: string }) =>
    req<UpdateResult>(`/stories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),
}
