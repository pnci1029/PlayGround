import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function PostPage({ params }: PageProps) {
  // In real implementation, fetch post by slug
  // const post = await api.posts.get(params.slug);
  
  // Since there are no real posts yet, return 404
  notFound();
}

export function generateMetadata({ params }: PageProps) {
  return {
    title: '포스트를 찾을 수 없습니다',
    description: '요청한 포스트가 존재하지 않습니다',
  };
}