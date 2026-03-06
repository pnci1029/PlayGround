// API 관련 타입 정의
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface ApiError {
  message: string
  status: number
  code?: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta
}

// 요청/응답 타입들
export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: string
}

export interface HttpClientConfig {
  baseURL?: string
  timeout?: number
  defaultHeaders?: Record<string, string>
}

export interface JsonFormatterResponse {
  formatted: string
}

export interface VariableGeneratorResponse {
  camelCase: string
  PascalCase: string
  snake_case: string
  kebab_case: string
  UPPER_SNAKE_CASE: string
  lowercase: string
  UPPERCASE: string
}