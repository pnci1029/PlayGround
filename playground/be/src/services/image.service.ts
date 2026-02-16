import sharp from 'sharp'
import { promises as fs } from 'fs'
import path from 'path'

export class ImageService {
  private uploadsDir: string
  private artworksDir: string
  private thumbnailsDir: string

  constructor() {
    this.uploadsDir = path.join(__dirname, '../../uploads')
    this.artworksDir = path.join(this.uploadsDir, 'artworks')
    this.thumbnailsDir = path.join(this.uploadsDir, 'thumbnails')
    this.ensureDirectories()
  }

  private async ensureDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true })
      await fs.mkdir(this.artworksDir, { recursive: true })
      await fs.mkdir(this.thumbnailsDir, { recursive: true })
    } catch (error) {
      console.error('Error creating directories:', error)
    }
  }

  async saveImage(buffer: Buffer, originalName?: string): Promise<{
    imageUrl: string
    thumbnailUrl: string
    filename: string
    thumbnailFilename: string
  }> {
    try {
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 15)
      const filename = `${timestamp}_${randomId}_original.png`
      const thumbnailFilename = `${timestamp}_${randomId}_thumb.jpg`
      
      const imagePath = path.join(this.artworksDir, filename)
      const thumbnailPath = path.join(this.thumbnailsDir, thumbnailFilename)

      // 원본 이미지 저장 (PNG 형식으로 최적화)
      await sharp(buffer)
        .png({ quality: 90 })
        .toFile(imagePath)

      // 썸네일 생성 (300x200, JPEG)
      await sharp(buffer)
        .resize(300, 200, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath)

      return {
        imageUrl: `/uploads/artworks/${filename}`,
        thumbnailUrl: `/uploads/thumbnails/${thumbnailFilename}`,
        filename,
        thumbnailFilename
      }
    } catch (error) {
      console.error('Error saving image:', error)
      throw new Error('Failed to save image')
    }
  }

  async deleteImage(imageUrl: string, thumbnailUrl?: string): Promise<void> {
    try {
      // Extract filename from URL
      const imagePath = path.join(__dirname, '../..', imageUrl)
      await fs.unlink(imagePath).catch(() => {}) // Ignore errors if file doesn't exist

      if (thumbnailUrl) {
        const thumbnailPath = path.join(__dirname, '../..', thumbnailUrl)
        await fs.unlink(thumbnailPath).catch(() => {})
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      // Don't throw error for cleanup operations
    }
  }

  async generateThumbnail(imageBuffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .resize(300, 200, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toBuffer()
    } catch (error) {
      console.error('Error generating thumbnail:', error)
      throw new Error('Failed to generate thumbnail')
    }
  }

  getImageInfo(buffer: Buffer) {
    return sharp(buffer).metadata()
  }
}

export const imageService = new ImageService()