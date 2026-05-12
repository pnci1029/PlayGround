'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([
    // 더미 데이터 - 실제로는 API에서 가져와야 함
    {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      lastLogin: '2024-03-15T10:30:00Z'
    }
  ]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'viewer' as User['role']
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 실제로는 API 호출을 해야 함
    const user: User = {
      id: Date.now().toString(),
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    setUsers([...users, user]);
    setNewUser({ username: '', email: '', password: '', role: 'viewer' });
    setShowAddUser(false);
    alert('사용자가 추가되었습니다.');
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ));
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      setUsers(users.filter(user => user.id !== userId));
      alert('사용자가 삭제되었습니다.');
    }
  };

  const handleChangeRole = (userId: string, newRole: User['role']) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, role: newRole }
        : user
    ));
  };

  const getRoleBadgeClass = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return '관리자';
      case 'editor':
        return '편집자';
      case 'viewer':
        return '조회자';
      default:
        return '알 수 없음';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">사용자 관리</h2>
        <button
          onClick={() => setShowAddUser(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          사용자 추가
        </button>
      </div>

      {/* 사용자 목록 */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">사용자명</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">이메일</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">역할</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">상태</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">마지막 로그인</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="ml-3 font-medium">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleChangeRole(user.id, e.target.value as User['role'])}
                      className={`px-2 py-1 text-xs rounded-full border-0 ${getRoleBadgeClass(user.role)}`}
                      disabled={user.role === 'admin' && user.id === '1'} // 메인 관리자는 변경 불가
                    >
                      <option value="admin">관리자</option>
                      <option value="editor">편집자</option>
                      <option value="viewer">조회자</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleString()
                      : '로그인 기록 없음'
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleUserStatus(user.id)}
                        className="text-orange-600 hover:text-orange-800 text-sm"
                        disabled={user.role === 'admin' && user.id === '1'}
                      >
                        {user.isActive ? '비활성화' : '활성화'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        disabled={user.role === 'admin' && user.id === '1'}
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

      {/* 사용자 추가 모달 */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">새 사용자 추가</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사용자명
                </label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  역할
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as User['role']})}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="viewer">조회자</option>
                  <option value="editor">편집자</option>
                  <option value="admin">관리자</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 사용자 통계 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900">전체 사용자</h4>
          <p className="text-2xl font-bold text-blue-700">{users.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900">활성 사용자</h4>
          <p className="text-2xl font-bold text-green-700">
            {users.filter(u => u.isActive).length}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-medium text-purple-900">관리자</h4>
          <p className="text-2xl font-bold text-purple-700">
            {users.filter(u => u.role === 'admin').length}
          </p>
        </div>
      </div>
    </div>
  );
}