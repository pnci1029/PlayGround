'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiUrls, imageUrls, logger } from '@/lib/config'
import type { SortOption } from '@/types/canvas'

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
  const [sortBy, setSortBy] = useState<SortOption>('latest')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchArtworks()
  }, [pagination.page, sortBy])

  const fetchArtworks = async () => {
    setLoading(true)
    try {
      // 임시로 localStorage에서 데이터 가져오기 (백엔드 복구 전까지)
      logger.log('📚 localStorage에서 작품 목록 가져오는 중...')
      const storedArtworks = JSON.parse(localStorage.getItem('artworks') || '[]')
      logger.log('🎨 저장된 작품 수:', storedArtworks.length)
      
      let filteredArtworks = [...storedArtworks]
      
      // 검색 필터링
      if (searchTerm) {
        filteredArtworks = filteredArtworks.filter(artwork => 
          artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          artwork.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (artwork.description && artwork.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      }
      
      // 정렬
      if (sortBy === 'latest') {
        filteredArtworks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      } else if (sortBy === 'popular') {
        filteredArtworks.sort((a, b) => (b.likes || 0) - (a.likes || 0))
      } else if (sortBy === 'views') {
        filteredArtworks.sort((a, b) => (b.views || 0) - (a.views || 0))
      }
      
      // 페이지네이션
      const startIndex = (pagination.page - 1) * pagination.limit
      const endIndex = startIndex + pagination.limit
      const paginatedArtworks = filteredArtworks.slice(startIndex, endIndex)
      
      // localStorage 데이터를 API 형식에 맞게 변환
      const transformedArtworks = paginatedArtworks.map((artwork, index) => ({
        id: parseInt(artwork.id) || index + 1,
        title: artwork.title,
        description: artwork.description || '',
        author_name: artwork.author_name,
        thumbnail_url: artwork.imageData, // localStorage에 저장된 base64 이미지 사용
        image_url: artwork.imageData,
        views: artwork.views || 0,
        likes: artwork.likes || 0,
        created_at: artwork.created_at,
        version: artwork.version || 1
      }))
      
      setArtworks(transformedArtworks)
      setPagination(prev => ({
        ...prev,
        total: filteredArtworks.length,
        totalPages: Math.ceil(filteredArtworks.length / prev.limit)
      }))
      
      logger.log('✅ 갤러리 데이터 로드 완료:', transformedArtworks.length, '개 작품')
      
      // 백엔드 API도 시도해보기 (실패해도 무시)
      try {
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          sort: sortBy
        })

        if (searchTerm) {
          params.append('search', searchTerm)
        }

        const response = await fetch(`${apiUrls.artworks}?${params}`)
        if (response.ok) {
          const data = await response.json()
          logger.log('🌐 백엔드 API에서도 데이터 가져옴:', data.artworks.length, '개')
          // 백엔드 데이터가 있으면 localStorage 데이터와 합치거나 대체할 수 있음
        }
      } catch (apiError) {
        logger.log('🚫 백엔드 API 호출 실패 (localStorage 데이터 사용):', apiError)
      }
      
    } catch (error) {
      console.error('Failed to fetch artworks:', error)
      setArtworks([])
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
            <h1 className="text-5xl font-bold text-gray-900">작품 갤러리</h1>
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
                  className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 bg-white border border-gray-200 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="text-gray-600">작품을 불러오는 중...</div>
          </div>
        )}

        {/* Empty State */}
        {!loading && artworks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-600 mb-4">
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
                <div key={artwork.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors shadow-lg">
                  <Link href={`/gallery/${artwork.id}`}>
                    <div className="aspect-video relative">
                      <img
                        src={imageUrls.thumbnail(artwork.thumbnail_url)}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-gray-900 text-lg font-semibold mb-1 truncate">
                        {artwork.title}
                      </h3>
                      <p className="text-gray-600 text-base mb-2">
                        by {artwork.author_name}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>조회 {artwork.views}회</span>
                        <span>좋아요 {artwork.likes}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
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
                  className="px-3 py-1 bg-white text-gray-700 rounded border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  이전
                </button>
                
                <span className="px-4 py-1 text-gray-700">
                  {pagination.page} / {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 bg-white text-gray-700 rounded border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  다음
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="text-center text-gray-600 text-base mt-6">
              총 {pagination.total}개의 작품
            </div>
          </>
        )}
      </div>
    </div>
  )
}