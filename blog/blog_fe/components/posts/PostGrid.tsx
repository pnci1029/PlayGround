'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PostCard from './PostCard';
import Pagination from './Pagination';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
}

interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  totalPages: number;
}

export default function PostGrid() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        
        // URL 파라미터에서 검색 조건 가져오기
        const search = searchParams.get('search');
        const category = searchParams.get('category');
        const page = searchParams.get('page') || '1';
        const sortBy = searchParams.get('sortBy') || 'publishedAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        if (search) params.append('search', search);
        if (category) params.append('category', category);
        params.append('page', page);
        params.append('limit', '9');
        params.append('sortBy', sortBy);
        params.append('sortOrder', sortOrder);

        const response = await fetch(`/api/posts?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('포스트를 불러오는데 실패했습니다');
        }

        const data: PostsResponse = await response.json();
        setPosts(data.posts || []);
        setPagination({
          page: data.page,
          totalPages: data.totalPages,
          total: data.total
        });
      } catch (error) {
        console.error('포스트 로딩 오류:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-64 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    const hasFilters = searchParams.get('search') || searchParams.get('category');
    
    return (
      <div className="text-center py-16">
        <div className="text-text-muted mb-4">
          <svg className="w-16 h-16 mx-auto mb-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-text-secondary mb-2">
            {hasFilters ? '검색 결과가 없습니다' : '아직 작성된 포스트가 없습니다'}
          </h3>
          <p className="text-text-muted">
            {hasFilters ? '다른 검색어나 필터를 시도해보세요' : '첫 번째 글을 작성해보세요!'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 포스트 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            id={post.id}
            title={post.title}
            slug={post.slug}
            excerpt={post.excerpt}
            category={post.category}
            tags={post.tags}
            publishedAt={post.publishedAt}
            readingTime={post.readingTime}
          />
        ))}
      </div>

      {/* 페이지네이션 */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
        />
      )}

      {/* 결과 요약 */}
      <div className="text-center text-sm text-text-muted">
        총 {pagination.total}개의 포스트 중 {posts.length}개 표시
      </div>
    </div>
  );
}