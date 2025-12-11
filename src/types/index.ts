// Global type definitions
// Export API types except User (to avoid conflict with models)
export type {
    ApiResponse,
    ApiError,
    PaginationParams,
    PaginatedResponse,
    Filter,
    QueryParams,
    LoginRequest,
    RegisterRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    AuthResponse,
} from './api'

// Export all model types (including User)
export * from './models'
export * from './components'

// Common utility types
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type Maybe<T> = T | null | undefined

export type ID = string | number

export type Status = 'active' | 'inactive' | 'pending' | 'archived'

export type Role = 'admin' | 'user' | 'manager' | 'viewer'

export type SortDirection = 'asc' | 'desc'

export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith'
