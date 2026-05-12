import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    // 환경변수에서 관리자 계정 정보 가져오기
    const adminUsername = process.env.BLOG_ADMIN_USERNAME;
    const adminPassword = process.env.BLOG_ADMIN_PASSWORD;
    
    if (!adminPassword || !adminUsername) {
      return NextResponse.json(
        { error: 'Admin credentials not configured' },
        { status: 500 }
      );
    }
    
    // 사용자명과 비밀번호 검증
    if (username === adminUsername && password === adminPassword) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}