import { AdminModel } from '../models/adminModel'
import { AuthMiddleware } from '../middleware/auth'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  admin?: {
    id: number
    username: string
    email: string
    name?: string
    role: string
  }
  token?: string
  message?: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  name?: string
  role?: 'admin' | 'super_admin'
}

export class AuthService {
  static async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      // 사용자 조회
      const admin = await AdminModel.findByUsername(data.username)
      if (!admin) {
        return {
          success: false,
          message: '존재하지 않는 사용자입니다'
        }
      }

      // 비밀번호 확인
      const isValidPassword = await AdminModel.verifyPassword(
        data.password, 
        admin.password_hash
      )
      if (!isValidPassword) {
        return {
          success: false,
          message: '비밀번호가 일치하지 않습니다'
        }
      }

      // 계정 활성 상태 확인
      if (!admin.is_active) {
        return {
          success: false,
          message: '비활성화된 계정입니다'
        }
      }

      // JWT 토큰 생성
      const token = AuthMiddleware.generateToken({
        adminId: admin.id,
        username: admin.username,
        role: admin.role
      })

      // 마지막 로그인 시간 업데이트
      await AdminModel.updateLastLogin(admin.id)

      return {
        success: true,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          name: admin.name,
          role: admin.role
        },
        token,
        message: '로그인 성공'
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: '로그인 중 오류가 발생했습니다'
      }
    }
  }

  static async register(data: RegisterRequest): Promise<LoginResponse> {
    try {
      // 중복 사용자명 확인
      const existingByUsername = await AdminModel.findByUsername(data.username)
      if (existingByUsername) {
        return {
          success: false,
          message: '이미 사용 중인 사용자명입니다'
        }
      }

      // 중복 이메일 확인
      const existingByEmail = await AdminModel.findByEmail(data.email)
      if (existingByEmail) {
        return {
          success: false,
          message: '이미 사용 중인 이메일입니다'
        }
      }

      // 새 관리자 생성
      const newAdmin = await AdminModel.create({
        username: data.username,
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role || 'admin'
      })

      // JWT 토큰 생성
      const token = AuthMiddleware.generateToken({
        adminId: newAdmin.id,
        username: newAdmin.username,
        role: newAdmin.role
      })

      return {
        success: true,
        admin: {
          id: newAdmin.id,
          username: newAdmin.username,
          email: newAdmin.email,
          name: newAdmin.name,
          role: newAdmin.role
        },
        token,
        message: '관리자 계정이 생성되었습니다'
      }
    } catch (error) {
      console.error('Register error:', error)
      return {
        success: false,
        message: '계정 생성 중 오류가 발생했습니다'
      }
    }
  }

  static async changePassword(
    adminId: number, 
    currentPassword: string, 
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const admin = await AdminModel.findById(adminId)
      if (!admin) {
        return {
          success: false,
          message: '관리자를 찾을 수 없습니다'
        }
      }

      // 현재 비밀번호 확인
      const isValidPassword = await AdminModel.verifyPassword(
        currentPassword, 
        admin.password_hash
      )
      if (!isValidPassword) {
        return {
          success: false,
          message: '현재 비밀번호가 일치하지 않습니다'
        }
      }

      // 새 비밀번호 설정
      await AdminModel.changePassword(adminId, newPassword)

      return {
        success: true,
        message: '비밀번호가 변경되었습니다'
      }
    } catch (error) {
      console.error('Change password error:', error)
      return {
        success: false,
        message: '비밀번호 변경 중 오류가 발생했습니다'
      }
    }
  }

  static async getProfile(adminId: number) {
    try {
      const admin = await AdminModel.findById(adminId)
      if (!admin) {
        return {
          success: false,
          message: '관리자를 찾을 수 없습니다'
        }
      }

      return {
        success: true,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          last_login_at: admin.last_login_at,
          created_at: admin.created_at
        }
      }
    } catch (error) {
      console.error('Get profile error:', error)
      return {
        success: false,
        message: '프로필 조회 중 오류가 발생했습니다'
      }
    }
  }

  static async getAllAdmins() {
    try {
      const admins = await AdminModel.findAll()
      return {
        success: true,
        admins: admins.map(admin => ({
          id: admin.id,
          username: admin.username,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          is_active: admin.is_active,
          last_login_at: admin.last_login_at,
          created_at: admin.created_at
        }))
      }
    } catch (error) {
      console.error('Get all admins error:', error)
      return {
        success: false,
        message: '관리자 목록 조회 중 오류가 발생했습니다'
      }
    }
  }
}