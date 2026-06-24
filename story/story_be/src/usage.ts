import { config } from './config.js'
import { getDb } from './db.js'

// 하루 경계는 KST(Asia/Seoul) 고정. (근거: docs/PLANNING.md §7)
export function kstToday(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export interface Usage {
  used: number
  limit: number
  remaining: number
  unlimited: boolean
}

export async function getUsage(uid: string): Promise<Usage> {
  const { rows } = await getDb().query<{ count: number }>(
    `SELECT count FROM story.daily_usage WHERE user_key = $1 AND usage_date = $2`,
    [uid, kstToday()],
  )
  const used = Number(rows[0]?.count ?? 0)
  const unlimited = config.unlimited
  return {
    used,
    limit: config.dailyLimit,
    remaining: unlimited ? Number.MAX_SAFE_INTEGER : Math.max(0, config.dailyLimit - used),
    unlimited,
  }
}

// 생성 성공 시에만 호출. 원자적 UPSERT 후 증가된 count 반환.
// (실패는 차감/증가 없음 — 호출 자체를 안 함. 근거: docs/PLANNING.md §5)
export async function incrementUsage(uid: string): Promise<number> {
  const { rows } = await getDb().query<{ count: number }>(
    `INSERT INTO story.daily_usage (user_key, usage_date, count)
     VALUES ($1, $2, 1)
     ON CONFLICT (user_key, usage_date)
     DO UPDATE SET count = story.daily_usage.count + 1
     RETURNING count`,
    [uid, kstToday()],
  )
  return Number(rows[0]?.count ?? 0)
}
