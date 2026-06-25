import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import dotenv from 'dotenv'

// 비밀값은 모노레포 루트 .env 한 곳에서 관리(STORY_ 접두어). (근거: docs/PLANNING.md §4)
// 로컬: 루트 .env 파일 로드 / 운영: 컨테이너에 env_file로 주입(파일 없어도 process.env에 존재)
const here = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(here, '../../../.env') })

function required(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`${name} 환경변수가 필요합니다 (모노레포 루트 .env 확인)`)
  return v
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.STORY_PORT ?? '8004', 10),
  dailyLimit: parseInt(process.env.STORY_DAILY_LIMIT ?? '3', 10),
  // 베타 기간: 작성 수 무제한 (기본 on). 정식 전환 시 STORY_UNLIMITED=false.
  unlimited: (process.env.STORY_UNLIMITED ?? 'true') !== 'false',

  db: {
    driver: (process.env.STORY_DB_DRIVER ?? 'pglite') as 'pglite' | 'pg',
    pgliteDataDir: process.env.STORY_PGLITE_DATA_DIR ?? './.pgdata',
    // pg(운영) 모드: host/포트는 STORY_ 전용, DB 자체는 공용 POSTGRES_* 재사용
    host: process.env.STORY_DB_HOST ?? 'postgres',
    port: parseInt(process.env.STORY_DB_PORT ?? '5432', 10),
    name: process.env.POSTGRES_DB ?? 'playground',
    user: process.env.POSTGRES_USER ?? 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    schema: process.env.STORY_DB_SCHEMA ?? 'story',
    ssl: process.env.STORY_DB_SSL === 'true',
  },

  openai: {
    apiKey: required('STORY_OPENAI_API_KEY'),
    model: process.env.STORY_OPENAI_MODEL ?? 'gpt-4.1-mini',
    // 산문 모델만 별도 지정 가능(기본=일반 모델). 3단계 품질 업 시 STORY_PROSE_MODEL=gpt-4.1.
    proseModel:
      process.env.STORY_PROSE_MODEL ?? process.env.STORY_OPENAI_MODEL ?? 'gpt-4.1-mini',
    moderationModel: process.env.STORY_OPENAI_MODERATION_MODEL ?? 'omni-moderation-latest',
  },

  // 자기검수(생성 후 논리·고증·가독성 교정 패스). 기본 on.
  selfCritique: (process.env.STORY_SELF_CRITIQUE ?? 'true') !== 'false',

  // 데일리 AI 큐레이션(P3): 매일 10~16시(KST) 사이 랜덤 시각에 하루 count편 자동 생성.
  // 운영(production)에선 기본 on, 로컬/개발에선 기본 off(OpenAI 호출 방지). ENABLE_STORY_DAILY_AI로 강제 토글.
  dailyAi: {
    enabled:
      (process.env.ENABLE_STORY_DAILY_AI ??
        ((process.env.NODE_ENV ?? 'development') === 'production' ? 'true' : 'false')) !== 'false',
    count: Math.max(1, parseInt(process.env.STORY_DAILY_AI_COUNT ?? '1', 10) || 1),
  },

  // 창작 앱 = 완화. 하드블록 카테고리에 적중할 때만 차단. (근거: generation-pipeline.md §2.1)
  moderationBlock: (process.env.STORY_MODERATION_BLOCK ?? 'sexual/minors,self-harm/instructions')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  corsOrigins: ['http://localhost:3004', 'https://story.chhong.kr'],
}
