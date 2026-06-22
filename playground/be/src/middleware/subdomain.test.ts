import { describe, it, expect } from 'vitest'
import { extractSubdomain, getSubdomainCorsOrigins, SUPPORTED_SUBDOMAINS } from './subdomain'

describe('extractSubdomain', () => {
  it('빈 host 는 null', () => {
    expect(extractSubdomain('')).toBeNull()
  })

  it('localhost 서브도메인을 추출한다', () => {
    expect(extractSubdomain('tools.localhost:3002')).toBe('tools')
    expect(extractSubdomain('auth.localhost')).toBe('auth')
  })

  it('서브도메인 없는 localhost 는 null', () => {
    expect(extractSubdomain('localhost:3002')).toBeNull()
  })

  it('devforge.com 서브도메인을 추출한다', () => {
    expect(extractSubdomain('admin.devforge.com')).toBe('admin')
  })

  it('알 수 없는 도메인은 null', () => {
    expect(extractSubdomain('example.org')).toBeNull()
  })
})

describe('getSubdomainCorsOrigins', () => {
  const origins = getSubdomainCorsOrigins()

  it('지원 서브도메인마다 localhost/devforge origin 을 포함한다', () => {
    for (const { subdomain } of SUPPORTED_SUBDOMAINS) {
      expect(origins).toContain(`http://${subdomain}.localhost:3002`)
      expect(origins).toContain(`https://${subdomain}.devforge.com`)
    }
  })

  it('기본 운영 도메인을 포함한다', () => {
    expect(origins).toContain('https://playground.chhong.kr')
  })

  it('중복 없이 문자열 배열을 반환한다', () => {
    expect(new Set(origins).size).toBe(origins.length)
    expect(origins.every((o) => typeof o === 'string')).toBe(true)
  })
})
