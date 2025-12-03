/**
 * Centralized Route Configuration
 * 
 * All application routes defined as constants to avoid hard-coding
 * string literals throughout the codebase.
 */

import { env } from './env';

/**
 * Public routes (no authentication required)
 */
export const PUBLIC_ROUTES = {
    LOGIN: env.routes.login,
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
} as const;

/**
 * Main application routes
 */
export const APP_ROUTES = {
    HOME: '/',
    DASHBOARD: env.routes.dashboard,
    PROFILE: '/profile',
    SETTINGS: '/settings',
    PRODUCTS: '/products',
} as const;

/**
 * User management routes
 */
export const USER_ROUTES = {
    LIST: '/users',
    DETAIL: (id: string | number) => `/users/${id}`,
    CREATE: '/users/new',
    EDIT: (id: string | number) => `/users/${id}/edit`,
} as const;

/**
 * CRM routes
 */
export const CRM_ROUTES = {
    LEADS: {
        LIST: '/crm/leads',
        DETAIL: (id: string | number) => `/crm/leads/${id}`,
        CREATE: '/crm/leads/new',
        EDIT: (id: string | number) => `/crm/leads/${id}/edit`,
    },
    CLIENTS: {
        LIST: '/crm/clients',
        DETAIL: (id: string | number) => `/crm/clients/${id}`,
        CREATE: '/crm/clients/new',
        EDIT: (id: string | number) => `/crm/clients/${id}/edit`,
    },
    CONTACTS: {
        LIST: '/crm/contacts',
        DETAIL: (id: string | number) => `/crm/contacts/${id}`,
        CREATE: '/crm/contacts/new',
        EDIT: (id: string | number) => `/crm/contacts/${id}/edit`,
    },
} as const;

/**
 * Maintenance module routes
 */
export const MAINTENANCE_ROUTES = {
    DASHBOARD: '/maintenance/dashboard',
    WORK_ORDERS: {
        LIST: '/work-orders',
        DETAIL: (id: string | number) => `/work-orders/${id}`,
        ENHANCED: (id: string | number) => `/work-orders/${id}/enhanced`,
        CREATE: '/work-orders/new',
        EDIT: (id: string | number) => `/work-orders/${id}/edit`,
    },
    ASSETS: {
        LIST: '/assets',
        DETAIL: (id: string | number) => `/assets/${id}`,
        CREATE: '/assets/new',
        EDIT: (id: string | number) => `/assets/${id}/edit`,
    },
    PREVENTATIVE_MAINTENANCE: '/preventative-maintenance',
    COMPLIANCE: '/compliance',
    COST_TRACKING: '/cost-tracking',
    QUOTES: {
        LIST: '/quotes',
        DETAIL: (id: string | number) => `/quotes/${id}`,
        CREATE: '/quotes/new',
        EDIT: (id: string | number) => `/quotes/${id}/edit`,
    },
    VARIATIONS: '/variations',
    DOCUMENTS: '/documents',
    SITES: '/sites',
    ATTENDANCE: '/attendance',
    REPORTS: '/reports',
} as const;

/**
 * Project management routes
 */
export const PROJECT_ROUTES = {
    LIST: '/projects',
    DETAIL: (id: string | number) => `/projects/${id}`,
    CREATE: '/projects/new',
    EDIT: (id: string | number) => `/projects/${id}/edit`,
} as const;

/**
 * Task management routes
 */
export const TASK_ROUTES = {
    LIST: '/tasks',
    DETAIL: (id: string | number) => `/tasks/${id}`,
    CREATE: '/tasks/new',
    EDIT: (id: string | number) => `/tasks/${id}/edit`,
} as const;

/**
 * Report routes
 */
export const REPORT_ROUTES = {
    DASHBOARD: '/reports',
    ANALYTICS: '/reports/analytics',
    CUSTOM: '/reports/custom',
} as const;

/**
 * All routes combined for easy access
 */
export const ROUTES = {
    ...PUBLIC_ROUTES,
    ...APP_ROUTES,
    USERS: USER_ROUTES,
    CRM: CRM_ROUTES,
    MAINTENANCE: MAINTENANCE_ROUTES,
    PROJECTS: PROJECT_ROUTES,
    TASKS: TASK_ROUTES,
    REPORTS: REPORT_ROUTES,
} as const;

/**
 * Check if a path is a public route
 */
export function isPublicRoute(path: string): boolean {
    return Object.values(PUBLIC_ROUTES).includes(path as any);
}

/**
 * Get the default redirect path after login
 */
export function getDefaultRedirect(): string {
    return APP_ROUTES.DASHBOARD;
}

/**
 * Get the login redirect path
 */
export function getLoginPath(): string {
    return PUBLIC_ROUTES.LOGIN;
}

// Export for backward compatibility
export { ROUTES as default };
