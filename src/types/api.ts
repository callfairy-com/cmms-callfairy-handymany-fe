import { SortDirection, FilterOperator } from './index'

// API Response Types
export interface ApiResponse<T = any> {
    data: T
    message?: string
    success: boolean
}

export interface ApiError {
    message: string
    errors?: Record<string, string[]>
    status: number
    code?: string
}

// Pagination Types
export interface PaginationParams {
    page?: number
    pageSize?: number
    sortBy?: string
    sortDirection?: SortDirection
}

export interface PaginatedResponse<T> {
    count: number
    next: string | null
    previous: string | null
    results: T[]
}

// Filter Types
export interface Filter {
    field: string
    operator: FilterOperator
    value: any
}

export interface QueryParams extends PaginationParams {
    filters?: Filter[]
    search?: string
}

// Re-export auth types for backward compatibility
export type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    AuthResponse,
    ApiUser,
    User,
} from '@/features/auth/types'
