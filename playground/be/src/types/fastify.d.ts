import { Pool } from 'pg'

declare module 'fastify' {
  interface FastifyInstance {
    pg: Pool
    uploadsDir: string
  }
  
  interface FastifyRequest {
    file(): Promise<any>
    parts(): AsyncIterableIterator<any>
    session?: any
  }
}