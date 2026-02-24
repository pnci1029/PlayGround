import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function initializeDatabase() {
  try {
    await pool.connect();
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
    CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL UNIQUE,
      slug VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
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
    CREATE INDEX IF NOT EXISTS idx_posts_search ON posts USING GIN (to_tsvector('english', title || ' ' || excerpt || ' ' || content))
    `
  ];

  for (const query of queries) {
    await pool.query(query);
  }
  
  console.log('Database tables created/verified successfully');
}