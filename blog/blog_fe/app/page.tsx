import MainLayout from '@/components/layout/MainLayout';

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
        
        <div className="text-center py-16">
          <div className="text-text-muted mb-4">
            <svg className="w-16 h-16 mx-auto mb-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-text-secondary mb-2">
              아직 작성된 포스트가 없습니다
            </h3>
            <p className="text-text-muted">
              첫 번째 글을 작성해보세요!
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}