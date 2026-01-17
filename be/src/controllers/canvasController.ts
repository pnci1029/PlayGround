import { FastifyRequest } from 'fastify'
import { canvasService } from '../services/canvasService'
import { v4 as uuidv4 } from 'uuid'

export const canvasController = {
  // WebSocket 연결 핸들러
  async handleWebSocket(connection: any, request: FastifyRequest) {
    const connectionId = uuidv4()
    
    try {
      // 연결 설정
      canvasService.addConnection(connectionId, connection.socket)

      // 메시지 수신 처리
      connection.socket.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString())
          canvasService.handleDrawEvent(connectionId, data)
        } catch (error) {
          console.error('Canvas message parse error:', error)
          connection.socket.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format',
            timestamp: Date.now()
          }))
        }
      })

      // 연결 해제 처리
      connection.socket.on('close', () => {
        canvasService.removeConnection(connectionId)
      })

      connection.socket.on('error', (error: any) => {
        console.error('Canvas WebSocket error:', error)
        canvasService.removeConnection(connectionId)
      })

    } catch (error) {
      console.error('Canvas WebSocket connection error:', error)
      connection.socket.close()
    }
  },

  // Canvas 상태 정보 API
  async getCanvasInfo(request: FastifyRequest, reply: any) {
    try {
      return reply.send({
        success: true,
        data: {
          activeUsers: canvasService.getActiveUsers(),
          historyCount: canvasService.getDrawHistory().length
        }
      })
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: 'Failed to get canvas info'
      })
    }
  }
}