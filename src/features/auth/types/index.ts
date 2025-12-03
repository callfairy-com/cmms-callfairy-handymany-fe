export interface LoginRequest {
    email: string
    password: string
}

// Backend returns a flat structure with tokens and user fields at the same level
export interface LoginResponse {
    access: string
    refresh: string
    id: string
    email: string
    name: string
    company?: string
    job_title?: string
    phone?: string
    date_joined: string
    organizations: Array<{
        id: string
        name: string
        slug: string
        role: string
        role_display: string
        joined_at: string
    }>
}

export interface RegisterRequest {
    email: string
    password: string
    confirmPassword: string
    firstName: string
    lastName: string
}

export interface ForgotPasswordRequest {
    email: string
}

export interface ResetPasswordRequest {
    token: string
    password: string
    confirmPassword: string
}

export interface AuthResponse {
    token: string
    refreshToken?: string
    user: User
}

// Backend user type (snake_case from API)
export interface ApiUser {
    id: number
    email: string
    first_name: string
    last_name: string
    role: string
    tenant: {
        id: number
        name: string
        slug: string
    }
}

// Frontend user type (camelCase for app)
export interface User {
    id: string | number
    email: string
    firstName: string
    lastName: string
    role: string
    avatar?: string
    status: string
    createdAt: string
    updatedAt: string
}
