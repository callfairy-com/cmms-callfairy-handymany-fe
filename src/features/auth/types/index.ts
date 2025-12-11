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

// User Settings Types (matching backend API response)
export interface UserSettings {
    id: string
    user: string
    default_currency: string | null
    currency_details: any | null
    theme: string | null
    theme_details: any | null
    layout_density: 'compact' | 'comfortable' | 'spacious'
    sidebar_collapsed: boolean
    dashboard_widgets: any[]
    date_format: string
    time_format: '12' | '24'
    first_day_of_week: number
    email_notifications: boolean
    push_notifications: boolean
    sms_notifications: boolean
    notification_sound: boolean
    profile_visibility: 'public' | 'organization' | 'private'
    show_email: boolean
    show_phone: boolean
    allow_marketing_emails: boolean
    allow_analytics: boolean
    session_timeout_minutes: number
    require_password_change_days: number
    items_per_page: number
    auto_save: boolean
    show_tutorials: boolean
    custom_preferences: Record<string, any>
    created_at: string
    updated_at: string
}

export interface UpdateCurrencyRequest {
    currency_code: string
}

export interface UpdateAppearanceRequest {
    theme_id?: string
    layout_density: 'compact' | 'comfortable' | 'spacious'
    sidebar_collapsed?: boolean
}

export interface UpdateLocalizationRequest {
    date_format: string
    time_format: '12' | '24'
    first_day_of_week?: number
}

export interface UpdateNotificationsRequest {
    email_notifications: boolean
    push_notifications: boolean
    sms_notifications: boolean
    notification_sound?: boolean
}

export interface UpdatePrivacyRequest {
    profile_visibility: 'public' | 'organization' | 'private'
    show_email?: boolean
    show_phone?: boolean
    allow_marketing_emails?: boolean
    allow_analytics?: boolean
}
