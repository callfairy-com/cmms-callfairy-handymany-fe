// API Configuration
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
} as const

// Storage Keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    THEME: 'theme',
    SIDEBAR_STATE: 'sidebar_state',
} as const

// App Configuration
export const APP_CONFIG = {
    APP_NAME: 'Enterprise App',
    VERSION: '1.0.0',
    ITEMS_PER_PAGE: 10,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_FILE_TYPES: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
    ],
} as const

// Feature Flags
export const FEATURE_FLAGS = {
    ENABLE_ANALYTICS: true,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_DARK_MODE: true,
    ENABLE_EXPORT: true,
} as const

// Routes
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    DASHBOARD: '/dashboard',
    USERS: '/users',
    PRODUCTS: '/products',
    SETTINGS: '/settings',
    PROFILE: '/profile',
} as const

// API Endpoints (will be expanded in endpoints.ts)
export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        ME: '/auth/me',
    },
    USERS: {
        LIST: '/users',
        DETAIL: (id: string | number) => `/users/${id}`,
        CREATE: '/users',
        UPDATE: (id: string | number) => `/users/${id}`,
        DELETE: (id: string | number) => `/users/${id}`,
    },
    PRODUCTS: {
        LIST: '/products',
        DETAIL: (id: string | number) => `/products/${id}`,
        CREATE: '/products',
        UPDATE: (id: string | number) => `/products/${id}`,
        DELETE: (id: string | number) => `/products/${id}`,
    },
} as const

// Table Configuration
export const TABLE_CONFIG = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
    MAX_VISIBLE_PAGES: 5,
} as const

// Validation Messages
export const VALIDATION_MESSAGES = {
    REQUIRED: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PASSWORD: 'Password must be at least 8 characters',
    PASSWORDS_DONT_MATCH: 'Passwords do not match',
    INVALID_PHONE: 'Please enter a valid phone number',
    INVALID_URL: 'Please enter a valid URL',
    MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
    MAX_LENGTH: (max: number) => `Must be at most ${max} characters`,
    MIN_VALUE: (min: number) => `Must be at least ${min}`,
    MAX_VALUE: (max: number) => `Must be at most ${max}`,
} as const

// Status Types
export const STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    ARCHIVED: 'archived',
} as const

// User Roles
export const ROLES = {
    ADMIN: 'admin',
    USER: 'user',
    MANAGER: 'manager',
    VIEWER: 'viewer',
} as const
