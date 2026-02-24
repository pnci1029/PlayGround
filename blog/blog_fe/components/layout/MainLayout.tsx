'use client';

import Link from 'next/link';
import { useState } from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export default function MainLayout({ children, showSidebar = true }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const categories = [
    { name: '개발', slug: 'dev', count: 12 },
    { name: '독서', slug: 'reading', count: 8 },
    { name: '일상', slug: 'life', count: 5 },
    { name: '리뷰', slug: 'review', count: 3 },
  ];

  const recentPosts = [
    { title: '블로그 시스템 구축하기', slug: 'building-blog-system', date: '2024-02-24' },
    { title: '클린 아키텍처 독서 노트', slug: 'clean-architecture-notes', date: '2024-02-20' },
    { title: 'Next.js 16의 새로운 기능들', slug: 'nextjs-16-features', date: '2024-02-18' },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Top Navigation */}
      <header className="border-b border-gray-200 bg-surface sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold text-text-primary hover:text-primary transition-colors">
                Tech Journal
              </Link>
              
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/" className="text-text-secondary hover:text-primary transition-colors">
                  홈
                </Link>
                <Link href="/category/dev" className="text-text-secondary hover:text-primary transition-colors">
                  개발
                </Link>
                <Link href="/category/reading" className="text-text-secondary hover:text-primary transition-colors">
                  독서
                </Link>
                <Link href="/search" className="text-text-secondary hover:text-primary transition-colors">
                  검색
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/write"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                글쓰기
              </Link>
              
              {showSidebar && (
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="md:hidden p-2 text-text-secondary hover:text-primary"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className={`flex ${showSidebar ? 'lg:space-x-8' : ''}`}>
          {/* Main Content */}
          <main className={showSidebar ? 'flex-1 lg:max-w-3xl' : 'w-full max-w-4xl mx-auto'}>
            {children}
          </main>

          {/* Sidebar */}
          {showSidebar && (
            <aside className={`
              w-full lg:w-80 lg:flex-shrink-0
              ${isSidebarOpen ? 'block' : 'hidden'} lg:block
            `}>
              <div className="sticky top-24 space-y-6">
                {/* Categories */}
                <div className="bg-surface-elevated rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-text-primary mb-4">카테고리</h2>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/category/${category.slug}`}
                        className="flex items-center justify-between py-2 px-3 rounded hover:bg-primary-soft hover:text-primary transition-colors group"
                      >
                        <span className="text-text-secondary group-hover:text-primary">
                          {category.name}
                        </span>
                        <span className="text-xs text-text-muted bg-surface px-2 py-1 rounded">
                          {category.count}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Recent Posts */}
                <div className="bg-surface-elevated rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-text-primary mb-4">최근 포스트</h2>
                  <div className="space-y-4">
                    {recentPosts.map((post) => (
                      <Link
                        key={post.slug}
                        href={`/post/${post.slug}`}
                        className="block group"
                      >
                        <h3 className="font-medium text-text-primary group-hover:text-primary transition-colors mb-1 line-clamp-2">
                          {post.title}
                        </h3>
                        <time className="text-xs text-text-muted">
                          {new Date(post.date).toLocaleDateString('ko')}
                        </time>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* About */}
                <div className="bg-surface-elevated rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-text-primary mb-4">About</h2>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    개발과 독서를 통해 배운 것들을 정리하는 개인 기술 블로그입니다. 
                    깔끔하고 읽기 편한 환경에서 지식을 공유합니다.
                  </p>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}