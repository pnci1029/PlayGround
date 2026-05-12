'use client';

import { useState } from 'react';
import type { Post } from '@/types';
import { api } from '@/lib/api';

interface AdminPostListProps {
  posts: Post[];
  onRefresh: () => void;
  isLoading: boolean;
}

export default function AdminPostList({ posts, onRefresh, isLoading }: AdminPostListProps) {
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPosts = posts.filter(post => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'published' && post.isPublished) || 
      (filter === 'draft' && !post.isPublished);
    
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleDeletePost = async (postId: string) => {
    if (!confirm('정말로 이 게시물을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await api.posts.delete(postId);
      onRefresh();
      alert('게시물이 삭제되었습니다.');
    } catch (error) {
      console.error('게시물 삭제 실패:', error);
      alert('게시물 삭제에 실패했습니다.');
    }
  };

  const handleTogglePublish = async (post: Post) => {
    try {
      await api.posts.update(post.id, {
        ...post,
        isPublished: !post.isPublished
      });
      onRefresh();
    } catch (error) {
      console.error('게시물 상태 변경 실패:', error);
      alert('게시물 상태 변경에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">게시물 관리</h2>
        <button 
          onClick={onRefresh}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          새로고침
        </button>
      </div>

      {/* 필터 및 검색 */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* 필터 버튼 */}
          <div className="flex space-x-2">
            {[
              { key: 'all' as const, label: '전체' },
              { key: 'published' as const, label: '발행됨' },
              { key: 'draft' as const, label: '임시저장' }
            ].map(option => (
              <button
                key={option.key}
                onClick={() => setFilter(option.key)}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === option.key
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* 검색 */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="제목이나 카테고리로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* 게시물 목록 */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">게시물이 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">제목</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">카테고리</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">상태</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">작성일</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <h3 className="font-medium">{post.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{post.excerpt}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        post.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.isPublished ? '발행됨' : '임시저장'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(post.publishedAt || post.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.open(`/post/${post.slug}`, '_blank')}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          보기
                        </button>
                        <button
                          onClick={() => window.open(`/write?edit=${post.id}`, '_blank')}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          편집
                        </button>
                        <button
                          onClick={() => handleTogglePublish(post)}
                          className="text-orange-600 hover:text-orange-800 text-sm"
                        >
                          {post.isPublished ? '숨김' : '발행'}
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 통계 */}
      <div className="mt-6 text-sm text-gray-600">
        총 {filteredPosts.length}개의 게시물 
        {filter !== 'all' && ` (${filter === 'published' ? '발행됨' : '임시저장'})`}
      </div>
    </div>
  );
}