import { FastifyPluginAsync } from 'fastify'
import { db } from '../config/database'

interface ChatMessage {
  type: 'message'
  nickname: string
  message: string
  timestamp: number
  userId?: string
}

const chatRoutes: FastifyPluginAsync = async (fastify) => {
  // 채팅 히스토리 조회 (페이징)
  fastify.get('/history', async (request, reply) => {
    try {
      const { before, limit = 50 } = request.query as { before?: string, limit?: number }
      
      let query: string
      let params: any[]
      
      if (before) {
        // before 타임스탬프 이전의 메시지들 조회
        query = 'SELECT nickname, message, timestamp, user_id FROM chat_messages WHERE timestamp < $1 ORDER BY timestamp DESC LIMIT $2'
        params = [parseInt(before), limit]
      } else {
        // 최신 메시지들 조회
        query = 'SELECT nickname, message, timestamp, user_id FROM chat_messages ORDER BY timestamp DESC LIMIT $1'
        params = [limit]
      }
      
      const result = await db.query(query, params)
      
      // 시간 순으로 정렬해서 반환 (오래된 것부터)
      const messages: ChatMessage[] = result.rows.reverse().map(row => ({
        type: 'message',
        nickname: row.nickname,
        message: row.message,
        timestamp: parseInt(row.timestamp),
        userId: row.user_id
      }))
      
      reply.send({
        success: true,
        messages,
        hasMore: result.rows.length === limit
      })
    } catch (error) {
      console.error('채팅 히스토리 조회 실패:', error)
      reply.status(500).send({
        success: false,
        error: '채팅 히스토리를 불러올 수 없습니다'
      })
    }
  })

  // 채팅 통계 조회
  fastify.get('/stats', async (request, reply) => {
    try {
      const totalResult = await db.query('SELECT COUNT(*) as count FROM chat_messages')
      const todayResult = await db.query(
        'SELECT COUNT(*) as count FROM chat_messages WHERE created_at >= CURRENT_DATE'
      )
      
      reply.send({
        success: true,
        stats: {
          total: parseInt(totalResult.rows[0].count),
          today: parseInt(todayResult.rows[0].count)
        }
      })
    } catch (error) {
      console.error('채팅 통계 조회 실패:', error)
      reply.status(500).send({
        success: false,
        error: '통계를 불러올 수 없습니다'
      })
    }
  })
}

export default chatRoutes