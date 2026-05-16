'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'writer' | 'viewer';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    nickname: ''
  });
  const [validationErrors, setValidationErrors] = useState<{field: string, message: string}[]>([]);

  // 사용자 목록 불러오기
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (response.ok) {
        const userData = await response.json();
        setUsers(userData);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]); // Clear previous errors
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        const user = await response.json();
        setUsers([...users, user]);
        setNewUser({ username: '', password: '', nickname: '' });
        setShowAddUser(false);
        alert('사용자가 추가되었습니다.');
      } else {
        const error = await response.json();
        if (error.details && Array.isArray(error.details)) {
          setValidationErrors(error.details);
        } else {
          alert(error.error || '사용자 추가에 실패했습니다.');
        }
      }
    } catch (error) {
      alert('사용자 추가 중 오류가 발생했습니다.');
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !user.isActive })
      });

      if (response.ok) {
        setUsers(users.map(u => 
          u.id === userId ? { ...u, isActive: !u.isActive } : u
        ));
      }
    } catch (error) {
      alert('사용자 상태 변경에 실패했습니다.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setUsers(users.filter(user => user.id !== userId));
          alert('사용자가 삭제되었습니다.');
        } else {
          alert('사용자 삭제에 실패했습니다.');
        }
      } catch (error) {
        alert('사용자 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleChangeRole = async (userId: string, newRole: User['role']) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
      }
    } catch (error) {
      alert('권한 변경에 실패했습니다.');
    }
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
                  사용자 아이디
                </label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => {
                    setNewUser({...newUser, username: e.target.value});
                    setValidationErrors(prev => prev.filter(err => err.field !== 'username'));
                  }}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    validationErrors.some(err => err.field === 'username') 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="로그인용 아이디 입력"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  닉네임
                </label>
                <input
                  type="text"
                  value={newUser.nickname}
                  onChange={(e) => {
                    setNewUser({...newUser, nickname: e.target.value});
                    setValidationErrors(prev => prev.filter(err => err.field !== 'nickname'));
                  }}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    validationErrors.some(err => err.field === 'nickname') 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="화면에 표시될 닉네임 입력"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  관리자 비밀번호
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => {
                    setNewUser({...newUser, password: e.target.value});
                    setValidationErrors(prev => prev.filter(err => err.field !== 'password'));
                  }}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    validationErrors.some(err => err.field === 'password') 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="비밀번호 입력"
                  required
                />
              </div>
              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-red-800 mb-2">입력 오류:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-1">•</span>
                        <span>
                          <strong>{error.field === 'username' ? '사용자명' : error.field === 'password' ? '비밀번호' : error.field}:</strong> {' '}
                          {error.message === 'Username can only contain letters, numbers and underscores' ? 
                            '사용자명은 영문, 숫자, 언더스코어만 사용 가능합니다' :
                           error.message === 'Too small: expected string to have >=3 characters' && error.field === 'username' ?
                            '사용자명은 최소 3자 이상이어야 합니다' :
                           error.message === 'Too small: expected string to have >=6 characters' && error.field === 'password' ?
                            '비밀번호는 최소 6자 이상이어야 합니다' :
                           error.message}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>관리자 권한으로 자동 생성됩니다</strong><br/>
                  이메일과 디스플레이 이름은 자동으로 설정됩니다.
                </p>
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