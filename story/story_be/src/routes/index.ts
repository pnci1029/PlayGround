import { randomUUID } from 'node:crypto'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import { GENRES } from '../genres.js'
import { getUsage } from '../usage.js'
import { getDb } from '../db.js'
import { GenerateRequestSchema, SequelRequestSchema } from '../prompts.js'
import { generateStory, generateSequel, StoryGenError } from '../storyService.js'

const LIST_COLS = 'id, title, logline, genre, view_count, created_at, is_public'

// 익명 디바이스 ID 추출. (FE가 모든 요청에 X-Story-Uid 헤더 첨부)
function getUid(req: FastifyRequest): string | null {
  const raw = req.headers['x-story-uid']
  const uid = Array.isArray(raw) ? raw[0] : raw
  if (!uid || uid.length > 64) return null
  return uid
}

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  // 장르 목록
  app.get('/api/genres', async () => ({
    success: true,
    data: GENRES.map(({ id, name }) => ({ id, name })),
  }))

  // 오늘 남은 생성 횟수
  app.get('/api/usage', async (req, reply) => {
    const uid = getUid(req)
    if (!uid) return reply.code(400).send({ success: false, error: 'MISSING_UID' })
    return { success: true, data: await getUsage(uid) }
  })

  // 소설 생성 (모더레이션 → 아웃라인 → 산문 → 저장 + 쿼터)
  app.post('/api/stories', async (req, reply) => {
    const uid = getUid(req)
    if (!uid) return reply.code(400).send({ success: false, error: 'MISSING_UID' })

    const parsed = GenerateRequestSchema.safeParse(req.body)
    if (!parsed.success) {
      return reply.code(400).send({ success: false, error: 'INVALID_PREMISE', detail: parsed.error.issues })
    }

    try {
      const story = await generateStory(uid, parsed.data.genre, parsed.data.premise, parsed.data.subGenre)
      return { success: true, data: story }
    } catch (err) {
      if (err instanceof StoryGenError) {
        return reply.code(err.httpStatus).send({ success: false, error: err.code })
      }
      app.log.error(err)
      return reply.code(502).send({ success: false, error: 'GENERATION_FAILED' })
    }
  })

  // 속편 생성 (원작 id 기반)
  app.post('/api/stories/:id/sequel', async (req, reply) => {
    const uid = getUid(req)
    if (!uid) return reply.code(400).send({ success: false, error: 'MISSING_UID' })
    const { id } = req.params as { id: string }
    const parsed = SequelRequestSchema.safeParse(req.body ?? {})
    if (!parsed.success) {
      return reply.code(400).send({ success: false, error: 'INVALID_PREMISE', detail: parsed.error.issues })
    }
    try {
      const story = await generateSequel(uid, id, parsed.data.premise)
      return { success: true, data: story }
    } catch (err) {
      if (err instanceof StoryGenError) {
        return reply.code(err.httpStatus).send({ success: false, error: err.code })
      }
      app.log.error(err)
      return reply.code(502).send({ success: false, error: 'GENERATION_FAILED' })
    }
  })

  // 내 글 (정적 경로 — :id 보다 먼저 매칭됨)
  app.get('/api/stories/mine', async (req, reply) => {
    const uid = getUid(req)
    if (!uid) return reply.code(400).send({ success: false, error: 'MISSING_UID' })
    const { rows } = await getDb().query(
      `SELECT ${LIST_COLS} FROM story.stories WHERE author_uid = $1 ORDER BY created_at DESC LIMIT 50`,
      [uid],
    )
    return { success: true, data: rows }
  })

  // 내가 저장한 글
  app.get('/api/stories/bookmarked', async (req, reply) => {
    const uid = getUid(req)
    if (!uid) return reply.code(400).send({ success: false, error: 'MISSING_UID' })
    const { rows } = await getDb().query(
      `SELECT ${LIST_COLS.split(', ').map((c) => `s.${c}`).join(', ')}
       FROM story.bookmarks b JOIN story.stories s ON s.id = b.story_id
       WHERE b.user_key = $1 ORDER BY b.created_at DESC LIMIT 50`,
      [uid],
    )
    return { success: true, data: rows }
  })

  // 북마크 토글
  app.post('/api/stories/:id/bookmark', async (req, reply) => {
    const uid = getUid(req)
    if (!uid) return reply.code(400).send({ success: false, error: 'MISSING_UID' })
    const { id } = req.params as { id: string }
    const existing = await getDb().query(
      `SELECT 1 FROM story.bookmarks WHERE user_key = $1 AND story_id = $2`,
      [uid, id],
    )
    if (existing.rows.length > 0) {
      await getDb().query(`DELETE FROM story.bookmarks WHERE user_key = $1 AND story_id = $2`, [uid, id])
      return { success: true, data: { bookmarked: false } }
    }
    await getDb().query(
      `INSERT INTO story.bookmarks (user_key, story_id) VALUES ($1, $2)
       ON CONFLICT (user_key, story_id) DO NOTHING`,
      [uid, id],
    )
    return { success: true, data: { bookmarked: true } }
  })

  // 공개/비공개 전환 (작성자만)
  app.patch('/api/stories/:id/visibility', async (req, reply) => {
    const uid = getUid(req)
    if (!uid) return reply.code(400).send({ success: false, error: 'MISSING_UID' })
    const { id } = req.params as { id: string }
    const isPublic = (req.body as { isPublic?: unknown } | undefined)?.isPublic === true
    const { rows } = await getDb().query<{ author_uid: string }>(
      `SELECT author_uid FROM story.stories WHERE id = $1`,
      [id],
    )
    if (!rows[0]) return reply.code(404).send({ success: false, error: 'NOT_FOUND' })
    if (rows[0].author_uid !== uid) return reply.code(403).send({ success: false, error: 'FORBIDDEN' })
    await getDb().query(`UPDATE story.stories SET is_public = $1 WHERE id = $2`, [isPublic, id])
    return { success: true, data: { isPublic } }
  })

  // 신고
  app.post('/api/stories/:id/report', async (req, reply) => {
    const uid = getUid(req)
    if (!uid) return reply.code(400).send({ success: false, error: 'MISSING_UID' })
    const { id } = req.params as { id: string }
    const reason = (req.body as { reason?: string } | undefined)?.reason?.slice(0, 40) ?? null
    await getDb().query(
      `INSERT INTO story.reports (id, story_id, reporter_uid, reason) VALUES ($1, $2, $3, $4)`,
      [randomUUID(), id, uid, reason],
    )
    return { success: true, data: { reported: true } }
  })

  // 피드 — 공개 글 + 내 글(비공개 포함). 목록(본문 제외)
  app.get('/api/stories', async (req) => {
    const q = req.query as Record<string, string | undefined>
    const uid = getUid(req)
    const orderBy = q.sort === 'popular' ? 'view_count DESC, created_at DESC' : 'created_at DESC'
    const limit = Math.min(parseInt(q.limit ?? '20', 10) || 20, 50)
    const offset = parseInt(q.offset ?? '0', 10) || 0
    const where = uid ? 'is_public = TRUE OR author_uid = $3' : 'is_public = TRUE'
    const params = uid ? [limit, offset, uid] : [limit, offset]
    const { rows } = await getDb().query(
      `SELECT ${LIST_COLS} FROM story.stories WHERE ${where} ORDER BY ${orderBy} LIMIT $1 OFFSET $2`,
      params,
    )
    return { success: true, data: rows }
  })

  // 단건 열람 (조회수 +1, 본문 포함, uid 있으면 bookmarked 플래그)
  app.get('/api/stories/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const uid = getUid(req)
    await getDb().query(`UPDATE story.stories SET view_count = view_count + 1 WHERE id = $1`, [id])
    const { rows } = await getDb().query(`SELECT * FROM story.stories WHERE id = $1`, [id])
    if (!rows[0]) return reply.code(404).send({ success: false, error: 'NOT_FOUND' })

    let bookmarked = false
    if (uid) {
      const bm = await getDb().query(
        `SELECT 1 FROM story.bookmarks WHERE user_key = $1 AND story_id = $2`,
        [uid, id],
      )
      bookmarked = bm.rows.length > 0
    }
    return { success: true, data: { ...rows[0], bookmarked } }
  })
}
