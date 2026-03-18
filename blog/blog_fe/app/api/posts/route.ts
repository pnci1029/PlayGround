import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3004';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 쿼리 파라미터를 백엔드로 전달
    const backendUrl = `${API_BASE_URL}/api/posts?${searchParams.toString()}`;
    
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
    console.error('Posts API error:', error);
    
    // 개발 환경에서는 더미 데이터 반환
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        posts: [
          {
            id: '1',
            title: 'Next.js 13 App Router 완벽 가이드',
            slug: 'nextjs-13-app-router-guide',
            content: '<p>Next.js 13의 새로운 App Router에 대한 완벽한 가이드입니다...</p>',
            excerpt: 'Next.js 13에서 도입된 App Router의 핵심 기능들을 알아보고, 실제 프로젝트에 적용하는 방법을 살펴봅니다.',
            category: '개발',
            tags: ['Next.js', 'React', '웹개발'],
            isPublished: true,
            publishedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            readingTime: 8
          },
          {
            id: '2',
            title: 'TypeScript 고급 타입 시스템',
            slug: 'typescript-advanced-types',
            content: '<p>TypeScript의 고급 타입 시스템을 깊이 있게 다룹니다...</p>',
            excerpt: 'TypeScript의 유니온 타입, 조건부 타입, 매핑 타입 등 고급 기능들을 실제 예제와 함께 설명합니다.',
            category: '개발',
            tags: ['TypeScript', '타입시스템', '개발'],
            isPublished: true,
            publishedAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
            readingTime: 12
          },
          {
            id: '3',
            title: '클린 코드를 읽고',
            slug: 'clean-code-review',
            content: '<p>로버트 C. 마틴의 클린 코드를 읽은 후기입니다...</p>',
            excerpt: '소프트웨어 개발자라면 반드시 읽어야 할 고전, 클린 코드에서 얻은 인사이트를 공유합니다.',
            category: '독서',
            tags: ['클린코드', '책리뷰', '개발철학'],
            isPublished: true,
            publishedAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date(Date.now() - 172800000).toISOString(),
            readingTime: 6
          },
          {
            id: '4',
            title: 'React 18 동시성 기능 살펴보기',
            slug: 'react-18-concurrent-features',
            content: '<p>React 18에서 새로 추가된 동시성 기능들을 살펴봅니다...</p>',
            excerpt: 'Suspense, Transitions, useId 등 React 18의 새로운 동시성 기능들을 실습 예제와 함께 알아봅니다.',
            category: '개발',
            tags: ['React', 'JavaScript', '프론트엔드'],
            isPublished: true,
            publishedAt: new Date(Date.now() - 259200000).toISOString(),
            updatedAt: new Date(Date.now() - 259200000).toISOString(),
            readingTime: 10
          },
          {
            id: '5',
            title: '개발자를 위한 시간 관리법',
            slug: 'time-management-for-developers',
            content: '<p>개발자로서 효율적인 시간 관리 방법을 소개합니다...</p>',
            excerpt: '개발 업무의 특성을 고려한 실용적인 시간 관리 전략과 도구들을 소개합니다.',
            category: '일상',
            tags: ['시간관리', '생산성', '개발자'],
            isPublished: true,
            publishedAt: new Date(Date.now() - 345600000).toISOString(),
            updatedAt: new Date(Date.now() - 345600000).toISOString(),
            readingTime: 7
          },
          {
            id: '6',
            title: '블로그 플랫폼 개발기',
            slug: 'blog-platform-development',
            content: '<p>개인 블로그 플랫폼을 개발하면서 얻은 경험을 공유합니다...</p>',
            excerpt: 'Next.js와 Fastify를 사용해서 개인 블로그 플랫폼을 개발한 과정과 배운 점들을 정리했습니다.',
            category: '프로젝트',
            tags: ['Next.js', 'Fastify', '블로그', 'PostgreSQL'],
            isPublished: true,
            publishedAt: new Date(Date.now() - 432000000).toISOString(),
            updatedAt: new Date(Date.now() - 432000000).toISOString(),
            readingTime: 15
          }
        ],
        total: 6,
        page: 1,
        totalPages: 1
      });
    }

    return NextResponse.json(
      { error: 'Posts를 불러올 수 없습니다' },
      { status: 500 }
    );
  }
}