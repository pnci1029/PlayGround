import { testConnection } from '../config/database'
import { DatabaseMigrator } from './migrate'
import { AdminModel } from '../models/adminModel'
import bcrypt from 'bcrypt'

export class DatabaseInitializer {
  async initialize() {
    try {
      console.log('🚀 데이터베이스 초기화 시작...')
      
      // 1. 연결 테스트
      await testConnection()
      
      // 2. 마이그레이션 실행
      const migrator = new DatabaseMigrator()
      await migrator.runMigrations()
      
      // 3. 기본 관리자 계정 생성
      await this.createDefaultAdmin()
      
      console.log('✅ 데이터베이스 초기화 완료!')
    } catch (error) {
      console.error('❌ 데이터베이스 초기화 실패:', error)
      throw error
    }
  }

  private async createDefaultAdmin() {
    try {
      const username = process.env.ADMIN_DEFAULT_USERNAME || 'admin'
      const email = process.env.ADMIN_DEFAULT_EMAIL || 'admin@localhost'
      const password = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123'

      // 이미 관리자가 있는지 확인
      const existingAdmin = await AdminModel.findByUsername(username)
      if (existingAdmin) {
        console.log(`📝 기본 관리자 '${username}'가 이미 존재합니다`)
        return
      }

      // 기본 관리자 계정 생성
      await AdminModel.create({
        username,
        email,
        password,
        name: 'Administrator',
        role: 'super_admin'
      })

      console.log(`✅ 기본 관리자 계정이 생성되었습니다:`)
      console.log(`   Username: ${username}`)
      console.log(`   Email: ${email}`)
      console.log(`   Password: ${password}`)
      console.log('   ⚠️  프로덕션에서는 반드시 비밀번호를 변경하세요!')
      
    } catch (error) {
      console.error('❌ 기본 관리자 생성 실패:', error)
      throw error
    }
  }

  async reset() {
    console.log('⚠️  데이터베이스 리셋은 구현되지 않았습니다')
    console.log('   수동으로 테이블을 삭제하거나 데이터베이스를 다시 만드세요')
  }
}

// 직접 실행 시 초기화 실행
if (require.main === module) {
  const initializer = new DatabaseInitializer()
  
  const command = process.argv[2]
  
  if (command === 'reset') {
    initializer.reset()
  } else {
    initializer.initialize()
      .then(() => {
        console.log('데이터베이스 초기화 완료')
        process.exit(0)
      })
      .catch((error) => {
        console.error('데이터베이스 초기화 실패:', error)
        process.exit(1)
      })
  }
}