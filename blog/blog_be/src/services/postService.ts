import { pool } from '@/utils/database.js';
import { 
  calculateReadingTime, 
  extractCodeLanguages, 
  dbPostToPost 
} from '@/utils/helpers.js';
import type { 
  CreatePostInput, 
  UpdatePostInput, 
  PostQueryInput 
} from '@/models/post.js';
import type { Post, PostListResponse } from '../../../shared/types/index.js';
import type { DbPost } from '@/types/database.js';

export class PostService {
  async createPost(input: CreatePostInput): Promise<Post> {
    const readingTime = calculateReadingTime(input.content);
    const codeLanguages = extractCodeLanguages(input.content);
    const now = new Date();
    
    const query = `
      INSERT INTO posts (
        title, slug, content, excerpt, category, tags, 
        reading_time, code_languages, is_published, published_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      input.title,
      input.slug,
      input.content,
      input.excerpt,
      input.category,
      input.tags,
      readingTime,
      codeLanguages,
      input.isPublished,
      input.isPublished ? now : null
    ];
    
    const result = await pool.query<DbPost>(query, values);
    return dbPostToPost(result.rows[0]);
  }
  
  async updatePost(id: string, input: UpdatePostInput): Promise<Post | null> {
    const sets: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    if (input.title) {
      sets.push(`title = $${paramCount++}`);
      values.push(input.title);
    }
    
    if (input.slug) {
      sets.push(`slug = $${paramCount++}`);
      values.push(input.slug);
    }
    
    if (input.content) {
      sets.push(`content = $${paramCount++}`);
      values.push(input.content);
      
      const readingTime = calculateReadingTime(input.content);
      const codeLanguages = extractCodeLanguages(input.content);
      
      sets.push(`reading_time = $${paramCount++}`);
      values.push(readingTime);
      
      sets.push(`code_languages = $${paramCount++}`);
      values.push(codeLanguages);
    }
    
    if (input.excerpt !== undefined) {
      sets.push(`excerpt = $${paramCount++}`);
      values.push(input.excerpt);
    }
    
    if (input.category) {
      sets.push(`category = $${paramCount++}`);
      values.push(input.category);
    }
    
    if (input.tags) {
      sets.push(`tags = $${paramCount++}`);
      values.push(input.tags);
    }
    
    if (input.isPublished !== undefined) {
      sets.push(`is_published = $${paramCount++}`);
      values.push(input.isPublished);
      
      if (input.isPublished) {
        sets.push(`published_at = $${paramCount++}`);
        values.push(new Date());
      }
    }
    
    sets.push(`updated_at = $${paramCount++}`);
    values.push(new Date());
    
    values.push(id);
    
    const query = `
      UPDATE posts 
      SET ${sets.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await pool.query<DbPost>(query, values);
    return result.rows[0] ? dbPostToPost(result.rows[0]) : null;
  }
  
  async getPost(slug: string): Promise<Post | null> {
    const query = 'SELECT * FROM posts WHERE slug = $1 AND is_published = TRUE';
    const result = await pool.query<DbPost>(query, [slug]);
    return result.rows[0] ? dbPostToPost(result.rows[0]) : null;
  }
  
  async getPostById(id: string): Promise<Post | null> {
    const query = 'SELECT * FROM posts WHERE id = $1';
    const result = await pool.query<DbPost>(query, [id]);
    return result.rows[0] ? dbPostToPost(result.rows[0]) : null;
  }
  
  async getPosts(query: PostQueryInput): Promise<PostListResponse> {
    const { page, limit, category, tags, search, sortBy, sortOrder } = query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE is_published = TRUE';
    const queryParams: any[] = [];
    let paramCount = 1;
    
    if (category) {
      whereClause += ` AND category = $${paramCount++}`;
      queryParams.push(category);
    }
    
    if (tags && tags.length > 0) {
      whereClause += ` AND tags && $${paramCount++}`;
      queryParams.push(tags);
    }
    
    if (search) {
      whereClause += ` AND (
        to_tsvector('english', title || ' ' || excerpt || ' ' || content) 
        @@ plainto_tsquery('english', $${paramCount++})
      )`;
      queryParams.push(search);
    }
    
    const orderByMap = {
      publishedAt: 'published_at',
      updatedAt: 'updated_at',
      readingTime: 'reading_time'
    };
    
    const orderBy = `ORDER BY ${orderByMap[sortBy]} ${sortOrder.toUpperCase()}`;
    
    // Get total count
    const countQuery = `SELECT COUNT(*) FROM posts ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);
    
    // Get posts
    const postsQuery = `
      SELECT * FROM posts 
      ${whereClause} 
      ${orderBy}
      LIMIT $${paramCount++} OFFSET $${paramCount++}
    `;
    
    queryParams.push(limit, offset);
    const postsResult = await pool.query<DbPost>(postsQuery, queryParams);
    
    const posts = postsResult.rows.map(dbPostToPost);
    const totalPages = Math.ceil(total / limit);
    
    return {
      posts,
      total,
      page,
      limit,
      totalPages
    };
  }
  
  async deletePost(id: string): Promise<boolean> {
    const query = 'DELETE FROM posts WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }
}