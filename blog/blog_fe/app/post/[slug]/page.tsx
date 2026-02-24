import PostReader from '@/components/reader/PostReader';
import { Post } from '@/types';

// Mock data - in real implementation, this would fetch from API
const mockPost: Post = {
  id: '1',
  title: '블로그 시스템 구축하기',
  slug: 'building-blog-system',
  content: `
# 개인 기술 블로그 구축기

개인 기술 블로그를 만들면서 고려한 설계 원칙들과 구현 과정을 정리해보았습니다.

## 설계 철학

블로그를 만들면서 가장 중요하게 생각한 것은 **읽기 경험의 최적화**였습니다. 

### 1. Typography First

가독성을 위해 다음과 같은 요소들을 고려했습니다:

- Inter 폰트를 사용한 깔끔한 본문
- JetBrains Mono를 사용한 코드 블록
- 18px 크기의 본문과 1.7 line-height로 편안한 읽기 환경

\`\`\`typescript
// 타이포그래피 설정 예시
const typography = {
  fontSize: {
    reading: ['18px', { lineHeight: '1.7' }],
    code: ['16px', { lineHeight: '1.6' }],
  },
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Monaco', 'Consolas'],
  }
}
\`\`\`

### 2. 개발자 친화적 기능

코드 블록에서는 다음과 같은 기능들을 제공합니다:

- 문법 강조
- 언어 표시
- 복사 버튼 (구현 예정)

\`\`\`python
def calculate_reading_time(content: str) -> int:
    words_per_minute = 200
    words = len(content.split())
    return math.ceil(words / words_per_minute)
\`\`\`

### 3. 미니멀한 디자인

> 컨텐츠에 집중할 수 있는 미니멀한 디자인을 추구했습니다.

불필요한 요소들을 제거하고, 순수한 내용에 집중할 수 있는 환경을 만들고자 했습니다.

## 기술 스택

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: TailwindCSS 
- **Editor**: TipTap (WYSIWYG) + Monaco Editor (코드)
- **Backend**: Fastify, PostgreSQL

## 마무리

개발자가 쓰고 읽기 편한 블로그를 만드는 것이 목표였습니다. 앞으로도 지속적으로 개선해 나갈 예정입니다.
`,
  excerpt: '개인 기술 블로그를 만들면서 고려한 설계 원칙들과 구현 과정을 정리해보았습니다. 마크다운 에디터부터 읽기 최적화까지, 개발자가 쓰고 읽기 편한 블로그를 만드는 여정을 담았습니다.',
  category: '개발',
  tags: ['Next.js', 'TypeScript', 'TailwindCSS', 'TipTap'],
  publishedAt: new Date('2024-02-24'),
  updatedAt: new Date('2024-02-24'),
  readingTime: 5,
  codeLanguages: ['typescript', 'python'],
  isPublished: true
};

interface PageProps {
  params: {
    slug: string;
  };
}

export default function PostPage({ params }: PageProps) {
  // In real implementation, fetch post by slug
  // const post = await api.posts.get(params.slug);
  
  return <PostReader post={mockPost} />;
}

export function generateMetadata({ params }: PageProps) {
  return {
    title: mockPost.title,
    description: mockPost.excerpt,
  };
}