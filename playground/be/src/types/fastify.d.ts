import { Pool } from 'pg'
import { MultipartFile } from '@fastify/multipart'

declare module 'fastify' {
  interface FastifyInstance {
    pg: Pool
    uploadsDir: string
  }
  
  interface FastifyRequest {
    file(): Promise<MultipartFile | undefined>
    parts(): AsyncIterableIterator<MultipartFile>
    session?: any
  }
}