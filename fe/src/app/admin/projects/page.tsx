'use client'

import { useState, useEffect } from 'react'
import { AdminAPI } from '@/lib/adminApi'

interface Project {
  id: number
  name: string
  display_name: string
  description?: string
  subdomain?: string
  git_repo?: string
  branch: string
  status: 'active' | 'inactive' | 'building' | 'error'
  created_at: string
  created_by_username?: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [error, setError] = useState('')

  const [newProject, setNewProject] = useState({
    name: '',
    display_name: '',
    description: '',
    subdomain: '',
    git_repo: '',
    branch: 'main'
  })

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      // TODO: 실제 API 호출로 대체
      setProjects([
        {
          id: 1,
          name: 'blog',
          display_name: '개인 블로그',
          description: '기술 게시물과 독서 로그를 위한 블로그',
          subdomain: 'blog',
          git_repo: 'https://github.com/user/blog',
          branch: 'main',
          status: 'active',
          created_at: '2024-01-15T10:00:00Z',
          created_by_username: 'admin'
        },
        {
          id: 2,
          name: 'menu',
          display_name: '맛집 추천',
          description: 'AI 기반 맛집 추천 서비스',
          subdomain: 'menu',
          git_repo: 'https://github.com/user/menu-app',
          branch: 'develop',
          status: 'building',
          created_at: '2024-01-10T15:30:00Z',
          created_by_username: 'admin'
        },
        {
          id: 3,
          name: 'portfolio',
          display_name: '포트폴리오',
          description: '개인 포트폴리오 사이트',
          subdomain: 'portfolio',
          git_repo: '',
          branch: 'main',
          status: 'inactive',
          created_at: '2024-01-05T09:15:00Z',
          created_by_username: 'admin'
        }
      ])
    } catch (error) {
      console.error('Failed to load projects:', error)
      setError('프로젝트 목록을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // TODO: 실제 API 호출
      console.log('Creating project:', newProject)
      
      // 임시로 로컬 상태 업데이트
      const newId = Math.max(...projects.map(p => p.id)) + 1
      const project: Project = {
        id: newId,
        ...newProject,
        status: 'inactive',
        created_at: new Date().toISOString(),
        created_by_username: 'admin'
      }
      
      setProjects([project, ...projects])
      setShowCreateModal(false)
      setNewProject({
        name: '',
        display_name: '',
        description: '',
        subdomain: '',
        git_repo: '',
        branch: 'main'
      })
    } catch (error) {
      console.error('Failed to create project:', error)
      setError('프로젝트 생성에 실패했습니다')
    }
  }

  const getStatusBadge = (status: Project['status']) => {
    const styles = {
      active: 'bg-green-600 text-green-100',
      inactive: 'bg-gray-600 text-gray-100', 
      building: 'bg-yellow-600 text-yellow-100',
      error: 'bg-red-600 text-red-100'
    }

    const labels = {
      active: '활성',
      inactive: '비활성',
      building: '빌드 중',
      error: '오류'
    }

    return (
      <span className={`px-2 py-1 text-xs rounded ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 pt-20">
        <div className="text-center">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20">
      {/* Header */}
      <header className="bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold">프로젝트 관리</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm transition-colors"
            >
              새 프로젝트 추가
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-600 bg-opacity-20 border border-red-600 text-red-100 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium">{project.display_name}</h3>
                {getStatusBadge(project.status)}
              </div>
              
              <p className="text-gray-400 text-sm mb-4">
                {project.description || '설명이 없습니다'}
              </p>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">프로젝트명:</span>
                  <span className="ml-2 font-mono">{project.name}</span>
                </div>
                {project.subdomain && (
                  <div>
                    <span className="text-gray-400">서브도메인:</span>
                    <span className="ml-2 font-mono text-blue-400">
                      {project.subdomain}.playground.com
                    </span>
                  </div>
                )}
                {project.git_repo && (
                  <div>
                    <span className="text-gray-400">저장소:</span>
                    <a 
                      href={project.git_repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-purple-400 hover:text-purple-300 text-xs break-all"
                    >
                      {project.git_repo}
                    </a>
                  </div>
                )}
                <div>
                  <span className="text-gray-400">브랜치:</span>
                  <span className="ml-2 font-mono">{project.branch}</span>
                </div>
                <div>
                  <span className="text-gray-400">생성일:</span>
                  <span className="ml-2">{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-6 flex space-x-2">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm transition-colors">
                  설정
                </button>
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm transition-colors">
                  배포
                </button>
                <button className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm transition-colors">
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              아직 프로젝트가 없습니다
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors"
            >
              첫 번째 프로젝트 만들기
            </button>
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-bold mb-4">새 프로젝트 생성</h2>
            
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  프로젝트명 *
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="blog, portfolio, etc..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  표시 이름 *
                </label>
                <input
                  type="text"
                  value={newProject.display_name}
                  onChange={(e) => setNewProject({...newProject, display_name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="개인 블로그"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  설명
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="프로젝트에 대한 간단한 설명..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  서브도메인
                </label>
                <input
                  type="text"
                  value={newProject.subdomain}
                  onChange={(e) => setNewProject({...newProject, subdomain: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="blog (선택사항)"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {newProject.subdomain}.playground.com으로 접근 가능
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors"
                >
                  생성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}