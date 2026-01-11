import { FastifyInstance } from 'fastify'
import { toolsController } from '../../controllers/toolsController'

export default async function toolsRoutes(fastify: FastifyInstance) {
  // Tools 목록 조회
  fastify.get('/', toolsController.getToolsList)
  
  // JSON Formatter
  fastify.post('/json-formatter', toolsController.formatJson)
  
  // Variable Generator
  fastify.post('/variable-generator', toolsController.generateVariable)
}