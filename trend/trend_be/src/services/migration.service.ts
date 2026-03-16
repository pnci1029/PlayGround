import { Pool } from 'pg'
import { promises as fs } from 'fs'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface Migration {
  id: number
  filename: string
  executed_at: Date
}

export class MigrationService {
  constructor(private pool: Pool) {}

  // 마이그레이션 테이블 생성
  async createMigrationTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
    await this.pool.query(query)
    console.log('📋 Migration table ready')
  }

  // 실행된 마이그레이션 목록 조회
  async getExecutedMigrations(): Promise<string[]> {
    try {
      const result = await this.pool.query('SELECT filename FROM migrations ORDER BY id')
      return result.rows.map(row => row.filename)
    } catch (error) {
      return []
    }
  }

  // 마이그레이션 파일 목록 조회
  async getMigrationFiles(): Promise<string[]> {
    const migrationDir = join(__dirname, '../../migrations')
    
    try {
      const files = await fs.readdir(migrationDir)
      return files
        .filter(file => file.endsWith('.sql'))
        .filter(file => file !== 'README.md') // README 제외
        .sort() // 파일명 순서로 정렬
    } catch (error) {
      console.log('📁 No migrations directory found, creating...')
      await fs.mkdir(migrationDir, { recursive: true })
      return []
    }
  }

  // 마이그레이션 실행 (세미콜론 기반 분할로 안전하게 실행)
  async runMigration(filename: string): Promise<void> {
    const migrationPath = join(__dirname, '../../migrations', filename)
    console.log(`🚀 Running migration: ${filename} (${migrationPath})`)
    
    try {
      const sql = await fs.readFile(migrationPath, 'utf-8')
      
      // 트랜잭션으로 실행
      const client = await this.pool.connect()
      try {
        await client.query('BEGIN')
        
        console.log(`🔄 Executing SQL file in chunks...`)
        
        // SQL을 세미콜론으로 분할하되 함수 정의 등을 고려
        const queries = this.splitSqlSafely(sql)
        
        for (let i = 0; i < queries.length; i++) {
          const query = queries[i].trim()
          if (query) {
            console.log(`🔄 Executing query ${i + 1}/${queries.length}: ${query.substring(0, 100).replace(/\s+/g, ' ')}...`)
            try {
              await client.query(query)
            } catch (error) {
              console.error(`❌ Query ${i + 1} failed:`, error)
              console.error(`📜 Full query: ${query}`)
              throw error
            }
          }
        }
        
        // 마이그레이션 기록
        await client.query('INSERT INTO migrations (filename) VALUES ($1)', [filename])
        
        await client.query('COMMIT')
        console.log(`✅ Migration executed: ${filename}`)
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    } catch (error) {
      console.error(`❌ Migration failed: ${filename}`, error)
      throw error
    }
  }

  // SQL을 안전하게 분할 (함수 정의 등을 고려)
  private splitSqlSafely(sql: string): string[] {
    const queries: string[] = []
    let currentQuery = ''
    let inFunction = false
    let functionDelimiter = ''
    
    const lines = sql.split('\n')
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      // 함수 정의 시작 감지
      if (trimmedLine.includes('$$') && !inFunction) {
        inFunction = true
        functionDelimiter = '$$'
        currentQuery += line + '\n'
      }
      // 함수 정의 끝 감지  
      else if (inFunction && trimmedLine.includes(functionDelimiter)) {
        currentQuery += line + '\n'
        if (trimmedLine.endsWith(';')) {
          queries.push(currentQuery.trim())
          currentQuery = ''
          inFunction = false
          functionDelimiter = ''
        }
      }
      // 일반 쿼리
      else if (!inFunction && trimmedLine.endsWith(';')) {
        currentQuery += line + '\n'
        queries.push(currentQuery.trim())
        currentQuery = ''
      }
      // 멀티라인 쿼리 계속
      else {
        currentQuery += line + '\n'
      }
    }
    
    // 마지막 쿼리가 있다면 추가
    if (currentQuery.trim()) {
      queries.push(currentQuery.trim())
    }
    
    return queries.filter(q => q.trim() && !q.trim().startsWith('--'))
  }

  // 모든 pending 마이그레이션 실행
  async runPendingMigrations(filterFiles?: string[]): Promise<void> {
    console.log('🔄 Checking for pending migrations...')
    
    await this.createMigrationTable()
    
    const executedMigrations = await this.getExecutedMigrations()
    let allMigrations = await this.getMigrationFiles()
    
    // 특정 파일만 필터링 (선택적)
    if (filterFiles && filterFiles.length > 0) {
      allMigrations = allMigrations.filter(migration => 
        filterFiles.includes(migration)
      )
      console.log(`🎯 Filtering migrations to: ${filterFiles.join(', ')}`)
    }
    
    const pendingMigrations = allMigrations.filter(
      migration => !executedMigrations.includes(migration)
    )

    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations')
      return
    }

    console.log(`📋 Found ${pendingMigrations.length} pending migrations:`, pendingMigrations)
    
    for (const migration of pendingMigrations) {
      await this.runMigration(migration)
    }
    
    console.log('🎉 All migrations completed!')
  }
}