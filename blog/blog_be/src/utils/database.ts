import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: false
});

export async function initializeDatabase() {
  try {
    // pool.connect() 로 얻은 client 를 release 하지 않으면 커넥션이 영구 점유된다.
    // pool.query 는 내부적으로 client 를 빌렸다가 자동 반환하므로 연결 확인용으로 적합.
    await pool.query('SELECT 1');
    console.log('Database connected successfully');
    
    // Create tables if they don't exist
    await createTables();
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

async function createTables() {
  const queries = [
    `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      display_name VARCHAR(100),
      role VARCHAR(20) DEFAULT 'writer' CHECK (role IN ('admin', 'editor', 'writer', 'viewer')),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      last_login_at TIMESTAMP
    )
    `,
    `
    CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL UNIQUE,
      slug VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      color VARCHAR(7) DEFAULT '#3B82F6',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
    `,
    `
    CREATE TABLE IF NOT EXISTS tags (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL UNIQUE,
      slug VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
    `,
    `
    CREATE TABLE IF NOT EXISTS posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(500) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      content TEXT NOT NULL,
      excerpt TEXT,
      category VARCHAR(255) NOT NULL,
      tags TEXT[] DEFAULT ARRAY[]::TEXT[],
      author_id UUID REFERENCES users(id) ON DELETE SET NULL,
      author_name VARCHAR(100),
      published_at TIMESTAMP,
      updated_at TIMESTAMP DEFAULT NOW(),
      reading_time INTEGER DEFAULT 0,
      code_languages TEXT[] DEFAULT ARRAY[]::TEXT[],
      is_published BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    )
    `,
    `
    CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts (published_at DESC) WHERE is_published = TRUE
    `,
    `
    CREATE INDEX IF NOT EXISTS idx_posts_category ON posts (category)
    `,
    `
    CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN (tags)
    `,
    `
    CREATE INDEX IF NOT EXISTS idx_posts_search ON posts USING GIN (to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || content))
    `
  ];

  for (const query of queries) {
    await pool.query(query);
  }
  
  console.log('Database tables created/verified successfully');
}