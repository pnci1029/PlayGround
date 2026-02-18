import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'
import { AdminModel } from '../models/adminModel'

const JWT_SECRET = process.env.JWT_SECRET || 'please_change_this_jwt_secret_in_production'

export interface JWTPayload {
  adminId: number
  username: string
  role: string
}

export interface AuthenticatedRequest extends FastifyRequest {
  admin?: {
    id: number
    username: string
    email: string
    role: string
  }
}

export class AuthMiddleware {
  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { 
      expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
    } as jwt.SignOptions)
  }

  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch (error) {
      throw new Error('유효하지 않은 토큰입니다')
    }
  }

  static async authenticate(
    request: AuthenticatedRequest, 
    reply: FastifyReply
  ) {
    try {
      // Authorization 헤더에서 토큰 추출
      const authHeader = request.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({
          success: false,
          error: 'UNAUTHORIZED',
          message: '인증 토큰이 필요합니다'
        })
      }

      const token = authHeader.substring(7) // 'Bearer ' 제거
      const payload = AuthMiddleware.verifyToken(token)

      // 데이터베이스에서 관리자 정보 확인
      const admin = await AdminModel.findById(payload.adminId)
      if (!admin || !admin.is_active) {
        return reply.status(401).send({
          success: false,
          error: 'UNAUTHORIZED', 
          message: '유효하지 않은 관리자 계정입니다'
        })
      }

      // request 객체에 관리자 정보 추가
      request.admin = {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : '인증 실패'
      return reply.status(401).send({
        success: false,
        error: 'UNAUTHORIZED',
        message
      })
    }
  }

  static requireRole(roles: string[]) {
    return async (request: AuthenticatedRequest, reply: FastifyReply) => {
      if (!request.admin) {
        return reply.status(401).send({
          success: false,
          error: 'UNAUTHORIZED',
          message: '인증이 필요합니다'
        })
      }

      if (!roles.includes(request.admin.role)) {
        return reply.status(403).send({
          success: false,
          error: 'FORBIDDEN',
          message: '권한이 부족합니다'
        })
      }
    }
  }

  static requireSuperAdmin() {
    return AuthMiddleware.requireRole(['super_admin'])
  }

  static requireAdmin() {
    return AuthMiddleware.requireRole(['admin', 'super_admin'])
  }

  // 선택적 인증 (토큰이 있으면 인증, 없어도 계속 진행)
  static async optionalAuth(
    request: AuthenticatedRequest, 
    reply: FastifyReply
  ) {
    try {
      const authHeader = request.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return // 토큰이 없으면 그냥 진행
      }

      const token = authHeader.substring(7)
      const payload = AuthMiddleware.verifyToken(token)
      const admin = await AdminModel.findById(payload.adminId)
      
      if (admin && admin.is_active) {
        request.admin = {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role
        }
      }
    } catch (error) {
      // 선택적 인증이므로 에러가 있어도 무시하고 계속 진행
    }
  }
}