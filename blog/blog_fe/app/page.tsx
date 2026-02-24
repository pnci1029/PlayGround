import MainLayout from '@/components/layout/MainLayout';
import PostCard from '@/components/reader/PostCard';
import { Post } from '@/types';

// Mock data for demonstration
const mockPosts: Post[] = [
  {
    id: '1',
    title: '블로그 시스템 구축하기',
    slug: 'building-blog-system',
    content: '개인 기술 블로그를 만들면서...',
    excerpt: '개인 기술 블로그를 만들면서 고려한 설계 원칙들과 구현 과정을 정리해보았습니다. 마크다운 에디터부터 읽기 최적화까지, 개발자가 쓰고 읽기 편한 블로그를 만드는 여정을 담았습니다.',
    category: '개발',
    tags: ['Next.js', 'TypeScript', 'TailwindCSS'],
    publishedAt: new Date('2024-02-24'),
    updatedAt: new Date('2024-02-24'),
    readingTime: 5,
    codeLanguages: ['typescript', 'javascript', 'css'],
    isPublished: true
  },
  {
    id: '2',
    title: '클린 아키텍처 독서 노트',
    slug: 'clean-architecture-notes',
    content: '로버트 C. 마틴의 클린 아키텍처를 읽으며...',
    excerpt: '로버트 C. 마틴의 클린 아키텍처를 읽으며 정리한 핵심 개념들입니다. 의존성 규칙부터 경계와 플러그인 아키텍처까지, 실무에 적용할 수 있는 인사이트를 담았습니다.',
    category: '독서',
    tags: ['아키텍처', '설계', '클린코드'],
    publishedAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-20'),
    readingTime: 8,
    codeLanguages: [],
    isPublished: true
  }
];

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
        
        {mockPosts.map((post, index) => (
          <PostCard 
            key={post.id} 
            post={post} 
            variant={index === 0 ? 'featured' : 'default'}
          />
        ))}
      </div>
    </MainLayout>
  )
}