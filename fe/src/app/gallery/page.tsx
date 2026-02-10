'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Artwork {
  id: number
  title: string
  description?: string
  author_name: string
  thumbnail_url: string
  image_url: string
  views: number
  likes: number
  created_at: string
  version: number
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function GalleryPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'views'>('latest')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchArtworks()
  }, [pagination.page, sortBy])

  const fetchArtworks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort: sortBy
      })

      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(`http://localhost:8085/api/artworks?${params}`)
      if (response.ok) {
        const data = await response.json()
        setArtworks(data.artworks)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch artworks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchArtworks()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--background)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white">작품 갤러리</h1>
            <Link 
              href="/canvas"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              새 작품 만들기
            </Link>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="작품명이나 작가명으로 검색..."
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  검색
                </button>
              </div>
            </form>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="latest">최신순</option>
              <option value="popular">인기순</option>
              <option value="views">조회순</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-400">작품을 불러오는 중...</div>
          </div>
        )}

        {/* Empty State */}
        {!loading && artworks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {searchTerm ? '검색 결과가 없습니다.' : '아직 등록된 작품이 없습니다.'}
            </div>
            <Link 
              href="/canvas"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors"
            >
              첫 번째 작품 만들기
            </Link>
          </div>
        )}

        {/* Artwork Grid */}
        {!loading && artworks.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {artworks.map((artwork) => (
                <div key={artwork.id} className="bg-gray-800 border border-gray-600 rounded-lg overflow-hidden hover:border-gray-500 transition-colors">
                  <Link href={`/gallery/${artwork.id}`}>
                    <div className="aspect-video relative">
                      <img
                        src={`http://localhost:8085${artwork.thumbnail_url}`}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-medium mb-1 truncate">
                        {artwork.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">
                        by {artwork.author_name}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>조회 {artwork.views}회</span>
                        <span>♥ {artwork.likes}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(artwork.created_at)}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 bg-gray-800 text-gray-300 rounded border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                >
                  이전
                </button>
                
                <span className="px-4 py-1 text-gray-300">
                  {pagination.page} / {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 bg-gray-800 text-gray-300 rounded border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                >
                  다음
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="text-center text-gray-500 text-sm mt-6">
              총 {pagination.total}개의 작품
            </div>
          </>
        )}
      </div>
    </div>
  )
}