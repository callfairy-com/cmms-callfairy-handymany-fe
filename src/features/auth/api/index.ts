import { apiClient } from '@/lib/api/client'
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ApiUser,
} from '../types'

/**
 * Consolidated Auth API
 * Uses apiClient for consistent error handling and token management
 */
export const authApi = {
    /**
     * Login user
     */
    login: (data: LoginRequest) =>
        apiClient.post<LoginResponse>('/api/v1/auth/login/', data),

    /**
     * Register new user
     */
    register: (data: RegisterRequest) =>
        apiClient.post<LoginResponse>('/api/v1/auth/register/', data),

    /**
     * Logout user
     */
    logout: () =>
        apiClient.post('/api/v1/auth/logout/'),

    /**
     * Get current user
     */
    me: () =>
        apiClient.get<ApiUser>('/api/v1/auth/me/'),

    /**
     * Request password reset
     */
    forgotPassword: (data: ForgotPasswordRequest) =>
        apiClient.post('/api/v1/auth/forgot-password/', data),

    /**
     * Reset password
     */
    resetPassword: (data: ResetPasswordRequest) =>
        apiClient.post('/api/v1/auth/reset-password/', data),

    /**
     * Refresh access token
     */
    refreshToken: (refreshToken: string) =>
        apiClient.post<{ access: string }>('/api/v1/auth/token/refresh/', { refresh: refreshToken }),
}
