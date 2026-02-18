import { Pool } from 'pg'

// 데이터베이스 연결 설정
export const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'playground',
  password: process.env.DB_PASSWORD || 'please_change_this_password',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
}

// 데이터베이스 연결 풀
export const db = new Pool(dbConfig)

// 연결 테스트
export const testConnection = async () => {
  try {
    const client = await db.connect()
    console.log('✅ PostgreSQL 연결 성공')
    client.release()
  } catch (error) {
    console.error('❌ PostgreSQL 연결 실패:', error)
  }
}

// 앱 종료 시 연결 정리
process.on('SIGINT', async () => {
  await db.end()
  console.log('📝 PostgreSQL 연결이 정리되었습니다')
  process.exit(0)
})