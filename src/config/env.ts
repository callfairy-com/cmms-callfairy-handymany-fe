/**
 * Environment Variable Loader
 * 
 * Provides type-safe access to environment variables with validation
 * and helpful error messages for missing required variables.
 */

/**
 * Get optional environment variable
 */
function getOptionalEnvVar(key: string, defaultValue: string): string {
    const value = import.meta.env[key];
    if (value === undefined || value === null || value === '') {
        return defaultValue;
    }
    return value;
}

function getApiBaseUrl(): string {
    const raw = import.meta.env.VITE_API_BASE_URL;
    const fallback = 'https://cmms-callfairy-handyman-production.up.railway.app';

    if (!raw || raw.trim() === '' || raw.trim() === '/') {
        return fallback;
    }

    try {
        const parsed = new URL(raw);
        return parsed.origin + parsed.pathname.replace(/\/$/, '');
    } catch {
        console.warn(`Invalid VITE_API_BASE_URL provided: ${raw}. Falling back to ${fallback}`);
        return fallback;
    }
}

/**
 * Get boolean environment variable
 */
function getBooleanEnvVar(key: string, defaultValue: boolean): boolean {
    const value = import.meta.env[key];
    if (value === undefined) {
        return defaultValue;
    }
    return value === 'true' || value === '1';
}

/**
 * Get number environment variable
 */
function getNumberEnvVar(key: string, defaultValue: number): number {
    const value = import.meta.env[key];
    if (value === undefined) {
        return defaultValue;
    }
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
        console.warn(`Invalid number for ${key}: ${value}, using default: ${defaultValue}`);
        return defaultValue;
    }
    return parsed;
}

/**
 * Environment configuration
 */
export const env = {
    // Mode
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    mode: import.meta.env.MODE,

    // API Configuration
    api: {
        baseUrl: getApiBaseUrl(),
        version: getOptionalEnvVar('VITE_API_VERSION', 'v1'),
        timeout: getNumberEnvVar('VITE_API_TIMEOUT', 30000),
        retryAttempts: getNumberEnvVar('VITE_API_RETRY_ATTEMPTS', 3),
    },

    // App Configuration
    app: {
        name: getOptionalEnvVar('VITE_APP_NAME', 'CallFairy CMMS'),
        version: getOptionalEnvVar('VITE_APP_VERSION', '1.0.0'),
        environment: getOptionalEnvVar('VITE_APP_ENVIRONMENT', 'development'),
    },

    // Feature Flags
    features: {
        analytics: getBooleanEnvVar('VITE_ENABLE_ANALYTICS', false),
        notifications: getBooleanEnvVar('VITE_ENABLE_NOTIFICATIONS', true),
        darkMode: getBooleanEnvVar('VITE_ENABLE_DARK_MODE', true),
        export: getBooleanEnvVar('VITE_ENABLE_EXPORT', true),
    },

    // UI Configuration
    ui: {
        itemsPerPage: getNumberEnvVar('VITE_ITEMS_PER_PAGE', 10),
        pageSizeOptions: getOptionalEnvVar('VITE_PAGE_SIZE_OPTIONS', '10,25,50,100')
            .split(',')
            .map(s => parseInt(s.trim(), 10))
            .filter(n => !isNaN(n)),
        maxFileSize: getNumberEnvVar('VITE_MAX_FILE_SIZE', 5242880), // 5MB
        allowedFileTypes: getOptionalEnvVar(
            'VITE_ALLOWED_FILE_TYPES',
            'image/jpeg,image/png,image/gif,application/pdf'
        ).split(',').map(s => s.trim()),
    },

    // RBAC Configuration
    rbac: {
        defaultRole: getOptionalEnvVar('VITE_DEFAULT_ROLE', 'viewer'),
        enabled: getBooleanEnvVar('VITE_ENABLE_RBAC', true),
    },

    // Routes (optional custom paths)
    routes: {
        login: getOptionalEnvVar('VITE_LOGIN_PATH', '/login'),
        dashboard: getOptionalEnvVar('VITE_DASHBOARD_PATH', '/dashboard'),
    },
} as const;

/**
 * Validate environment configuration
 */
export function validateEnv(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate API URL format
    try {
        new URL(env.api.baseUrl);
    } catch {
        errors.push(`Invalid API URL: ${env.api.baseUrl}`);
    }

    // Validate timeout
    if (env.api.timeout < 0) {
        errors.push('API timeout must be positive');
    }

    // Validate retry attempts
    if (env.api.retryAttempts < 0) {
        errors.push('API retry attempts must be non-negative');
    }

    // Validate items per page
    if (env.ui.itemsPerPage < 1) {
        errors.push('Items per page must be at least 1');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

// Validate on load in development
if (env.isDevelopment) {
    const validation = validateEnv();
    if (!validation.isValid) {
        console.error('Environment configuration errors:', validation.errors);
    }
}
