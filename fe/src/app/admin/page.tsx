'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Admin {
  id: number
  username: string
  email: string
  name?: string
  role: string
  last_login_at?: string
  created_at: string
}

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalSubdomains: 0,
    recentDeployments: 0
  })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadDashboardData()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        router.push('/admin/login')
        return
      }

      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        localStorage.removeItem('admin_token')
        router.push('/admin/login')
        return
      }

      const data = await response.json()
      if (data.success) {
        setAdmin(data.admin)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const loadDashboardData = async () => {
    // TODO: 실제 API 호출로 대체
    setStats({
      totalProjects: 5,
      activeProjects: 3,
      totalSubdomains: 8,
      recentDeployments: 12
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">관리자 대시보드</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">
                {admin?.name || admin?.username}님 안녕하세요
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <a href="/admin" className="border-b-2 border-purple-500 text-purple-400 py-4 px-1 text-sm font-medium">
              대시보드
            </a>
            <a href="/admin/projects" className="text-gray-300 hover:text-white py-4 px-1 text-sm font-medium">
              프로젝트
            </a>
            <a href="/admin/subdomains" className="text-gray-300 hover:text-white py-4 px-1 text-sm font-medium">
              서브도메인
            </a>
            <a href="/admin/deployments" className="text-gray-300 hover:text-white py-4 px-1 text-sm font-medium">
              배포 관리
            </a>
            <a href="/admin/settings" className="text-gray-300 hover:text-white py-4 px-1 text-sm font-medium">
              설정
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">
            {admin?.name || admin?.username}님, 환영합니다! 👋
          </h2>
          <p className="text-purple-100">
            플레이그라운드 관리자 패널에서 프로젝트와 서브도메인을 관리하세요
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">전체 프로젝트</p>
                <p className="text-2xl font-semibold">{stats.totalProjects}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">활성 프로젝트</p>
                <p className="text-2xl font-semibold">{stats.activeProjects}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">서브도메인</p>
                <p className="text-2xl font-semibold">{stats.totalSubdomains}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">이번 달 배포</p>
                <p className="text-2xl font-semibold">{stats.recentDeployments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Projects */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-medium mb-4">최근 프로젝트</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <div>
                  <p className="font-medium">블로그 사이트</p>
                  <p className="text-sm text-gray-400">blog.playground.com</p>
                </div>
                <span className="px-2 py-1 bg-green-600 text-green-100 text-xs rounded">활성</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <div>
                  <p className="font-medium">맛집 추천</p>
                  <p className="text-sm text-gray-400">menu.playground.com</p>
                </div>
                <span className="px-2 py-1 bg-yellow-600 text-yellow-100 text-xs rounded">빌드 중</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <div>
                  <p className="font-medium">포트폴리오</p>
                  <p className="text-sm text-gray-400">portfolio.playground.com</p>
                </div>
                <span className="px-2 py-1 bg-gray-600 text-gray-100 text-xs rounded">비활성</span>
              </div>
            </div>
            <button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors">
              모든 프로젝트 보기
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-medium mb-4">빠른 작업</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-center transition-colors">
                <div className="w-8 h-8 mx-auto mb-2">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-sm">새 프로젝트</p>
              </button>
              
              <button className="p-4 bg-green-600 hover:bg-green-700 rounded-lg text-center transition-colors">
                <div className="w-8 h-8 mx-auto mb-2">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
                <p className="text-sm">서브도메인 추가</p>
              </button>
              
              <button className="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-center transition-colors">
                <div className="w-8 h-8 mx-auto mb-2">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <p className="text-sm">배포 실행</p>
              </button>
              
              <button className="p-4 bg-gray-600 hover:bg-gray-700 rounded-lg text-center transition-colors">
                <div className="w-8 h-8 mx-auto mb-2">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-sm">시스템 설정</p>
              </button>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-medium mb-4">시스템 상태</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">데이터베이스: 정상</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">서버: 정상</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">배포 시스템: 점검 중</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}