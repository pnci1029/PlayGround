import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'

export default fp(async function (fastify: FastifyInstance) {
  // WebSocket 플러그인 등록
  await fastify.register(require('@fastify/websocket'))
})