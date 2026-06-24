// 익명 디바이스 ID — 최초 진입 시 발급해 localStorage에 보관, 모든 API 요청에 첨부.
const KEY = 'story_uid'

export function getDeviceId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
  }
  return id
}
