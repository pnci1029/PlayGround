import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { config } from './config.js'
import {
  OutlineSchema,
  ProseSchema,
  outlineSystemPrompt,
  sequelOutlineSystemPrompt,
  proseSystemPrompt,
  reviseSystemPrompt,
  premiseUserBlock,
  proseToText,
  seedPremiseSystemPrompt,
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

// 데일리 AI(P3): 장르/세부장르만으로 시드 premise 자체 생성 (높은 temp로 매번 다르게)
export async function generateSeedPremise(genre: Genre, subGenres?: string[]): Promise<string> {
  const completion = await client.chat.completions.create({
    model: config.openai.model,
    temperature: 1.0,
    max_completion_tokens: 200,
    messages: [
      { role: 'system', content: seedPremiseSystemPrompt(genre, subGenres) },
      { role: 'user', content: '흥미로운 한 줄 줄거리(premise) 하나만 출력하라.' },
    ],
  })
  const text = completion.choices[0]?.message.content?.trim()
  if (!text) throw new Error('seed premise generation failed')
  return text.slice(0, 480) // premise 최대 500자 안전 마진
}

// 1단계: 아웃라인/비트 (낮은 temp, 구조 안정) — premise(줄거리) 기반
export async function generateOutline(
  genre: Genre,
  premise: string,
  subGenres?: string[],
): Promise<Outline> {
  const completion = await client.beta.chat.completions.parse({
    model: config.openai.model,
    temperature: 0.5,
    messages: [
      { role: 'system', content: outlineSystemPrompt(genre, subGenres) },
      { role: 'user', content: premiseUserBlock(premise) },
    ],
    response_format: zodResponseFormat(OutlineSchema, 'outline'),
  })
  const parsed = completion.choices[0]?.message.parsed
  if (!parsed) throw new Error('outline parse failed')
  return parsed
}

// 1단계(속편): 원작 컨텍스트를 주입한 아웃라인
export async function generateSequelOutline(
  genre: Genre,
  parent: { title: string; logline: string; content: string },
  direction?: string,
): Promise<Outline> {
  const completion = await client.beta.chat.completions.parse({
    model: config.openai.model,
    temperature: 0.5,
    messages: [
      { role: 'system', content: sequelOutlineSystemPrompt(genre, parent, direction) },
      {
        role: 'user',
        content: direction ? `이어갈 방향: ${direction}` : '원작을 잇는 다음 이야기를 설계하라.',
      },
    ],
    response_format: zodResponseFormat(OutlineSchema, 'outline'),
  })
  const parsed = completion.choices[0]?.message.parsed
  if (!parsed) throw new Error('sequel outline parse failed')
  return parsed
}

// 2단계: 산문 (temp 0.8 — 일관성↑ + 반복 억제)
export async function generateProse(genre: Genre, outline: Outline): Promise<Prose> {
  const completion = await client.beta.chat.completions.parse({
    model: config.openai.proseModel,
    temperature: 0.8,
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

// 2.5단계: 자기검수·수정 (논리·고증·가독성 교정 후 재작성). 낮은 temp로 '교정'에 집중.
export async function reviseProse(genre: Genre, prose: Prose): Promise<Prose> {
  const completion = await client.beta.chat.completions.parse({
    model: config.openai.proseModel,
    temperature: 0.4,
    max_completion_tokens: 5000,
    messages: [
      { role: 'system', content: reviseSystemPrompt(genre) },
      { role: 'user', content: proseToText(prose.chapters) },
    ],
    response_format: zodResponseFormat(ProseSchema, 'prose'),
  })
  const parsed = completion.choices[0]?.message.parsed
  if (!parsed) throw new Error('revise parse failed')
  return parsed
}
