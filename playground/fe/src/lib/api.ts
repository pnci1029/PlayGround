// API 클라이언트 설정
import type { ApiResponse, ApiError, HttpClientConfig } from '@/types/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082'

class ApiClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor(config: HttpClientConfig = {}) {
    this.baseURL = config.baseURL || API_BASE_URL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.defaultHeaders,
    }
  }

  async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          data: undefined as T,
          error: data.error || 'API request failed',
          message: data.message,
        }
      }

      return {
        success: true,
        data: data as T,
      }
    } catch (error) {
      return {
        success: false,
        data: undefined as T,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  get<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  post<T = unknown, D = unknown>(endpoint: string, data?: D): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  put<T = unknown, D = unknown>(endpoint: string, data?: D): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  delete<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  patch<T = unknown, D = unknown>(endpoint: string, data?: D): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }
}

export const api = new ApiClient()