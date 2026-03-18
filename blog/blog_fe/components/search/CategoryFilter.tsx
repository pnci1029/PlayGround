'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

const categories = [
  { value: '', label: '전체 카테고리' },
  { value: '개발', label: '개발' },
  { value: '독서', label: '독서' },
  { value: '일상', label: '일상' },
  { value: '프로젝트', label: '프로젝트' },
  { value: '튜토리얼', label: '튜토리얼' },
  { value: '리뷰', label: '리뷰' },
];

export default function CategoryFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentCategory = searchParams.get('category') || '';

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    
    // 카테고리 변경 시 페이지를 1로 리셋
    params.delete('page');
    
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? '?' + queryString : ''}`);
  };

  return (
    <select
      value={currentCategory}
      onChange={(e) => handleCategoryChange(e.target.value)}
      className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
    >
      {categories.map((category) => (
        <option key={category.value} value={category.value}>
          {category.label}
        </option>
      ))}
    </select>
  );
}