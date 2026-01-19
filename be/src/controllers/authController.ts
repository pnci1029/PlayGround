import { FastifyRequest, FastifyReply } from 'fastify'
import { AuthService, LoginRequest, RegisterRequest } from '../services/authService'
import { AuthenticatedRequest } from '../middleware/auth'

export class AuthController {
  static async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { username, password } = request.body as LoginRequest

      // 입력값 검증
      if (!username || !password) {
        return reply.status(400).send({
          success: false,
          error: 'VALIDATION_ERROR',
          message: '사용자명과 비밀번호를 입력해주세요'
        })
      }

      const result = await AuthService.login({ username, password })

      if (!result.success) {
        return reply.status(401).send(result)
      }

      return reply.send(result)
    } catch (error) {
      console.error('Login controller error:', error)
      return reply.status(500).send({
        success: false,
        error: 'INTERNAL_ERROR',
        message: '서버 오류가 발생했습니다'
      })
    }
  }

  static async register(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { username, email, password, name, role } = request.body as RegisterRequest

      // 입력값 검증
      if (!username || !email || !password) {
        return reply.status(400).send({
          success: false,
          error: 'VALIDATION_ERROR',
          message: '사용자명, 이메일, 비밀번호를 입력해주세요'
        })
      }

      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return reply.status(400).send({
          success: false,
          error: 'VALIDATION_ERROR',
          message: '올바른 이메일 형식을 입력해주세요'
        })
      }

      // 비밀번호 강도 검증
      if (password.length < 6) {
        return reply.status(400).send({
          success: false,
          error: 'VALIDATION_ERROR',
          message: '비밀번호는 6자 이상이어야 합니다'
        })
      }

      // super_admin 역할 생성 권한 확인
      if (role === 'super_admin' && request.admin?.role !== 'super_admin') {
        return reply.status(403).send({
          success: false,
          error: 'FORBIDDEN',
          message: 'super_admin 계정은 super_admin만 생성할 수 있습니다'
        })
      }

      const result = await AuthService.register({
        username,
        email,
        password,
        name,
        role
      })

      if (!result.success) {
        return reply.status(400).send(result)
      }

      return reply.status(201).send(result)
    } catch (error) {
      console.error('Register controller error:', error)
      return reply.status(500).send({
        success: false,
        error: 'INTERNAL_ERROR',
        message: '서버 오류가 발생했습니다'
      })
    }
  }

  static async getProfile(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      if (!request.admin) {
        return reply.status(401).send({
          success: false,
          error: 'UNAUTHORIZED',
          message: '인증이 필요합니다'
        })
      }

      const result = await AuthService.getProfile(request.admin.id)
      
      if (!result.success) {
        return reply.status(404).send(result)
      }

      return reply.send(result)
    } catch (error) {
      console.error('Get profile controller error:', error)
      return reply.status(500).send({
        success: false,
        error: 'INTERNAL_ERROR',
        message: '서버 오류가 발생했습니다'
      })
    }
  }

  static async changePassword(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      if (!request.admin) {
        return reply.status(401).send({
          success: false,
          error: 'UNAUTHORIZED',
          message: '인증이 필요합니다'
        })
      }

      const { currentPassword, newPassword } = request.body as {
        currentPassword: string
        newPassword: string
      }

      // 입력값 검증
      if (!currentPassword || !newPassword) {
        return reply.status(400).send({
          success: false,
          error: 'VALIDATION_ERROR',
          message: '현재 비밀번호와 새 비밀번호를 입력해주세요'
        })
      }

      if (newPassword.length < 6) {
        return reply.status(400).send({
          success: false,
          error: 'VALIDATION_ERROR',
          message: '새 비밀번호는 6자 이상이어야 합니다'
        })
      }

      const result = await AuthService.changePassword(
        request.admin.id,
        currentPassword,
        newPassword
      )

      if (!result.success) {
        return reply.status(400).send(result)
      }

      return reply.send(result)
    } catch (error) {
      console.error('Change password controller error:', error)
      return reply.status(500).send({
        success: false,
        error: 'INTERNAL_ERROR',
        message: '서버 오류가 발생했습니다'
      })
    }
  }

  static async getAllAdmins(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      // super_admin만 모든 관리자 조회 가능
      if (request.admin?.role !== 'super_admin') {
        return reply.status(403).send({
          success: false,
          error: 'FORBIDDEN',
          message: '관리자 목록 조회 권한이 없습니다'
        })
      }

      const result = await AuthService.getAllAdmins()
      
      if (!result.success) {
        return reply.status(500).send(result)
      }

      return reply.send(result)
    } catch (error) {
      console.error('Get all admins controller error:', error)
      return reply.status(500).send({
        success: false,
        error: 'INTERNAL_ERROR',
        message: '서버 오류가 발생했습니다'
      })
    }
  }

  static async logout(request: AuthenticatedRequest, reply: FastifyReply) {
    // JWT는 stateless이므로 서버에서 할 일이 없음
    // 클라이언트에서 토큰을 삭제하면 됨
    return reply.send({
      success: true,
      message: '로그아웃되었습니다'
    })
  }
}