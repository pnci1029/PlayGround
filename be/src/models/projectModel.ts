import { db } from '../config/database'

export interface Project {
  id: number
  name: string
  display_name: string
  description?: string
  subdomain?: string
  git_repo?: string
  branch: string
  build_command?: string
  start_command?: string
  port?: number
  env_vars: Record<string, string>
  status: 'active' | 'inactive' | 'building' | 'error'
  created_by: number
  created_at: Date
  updated_at: Date
}

export interface CreateProjectData {
  name: string
  display_name: string
  description?: string
  subdomain?: string
  git_repo?: string
  branch?: string
  build_command?: string
  start_command?: string
  port?: number
  env_vars?: Record<string, string>
  created_by: number
}

export interface UpdateProjectData {
  name?: string
  display_name?: string
  description?: string
  subdomain?: string
  git_repo?: string
  branch?: string
  build_command?: string
  start_command?: string
  port?: number
  env_vars?: Record<string, string>
  status?: 'active' | 'inactive' | 'building' | 'error'
}

export class ProjectModel {
  static async create(data: CreateProjectData): Promise<Project> {
    const query = `
      INSERT INTO projects (
        name, display_name, description, subdomain, git_repo, branch,
        build_command, start_command, port, env_vars, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `
    const values = [
      data.name,
      data.display_name,
      data.description || null,
      data.subdomain || null,
      data.git_repo || null,
      data.branch || 'main',
      data.build_command || null,
      data.start_command || null,
      data.port || null,
      JSON.stringify(data.env_vars || {}),
      data.created_by
    ]
    
    const result = await db.query(query, values)
    return result.rows[0]
  }

  static async findById(id: number): Promise<Project | null> {
    const query = 'SELECT * FROM projects WHERE id = $1'
    const result = await db.query(query, [id])
    return result.rows[0] || null
  }

  static async findByName(name: string): Promise<Project | null> {
    const query = 'SELECT * FROM projects WHERE name = $1'
    const result = await db.query(query, [name])
    return result.rows[0] || null
  }

  static async findBySubdomain(subdomain: string): Promise<Project | null> {
    const query = 'SELECT * FROM projects WHERE subdomain = $1'
    const result = await db.query(query, [subdomain])
    return result.rows[0] || null
  }

  static async findAll(): Promise<Project[]> {
    const query = `
      SELECT p.*, a.username as created_by_username
      FROM projects p
      LEFT JOIN admins a ON p.created_by = a.id
      ORDER BY p.created_at DESC
    `
    const result = await db.query(query)
    return result.rows
  }

  static async findByStatus(status: Project['status']): Promise<Project[]> {
    const query = 'SELECT * FROM projects WHERE status = $1 ORDER BY updated_at DESC'
    const result = await db.query(query, [status])
    return result.rows
  }

  static async update(id: number, data: UpdateProjectData): Promise<Project | null> {
    const fields = []
    const values = []
    let paramCount = 1

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        if (key === 'env_vars') {
          fields.push(`${key} = $${paramCount}`)
          values.push(JSON.stringify(value))
        } else {
          fields.push(`${key} = $${paramCount}`)
          values.push(value)
        }
        paramCount++
      }
    }

    if (fields.length === 0) {
      return this.findById(id)
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const query = `
      UPDATE projects 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `

    const result = await db.query(query, values)
    return result.rows[0] || null
  }

  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM projects WHERE id = $1'
    const result = await db.query(query, [id])
    return (result.rowCount || 0) > 0
  }

  static async updateStatus(id: number, status: Project['status']): Promise<boolean> {
    const query = `
      UPDATE projects 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `
    const result = await db.query(query, [status, id])
    return (result.rowCount || 0) > 0
  }

  static async getProjectStats(): Promise<{
    total: number
    active: number
    inactive: number
    building: number
    error: number
  }> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
        COUNT(CASE WHEN status = 'building' THEN 1 END) as building,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as error
      FROM projects
    `
    const result = await db.query(query)
    return result.rows[0]
  }

  static async findAvailablePort(): Promise<number> {
    const query = 'SELECT port FROM projects WHERE port IS NOT NULL ORDER BY port'
    const result = await db.query(query)
    const usedPorts = result.rows.map((row: any) => row.port)
    
    // 8000-9000 범위에서 사용 가능한 포트 찾기
    for (let port = 8000; port <= 9000; port++) {
      if (!usedPorts.includes(port)) {
        return port
      }
    }
    
    throw new Error('사용 가능한 포트가 없습니다')
  }
}