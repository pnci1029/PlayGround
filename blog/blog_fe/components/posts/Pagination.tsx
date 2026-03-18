'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
}

export default function Pagination({ currentPage, totalPages, total }: PaginationProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? '?' + queryString : ''}`);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const half = Math.floor(maxVisible / 2);
      let start = Math.max(currentPage - half, 1);
      let end = Math.min(start + maxVisible - 1, totalPages);
      
      if (end - start < maxVisible - 1) {
        start = Math.max(end - maxVisible + 1, 1);
      }
      
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* 페이지 정보 */}
      <div className="text-sm text-text-muted">
        페이지 {currentPage} / {totalPages} (총 {total}개)
      </div>

      {/* 페이지네이션 버튼 */}
      <div className="flex items-center space-x-1">
        {/* 이전 페이지 */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          이전
        </button>

        {/* 첫 페이지 */}
        {pageNumbers[0] > 1 && (
          <>
            <button
              onClick={() => goToPage(1)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-primary transition-colors"
            >
              1
            </button>
            {pageNumbers[0] > 2 && (
              <span className="px-2 py-2 text-gray-500">...</span>
            )}
          </>
        )}

        {/* 페이지 번호들 */}
        {pageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => goToPage(pageNumber)}
            className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              pageNumber === currentPage
                ? 'text-white bg-primary border border-primary'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-primary'
            }`}
          >
            {pageNumber}
          </button>
        ))}

        {/* 마지막 페이지 */}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="px-2 py-2 text-gray-500">...</span>
            )}
            <button
              onClick={() => goToPage(totalPages)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-primary transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* 다음 페이지 */}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          다음
          <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}