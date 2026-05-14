'use client';

import { useState, useEffect } from 'react';
import UserLoginModal from './UserLoginModal';

export default function UserLoginButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState<{ username: string; display_name?: string } | null>(null);

  useEffect(() => {
    // 사용자 로그인 상태 확인
    const token = localStorage.getItem('user_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsLoggedIn(true);
      } catch (error) {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_data');
      }
    }
  }, []);

  const handleLogin = (userData: any, token: string) => {
    localStorage.setItem('user_token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setIsLoggedIn(false);
  };

  const handleWrite = () => {
    // 글쓰기 페이지로 이동
    window.location.href = '/write';
  };

  if (isLoggedIn && user) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          안녕하세요, {user.display_name || user.username}님
        </span>
        <button
          onClick={handleWrite}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>글쓰기</span>
        </button>
        <button
          onClick={handleLogout}
          className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowLoginModal(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>글쓰기</span>
      </button>
      
      {showLoginModal && (
        <UserLoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
        />
      )}
    </>
  );
}