import { describe, it, expect } from 'vitest'
import { TrendingCalculator } from './trendingCalculator'

const calc = new TrendingCalculator()

describe('calculateGrowthRate', () => {
  it('이전값 0, 현재값 > 0 이면 100', () => {
    expect(calc.calculateGrowthRate(5, 0)).toBe(100)
  })
  it('이전값 0, 현재값 0 이면 0', () => {
    expect(calc.calculateGrowthRate(0, 0)).toBe(0)
  })
  it('정상 증가율을 계산한다', () => {
    expect(calc.calculateGrowthRate(150, 100)).toBe(50)
  })
  it('감소는 음수 증가율', () => {
    expect(calc.calculateGrowthRate(50, 100)).toBe(-50)
  })
})

describe('calculateTrendDirection', () => {
  it('이전 순위가 없으면 new', () => {
    expect(calc.calculateTrendDirection(3)).toBe('new')
  })
  it('순위가 올라가면(숫자 작아짐) up', () => {
    expect(calc.calculateTrendDirection(2, 5)).toBe('up')
  })
  it('순위가 내려가면 down', () => {
    expect(calc.calculateTrendDirection(8, 5)).toBe('down')
  })
  it('순위가 같으면 stable', () => {
    expect(calc.calculateTrendDirection(5, 5)).toBe('stable')
  })
})

describe('normalizeKeyword', () => {
  it('공백 제거 + 소문자화 + 첫 글자 대문자', () => {
    expect(calc.normalizeKeyword('  rUST ')).toBe('Rust')
  })
  it('동의어 맵이 있으면 대표어로 정규화', () => {
    const syn = new Map<string, string[]>([['ChatGPT', ['gpt', '챗지피티']]])
    expect(calc.normalizeKeyword('gpt', syn)).toBe('ChatGPT')
  })
})

describe('calculateRankings', () => {
  const ts = new Date()
  const mk = (keyword: string, mentions: number, engagement: number, sources: string[]) => ({
    keyword, mentions, engagement, sources, timeframe: '1d', growthRate: 0, timestamp: ts,
  })

  it('점수가 높은 키워드가 1위가 되고 순위가 매겨진다', () => {
    const r = calc.calculateRankings([
      mk('A', 1, 1, ['reddit']),
      mk('B', 100, 100, ['hackernews']),
    ] as any)
    expect(r[0].keyword).toBe('B')
    expect(r[0].rank).toBe(1)
    expect(r[1].keyword).toBe('A')
    expect(r[1].rank).toBe(2)
  })

  it('이전 순위를 반영해 trend 방향을 계산한다', () => {
    const prev = new Map<string, number>([['B', 5]])
    const r = calc.calculateRankings([mk('B', 100, 100, ['hackernews'])] as any, prev)
    expect(r[0].rank).toBe(1)
    expect(r[0].trend).toBe('up') // 5위 → 1위
  })
})
