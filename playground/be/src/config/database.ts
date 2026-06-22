import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

// 데이터베이스 연결 설정
// 필수 환경변수 검증
if (!process.env.DB_PASSWORD) {
  throw new Error('DB_PASSWORD environment variable is required')
}
if (!process.env.DB_USER) {
  throw new Error('DB_USER environment variable is required')
}
if (!process.env.DB_HOST) {
  throw new Error('DB_HOST environment variable is required')
}
if (!process.env.DB_NAME) {
  throw new Error('DB_NAME environment variable is required')
}

export const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
}

// 데이터베이스 연결 풀
export const db = new Pool(dbConfig)

// 연결 테스트 및 테이블 초기화
export const testConnection = async () => {
  try {
    const client = await db.connect()
    console.log('✅ PostgreSQL 연결 성공')
    client.release()
  } catch (error) {
    console.error('❌ PostgreSQL 연결 실패:', error)
    // 연결 실패를 삼키면 DB 없이 서버가 떠서 모든 쿼리가 실패한다. 부팅을 중단한다.
    throw error
  }
}

// 데이터베이스 테이블 초기화
export const initializeTables = async () => {
  try {
    // 채팅 메시지 테이블 생성
    await db.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        nickname VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        timestamp BIGINT NOT NULL,
        user_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // 도구 통계 테이블 생성
    await db.query(`
      CREATE TABLE IF NOT EXISTS tool_stats (
        id SERIAL PRIMARY KEY,
        tool_name VARCHAR(100) UNIQUE NOT NULL,
        total_visits INTEGER DEFAULT 0,
        daily_visits INTEGER DEFAULT 0,
        weekly_visits INTEGER DEFAULT 0,
        last_visited TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // 일별 도구 방문 통계 테이블 생성
    await db.query(`
      CREATE TABLE IF NOT EXISTS daily_tool_visits (
        id SERIAL PRIMARY KEY,
        tool_name VARCHAR(100) NOT NULL,
        visit_date DATE NOT NULL,
        visit_count INTEGER DEFAULT 0,
        UNIQUE(tool_name, visit_date)
      );
    `)

    // 성능을 위한 인덱스 생성
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp 
      ON chat_messages (timestamp DESC);
    `)

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at 
      ON chat_messages (created_at DESC);
    `)

    console.log('✅ 데이터베이스 테이블 초기화 완료')
  } catch (error) {
    console.error('❌ 데이터베이스 테이블 초기화 실패:', error)
    throw error
  }
}

// 앱 종료 시 연결 정리
process.on('SIGINT', async () => {
  await db.end()
  console.log('📝 PostgreSQL 연결이 정리되었습니다')
  process.exit(0)
})