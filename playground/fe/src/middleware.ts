import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // 서브도메인 감지 (포트 제거)
  const hostParts = hostname.split(':')[0].split('.')
  const subdomain = hostParts[0]
  
  console.log('🔍 Middleware Debug:', { hostname, subdomain, pathname })
  
  // localhost 개발환경 처리
  if (hostname.includes('localhost')) {
    // admin.localhost:3002 -> /admin
    if (subdomain === 'admin') {
      const rewriteUrl = `/admin${pathname === '/' ? '' : pathname}`
      console.log('👑 Admin rewrite:', rewriteUrl)
      return NextResponse.rewrite(new URL(rewriteUrl, request.url))
    }
    
    // blog.localhost:3002 -> /blog  
    if (subdomain === 'blog') {
      return NextResponse.rewrite(new URL(`/blog${pathname}`, request.url))
    }
    
    // 기본 localhost -> 메인 사이트
    return NextResponse.next()
  }

  // 프로덕션 환경에서 서브도메인 처리
  if (hostname.includes('playground.com')) {
    // admin.playground.com -> /admin
    if (subdomain === 'admin') {
      return NextResponse.rewrite(new URL(`/admin${pathname}`, request.url))
    }
    
    // blog.playground.com -> /blog
    if (subdomain === 'blog') {
      return NextResponse.rewrite(new URL(`/blog${pathname}`, request.url))
    }

    // menu.playground.com -> /menu (미래)
    if (subdomain === 'menu') {
      return NextResponse.rewrite(new URL(`/menu${pathname}`, request.url))
    }

    // diary.playground.com -> /diary (미래)  
    if (subdomain === 'diary') {
      return NextResponse.rewrite(new URL(`/diary${pathname}`, request.url))
    }
    
    // portfolio.playground.com -> /portfolio (미래)
    if (subdomain === 'portfolio') {
      return NextResponse.rewrite(new URL(`/portfolio${pathname}`, request.url))
    }
  }

  // API 요청은 백엔드로 프록시
  if (pathname.startsWith('/api')) {
    if (!process.env.BACKEND_URL) {
      throw new Error('BACKEND_URL environment variable is required')
    }
    return NextResponse.rewrite(new URL(pathname, process.env.BACKEND_URL))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // API 라우트
    '/api/:path*',
    
    // 정적 파일 제외
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg|ico|css|js)$).*)'
  ]
}