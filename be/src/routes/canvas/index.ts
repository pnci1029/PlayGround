import { FastifyInstance } from 'fastify'
import { canvasController } from '../../controllers/canvasController'

export default async function canvasRoutes(fastify: FastifyInstance) {
  // Canvas 정보 API
  fastify.get('/info', canvasController.getCanvasInfo)
  
  // TODO: WebSocket 연결은 나중에 추가
  // fastify.register(async function (fastify) {
  //   fastify.get('/ws', { websocket: true }, canvasController.handleWebSocket)
  // })
}