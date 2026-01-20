import { FastifyInstance } from 'fastify'
import { AuthController } from '../controllers/authController'
import { AuthMiddleware } from '../middleware/auth'

export async function authRoutes(fastify: FastifyInstance) {
  // 로그인 (인증 불필요)
  fastify.post('/login', AuthController.login)

  // 로그아웃 (인증 불필요 - 클라이언트에서 토큰 삭제)
  fastify.post('/logout', AuthController.logout)

  // 인증이 필요한 라우트들
  fastify.addHook('preHandler', AuthMiddleware.authenticate)

  // 내 프로필 조회
  fastify.get('/profile', AuthController.getProfile)

  // 비밀번호 변경
  fastify.patch('/password', AuthController.changePassword)

  // 관리자 생성 (기존 관리자만 가능)
  fastify.post('/register', AuthController.register)

  // 모든 관리자 목록 조회 (super_admin만 가능)
  fastify.get('/admins', AuthController.getAllAdmins)

  // 토큰 검증 엔드포인트 (프론트엔드에서 토큰 유효성 확인용)
  fastify.get('/verify', async (request, reply) => {
    // AuthMiddleware.authenticate가 이미 실행되어 request.admin이 설정됨
    return reply.send({
      success: true,
      admin: (request as any).admin,
      message: '유효한 토큰입니다'
    })
  })
}