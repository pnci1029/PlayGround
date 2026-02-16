// API 공통 타입 정의

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  statusCode: number
  error: string
  message: string
}

// 공통 요청/응답 타입들
export interface PaginationQuery {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}