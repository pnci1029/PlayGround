'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { Post } from '@/types';
import AdminPostList from './AdminPostList';
import AdminStats from './AdminStats';
import AdminUserManagement from './AdminUserManagement';

type TabType = 'posts' | 'stats' | 'users' | 'settings';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshPosts = async () => {
    try {
      setIsLoading(true);
      const response = await api.posts.list();
      setPosts(response.posts || []);
    } catch (error) {
      console.error('게시물 로딩 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'posts') {
      refreshPosts();
    }
  }, [activeTab]);

  const handleLogout = () => {
    sessionStorage.removeItem('blog_auth');
    window.location.reload();
  };

  const tabs = [
    { id: 'stats' as const, label: '대시보드', icon: '📊' },
    { id: 'posts' as const, label: '게시물 관리', icon: '📝' },
    { id: 'users' as const, label: '사용자 관리', icon: '👥' },
    { id: 'settings' as const, label: '설정', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.open('/write', '_blank')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                새 글 작성
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 사이드바 */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-lg shadow-sm border p-4">
              <ul className="space-y-2">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border">
              {activeTab === 'stats' && <AdminStats />}
              {activeTab === 'posts' && (
                <AdminPostList 
                  posts={posts} 
                  onRefresh={refreshPosts}
                  isLoading={isLoading}
                />
              )}
              {activeTab === 'users' && <AdminUserManagement />}
              {activeTab === 'settings' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">시스템 설정</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        블로그 제목
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                        defaultValue="개발자 블로그"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        관리자 비밀번호 변경
                      </label>
                      <input
                        type="password"
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="새 비밀번호"
                      />
                    </div>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                      설정 저장
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}