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
  parent_artwork_id?: number
}

export interface ArtworkQueryParams {
  page?: number
  limit?: number
  sort?: 'latest' | 'popular' | 'views'
  search?: string
  author?: string
}

export interface ArtworkListResponse {
  artworks: Artwork[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ArtworkLike {
  id: number
  artwork_id: number
  user_ip?: string
  user_session?: string
  created_at: Date
}

export interface ArtworkHistory {
  id: number
  artwork_id: number
  author_name: string
  action: 'created' | 'modified' | 'forked'
  description?: string
  canvas_data_snapshot?: any
  created_at: Date
}