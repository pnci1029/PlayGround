import { Pool, PoolClient, QueryResult } from 'pg'
import { TrendData } from '../types/trend.types'

export interface CategoryData {
  id: number
  name: string
  display_name: string
  description: string | null
  color: string | null
  icon: string | null
  is_active: boolean
}

export interface StoredTrendData extends TrendData {
  id: number
  raw_data?: any
  created_at: Date
  updated_at: Date
}

export class DatabaseService {
  public pool: Pool
  
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'playground',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      // PostgreSQL connection pool settings
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    this.pool.on('error', (err) => {
      console.error('❌ PostgreSQL Pool Error:', err)
    })
  }

  // 필수 테이블 초기화
  async initializeTables(): Promise<void> {
    try {
      // trending_rankings 테이블 생성
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS trend.trending_rankings (
          id SERIAL PRIMARY KEY,
          keyword VARCHAR(500) NOT NULL,
          timeframe VARCHAR(10) NOT NULL,
          current_rank INTEGER NOT NULL,
          previous_rank INTEGER,
          trending_score DECIMAL(10,4) NOT NULL DEFAULT 0,
          mentions_count INTEGER NOT NULL DEFAULT 0,
          engagement_total BIGINT NOT NULL DEFAULT 0,
          growth_rate DECIMAL(8,4) DEFAULT 0,
          sources TEXT[] DEFAULT '{}',
          calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_rankings_timeframe_rank ON trend.trending_rankings(timeframe, current_rank);
        CREATE INDEX IF NOT EXISTS idx_rankings_calculated_at ON trend.trending_rankings(calculated_at DESC);
        CREATE INDEX IF NOT EXISTS idx_rankings_keyword ON trend.trending_rankings(keyword);
      `
      
      await this.pool.query(createTableQuery)
      console.log('✅ trending_rankings 테이블 초기화 완료')
    } catch (error) {
      console.error('❌ 테이블 초기화 실패:', error)
    }
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

  // 편의 메서드 - 직접 쿼리 실행
  async query(text: string, params?: any[]): Promise<any[]> {
    const result = await this.pool.query(text, params)
    return result.rows
  }

  // 트렌드 데이터 저장
  async saveTrends(trends: TrendData[]): Promise<StoredTrendData[]> {
    const client = await this.pool.connect()
    
    try {
      await client.query('BEGIN')
      
      const savedTrends: StoredTrendData[] = []
      
      for (const trend of trends) {
        const category = await this.getCategoryByKeyword(trend.keyword, client) || trend.category
        
        const insertQuery = `
          INSERT INTO trend.trends (keyword, interest, category, source, region, url, rank, raw_data)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (keyword, source) 
          DO UPDATE SET 
            interest = EXCLUDED.interest,
            rank = EXCLUDED.rank,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `
        
        const result = await client.query(insertQuery, [
          trend.keyword,
          trend.interest,
          category,
          trend.source,
          trend.region,
          trend.url,
          trend.rank,
          JSON.stringify(trend)
        ])
        
        if (result.rows[0]) {
          const saved: StoredTrendData = {
            ...trend,
            id: result.rows[0].id,
            created_at: result.rows[0].created_at,
            updated_at: result.rows[0].updated_at
          }
          savedTrends.push(saved)
          
          // 히스토리에도 저장
          await this.saveTrendHistory(saved.id, trend.interest, trend.rank, client)
        }
      }
      
      await client.query('COMMIT')
      console.log(`💾 ${savedTrends.length}개 트렌드 저장 완료`)
      
      return savedTrends
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('❌ 트렌드 저장 실패:', error)
      throw error
    } finally {
      client.release()
    }
  }

  // 트렌드 히스토리 저장
  private async saveTrendHistory(trendId: number, interest: number, rank: number | undefined, client: PoolClient) {
    const historyQuery = `
      INSERT INTO trend.trend_history (trend_id, interest, rank)
      VALUES ($1, $2, $3)
    `
    await client.query(historyQuery, [trendId, interest, rank])
  }

  // 최신 트렌드 조회
  async getLatestTrends(limit: number = 100, source?: string): Promise<StoredTrendData[]> {
    let query = `
      SELECT * FROM trend.trends 
      WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
    `
    const params: any[] = []
    
    if (source) {
      query += ` AND source = $${params.length + 1}`
      params.push(source)
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`
    params.push(limit)
    
    const result = await this.pool.query(query, params)
    return result.rows.map(row => this.mapRowToTrend(row))
  }

  // 카테고리별 트렌드 조회
  async getTrendsByCategory(category: string, limit: number = 50): Promise<StoredTrendData[]> {
    const query = `
      SELECT * FROM trend.trends 
      WHERE category = $1 AND created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
      ORDER BY interest DESC, created_at DESC 
      LIMIT $2
    `
    const result = await this.pool.query(query, [category, limit])
    return result.rows.map(row => this.mapRowToTrend(row))
  }

  // 트렌드 히스토리 조회 (차트용)
  async getTrendHistory(trendId: number, hours: number = 24): Promise<any[]> {
    const query = `
      SELECT interest, rank, snapshot_at
      FROM trend.trend_history 
      WHERE trend_id = $1 AND snapshot_at > CURRENT_TIMESTAMP - INTERVAL '${hours} hours'
      ORDER BY snapshot_at ASC
    `
    const result = await this.pool.query(query, [trendId])
    return result.rows
  }

  // 키워드로 카테고리 자동 분류
  private async getCategoryByKeyword(keyword: string, client: PoolClient): Promise<string | null> {
    const query = `
      SELECT c.name
      FROM trend.keyword_mappings km
      JOIN trend.categories c ON km.category_id = c.id
      WHERE $1 ILIKE '%' || km.keyword_pattern || '%' AND km.is_active = true
      ORDER BY km.priority ASC
      LIMIT 1
    `
    const result = await client.query(query, [keyword])
    return result.rows[0]?.name || null
  }

  // 모든 카테고리 조회
  async getCategories(): Promise<CategoryData[]> {
    const query = `
      SELECT * FROM trend.categories 
      WHERE is_active = true 
      ORDER BY name ASC
    `
    const result = await this.pool.query(query)
    return result.rows
  }

  // 소스별 통계
  async getSourceStats(): Promise<any[]> {
    const query = `
      SELECT 
        source,
        COUNT(*) as total_trends,
        AVG(interest) as avg_interest,
        MAX(interest) as max_interest,
        COUNT(DISTINCT category) as unique_categories
      FROM trend.trends 
      WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
      GROUP BY source
      ORDER BY total_trends DESC
    `
    const result = await this.pool.query(query)
    return result.rows
  }

  // 카테고리별 통계
  async getCategoryStats(): Promise<any[]> {
    const query = `
      SELECT 
        t.category,
        c.display_name,
        c.color,
        c.icon,
        COUNT(*) as total_trends,
        AVG(t.interest) as avg_interest
      FROM trend.trends t
      LEFT JOIN trend.categories c ON t.category = c.name
      WHERE t.created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
      GROUP BY t.category, c.display_name, c.color, c.icon
      ORDER BY total_trends DESC
    `
    const result = await this.pool.query(query)
    return result.rows
  }

  // 검색 기능
  async searchTrends(query: string, limit: number = 20): Promise<StoredTrendData[]> {
    const searchQuery = `
      SELECT * FROM trend.trends 
      WHERE keyword ILIKE $1 OR category ILIKE $1
      AND created_at > CURRENT_TIMESTAMP - INTERVAL '7 days'
      ORDER BY 
        CASE WHEN keyword ILIKE $1 THEN 1 ELSE 2 END,
        interest DESC,
        created_at DESC 
      LIMIT $2
    `
    const result = await this.pool.query(searchQuery, [`%${query}%`, limit])
    return result.rows.map(row => this.mapRowToTrend(row))
  }

  // 데이터 정리 (오래된 데이터 삭제)
  async cleanup(): Promise<void> {
    try {
      const result = await this.pool.query('SELECT trend.cleanup_old_history()')
      console.log('🧹 데이터 정리 완료')
    } catch (error) {
      console.error('❌ 데이터 정리 실패:', error)
    }
  }

  // DB 행을 TrendData로 변환
  private mapRowToTrend(row: any): StoredTrendData {
    return {
      id: row.id,
      keyword: row.keyword,
      interest: row.interest,
      category: row.category,
      source: row.source,
      timestamp: row.created_at,
      region: row.region,
      url: row.url,
      rank: row.rank,
      raw_data: row.raw_data,
      created_at: row.created_at,
      updated_at: row.updated_at
    }
  }

  // 연결 종료
  async close(): Promise<void> {
    await this.pool.end()
    console.log('🔌 PostgreSQL 연결 종료')
  }
}

export const databaseService = new DatabaseService()