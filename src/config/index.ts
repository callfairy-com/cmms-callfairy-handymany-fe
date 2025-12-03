/**
 * Centralized Configuration System
 * 
 * Single source of truth for all application configuration.
 * All configuration values are loaded from environment variables
 * with sensible defaults.
 */

import { env, validateEnv } from './env';
import { ROUTES, PUBLIC_ROUTES, APP_ROUTES, CRM_ROUTES, MAINTENANCE_ROUTES, isPublicRoute, getDefaultRedirect, getLoginPath } from './routes';
import { API_ENDPOINTS, AUTH_ENDPOINTS, USER_ENDPOINTS, CRM_ENDPOINTS, WORK_ORDER_ENDPOINTS } from './endpoints';

/**
 * Storage keys for localStorage/sessionStorage
 */
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    THEME: 'theme',
    SIDEBAR_STATE: 'sidebar_state',
    ORGANIZATION_ID: 'organization_id',
} as const;

/**
 * Validation messages
 */
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
} as const;

/**
 * Status constants
 */
export const STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    ARCHIVED: 'archived',
    DRAFT: 'draft',
    PUBLISHED: 'published',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
} as const;

/**
 * User roles (basic constants, detailed permissions in RBAC)
 */
export const ROLES = {
    PLATFORM_OWNER: 'platform_owner',
    OWNER: 'owner',
    MANAGER: 'manager',
    TECHNICIAN: 'technician',
    VIEWER: 'viewer',
} as const;

/**
 * Table configuration
 */
export const TABLE_CONFIG = {
    DEFAULT_PAGE_SIZE: env.ui.itemsPerPage,
    PAGE_SIZE_OPTIONS: env.ui.pageSizeOptions,
    MAX_VISIBLE_PAGES: 5,
} as const;

/**
 * File upload configuration
 */
export const FILE_CONFIG = {
    MAX_SIZE: env.ui.maxFileSize,
    ALLOWED_TYPES: env.ui.allowedFileTypes,
    MAX_SIZE_MB: Math.round(env.ui.maxFileSize / (1024 * 1024)),
} as const;

/**
 * Main application configuration object
 */
export const config = {
    // Environment
    env: {
        isDevelopment: env.isDevelopment,
        isProduction: env.isProduction,
        mode: env.mode,
    },

    // API
    api: {
        baseUrl: env.api.baseUrl,
        version: env.api.version,
        timeout: env.api.timeout,
        retryAttempts: env.api.retryAttempts,
        endpoints: API_ENDPOINTS,
    },

    // App
    app: {
        name: env.app.name,
        version: env.app.version,
        environment: env.app.environment,
    },

    // Features
    features: {
        analytics: env.features.analytics,
        notifications: env.features.notifications,
        darkMode: env.features.darkMode,
        export: env.features.export,
    },

    // UI
    ui: {
        itemsPerPage: env.ui.itemsPerPage,
        pageSizeOptions: env.ui.pageSizeOptions,
        maxFileSize: env.ui.maxFileSize,
        allowedFileTypes: env.ui.allowedFileTypes,
    },

    // RBAC
    rbac: {
        defaultRole: env.rbac.defaultRole,
        enabled: env.rbac.enabled,
    },

    // Routes
    routes: ROUTES,

    // Storage
    storage: STORAGE_KEYS,

    // Validation
    validation: VALIDATION_MESSAGES,

    // Status
    status: STATUS,

    // Roles
    roles: ROLES,

    // Table
    table: TABLE_CONFIG,

    // Files
    files: FILE_CONFIG,
} as const;

/**
 * Validate entire configuration
 */
export function validateConfig(): { isValid: boolean; errors: string[] } {
    return validateEnv();
}

// Export everything for convenient access
export {
    env,
    validateEnv,
    ROUTES,
    PUBLIC_ROUTES,
    APP_ROUTES,
    CRM_ROUTES,
    MAINTENANCE_ROUTES,
    isPublicRoute,
    getDefaultRedirect,
    getLoginPath,
    API_ENDPOINTS,
    AUTH_ENDPOINTS,
    USER_ENDPOINTS,
    CRM_ENDPOINTS,
    WORK_ORDER_ENDPOINTS,
};

// Export default config object
export default config;
