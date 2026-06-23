// 라우트 파라미터 검증 유틸

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// :id 파라미터가 UUID 형식인지 확인. 잘못된 값이 그대로 DB로 가
// "invalid input syntax for type uuid" 500 을 유발하는 것을 막는다.
export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}
