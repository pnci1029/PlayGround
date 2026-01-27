import { FastifyInstance } from 'fastify'
import { toolsController } from '../../controllers/toolsController'

export default async function toolsRoutes(fastify: FastifyInstance) {
  // 도구 서비스 정보 (클라이언트 가이드)
  fastify.get('/', toolsController.getToolsInfo)
  
  // 실제 서버 처리가 필요한 기능들 (필요시 구현)
  fastify.post('/upload', toolsController.uploadFile)
  fastify.post('/proxy', toolsController.proxyRequest)
}