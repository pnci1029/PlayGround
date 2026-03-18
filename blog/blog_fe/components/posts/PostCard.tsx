import Link from 'next/link';

interface PostCardProps {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readingTime: number;
  content?: string;
}

export default function PostCard({ 
  title, 
  slug, 
  excerpt, 
  category, 
  tags, 
  publishedAt, 
  readingTime 
}: PostCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <article className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-300 overflow-hidden group">
      <div className="p-6">
        {/* 카테고리 */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-soft text-primary">
            {category}
          </span>
          <span className="text-sm text-text-muted">
            {readingTime}분 읽기
          </span>
        </div>

        {/* 제목 */}
        <h2 className="text-xl font-bold text-text-primary mb-3 group-hover:text-primary transition-colors line-clamp-2">
          <Link href={`/post/${slug}`} className="hover:underline">
            {title}
          </Link>
        </h2>

        {/* 요약 */}
        <p className="text-text-secondary mb-4 line-clamp-3 leading-relaxed">
          {excerpt}
        </p>

        {/* 태그 */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-text-muted">
                +{tags.length - 3}개 더
              </span>
            )}
          </div>
        )}

        {/* 메타 정보 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <time className="text-sm text-text-muted">
            {formatDate(publishedAt)}
          </time>
          <Link 
            href={`/post/${slug}`}
            className="inline-flex items-center text-sm font-medium text-primary hover:text-blue-600 transition-colors group"
          >
            읽어보기
            <svg 
              className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}