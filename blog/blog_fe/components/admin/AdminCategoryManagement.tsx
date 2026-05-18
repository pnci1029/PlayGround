'use client';

import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminCategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('user_token');
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newCategory)
      });

      if (response.ok) {
        const category = await response.json();
        setCategories([...categories, category]);
        setNewCategory({ name: '', description: '', color: '#3B82F6' });
        setShowAddCategory(false);
        alert('카테고리가 추가되었습니다.');
      } else {
        const error = await response.json();
        alert(error.error || '카테고리 추가에 실패했습니다.');
      }
    } catch (error) {
      alert('카테고리 추가 중 오류가 발생했습니다.');
    }
  };

  const handleToggleCategoryStatus = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    try {
      const token = localStorage.getItem('user_token');
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !category.is_active })
      });

      if (response.ok) {
        setCategories(categories.map(c => 
          c.id === categoryId ? { ...c, is_active: !c.is_active } : c
        ));
      }
    } catch (error) {
      alert('카테고리 상태 변경에 실패했습니다.');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('정말로 이 카테고리를 삭제하시겠습니까?')) {
      try {
        const token = localStorage.getItem('user_token');
        const response = await fetch(`/api/categories/${categoryId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setCategories(categories.filter(c => c.id !== categoryId));
          alert('카테고리가 삭제되었습니다.');
        } else {
          alert('카테고리 삭제에 실패했습니다.');
        }
      } catch (error) {
        alert('카테고리 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">카테고리 관리</h2>
        <button
          onClick={() => setShowAddCategory(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          카테고리 추가
        </button>
      </div>

      {/* 카테고리 목록 */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">이름</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">슬러그</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">설명</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">색상</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">상태</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded mr-3"
                        style={{ backgroundColor: category.color || '#3B82F6' }}
                      ></div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-sm">{category.slug}</td>
                  <td className="px-4 py-3 text-gray-600">{category.description || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div 
                        className="w-6 h-6 rounded mr-2 border"
                        style={{ backgroundColor: category.color || '#3B82F6' }}
                      ></div>
                      <span className="text-sm font-mono">{category.color || '#3B82F6'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      category.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.is_active ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleCategoryStatus(category.id)}
                        className="text-orange-600 hover:text-orange-800 text-sm"
                      >
                        {category.is_active ? '비활성화' : '활성화'}
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
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

      {/* 카테고리 추가 모달 */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">새 카테고리 추가</h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리 이름
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="예: 개발, 독서, 일상..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명 (선택)
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="카테고리에 대한 간단한 설명..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  색상
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                    className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                    className="flex-1 border rounded-lg px-3 py-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddCategory(false)}
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

      {/* 카테고리 통계 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900">전체 카테고리</h4>
          <p className="text-2xl font-bold text-blue-700">{categories.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900">활성 카테고리</h4>
          <p className="text-2xl font-bold text-green-700">
            {categories.filter(c => c.is_active).length}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900">비활성 카테고리</h4>
          <p className="text-2xl font-bold text-gray-700">
            {categories.filter(c => !c.is_active).length}
          </p>
        </div>
      </div>
    </div>
  );
}