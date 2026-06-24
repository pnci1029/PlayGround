import { randomUUID } from 'node:crypto'
import { config } from './config.js'
import { getDb } from './db.js'
import { findGenre } from './genres.js'
import { getUsage, incrementUsage } from './usage.js'
import { moderate, blockedCategory, generateOutline, generateProse } from './openai.js'
import type { Prose } from './prompts.js'

export type GenErrorCode =
  | 'INVALID_GENRE'
  | 'INVALID_PREMISE'
  | 'DAILY_LIMIT'
  | 'UNSAFE_INPUT'
  | 'UNSAFE_OUTPUT'
  | 'GENERATION_FAILED'

export class StoryGenError extends Error {
  constructor(
    public code: GenErrorCode,
    public httpStatus: number,
  ) {
    super(code)
  }
}

export interface GeneratedStory {
  id: string
  title: string
  logline: string
  genre: string
  premise: string
  chapters: Prose['chapters']
  createdAt: string
  usage: { used: number; limit: number; remaining: number }
}

// 파이프라인 오케스트레이션 (스펙: docs/generation-pipeline.md §2)
export async function generateStory(
  uid: string,
  genreId: string,
  premise: string,
): Promise<GeneratedStory> {
  const genre = findGenre(genreId)
  if (!genre) throw new StoryGenError('INVALID_GENRE', 400)

  // 쿼터 확인 (성공 시에만 차감)
  const usage = await getUsage(uid)
  if (usage.remaining <= 0) throw new StoryGenError('DAILY_LIMIT', 429)

  // 입력 모더레이션 (하드블록 카테고리만 차단)
  const inMod = await moderate(premise)
  const inHit = blockedCategory(inMod.categories)
  if (inHit) {
    console.warn(`[moderation] 입력 차단 — category=${inHit}`)
    throw new StoryGenError('UNSAFE_INPUT', 422)
  }

  // 생성 (아웃라인 → 산문). OpenAI 오류는 1회 재시도.
  let prose: Prose
  let title: string
  let logline: string
  try {
    const outline = await generateOutline(genre, premise)
    title = outline.title
    logline = outline.logline
    prose = await generateProse(genre, outline)
  } catch {
    try {
      const outline = await generateOutline(genre, premise)
      title = outline.title
      logline = outline.logline
      prose = await generateProse(genre, outline)
    } catch {
      throw new StoryGenError('GENERATION_FAILED', 502)
    }
  }

  const content = prose.chapters.map((c) => `${c.title}\n\n${c.body}`).join('\n\n')

  // 출력 모더레이션 (하드블록 카테고리만 차단, 위반 시 저장/차감 안 함)
  const outMod = await moderate(content)
  const outHit = blockedCategory(outMod.categories)
  if (outHit) {
    console.warn(`[moderation] 출력 차단 — category=${outHit}`)
    throw new StoryGenError('UNSAFE_OUTPUT', 422)
  }

  // 저장
  const id = randomUUID()
  await getDb().query(
    `INSERT INTO story.stories
       (id, author_uid, title, logline, genre, premise, content, chapters, model)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [id, uid, title, logline, genreId, premise, content, JSON.stringify(prose.chapters), config.openai.model],
  )

  // 쿼터 +1
  const newCount = await incrementUsage(uid)

  return {
    id,
    title,
    logline,
    genre: genreId,
    premise,
    chapters: prose.chapters,
    createdAt: new Date().toISOString(),
    usage: {
      used: newCount,
      limit: config.dailyLimit,
      remaining: Math.max(0, config.dailyLimit - newCount),
    },
  }
}
