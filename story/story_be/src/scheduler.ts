import { config } from './config.js'
import { getDb } from './db.js'
import { generateDailyAi } from './storyService.js'

// 데일리 AI 큐레이션 스케줄러 (P3) — 매일 10~16시(KST) 사이 '랜덤 시각'에 하루 count편.
// 외부 의존성 없이 setInterval + KST 윈도우 + '남은 틱 확률(1/remaining)'로 구현:
//  - 윈도우 동안 정확히 1회 발동을 보장하면서, 매일 다른 시각에 발동(같은 시간 X).
//  - 재시작 안전: '오늘 생성됨' 여부를 DB(is_ai + KST 날짜)로 판단하므로 배포로 컨테이너가
//    재기동돼도 그날 이미 만들었으면 중복 생성 안 함.

const TICK_MS = 15 * 60 * 1000 // 15분마다 점검
const WIN_START = 10 // 10:00 (KST)
const WIN_END = 16 // 16:00 미만
const TICKS_IN_WINDOW = ((WIN_END - WIN_START) * 60) / 15 // 24

function kstHourMinute(): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(new Date())
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0') % 24
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0')
  return { hour, minute }
}

async function generatedToday(): Promise<boolean> {
  const { rows } = await getDb().query(
    `SELECT 1 FROM story.stories
       WHERE is_ai = TRUE
         AND (created_at AT TIME ZONE 'Asia/Seoul')::date = (now() AT TIME ZONE 'Asia/Seoul')::date
       LIMIT 1`,
  )
  return rows.length > 0
}

async function tick(): Promise<void> {
  try {
    const { hour, minute } = kstHourMinute()
    if (hour < WIN_START || hour >= WIN_END) return
    if (await generatedToday()) return

    // 남은 틱 수 기반 확률 → 윈도우 내 균등 랜덤 시각 + 마지막 틱에서 1회 보장
    const idx = (hour - WIN_START) * 4 + Math.floor(minute / 15) // 0..23
    const remaining = Math.max(1, TICKS_IN_WINDOW - idx)
    if (Math.random() >= 1 / remaining) return // 이번 틱은 패스

    for (let i = 0; i < config.dailyAi.count; i++) {
      const id = await generateDailyAi()
      console.log(`[daily-ai] 생성 완료 — ${id}`)
    }
  } catch (e) {
    console.error('[daily-ai] tick 실패:', e)
  }
}

export function startDailyAiScheduler(): void {
  if (!config.dailyAi.enabled) {
    console.log('[daily-ai] 비활성 (ENABLE_STORY_DAILY_AI=false 또는 비-production)')
    return
  }
  console.log(
    `[daily-ai] 스케줄러 시작 — 매일 ${WIN_START}~${WIN_END}시(KST) 사이 랜덤 시각, 하루 ${config.dailyAi.count}편`,
  )
  // setInterval은 즉시 실행하지 않으므로 첫 틱은 TICK_MS 후. (부팅 직후 즉시 점검 불필요)
  setInterval(() => {
    void tick()
  }, TICK_MS)
}
