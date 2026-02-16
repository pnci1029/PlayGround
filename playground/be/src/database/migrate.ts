import { db } from '../config/database'
import fs from 'fs'
import path from 'path'

export class DatabaseMigrator {
  private migrationsDir = path.join(__dirname, 'migrations')

  async runMigrations() {
    try {
      console.log('🚀 데이터베이스 마이그레이션 시작...')
      
      // 마이그레이션 테이블 생성
      await this.createMigrationsTable()
      
      // 마이그레이션 파일들 읽기
      const migrationFiles = fs.readdirSync(this.migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort()
      
      for (const file of migrationFiles) {
        await this.runMigration(file)
      }
      
      console.log('✅ 모든 마이그레이션이 완료되었습니다')
    } catch (error) {
      console.error('❌ 마이그레이션 실행 중 오류:', error)
      throw error
    }
  }

  private async createMigrationsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    await db.query(query)
  }

  private async runMigration(filename: string) {
    // 이미 실행된 마이그레이션인지 확인
    const checkQuery = 'SELECT filename FROM migrations WHERE filename = $1'
    const result = await db.query(checkQuery, [filename])
    
    if (result.rows.length > 0) {
      console.log(`⏭️  ${filename} - 이미 실행됨`)
      return
    }

    // 마이그레이션 파일 읽기 및 실행
    const filePath = path.join(this.migrationsDir, filename)
    const sql = fs.readFileSync(filePath, 'utf-8')
    
    console.log(`🔄 ${filename} 실행 중...`)
    
    // 트랜잭션으로 실행
    const client = await db.connect()
    try {
      await client.query('BEGIN')
      
      // SQL 실행
      await client.query(sql)
      
      // 마이그레이션 기록 저장
      await client.query(
        'INSERT INTO migrations (filename) VALUES ($1)',
        [filename]
      )
      
      await client.query('COMMIT')
      console.log(`✅ ${filename} 완료`)
    } catch (error) {
      await client.query('ROLLBACK')
      console.error(`❌ ${filename} 실패:`, error)
      throw error
    } finally {
      client.release()
    }
  }

  async rollbackMigration(filename: string) {
    console.log(`🔄 ${filename} 롤백 중...`)
    // 롤백 로직은 필요시 추가
  }
}

// 직접 실행 시 마이그레이션 실행
if (require.main === module) {
  const migrator = new DatabaseMigrator()
  migrator.runMigrations()
    .then(() => {
      console.log('마이그레이션 완료')
      process.exit(0)
    })
    .catch((error) => {
      console.error('마이그레이션 실패:', error)
      process.exit(1)
    })
}