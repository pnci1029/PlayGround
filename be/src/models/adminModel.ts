import { db } from '../config/database'
import bcrypt from 'bcrypt'

export interface Admin {
  id: number
  username: string
  email: string
  password_hash: string
  name?: string
  role: 'admin' | 'super_admin'
  is_active: boolean
  last_login_at?: Date
  created_at: Date
  updated_at: Date
}

export interface CreateAdminData {
  username: string
  email: string
  password: string
  name?: string
  role?: 'admin' | 'super_admin'
}

export interface UpdateAdminData {
  username?: string
  email?: string
  name?: string
  role?: 'admin' | 'super_admin'
  is_active?: boolean
}

export class AdminModel {
  static async create(data: CreateAdminData): Promise<Admin> {
    const saltRounds = 12
    const password_hash = await bcrypt.hash(data.password, saltRounds)
    
    const query = `
      INSERT INTO admins (username, email, password_hash, name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `
    const values = [
      data.username,
      data.email,
      password_hash,
      data.name || null,
      data.role || 'admin'
    ]
    
    const result = await db.query(query, values)
    return result.rows[0]
  }

  static async findById(id: number): Promise<Admin | null> {
    const query = 'SELECT * FROM admins WHERE id = $1 AND is_active = true'
    const result = await db.query(query, [id])
    return result.rows[0] || null
  }

  static async findByUsername(username: string): Promise<Admin | null> {
    const query = 'SELECT * FROM admins WHERE username = $1 AND is_active = true'
    const result = await db.query(query, [username])
    return result.rows[0] || null
  }

  static async findByEmail(email: string): Promise<Admin | null> {
    const query = 'SELECT * FROM admins WHERE email = $1 AND is_active = true'
    const result = await db.query(query, [email])
    return result.rows[0] || null
  }

  static async findAll(): Promise<Admin[]> {
    const query = `
      SELECT id, username, email, name, role, is_active, last_login_at, created_at, updated_at 
      FROM admins 
      ORDER BY created_at DESC
    `
    const result = await db.query(query)
    return result.rows
  }

  static async update(id: number, data: UpdateAdminData): Promise<Admin | null> {
    const fields = []
    const values = []
    let paramCount = 1

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    }

    if (fields.length === 0) {
      return this.findById(id)
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const query = `
      UPDATE admins 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `

    const result = await db.query(query, values)
    return result.rows[0] || null
  }

  static async delete(id: number): Promise<boolean> {
    const query = 'UPDATE admins SET is_active = false WHERE id = $1'
    const result = await db.query(query, [id])
    return (result.rowCount || 0) > 0
  }

  static async updateLastLogin(id: number): Promise<void> {
    const query = 'UPDATE admins SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1'
    await db.query(query, [id])
  }

  static async verifyPassword(plainPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hash)
  }

  static async changePassword(id: number, newPassword: string): Promise<boolean> {
    const saltRounds = 12
    const password_hash = await bcrypt.hash(newPassword, saltRounds)
    
    const query = `
      UPDATE admins 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `
    const result = await db.query(query, [password_hash, id])
    return (result.rowCount || 0) > 0
  }
}