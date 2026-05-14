import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../utils/database.js';
import { User, CreateUserInput, LoginInput, UpdateUserInput } from '../models/user.js';
import { config } from '../utils/config.js';

export class UserService {
  async createUser(input: CreateUserInput): Promise<User> {
    const { username, password } = input;
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    
    if (existingUser.rows.length > 0) {
      throw new Error('Username already exists');
    }
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
    // Create admin user (auto-assign admin role and generate email)
    const email = `${username}@admin.local`;
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, display_name, role)
       VALUES ($1, $2, $3, $4, 'admin')
       RETURNING id, username, email, display_name, role, is_active, created_at, updated_at`,
      [username, email, password_hash, username]
    );
    
    return result.rows[0];
  }
  
  async authenticateUser(input: LoginInput): Promise<{ user: User; token: string }> {
    const { username, password } = input;
    
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND is_active = true',
      [username]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }
    
    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }
    
    // Update last login
    await pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      config.jwtSecret,
      { expiresIn: '24h' }
    );
    
    // Remove password from response
    delete user.password_hash;
    
    return { user, token };
  }
  
  async getUserById(id: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT id, username, email, display_name, role, is_active, created_at, updated_at, last_login_at FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows[0] || null;
  }
  
  async getAllUsers(): Promise<User[]> {
    const result = await pool.query(
      'SELECT id, username, email, display_name, role, is_active, created_at, updated_at, last_login_at FROM users ORDER BY created_at DESC'
    );
    
    return result.rows;
  }
  
  async updateUser(id: string, input: UpdateUserInput): Promise<User | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    if (input.display_name !== undefined) {
      fields.push(`display_name = $${paramCount++}`);
      values.push(input.display_name);
    }
    
    if (input.role !== undefined) {
      fields.push(`role = $${paramCount++}`);
      values.push(input.role);
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
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount}
       RETURNING id, username, email, display_name, role, is_active, created_at, updated_at, last_login_at`,
      values
    );
    
    return result.rows[0] || null;
  }
  
  async deleteUser(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
    
    return result.rowCount > 0;
  }
}