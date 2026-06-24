import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { config } from './config.js'
import {
  OutlineSchema,
  ProseSchema,
  outlineSystemPrompt,
  proseSystemPrompt,
  premiseUserBlock,
  type Outline,
  type Prose,
} from './prompts.js'
import type { Genre } from './genres.js'

const client = new OpenAI({ apiKey: config.openai.apiKey })

export interface ModerationResult {
  flagged: boolean
  categories: string[] // true로 표시된 카테고리들
}

// 모더레이션 원시 결과. 차단 여부는 하드블록 정책으로 별도 판단(storyService). (무료 omni-moderation)
export async function moderate(input: string): Promise<ModerationResult> {
  const res = await client.moderations.create({
    model: config.openai.moderationModel,
    input,
  })
  const r = res.results[0]
  const categories = r
    ? Object.entries(r.categories)
        .filter(([, v]) => v === true)
        .map(([k]) => k)
    : []
  return { flagged: r?.flagged ?? false, categories }
}

// 하드블록 카테고리에 적중하면 그 카테고리명 반환, 아니면 null.
export function blockedCategory(categories: string[]): string | null {
  return categories.find((c) => config.moderationBlock.includes(c)) ?? null
}

// 1단계: 아웃라인/비트 (낮은 temp, 구조 안정) — premise(줄거리) 기반
export async function generateOutline(genre: Genre, premise: string): Promise<Outline> {
  const completion = await client.beta.chat.completions.parse({
    model: config.openai.model,
    temperature: 0.5,
    messages: [
      { role: 'system', content: outlineSystemPrompt(genre) },
      { role: 'user', content: premiseUserBlock(premise) },
    ],
    response_format: zodResponseFormat(OutlineSchema, 'outline'),
  })
  const parsed = completion.choices[0]?.message.parsed
  if (!parsed) throw new Error('outline parse failed')
  return parsed
}

// 2단계: 산문 (높은 temp + 반복 억제)
export async function generateProse(genre: Genre, outline: Outline): Promise<Prose> {
  const completion = await client.beta.chat.completions.parse({
    model: config.openai.model,
    temperature: 0.95,
    frequency_penalty: 0.5,
    presence_penalty: 0.4,
    max_completion_tokens: 5000,
    messages: [
      { role: 'system', content: proseSystemPrompt(genre, outline) },
      { role: 'user', content: '위 아웃라인과 비트에 따라 완성된 소설 본문을 챕터로 써라.' },
    ],
    response_format: zodResponseFormat(ProseSchema, 'prose'),
  })
  const parsed = completion.choices[0]?.message.parsed
  if (!parsed) throw new Error('prose parse failed')
  return parsed
}
