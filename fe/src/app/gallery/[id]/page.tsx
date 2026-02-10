'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Artwork {
  id: number
  title: string
  description?: string
  author_name: string
  image_url: string
  canvas_data?: any
  width: number
  height: number
  views: number
  likes: number
  created_at: string
  related: RelatedArtwork[]
}

interface RelatedArtwork {
  id: number
  title: string
  thumbnail_url: string
  author_name: string
}

export default function ArtworkDetailPage() {
  const params = useParams()
  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchArtwork()
    }
  }, [params.id])

  const fetchArtwork = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8085/api/artworks/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setArtwork(data)
      } else {
        // Handle 404 or other errors
      }
    } catch (error) {
      console.error('Failed to fetch artwork:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!artwork || isLiking) return
    
    setIsLiking(true)
    try {
      const response = await fetch(`http://localhost:8085/api/artworks/${artwork.id}/like`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const result = await response.json()
        setLiked(result.liked)
        setArtwork(prev => prev ? {
          ...prev,
          likes: prev.likes + (result.liked ? 1 : -1)
        } : null)
      }
    } catch (error) {
      console.error('Failed to like artwork:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleFork = async () => {
    if (!artwork) return

    const authorName = prompt('작가명을 입력하세요:')
    if (!authorName) return

    try {
      const response = await fetch(`http://localhost:8085/api/artworks/${artwork.id}/fork`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          author_name: authorName
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`작품이 성공적으로 포크되었습니다! (ID: ${result.id})`)
      }
    } catch (error) {
      console.error('Failed to fork artwork:', error)
      alert('포크 중 오류가 발생했습니다.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{background: 'var(--background)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-400">작품을 불러오는 중...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!artwork) {
    return (
      <div className="min-h-screen" style={{background: 'var(--background)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">작품을 찾을 수 없습니다.</div>
            <Link 
              href="/gallery"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors"
            >
              갤러리로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--background)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/gallery"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← 갤러리로 돌아가기
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Artwork Display */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
              <img
                src={`http://localhost:8085${artwork.image_url}`}
                alt={artwork.title}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Artwork Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {artwork.title}
              </h1>
              <p className="text-gray-400 mb-4">
                by {artwork.author_name}
              </p>
              {artwork.description && (
                <p className="text-gray-300 mb-4">
                  {artwork.description}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{artwork.views}</div>
                  <div className="text-sm text-gray-400">조회수</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{artwork.likes}</div>
                  <div className="text-sm text-gray-400">좋아요</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`w-full px-4 py-2 rounded transition-colors ${
                  liked 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-gray-600 hover:bg-gray-700'
                } text-white disabled:opacity-50`}
              >
                {isLiking ? '처리 중...' : (liked ? '♥ 좋아요 취소' : '♡ 좋아요')}
              </button>
              
              <Link
                href={`/canvas?edit=${artwork.id}`}
                className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-center"
              >
                ✏️ 편집하기
              </Link>
              
              <button
                onClick={handleFork}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              >
                🍴 포크하기
              </button>
            </div>

            {/* Metadata */}
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">크기:</span>
                <span className="text-white">{artwork.width} × {artwork.height}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">생성일:</span>
                <span className="text-white">{formatDate(artwork.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Artworks */}
        {artwork.related && artwork.related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">관련 작품</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {artwork.related.map((relatedArtwork) => (
                <Link 
                  key={relatedArtwork.id}
                  href={`/gallery/${relatedArtwork.id}`}
                  className="bg-gray-800 border border-gray-600 rounded-lg overflow-hidden hover:border-gray-500 transition-colors"
                >
                  <div className="aspect-square">
                    <img
                      src={`http://localhost:8085${relatedArtwork.thumbnail_url}`}
                      alt={relatedArtwork.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <h3 className="text-white text-sm font-medium truncate">
                      {relatedArtwork.title}
                    </h3>
                    <p className="text-gray-400 text-xs truncate">
                      {relatedArtwork.author_name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}