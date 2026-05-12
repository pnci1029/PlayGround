import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'https://blog-api.chhong.kr';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const backendUrl = `${API_BASE_URL}/api/posts/${id}`;
    
    const response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Post GET API error:', error);
    
    // 개발 환경에서는 더미 데이터 반환
    if (process.env.NODE_ENV === 'development') {
      const { id } = await params;
      return NextResponse.json({
        id: id,
        title: 'Sample Post',
        slug: 'sample-post',
        content: '<p>This is a sample post content.</p>',
        excerpt: 'This is a sample post excerpt.',
        category: '개발',
        tags: ['Sample', 'Test'],
        isPublished: true,
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        readingTime: 5
      });
    }

    return NextResponse.json(
      { error: '게시물을 불러올 수 없습니다' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const backendUrl = `${API_BASE_URL}/api/posts/${id}`;
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Post PUT API error:', error);
    
    // 개발 환경에서는 성공 응답
    if (process.env.NODE_ENV === 'development') {
      const { id } = await params;
      return NextResponse.json({
        id: id,
        ...await request.json(),
        updatedAt: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { error: '게시물을 수정할 수 없습니다' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const backendUrl = `${API_BASE_URL}/api/posts/${id}`;
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Post DELETE API error:', error);
    
    // 개발 환경에서는 성공 응답
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ message: '게시물이 삭제되었습니다' });
    }

    return NextResponse.json(
      { error: '게시물을 삭제할 수 없습니다' },
      { status: 500 }
    );
  }
}