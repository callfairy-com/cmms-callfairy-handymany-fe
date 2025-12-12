import { apiClient } from '@/lib/api/client'
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ApiUser,
    UserSettings,
    UpdateCurrencyRequest,
    UpdateAppearanceRequest,
    UpdateLocalizationRequest,
    UpdateNotificationsRequest,
    UpdatePrivacyRequest,
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

    // User Settings Endpoints

    /**
     * Get user settings
     */
    getSettings: () =>
        apiClient.get<UserSettings>('/api/v1/auth/settings/'),

    /**
     * Get all active currencies
     */
    getCurrencies: () =>
        apiClient.get('/api/v1/auth/currencies/'),

    /**
     * Update currency
     */
    updateCurrency: (data: UpdateCurrencyRequest) =>
        apiClient.post<UserSettings>('/api/v1/auth/settings/update_currency/', data),

    /**
     * Update appearance
     */
    updateAppearance: (data: UpdateAppearanceRequest) =>
        apiClient.post<UserSettings>('/api/v1/auth/settings/update_appearance/', data),

    /**
     * Update localization
     */
    updateLocalization: (data: UpdateLocalizationRequest) =>
        apiClient.post<UserSettings>('/api/v1/auth/settings/update_localization/', data),

    /**
     * Update notifications
     */
    updateNotifications: (data: UpdateNotificationsRequest) =>
        apiClient.post<UserSettings>('/api/v1/auth/settings/update_notifications/', data),

    /**
     * Update privacy
     */
    updatePrivacy: (data: UpdatePrivacyRequest) =>
        apiClient.post<UserSettings>('/api/v1/auth/settings/update_privacy/', data),

    /**
     * Get all active themes
     */
    getThemes: () =>
        apiClient.get('/api/v1/auth/themes/'),

    /**
     * Update preferences
     */
    updatePreferences: (data: any) =>
        apiClient.post<UserSettings>('/api/v1/auth/settings/update_preferences/', data),
}
