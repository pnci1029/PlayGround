'use client'

import { useEffect, useState } from 'react'

// P2 옵션 A — 생성 대기 중 진행 단계 표시 (순수 FE 추정 타이머).
// 생성 POST는 완료까지 블로킹되는 단일 요청이라 실제 단계 신호가 없다.
// → 경과 시간 기준으로 단계/진행률을 '추정'해 연출한다. (실시간 신호는 옵션 B=SSE)
// 근거: docs/roadmap-generation-ux.md

// 각 단계 시작 시각(초). 생성 파이프라인(아웃라인→산문→자기검수)과 매칭.
const STEP_STARTS = [0, 12, 45]
const ESTIMATE_SEC = 58 // 진행바 추정 총시간(이 전엔 95%에서 멈춤)

export function GenerationProgress({ isSequel = false }: { isSequel?: boolean }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const startedAt = Date.now()
    const t = setInterval(() => setElapsed((Date.now() - startedAt) / 1000), 250)
    return () => clearInterval(t)
  }, [])

  const steps = isSequel
    ? ['원작을 읽고 구상하는 중', '다음 이야기를 쓰는 중', '마지막으로 다듬는 중']
    : ['이야기를 구상하는 중', '본문을 쓰는 중', '마지막으로 다듬는 중']

  // 현재 단계 = 시작시각을 지난 마지막 단계
  let current = 0
  for (let i = 0; i < STEP_STARTS.length; i++) {
    if (elapsed >= STEP_STARTS[i]) current = i
  }
  // 진행바: 추정 스케줄로 차오르되 응답 전까지 95%에서 멈춤(거짓 완료 방지)
  const percent = Math.min(95, (elapsed / ESTIMATE_SEC) * 100)

  return (
    <div className="flex w-full max-w-sm flex-col gap-7">
      <div>
        <p className="text-center text-base font-semibold text-brand">
          {isSequel ? '다음 이야기를 쓰고 있어요' : 'AI가 이야기를 쓰고 있어요'}
        </p>
        <p className="mt-1.5 text-center text-xs text-gray-500">
          보통 30초~1분 정도 걸려요 (검수까지 거쳐요)
        </p>
      </div>

      {/* 진행바 */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* 단계 목록 */}
      <ol className="flex flex-col gap-4">
        {steps.map((label, i) => {
          const done = i < current
          const active = i === current
          return (
            <li key={i} className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                  done
                    ? 'border-brand bg-brand text-[#1a1410]'
                    : active
                      ? 'border-brand text-brand'
                      : 'border-line text-gray-600'
                }`}
              >
                {done ? '✓' : active ? (
                  <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={`text-sm ${
                  done ? 'text-gray-400 line-through' : active ? 'font-medium text-white' : 'text-gray-600'
                }`}
              >
                {label}
                {active && <span className="ml-1 animate-pulse text-brand">…</span>}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
