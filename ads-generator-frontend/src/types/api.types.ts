export interface ApiResponse<T> {
  success: boolean
  statusCode: number
  data: T
  timestamp: string
}

export interface ApiError {
  success: false
  statusCode: number
  message: string
  path: string
  timestamp: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
