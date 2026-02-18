import { FastifyRequest, FastifyReply } from 'fastify'
import { Pool } from 'pg'
import { imageService } from './image.service'
import '../types/fastify'
import { 
  Artwork, 
  CreateArtworkRequest, 
  ArtworkQueryParams, 
  ArtworkListResponse 
} from '../types/artwork'

export class ArtworkService {
  constructor(private pool: Pool) {}

  async createArtwork(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await request.file()
      if (!data) {
        return reply.status(400).send({ error: 'Image file is required' })
      }

      const buffer = await data.toBuffer()
      const fields: any = {}
      
      // Parse form fields
      for await (const field of request.parts()) {
        if (field.type === 'field') {
          fields[field.fieldname] = (field as any).value
        }
      }

      const { title, description, author_name, canvas_data, width, height, parent_artwork_id } = fields

      // Validate required fields
      if (!title || !author_name) {
        return reply.status(400).send({ 
          error: 'Title and author_name are required' 
        })
      }

      // Save image and generate thumbnail
      const { imageUrl, thumbnailUrl } = await imageService.saveImage(buffer)

      // Parse numeric values
      const numericWidth = parseInt(width) || 800
      const numericHeight = parseInt(height) || 600
      const numericParentId = parent_artwork_id ? parseInt(parent_artwork_id) : null

      // Save to database
      const query = `
        INSERT INTO artworks (
          title, description, author_name, image_url, thumbnail_url, 
          canvas_data, width, height, parent_artwork_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `
      
      const values = [
        title,
        description || null,
        author_name,
        imageUrl,
        thumbnailUrl,
        canvas_data ? JSON.parse(canvas_data) : null,
        numericWidth,
        numericHeight,
        numericParentId
      ]

      const result = await this.pool.query(query, values)
      const artwork = result.rows[0]

      // Add to history
      await this.addHistory(artwork.id, author_name, 'created', `Created artwork: ${title}`)

      reply.status(201).send(artwork)
    } catch (error) {
      console.error('Error creating artwork:', error)
      reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async getArtworks(request: FastifyRequest<{ Querystring: ArtworkQueryParams }>, reply: FastifyReply) {
    try {
      const { 
        page = 1, 
        limit = 12, 
        sort = 'latest',
        search,
        author 
      } = request.query

      const offset = (page - 1) * limit
      
      let orderBy = 'created_at DESC'
      switch (sort) {
        case 'popular':
          orderBy = 'likes DESC, created_at DESC'
          break
        case 'views':
          orderBy = 'views DESC, created_at DESC'
          break
        default:
          orderBy = 'created_at DESC'
      }

      // Build WHERE conditions
      let whereConditions = ['is_public = true']
      let queryParams: any[] = []
      let paramIndex = 1

      if (search) {
        whereConditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`)
        queryParams.push(`%${search}%`)
        paramIndex++
      }

      if (author) {
        whereConditions.push(`author_name ILIKE $${paramIndex}`)
        queryParams.push(`%${author}%`)
        paramIndex++
      }

      const whereClause = whereConditions.join(' AND ')

      // Get artworks
      const artworksQuery = `
        SELECT id, title, description, author_name, thumbnail_url, image_url,
               views, likes, created_at, version, parent_artwork_id
        FROM artworks 
        WHERE ${whereClause}
        ORDER BY ${orderBy}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `
      
      queryParams.push(limit, offset)
      const artworksResult = await this.pool.query(artworksQuery, queryParams)

      // Get total count
      const countQuery = `SELECT COUNT(*) FROM artworks WHERE ${whereClause}`
      const countResult = await this.pool.query(countQuery, queryParams.slice(0, -2))
      const total = parseInt(countResult.rows[0].count)

      const response: ArtworkListResponse = {
        artworks: artworksResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }

      reply.send(response)
    } catch (error) {
      console.error('Error fetching artworks:', error)
      reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async getArtworkById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params
      
      // Increment view count
      await this.pool.query(
        'UPDATE artworks SET views = views + 1 WHERE id = $1',
        [id]
      )

      // Get artwork details
      const result = await this.pool.query(
        'SELECT * FROM artworks WHERE id = $1 AND is_public = true',
        [id]
      )

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'Artwork not found' })
      }

      const artwork = result.rows[0]

      // Get related artworks (same author or forks)
      const relatedQuery = `
        SELECT id, title, thumbnail_url, author_name, created_at
        FROM artworks 
        WHERE (author_name = $1 OR parent_artwork_id = $2) 
          AND id != $2 
          AND is_public = true
        ORDER BY created_at DESC 
        LIMIT 6
      `
      const relatedResult = await this.pool.query(relatedQuery, [artwork.author_name, id])

      reply.send({
        ...artwork,
        related: relatedResult.rows
      })
    } catch (error) {
      console.error('Error fetching artwork:', error)
      reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async updateArtwork(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params
      
      // Check if artwork exists
      const checkResult = await this.pool.query(
        'SELECT * FROM artworks WHERE id = $1',
        [id]
      )

      if (checkResult.rows.length === 0) {
        return reply.status(404).send({ error: 'Artwork not found' })
      }

      const existingArtwork = checkResult.rows[0]
      let imageUrl = existingArtwork.image_url
      let thumbnailUrl = existingArtwork.thumbnail_url

      // Check if new image is uploaded
      const data = await request.file()
      if (data) {
        const buffer = await data.toBuffer()
        const imageResult = await imageService.saveImage(buffer)
        imageUrl = imageResult.imageUrl
        thumbnailUrl = imageResult.thumbnailUrl

        // Delete old images
        await imageService.deleteImage(existingArtwork.image_url, existingArtwork.thumbnail_url)
      }

      const fields: any = {}
      for await (const field of request.parts()) {
        if (field.type === 'field') {
          fields[field.fieldname] = (field as any).value
        }
      }

      const { title, description, author_name, canvas_data } = fields

      // Update artwork
      const updateQuery = `
        UPDATE artworks SET 
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          author_name = COALESCE($3, author_name),
          canvas_data = COALESCE($4, canvas_data),
          image_url = $5,
          thumbnail_url = $6,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *
      `

      const values = [
        title || null,
        description || null,
        author_name || null,
        canvas_data ? JSON.parse(canvas_data) : null,
        imageUrl,
        thumbnailUrl,
        id
      ]

      const result = await this.pool.query(updateQuery, values)
      
      // Add to history
      await this.addHistory(parseInt(id), author_name || existingArtwork.author_name, 'modified', 'Artwork updated')

      reply.send(result.rows[0])
    } catch (error) {
      console.error('Error updating artwork:', error)
      reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async forkArtwork(request: FastifyRequest<{ 
    Params: { id: string }
    Body: { author_name: string, title?: string }
  }>, reply: FastifyReply) {
    try {
      const { id } = request.params
      const { author_name, title } = request.body

      if (!author_name) {
        return reply.status(400).send({ error: 'Author name is required' })
      }

      // Get original artwork
      const originalResult = await this.pool.query(
        'SELECT * FROM artworks WHERE id = $1 AND is_public = true',
        [id]
      )

      if (originalResult.rows.length === 0) {
        return reply.status(404).send({ error: 'Artwork not found' })
      }

      const original = originalResult.rows[0]
      
      // Create fork
      const forkQuery = `
        INSERT INTO artworks (
          title, description, author_name, image_url, thumbnail_url,
          canvas_data, width, height, parent_artwork_id, version
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `

      const forkTitle = title || `${original.title} (Fork by ${author_name})`
      
      const values = [
        forkTitle,
        original.description,
        author_name,
        original.image_url, // Initially same image
        original.thumbnail_url,
        original.canvas_data,
        original.width,
        original.height,
        parseInt(id),
        original.version + 1
      ]

      const result = await this.pool.query(forkQuery, values)
      const fork = result.rows[0]

      // Add to history
      await this.addHistory(fork.id, author_name, 'forked', `Forked from artwork: ${original.title}`)

      reply.status(201).send(fork)
    } catch (error) {
      console.error('Error forking artwork:', error)
      reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async toggleLike(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params
      const userIp = request.ip
      const userSession = (request as any).session?.sessionId || `ip_${userIp}`

      // Check if already liked
      const likeCheck = await this.pool.query(
        'SELECT id FROM artwork_likes WHERE artwork_id = $1 AND (user_ip = $2 OR user_session = $3)',
        [id, userIp, userSession]
      )

      if (likeCheck.rows.length > 0) {
        // Unlike
        await this.pool.query(
          'DELETE FROM artwork_likes WHERE artwork_id = $1 AND (user_ip = $2 OR user_session = $3)',
          [id, userIp, userSession]
        )
        
        await this.pool.query(
          'UPDATE artworks SET likes = likes - 1 WHERE id = $1',
          [id]
        )
        
        reply.send({ liked: false, message: 'Like removed' })
      } else {
        // Like
        await this.pool.query(
          'INSERT INTO artwork_likes (artwork_id, user_ip, user_session) VALUES ($1, $2, $3)',
          [id, userIp, userSession]
        )
        
        await this.pool.query(
          'UPDATE artworks SET likes = likes + 1 WHERE id = $1',
          [id]
        )
        
        reply.send({ liked: true, message: 'Liked' })
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      reply.status(500).send({ error: 'Internal server error' })
    }
  }

  private async addHistory(artworkId: number, authorName: string, action: string, description?: string) {
    try {
      await this.pool.query(
        'INSERT INTO artwork_history (artwork_id, author_name, action, description) VALUES ($1, $2, $3, $4)',
        [artworkId, authorName, action, description]
      )
    } catch (error) {
      console.error('Error adding history:', error)
      // Don't throw error for history logging
    }
  }
}