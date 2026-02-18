import { FastifyInstance } from 'fastify'
import { ArtworkService } from '../services/artwork.service'
import '../types/fastify'

export async function artworkRoutes(fastify: FastifyInstance) {
  // Register multipart support
  await fastify.register(require('@fastify/multipart'), {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    }
  })

  const artworkService = new ArtworkService((fastify as any).pg)

  // Create artwork (POST /api/artworks)
  fastify.post('/api/artworks', {
    schema: {
      consumes: ['multipart/form-data'],
      summary: 'Create a new artwork',
      description: 'Upload and save a new artwork with metadata',
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            author_name: { type: 'string' },
            image_url: { type: 'string' },
            created_at: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    },
    handler: artworkService.createArtwork.bind(artworkService)
  })

  // Get artworks list (GET /api/artworks)
  fastify.get('/api/artworks', {
    schema: {
      summary: 'Get artworks list',
      description: 'Retrieve paginated list of artworks with filtering and sorting',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 12 },
          sort: { 
            type: 'string', 
            enum: ['latest', 'popular', 'views'], 
            default: 'latest' 
          },
          search: { type: 'string' },
          author: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            artworks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  author_name: { type: 'string' },
                  thumbnail_url: { type: 'string' },
                  views: { type: 'number' },
                  likes: { type: 'number' },
                  created_at: { type: 'string' },
                  version: { type: 'number' }
                }
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number' },
                limit: { type: 'number' },
                total: { type: 'number' },
                totalPages: { type: 'number' }
              }
            }
          }
        }
      }
    },
    handler: artworkService.getArtworks.bind(artworkService)
  })

  // Get artwork by ID (GET /api/artworks/:id)
  fastify.get('/api/artworks/:id', {
    schema: {
      summary: 'Get artwork by ID',
      description: 'Retrieve detailed information about a specific artwork',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', pattern: '^[0-9]+$' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            description: { type: 'string' },
            author_name: { type: 'string' },
            image_url: { type: 'string' },
            canvas_data: { type: 'object' },
            width: { type: 'number' },
            height: { type: 'number' },
            views: { type: 'number' },
            likes: { type: 'number' },
            created_at: { type: 'string' },
            related: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  title: { type: 'string' },
                  thumbnail_url: { type: 'string' },
                  author_name: { type: 'string' }
                }
              }
            }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    },
    handler: artworkService.getArtworkById.bind(artworkService)
  })

  // Update artwork (PUT /api/artworks/:id)
  fastify.put('/api/artworks/:id', {
    schema: {
      consumes: ['multipart/form-data'],
      summary: 'Update artwork',
      description: 'Update an existing artwork',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', pattern: '^[0-9]+$' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            updated_at: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    },
    handler: artworkService.updateArtwork.bind(artworkService)
  })

  // Fork artwork (POST /api/artworks/:id/fork)
  fastify.post('/api/artworks/:id/fork', {
    schema: {
      summary: 'Fork artwork',
      description: 'Create a copy of an existing artwork for editing',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', pattern: '^[0-9]+$' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          author_name: { type: 'string' },
          title: { type: 'string' }
        },
        required: ['author_name']
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            author_name: { type: 'string' },
            parent_artwork_id: { type: 'number' },
            version: { type: 'number' }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    },
    handler: artworkService.forkArtwork.bind(artworkService)
  })

  // Toggle like (POST /api/artworks/:id/like)
  fastify.post('/api/artworks/:id/like', {
    schema: {
      summary: 'Toggle artwork like',
      description: 'Like or unlike an artwork',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', pattern: '^[0-9]+$' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            liked: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    },
    handler: artworkService.toggleLike.bind(artworkService)
  })

  // Serve static files
  const path = require('path')
  fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, '../../uploads'),
    prefix: '/uploads/'
  })

  fastify.log.info('Artwork routes registered')
}