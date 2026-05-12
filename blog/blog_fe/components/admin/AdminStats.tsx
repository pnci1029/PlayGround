'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Stats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  recentPosts: any[];
}

export default function AdminStats() {
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
    recentPosts: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 전체 게시물 가져오기
        const response = await api.posts.list();
        const posts = response.posts || [];
        
        const publishedPosts = posts.filter(post => post.isPublished);
        const draftPosts = posts.filter(post => !post.isPublished);
        
        setStats({
          totalPosts: posts.length,
          publishedPosts: publishedPosts.length,
          draftPosts: draftPosts.length,
          totalViews: 0, // API에서 조회수 데이터가 있다면 사용
          recentPosts: posts.slice(0, 5) // 최근 5개 게시물
        });
      } catch (error) {
        console.error('통계 데이터 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: '총 게시물',
      value: stats.totalPosts,
      icon: '📝',
      color: 'bg-blue-500'
    },
    {
      title: '발행된 게시물',
      value: stats.publishedPosts,
      icon: '✅',
      color: 'bg-green-500'
    },
    {
      title: '임시저장',
      value: stats.draftPosts,
      icon: '📄',
      color: 'bg-yellow-500'
    },
    {
      title: '총 조회수',
      value: stats.totalViews.toLocaleString(),
      icon: '👀',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">대시보드 개요</h2>
      
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg border p-4">
            <div className="flex items-center">
              <div className={`${card.color} text-white rounded-full p-3 text-xl`}>
                {card.icon}
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 최근 게시물 */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">최근 게시물</h3>
        </div>
        <div className="p-4">
          {stats.recentPosts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">게시물이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentPosts.map((post, index) => (
                <div key={post.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{post.title}</h4>
                    <p className="text-sm text-gray-600">
                      {post.category} • {new Date(post.publishedAt || post.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      post.isPublished 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.isPublished ? '발행됨' : '임시저장'}
                    </span>
                    <button 
                      onClick={() => window.open(`/post/${post.slug}`, '_blank')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      보기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}