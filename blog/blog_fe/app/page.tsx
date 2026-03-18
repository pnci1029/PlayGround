import MainLayout from '@/components/layout/MainLayout';
import PostGrid from '@/components/posts/PostGrid';
import SearchBar from '@/components/search/SearchBar';
import CategoryFilter from '@/components/search/CategoryFilter';
import { Suspense } from 'react';

export default function Home() {
  return (
    <MainLayout>
      <div className="space-y-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            최근 포스트
          </h1>
          <p className="text-text-secondary">
            개발과 독서, 그리고 생각의 기록
          </p>
        </header>
        
        {/* 검색 및 필터링 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <SearchBar />
          </div>
          <div className="sm:w-64">
            <CategoryFilter />
          </div>
        </div>
        
        {/* 포스트 그리드 */}
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        }>
          <PostGrid />
        </Suspense>
      </div>
    </MainLayout>
  )
}