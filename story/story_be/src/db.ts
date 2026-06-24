import { config } from './config.js'

// 로컬 PGlite / 운영 pg 양쪽이 동일하게 노출하는 최소 인터페이스.
// 애플리케이션 SQL은 한 벌만 유지한다(테이블은 story. 스키마로 한정).
export interface QueryResult<T = Record<string, unknown>> {
  rows: T[]
}

export interface Db {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<QueryResult<T>>
}

let db: Db | null = null

export async function initDb(): Promise<Db> {
  if (config.db.driver === 'pglite') {
    const { PGlite } = await import('@electric-sql/pglite')
    const pglite = new PGlite(config.db.pgliteDataDir)
    db = {
      async query(sql, params) {
        const res = await pglite.query(sql, (params ?? []) as unknown[])
        return { rows: res.rows as never[] }
      },
    }
  } else {
    const pg = await import('pg')
    const pool = new pg.default.Pool({
      host: config.db.host,
      port: config.db.port,
      database: config.db.name,
      user: config.db.user,
      password: config.db.password,
      ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
    })
    db = {
      async query(sql, params) {
        const res = await pool.query(sql, params as unknown[])
        return { rows: res.rows }
      },
    }
  }

  await createSchema(db)
  return db
}

export function getDb(): Db {
  if (!db) throw new Error('DB not initialized — call initDb() first')
  return db
}

// 부팅 시 스키마/테이블 보장 (CREATE ... IF NOT EXISTS). pglite/pg 양쪽 동일 SQL.
async function createSchema(db: Db): Promise<void> {
  await db.query(`CREATE SCHEMA IF NOT EXISTS story`)

  await db.query(`
    CREATE TABLE IF NOT EXISTS story.stories (
      id          UUID PRIMARY KEY,
      author_uid  VARCHAR(64) NOT NULL,
      title       VARCHAR(200) NOT NULL,
      logline     TEXT,
      genre       VARCHAR(30) NOT NULL,
      keywords    TEXT[] NOT NULL DEFAULT '{}',
      premise     TEXT,
      parent_id   UUID,
      content     TEXT NOT NULL,
      chapters    JSONB,
      model       VARCHAR(40),
      is_public   BOOLEAN NOT NULL DEFAULT TRUE,
      view_count  INTEGER NOT NULL DEFAULT 0,
      status      VARCHAR(20) NOT NULL DEFAULT 'done',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  // 기존 테이블 마이그레이션 — 컬럼 보강 (CREATE TABLE IF NOT EXISTS는 컬럼 추가 안 함)
  await db.query(`ALTER TABLE story.stories ADD COLUMN IF NOT EXISTS premise TEXT`)
  await db.query(`ALTER TABLE story.stories ADD COLUMN IF NOT EXISTS parent_id UUID`)

  await db.query(`
    CREATE TABLE IF NOT EXISTS story.daily_usage (
      user_key    VARCHAR(64) NOT NULL,
      usage_date  DATE NOT NULL,
      count       INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_key, usage_date)
    )
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS story.reports (
      id            UUID PRIMARY KEY,
      story_id      UUID NOT NULL,
      reporter_uid  VARCHAR(64) NOT NULL,
      reason        VARCHAR(40),
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS story.bookmarks (
      user_key    VARCHAR(64) NOT NULL,
      story_id    UUID NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (user_key, story_id)
    )
  `)

  await db.query(
    `CREATE INDEX IF NOT EXISTS idx_stories_public_created ON story.stories (is_public, created_at DESC)`,
  )
  await db.query(
    `CREATE INDEX IF NOT EXISTS idx_stories_author ON story.stories (author_uid, created_at DESC)`,
  )
  await db.query(
    `CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON story.bookmarks (user_key, created_at DESC)`,
  )
}
