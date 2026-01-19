// 관리자 API 클라이언트
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://api.yourdomain.com' 
  : 'http://localhost:8082'

export class AdminAPI {
  private static getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('admin_token')
  }

  private static getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }
    
    const token = this.getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return headers
  }

  private static async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}/api${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        // 토큰 만료 또는 유효하지 않음
        localStorage.removeItem('admin_token')
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login'
        }
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  // 인증 관련
  static async login(username: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
  }

  static async verifyToken() {
    return this.request('/auth/verify')
  }

  static async getProfile() {
    return this.request('/auth/profile')
  }

  static async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword })
    })
  }

  static async getAllAdmins() {
    return this.request('/auth/admins')
  }

  static async createAdmin(data: {
    username: string
    email: string
    password: string
    name?: string
    role?: 'admin' | 'super_admin'
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // 프로젝트 관련 (TODO: 구현 예정)
  static async getProjects() {
    return this.request('/projects')
  }

  static async createProject(data: {
    name: string
    display_name: string
    description?: string
    subdomain?: string
    git_repo?: string
    branch?: string
  }) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  static async updateProject(id: number, data: any) {
    return this.request(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  static async deleteProject(id: number) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE'
    })
  }

  // 서브도메인 관련 (TODO: 구현 예정)
  static async getSubdomains() {
    return this.request('/subdomains')
  }

  static async createSubdomain(data: {
    name: string
    project_id: number
    target_port: number
  }) {
    return this.request('/subdomains', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // 배포 관련 (TODO: 구현 예정)
  static async getDeployments(projectId?: number) {
    const endpoint = projectId ? `/deployments?project_id=${projectId}` : '/deployments'
    return this.request(endpoint)
  }

  static async createDeployment(projectId: number) {
    return this.request('/deployments', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId })
    })
  }

  // 시스템 설정 (TODO: 구현 예정)
  static async getSettings() {
    return this.request('/settings')
  }

  static async updateSetting(key: string, value: string) {
    return this.request('/settings', {
      method: 'PATCH',
      body: JSON.stringify({ key, value })
    })
  }

  // 통계 (TODO: 구현 예정)
  static async getDashboardStats() {
    return this.request('/stats/dashboard')
  }
}