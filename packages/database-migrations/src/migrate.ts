import { Pool, PoolClient } from 'pg'
import fs from 'fs'
import path from 'path'
import { config } from 'dotenv'

// 환경 변수 로드
config()

interface Migration {
  filename: string
  content: string
}

export class DatabaseMigrator {
  private pool: Pool
  private migrationsDir = path.join(__dirname, 'migrations')

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'playground',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    this.pool.on('error', (err) => {
      console.error('❌ PostgreSQL Pool Error:', err)
    })
  }

  async testConnection(): Promise<boolean> {
    try {
      const client = await this.pool.connect()
      await client.query('SELECT NOW()')
      client.release()
      console.log('✅ PostgreSQL 연결 성공')
      return true
    } catch (error) {
      console.error('❌ PostgreSQL 연결 실패:', error)
      return false
    }
  }

  async runMigrations(specificFile?: string): Promise<void> {
    try {
      console.log('🚀 중앙 집중식 데이터베이스 마이그레이션 시작...')
      
      // 연결 테스트
      const connected = await this.testConnection()
      if (!connected) {
        throw new Error('데이터베이스 연결 실패')
      }

      // 마이그레이션 테이블 생성
      await this.createMigrationsTable()
      
      // 마이그레이션 파일들 읽기
      const migrations = this.loadMigrations(specificFile)
      
      if (specificFile) {
        console.log(`📁 특정 파일 실행: ${specificFile}`)
      } else {
        console.log(`📁 ${migrations.length}개의 마이그레이션 파일 발견`)
      }
      
      for (const migration of migrations) {
        await this.runMigration(migration)
      }
      
      console.log('✅ 모든 마이그레이션이 완료되었습니다!')
    } catch (error) {
      console.error('❌ 마이그레이션 실행 중 오류:', error)
      throw error
    }
  }

  private loadMigrations(specificFile?: string): Migration[] {
    if (!fs.existsSync(this.migrationsDir)) {
      console.log('⚠️ migrations 디렉토리가 존재하지 않습니다')
      return []
    }

    let files: string[]
    
    if (specificFile) {
      // 특정 파일만 실행
      const filePath = path.join(this.migrationsDir, specificFile)
      if (!fs.existsSync(filePath)) {
        throw new Error(`마이그레이션 파일을 찾을 수 없습니다: ${specificFile}`)
      }
      files = [specificFile]
    } else {
      // 모든 SQL 파일 실행
      files = fs.readdirSync(this.migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort()
    }

    return files.map(filename => ({
      filename,
      content: fs.readFileSync(path.join(this.migrationsDir, filename), 'utf-8')
    }))
  }

  private async createMigrationsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        checksum VARCHAR(64) -- 파일 변경 감지용
      )
    `
    await this.pool.query(query)
  }

  private async runMigration(migration: Migration): Promise<void> {
    // 체크섬 계산 (간단한 해시)
    const checksum = this.calculateChecksum(migration.content)
    
    // 이미 실행된 마이그레이션인지 확인
    const checkQuery = 'SELECT filename, checksum FROM migrations WHERE filename = $1'
    const result = await this.pool.query(checkQuery, [migration.filename])
    
    if (result.rows.length > 0) {
      const existing = result.rows[0]
      if (existing.checksum === checksum) {
        console.log(`⏭️  ${migration.filename} - 이미 실행됨`)
        return
      } else {
        console.log(`⚠️  ${migration.filename} - 파일이 변경되었습니다. 재실행하지 않습니다.`)
        return
      }
    }

    // 마이그레이션 실행
    console.log(`🔄 ${migration.filename} 실행 중...`)
    
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')
      
      // SQL 실행 (여러 문장 지원)
      const statements = migration.content
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0)

      for (const statement of statements) {
        if (statement.trim()) {
          await client.query(statement)
        }
      }
      
      // 마이그레이션 기록 저장
      await client.query(
        'INSERT INTO migrations (filename, checksum) VALUES ($1, $2)',
        [migration.filename, checksum]
      )
      
      await client.query('COMMIT')
      console.log(`✅ ${migration.filename} 완료`)
    } catch (error) {
      await client.query('ROLLBACK')
      console.error(`❌ ${migration.filename} 실패:`, error)
      throw error
    } finally {
      client.release()
    }
  }

  private calculateChecksum(content: string): string {
    // 간단한 체크섬 (실제로는 crypto 모듈 사용 권장)
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 32bit 정수로 변환
    }
    return hash.toString(16)
  }

  async rollbackMigration(filename: string): Promise<void> {
    console.log(`🔄 ${filename} 롤백 중...`)
    
    try {
      // 롤백 기록 삭제
      await this.pool.query('DELETE FROM migrations WHERE filename = $1', [filename])
      console.log(`✅ ${filename} 롤백 완료 (기록 삭제됨)`)
      console.log('⚠️ 실제 스키마 변경은 수동으로 롤백해야 합니다')
    } catch (error) {
      console.error(`❌ ${filename} 롤백 실패:`, error)
      throw error
    }
  }

  async listMigrations(): Promise<void> {
    try {
      const result = await this.pool.query(
        'SELECT filename, executed_at FROM migrations ORDER BY executed_at ASC'
      )
      
      console.log('📋 실행된 마이그레이션 목록:')
      result.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.filename} (${row.executed_at})`)
      })
    } catch (error) {
      console.error('❌ 마이그레이션 목록 조회 실패:', error)
    }
  }

  async close(): Promise<void> {
    await this.pool.end()
    console.log('🔌 PostgreSQL 연결 종료')
  }
}

// 직접 실행 시 마이그레이션 실행
if (require.main === module) {
  const migrator = new DatabaseMigrator()
  
  const command = process.argv[2]
  const target = process.argv[3]
  
  async function main() {
    try {
      switch (command) {
        case 'rollback':
          if (!target) {
            console.error('❌ 롤백할 마이그레이션 파일명을 지정하세요')
            process.exit(1)
          }
          await migrator.rollbackMigration(target)
          break
        case 'list':
          await migrator.listMigrations()
          break
        default:
          await migrator.runMigrations(process.argv[2])
      }
    } catch (error) {
      console.error('❌ 작업 실패:', error)
      process.exit(1)
    } finally {
      await migrator.close()
    }
  }

  main()
}

export default DatabaseMigrator