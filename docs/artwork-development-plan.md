# 협업 그림판 개발 작업 계획

## 🎯 현재 상황 분석

### ✅ 기존 인프라
- PostgreSQL Docker 컨테이너 실행 중
- Fastify 백엔드 서버 구성 완료
- Next.js 프론트엔드 + Canvas 기본 기능
- WebSocket 채팅 시스템 구현됨

### 🔧 추가 필요 작업
- 이미지 저장/처리 API
- 데이터베이스 스키마 확장
- Canvas 저장 기능
- 갤러리 UI

---

## 📋 Phase 1: 백엔드 API 구축

### 1. 데이터베이스 마이그레이션
```sql
-- /be/src/database/migrations/001_create_artworks.sql
CREATE TABLE artworks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    author_name VARCHAR(100) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    canvas_data JSONB,
    width INTEGER DEFAULT 800,
    height INTEGER DEFAULT 600,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    parent_artwork_id INTEGER REFERENCES artworks(id),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_artworks_created_at ON artworks(created_at);
CREATE INDEX idx_artworks_likes ON artworks(likes);
CREATE INDEX idx_artworks_parent ON artworks(parent_artwork_id);
```

### 2. 필요 패키지 설치
```bash
cd be
npm install multer sharp @types/multer
```

### 3. 백엔드 파일 구조
```
be/src/
├── database/
│   ├── migrations/
│   │   └── 001_create_artworks.sql
│   └── connection.ts (기존 활용)
├── routes/
│   ├── artworks.ts (새로 생성)
│   └── chat.ts (기존)
├── services/
│   ├── artwork.service.ts (새로 생성)
│   └── image.service.ts (새로 생성)
├── types/
│   └── artwork.ts (새로 생성)
├── middleware/
│   └── upload.middleware.ts (새로 생성)
└── uploads/ (새로 생성)
    ├── artworks/
    └── thumbnails/
```

### 4. API 엔드포인트 구현

#### 📁 `/be/src/routes/artworks.ts`
```typescript
import { FastifyInstance } from 'fastify'
import { artworkService } from '../services/artwork.service'
import { uploadMiddleware } from '../middleware/upload.middleware'

export async function artworkRoutes(fastify: FastifyInstance) {
  // 작품 저장
  fastify.post('/api/artworks', {
    preHandler: uploadMiddleware,
    handler: async (request, reply) => {
      // multipart/form-data 처리
    }
  })
  
  // 작품 목록 조회
  fastify.get('/api/artworks', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 12 },
          sort: { type: 'string', enum: ['latest', 'popular', 'views'] }
        }
      }
    },
    handler: artworkService.getArtworks
  })
  
  // 특정 작품 조회
  fastify.get('/api/artworks/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' }
        }
      }
    },
    handler: artworkService.getArtworkById
  })
  
  // 작품 수정
  fastify.put('/api/artworks/:id', {
    preHandler: uploadMiddleware,
    handler: artworkService.updateArtwork
  })
  
  // 좋아요 토글
  fastify.post('/api/artworks/:id/like', {
    handler: artworkService.toggleLike
  })
  
  // 작품 포크 (복사해서 수정)
  fastify.post('/api/artworks/:id/fork', {
    handler: artworkService.forkArtwork
  })
}
```

#### 📁 `/be/src/services/artwork.service.ts`
```typescript
import { FastifyRequest, FastifyReply } from 'fastify'
import { pool } from '../database/connection'
import { imageService } from './image.service'
import { Artwork, CreateArtworkRequest } from '../types/artwork'

class ArtworkService {
  async createArtwork(request: FastifyRequest<{
    Body: CreateArtworkRequest
  }>, reply: FastifyReply) {
    try {
      const { title, description, author_name, canvas_data, width, height } = request.body
      const imageFile = request.file
      
      if (!imageFile) {
        return reply.status(400).send({ error: 'Image is required' })
      }
      
      // 이미지 저장 및 썸네일 생성
      const { imageUrl, thumbnailUrl } = await imageService.saveImage(imageFile)
      
      // DB에 저장
      const result = await pool.query(`
        INSERT INTO artworks (title, description, author_name, image_url, thumbnail_url, canvas_data, width, height)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [title, description, author_name, imageUrl, thumbnailUrl, canvas_data, width, height])
      
      reply.status(201).send(result.rows[0])
    } catch (error) {
      console.error('Error creating artwork:', error)
      reply.status(500).send({ error: 'Internal server error' })
    }
  }
  
  async getArtworks(request: FastifyRequest<{
    Querystring: {
      page?: number
      limit?: number
      sort?: 'latest' | 'popular' | 'views'
    }
  }>, reply: FastifyReply) {
    try {
      const { page = 1, limit = 12, sort = 'latest' } = request.query
      const offset = (page - 1) * limit
      
      let orderBy = 'created_at DESC'
      if (sort === 'popular') orderBy = 'likes DESC'
      if (sort === 'views') orderBy = 'views DESC'
      
      const result = await pool.query(`
        SELECT id, title, description, author_name, thumbnail_url, 
               views, likes, created_at, version
        FROM artworks 
        WHERE is_public = true
        ORDER BY ${orderBy}
        LIMIT $1 OFFSET $2
      `, [limit, offset])
      
      const countResult = await pool.query('SELECT COUNT(*) FROM artworks WHERE is_public = true')
      const total = parseInt(countResult.rows[0].count)
      
      reply.send({
        artworks: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      })
    } catch (error) {
      console.error('Error fetching artworks:', error)
      reply.status(500).send({ error: 'Internal server error' })
    }
  }
  
  // ... 기타 메서드들
}

export const artworkService = new ArtworkService()
```

#### 📁 `/be/src/services/image.service.ts`
```typescript
import sharp from 'sharp'
import { promises as fs } from 'fs'
import path from 'path'

class ImageService {
  private uploadsDir = path.join(__dirname, '../../uploads')
  private artworksDir = path.join(this.uploadsDir, 'artworks')
  private thumbnailsDir = path.join(this.uploadsDir, 'thumbnails')
  
  constructor() {
    this.ensureDirectories()
  }
  
  private async ensureDirectories() {
    await fs.mkdir(this.artworksDir, { recursive: true })
    await fs.mkdir(this.thumbnailsDir, { recursive: true })
  }
  
  async saveImage(file: any): Promise<{ imageUrl: string, thumbnailUrl: string }> {
    const timestamp = Date.now()
    const originalName = `${timestamp}_original.png`
    const thumbnailName = `${timestamp}_thumb.jpg`
    
    const originalPath = path.join(this.artworksDir, originalName)
    const thumbnailPath = path.join(this.thumbnailsDir, thumbnailName)
    
    // 원본 이미지 저장
    await fs.writeFile(originalPath, file.buffer)
    
    // 썸네일 생성 (300x200)
    await sharp(file.buffer)
      .resize(300, 200, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath)
    
    return {
      imageUrl: `/uploads/artworks/${originalName}`,
      thumbnailUrl: `/uploads/thumbnails/${thumbnailName}`
    }
  }
}

export const imageService = new ImageService()
```

#### 📁 `/be/src/middleware/upload.middleware.ts`
```typescript
import multer from 'multer'
import { FastifyRequest } from 'fastify'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB 제한
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

export const uploadMiddleware = async (request: FastifyRequest) => {
  return new Promise((resolve, reject) => {
    upload.single('image')(request as any, {} as any, (error) => {
      if (error) reject(error)
      else resolve(undefined)
    })
  })
}
```

#### 📁 `/be/src/types/artwork.ts`
```typescript
export interface Artwork {
  id: number
  title: string
  description?: string
  author_name: string
  image_url: string
  thumbnail_url?: string
  canvas_data?: any
  width: number
  height: number
  views: number
  likes: number
  is_public: boolean
  parent_artwork_id?: number
  version: number
  created_at: Date
  updated_at: Date
}

export interface CreateArtworkRequest {
  title: string
  description?: string
  author_name: string
  canvas_data: string
  width: number
  height: number
}
```

---

## 📋 Phase 2: 프론트엔드 Canvas 저장 기능

### 1. Canvas 저장 컴포넌트

#### 📁 `/fe/src/components/canvas/CanvasSaveControls.tsx`
```typescript
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface CanvasSaveControlsProps {
  canvasRef: React.RefObject<HTMLCanvasElement>
}

export default function CanvasSaveControls({ canvasRef }: CanvasSaveControlsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author_name: localStorage.getItem('author_name') || ''
  })
  const [isLoading, setIsLoading] = useState(false)
  
  const handleSave = async () => {
    if (!canvasRef.current) return
    
    setIsLoading(true)
    try {
      // Canvas를 Blob으로 변환
      const canvas = canvasRef.current
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png', 1.0)
      })
      
      // Canvas 데이터 추출 (재편집용)
      const canvasData = {
        imageData: canvas.toDataURL(),
        width: canvas.width,
        height: canvas.height
      }
      
      // FormData 생성
      const data = new FormData()
      data.append('image', blob, 'artwork.png')
      data.append('title', formData.title)
      data.append('description', formData.description)
      data.append('author_name', formData.author_name)
      data.append('canvas_data', JSON.stringify(canvasData))
      data.append('width', canvas.width.toString())
      data.append('height', canvas.height.toString())
      
      // API 호출
      const response = await fetch('/api/artworks', {
        method: 'POST',
        body: data
      })
      
      if (response.ok) {
        const result = await response.json()
        localStorage.setItem('author_name', formData.author_name)
        
        // 성공 처리
        alert('작품이 성공적으로 저장되었습니다!')
        setIsModalOpen(false)
        
        // 갤러리로 이동
        window.location.href = '/gallery'
      } else {
        throw new Error('저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <>
      <Button 
        onClick={() => setIsModalOpen(true)}
        className="bg-green-600 hover:bg-green-700"
      >
        💾 작품 저장
      </Button>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full mx-4 border border-border">
            <h3 className="text-xl font-bold text-white mb-4">작품 저장</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">작품 제목 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-800 border border-border text-white px-3 py-2 rounded focus:border-blue-500"
                  placeholder="작품의 제목을 입력하세요"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-800 border border-border text-white px-3 py-2 rounded focus:border-blue-500 h-20"
                  placeholder="작품에 대한 설명을 입력하세요 (선택)"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">작성자명 *</label>
                <input
                  type="text"
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  className="w-full bg-gray-800 border border-border text-white px-3 py-2 rounded focus:border-blue-500"
                  placeholder="닉네임을 입력하세요"
                  required
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => setIsModalOpen(false)}
                variant="secondary"
                className="flex-1"
                disabled={isLoading}
              >
                취소
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isLoading || !formData.title.trim() || !formData.author_name.trim()}
              >
                {isLoading ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

### 2. Canvas 페이지에 저장 기능 추가

#### 📁 `/fe/src/app/canvas/page.tsx` (기존 파일 수정)
```typescript
// 기존 imports에 추가
import CanvasSaveControls from '@/components/canvas/CanvasSaveControls'

// 컴포넌트 내부 버튼 영역에 추가
<div className="flex gap-4 mb-6">
  {/* 기존 버튼들 */}
  <button>펜</button>
  <button>지우개</button>
  {/* ... */}
  
  {/* 새로 추가 */}
  <CanvasSaveControls canvasRef={canvasRef} />
</div>
```

---

## 📋 Phase 3: 갤러리 페이지 구현

### 1. 갤러리 페이지

#### 📁 `/fe/src/app/gallery/page.tsx`
```typescript
'use client'
import { useState, useEffect } from 'react'
import ArtworkGrid from '@/components/artwork/ArtworkGrid'
import { Artwork } from '@/types/artwork'

export default function GalleryPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'views'>('latest')
  
  const fetchArtworks = async () => {
    try {
      const response = await fetch(`/api/artworks?page=${page}&sort=${sortBy}`)
      const data = await response.json()
      setArtworks(data.artworks)
    } catch (error) {
      console.error('Error fetching artworks:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchArtworks()
  }, [page, sortBy])
  
  return (
    <div className="min-h-screen pt-20" style={{background: 'var(--background)'}}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">작품 갤러리</h1>
          
          <div className="flex gap-4">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-800 text-white px-4 py-2 rounded border border-border"
            >
              <option value="latest">최신순</option>
              <option value="popular">인기순</option>
              <option value="views">조회순</option>
            </select>
            
            <Button 
              onClick={() => window.location.href = '/canvas'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              🎨 새 작품 그리기
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center text-gray-400 py-12">
            작품을 불러오는 중...
          </div>
        ) : (
          <ArtworkGrid artworks={artworks} />
        )}
      </div>
    </div>
  )
}
```

### 2. 작품 그리드 컴포넌트

#### 📁 `/fe/src/components/artwork/ArtworkGrid.tsx`
```typescript
import ArtworkCard from './ArtworkCard'
import { Artwork } from '@/types/artwork'

interface ArtworkGridProps {
  artworks: Artwork[]
}

export default function ArtworkGrid({ artworks }: ArtworkGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {artworks.map((artwork) => (
        <ArtworkCard key={artwork.id} artwork={artwork} />
      ))}
    </div>
  )
}
```

#### 📁 `/fe/src/components/artwork/ArtworkCard.tsx`
```typescript
import { Artwork } from '@/types/artwork'

interface ArtworkCardProps {
  artwork: Artwork
}

export default function ArtworkCard({ artwork }: ArtworkCardProps) {
  return (
    <div className="bg-gray-900/80 rounded-lg overflow-hidden border border-border hover:border-blue-500/50 transition-all group">
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={artwork.thumbnail_url || artwork.image_url} 
          alt={artwork.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-white font-medium mb-2 line-clamp-1">{artwork.title}</h3>
        {artwork.description && (
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{artwork.description}</p>
        )}
        
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>by {artwork.author_name}</span>
          <div className="flex gap-3">
            <span>👁 {artwork.views}</span>
            <span>❤️ {artwork.likes}</span>
          </div>
        </div>
        
        <div className="flex gap-2 mt-3">
          <button 
            onClick={() => window.location.href = `/artwork/${artwork.id}`}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm transition-colors"
          >
            상세보기
          </button>
          <button 
            onClick={() => window.location.href = `/canvas?fork=${artwork.id}`}
            className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm transition-colors"
          >
            수정하기
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## 📋 Phase 4: 메인 페이지 연동

### 1. 메인 페이지에 갤러리 섹션 추가

#### 📁 `/fe/src/app/page.tsx` (기존 파일 수정)
```typescript
// 기존 tools 섹션 아래에 추가
const featuredArtworks = await fetch('/api/artworks?limit=6&sort=popular').then(r => r.json())

// JSX에 추가
<section className="py-20">
  <div className="max-w-7xl mx-auto px-4">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold text-white mb-4">🎨 커뮤니티 작품</h2>
      <p className="text-gray-400 text-lg">다른 사용자들이 만든 멋진 작품들을 확인해보세요</p>
    </div>
    
    <ArtworkGrid artworks={featuredArtworks.artworks} />
    
    <div className="text-center mt-8">
      <Button 
        onClick={() => window.location.href = '/gallery'}
        className="btn-primary"
      >
        모든 작품 보기
      </Button>
    </div>
  </div>
</section>
```

---

## 🚀 작업 실행 계획

### Day 1: 백엔드 구축
- [ ] PostgreSQL 마이그레이션 실행
- [ ] 필요 패키지 설치
- [ ] Artwork API 구현
- [ ] 이미지 업로드 테스트

### Day 2: 프론트엔드 저장 기능
- [ ] Canvas 저장 컴포넌트 개발
- [ ] Canvas 페이지 연동
- [ ] 저장 기능 테스트

### Day 3: 갤러리 시스템
- [ ] 갤러리 페이지 구현
- [ ] 작품 카드 컴포넌트
- [ ] 메인 페이지 연동

### Day 4-5: 협업 기능
- [ ] 작품 수정 기능
- [ ] 포크 시스템
- [ ] 히스토리 추적

---

## 📝 테스트 시나리오

1. **저장 테스트**: Canvas에 그림 그리고 저장
2. **조회 테스트**: 갤러리에서 작품 목록 확인
3. **수정 테스트**: 기존 작품 불러와서 수정
4. **포크 테스트**: 다른 사람 작품을 기반으로 새 작품 생성

---

*마지막 업데이트: 2026-02-09*