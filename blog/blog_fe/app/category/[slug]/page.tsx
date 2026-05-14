import { notFound } from 'next/navigation';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;

  // 카테고리 유효성 검사
  const validCategories = ['dev', 'reading', 'life', 'review'];
  if (!validCategories.includes(slug)) {
    notFound();
  }

  const categoryNames = {
    dev: '개발',
    reading: '독서', 
    life: '일상',
    review: '리뷰'
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {categoryNames[slug as keyof typeof categoryNames]} 카테고리
      </h1>
      
      <div className="text-center py-16 text-gray-500">
        <p className="text-xl mb-4">아직 이 카테고리에 게시물이 없습니다.</p>
        <p>첫 번째 게시물을 작성해보세요!</p>
      </div>
    </div>
  );
}