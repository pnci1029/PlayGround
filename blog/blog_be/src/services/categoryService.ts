import { pool } from '../utils/database.js';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '../models/category.js';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export class CategoryService {
  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const { name, description, color } = input;
    const slug = generateSlug(name);
    
    // Check if category already exists
    const existingCategory = await pool.query(
      'SELECT id FROM categories WHERE name = $1 OR slug = $2',
      [name, slug]
    );
    
    if (existingCategory.rows.length > 0) {
      throw new Error('Category already exists');
    }
    
    const result = await pool.query(
      `INSERT INTO categories (name, slug, description, color, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, name, slug, description, color, is_active, created_at, updated_at`,
      [name, slug, description, color]
    );
    
    return result.rows[0];
  }
  
  async getAllCategories(): Promise<Category[]> {
    const result = await pool.query(
      'SELECT id, name, slug, description, color, is_active, created_at, updated_at FROM categories ORDER BY name'
    );
    
    return result.rows;
  }
  
  async getActiveCategories(): Promise<Category[]> {
    const result = await pool.query(
      'SELECT id, name, slug, description, color, is_active, created_at, updated_at FROM categories WHERE is_active = true ORDER BY name'
    );
    
    return result.rows;
  }
  
  async getCategoryById(id: string): Promise<Category | null> {
    const result = await pool.query(
      'SELECT id, name, slug, description, color, is_active, created_at, updated_at FROM categories WHERE id = $1',
      [id]
    );
    
    return result.rows[0] || null;
  }
  
  async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    if (input.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(input.name);
      
      // Update slug when name changes
      const slug = generateSlug(input.name);
      fields.push(`slug = $${paramCount++}`);
      values.push(slug);
    }
    
    if (input.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(input.description);
    }
    
    if (input.color !== undefined) {
      fields.push(`color = $${paramCount++}`);
      values.push(input.color);
    }
    
    if (input.is_active !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(input.is_active);
    }
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    fields.push(`updated_at = NOW()`);
    values.push(id);
    
    const result = await pool.query(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = $${paramCount}
       RETURNING id, name, slug, description, color, is_active, created_at, updated_at`,
      values
    );
    
    return result.rows[0] || null;
  }
  
  async deleteCategory(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1',
      [id]
    );
    
    return (result.rowCount || 0) > 0;
  }
}