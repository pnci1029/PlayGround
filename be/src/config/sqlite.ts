import sqlite3 from 'sqlite3'
import { promisify } from 'util'

// SQLite 인메모리 DB 설정
class SQLiteDatabase {
  private db: sqlite3.Database

  constructor() {
    // 인메모리 DB (:memory:) 또는 파일 DB (./playground.db)
    const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : './playground.db'
    this.db = new sqlite3.Database(dbPath)
    
    // 외래키 제약조건 활성화
    this.db.run('PRAGMA foreign_keys = ON')
  }

  // 프로미스 래퍼 함수들
  async run(sql: string, params: any[] = []): Promise<{ rowCount: number; lastID?: number }> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err)
        } else {
          resolve({ rowCount: this.changes, lastID: this.lastID })
        }
      })
    })
  }

  async query(sql: string, params: any[] = []): Promise<{ rows: any[] }> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve({ rows })
        }
      })
    })
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  }

  // 테이블 초기화
  async initTables() {
    const createAdminsTable = `
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
        is_active BOOLEAN DEFAULT true,
        last_login_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `

    const createProjectsTable = `
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        description TEXT,
        subdomain VARCHAR(50) UNIQUE,
        git_repo VARCHAR(255),
        branch VARCHAR(50) DEFAULT 'main',
        build_command VARCHAR(255),
        start_command VARCHAR(255),
        port INTEGER,
        env_vars TEXT DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'building', 'error')),
        created_by INTEGER REFERENCES admins(id),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `

    await this.run(createAdminsTable)
    await this.run(createProjectsTable)
    
    console.log('✅ SQLite 테이블 초기화 완료')
  }

  // 기본 관리자 생성
  async createDefaultAdmin() {
    const bcrypt = require('bcrypt')
    
    try {
      const existing = await this.get('SELECT id FROM admins WHERE username = ?', ['admin'])
      if (existing) {
        console.log('📝 기본 관리자가 이미 존재합니다')
        return
      }

      const password_hash = await bcrypt.hash('admin123', 12)
      
      await this.run(`
        INSERT INTO admins (username, email, password_hash, name, role)
        VALUES (?, ?, ?, ?, ?)
      `, ['admin', 'admin@localhost', password_hash, 'Administrator', 'super_admin'])
      
      console.log('✅ 기본 관리자 계정 생성됨: admin / admin123')
    } catch (error) {
      console.error('❌ 기본 관리자 생성 실패:', error)
    }
  }

  async close() {
    return new Promise<void>((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}

// 싱글톤 인스턴스
export const db = new SQLiteDatabase()

export const testConnection = async () => {
  try {
    await db.query('SELECT 1')
    console.log('✅ SQLite 연결 성공')
    
    // 테이블 초기화
    await db.initTables()
    
    // 기본 관리자 생성
    await db.createDefaultAdmin()
    
  } catch (error) {
    console.error('❌ SQLite 연결 실패:', error)
  }
}