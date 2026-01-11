import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // 로컬 개발 환경에서의 포트 제거
  const cleanHostname = hostname.replace(/:\d+$/, '')

  // 서브도메인 라우팅
  if (cleanHostname.startsWith('tools.')) {
    return NextResponse.rewrite(new URL(`/tools${pathname}`, request.url))
  }
  
  if (cleanHostname.startsWith('canvas.')) {
    return NextResponse.rewrite(new URL(`/canvas${pathname}`, request.url))
  }
  
  if (cleanHostname.startsWith('admin.')) {
    return NextResponse.rewrite(new URL(`/admin${pathname}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}