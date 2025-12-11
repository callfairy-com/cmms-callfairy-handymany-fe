/**
 * API Endpoints Configuration
 * 
 * Centralized API endpoint definitions for all backend requests.
 */

import { env } from './env';

/**
 * Build full API path with version
 */
function apiPath(path: string): string {
    return `/api/${env.api.version}${path}`;
}

/**
 * Authentication endpoints
 */
export const AUTH_ENDPOINTS = {
    LOGIN: apiPath('/auth/login/'),
    REGISTER: apiPath('/auth/register/'),
    LOGOUT: apiPath('/auth/logout/'),
    REFRESH: apiPath('/auth/token/refresh/'),
    FORGOT_PASSWORD: apiPath('/auth/forgot-password/'),
    RESET_PASSWORD: apiPath('/auth/reset-password/'),
    ME: apiPath('/auth/me/'),
    VERIFY_EMAIL: apiPath('/auth/verify-email/'),
    RESEND_VERIFICATION: apiPath('/auth/resend-verification/'),
} as const;

/**
 * User management endpoints
 */
export const USER_ENDPOINTS = {
    LIST: apiPath('/users/'),
    DETAIL: (id: string | number) => apiPath(`/users/${id}/`),
    CREATE: apiPath('/users/'),
    UPDATE: (id: string | number) => apiPath(`/users/${id}/`),
    DELETE: (id: string | number) => apiPath(`/users/${id}/`),
    PROFILE: apiPath('/users/profile/'),
    UPDATE_PROFILE: apiPath('/users/profile/'),
    CHANGE_PASSWORD: apiPath('/users/change-password/'),
} as const;

/**
 * Organization endpoints
 */
export const ORGANIZATION_ENDPOINTS = {
    LIST: apiPath('/organizations/'),
    DETAIL: (id: string | number) => apiPath(`/organizations/${id}/`),
    CREATE: apiPath('/organizations/'),
    UPDATE: (id: string | number) => apiPath(`/organizations/${id}/`),
    DELETE: (id: string | number) => apiPath(`/organizations/${id}/`),
    // CMMS organization members live under the /cmms prefix, similar to CREATE_MEMBER
    MEMBERS: (id: string | number) => apiPath(`/cmms/organizations/${id}/members/`),
    INVITE: (id: string | number) => apiPath(`/organizations/${id}/invite/`),
    INVITE_USER: (id: string | number) => apiPath(`/organizations/${id}/invite-user/`),
    CREATE_MEMBER: (id: string | number) => apiPath(`/cmms/organizations/${id}/create-member/`),
} as const;

/**
 * CRM endpoints
 */
export const CRM_ENDPOINTS = {
    LEADS: {
        LIST: apiPath('/crm/leads/'),
        DETAIL: (id: string | number) => apiPath(`/crm/leads/${id}/`),
        CREATE: apiPath('/crm/leads/'),
        UPDATE: (id: string | number) => apiPath(`/crm/leads/${id}/`),
        DELETE: (id: string | number) => apiPath(`/crm/leads/${id}/`),
        CONVERT: (id: string | number) => apiPath(`/crm/leads/${id}/convert/`),
    },
    CLIENTS: {
        LIST: apiPath('/crm/clients/'),
        DETAIL: (id: string | number) => apiPath(`/crm/clients/${id}/`),
        CREATE: apiPath('/crm/clients/'),
        UPDATE: (id: string | number) => apiPath(`/crm/clients/${id}/`),
        DELETE: (id: string | number) => apiPath(`/crm/clients/${id}/`),
    },
    CONTACTS: {
        LIST: apiPath('/crm/contacts/'),
        DETAIL: (id: string | number) => apiPath(`/crm/contacts/${id}/`),
        CREATE: apiPath('/crm/contacts/'),
        UPDATE: (id: string | number) => apiPath(`/crm/contacts/${id}/`),
        DELETE: (id: string | number) => apiPath(`/crm/contacts/${id}/`),
    },
} as const;

/**
 * Work order endpoints
 */
export const WORK_ORDER_ENDPOINTS = {
    LIST: apiPath('/work-orders/'),
    DETAIL: (id: string | number) => apiPath(`/work-orders/${id}/`),
    CREATE: apiPath('/work-orders/'),
    UPDATE: (id: string | number) => apiPath(`/work-orders/${id}/`),
    DELETE: (id: string | number) => apiPath(`/work-orders/${id}/`),
    ASSIGN: (id: string | number) => apiPath(`/work-orders/${id}/assign/`),
    ACCEPT: (id: string | number) => apiPath(`/work-orders/${id}/accept/`),
    REJECT: (id: string | number) => apiPath(`/work-orders/${id}/reject/`),
    COMPLETE: (id: string | number) => apiPath(`/work-orders/${id}/complete/`),
    STATUS: (id: string | number) => apiPath(`/work-orders/${id}/status/`),
} as const;

/**
 * Asset endpoints
 */
export const ASSET_ENDPOINTS = {
    LIST: apiPath('/assets/'),
    DETAIL: (id: string | number) => apiPath(`/assets/${id}/`),
    CREATE: apiPath('/assets/'),
    UPDATE: (id: string | number) => apiPath(`/assets/${id}/`),
    DELETE: (id: string | number) => apiPath(`/assets/${id}/`),
    MAINTENANCE_HISTORY: (id: string | number) => apiPath(`/assets/${id}/maintenance-history/`),
} as const;

/**
 * Project endpoints
 */
export const PROJECT_ENDPOINTS = {
    LIST: apiPath('/projects/'),
    DETAIL: (id: string | number) => apiPath(`/projects/${id}/`),
    CREATE: apiPath('/projects/'),
    UPDATE: (id: string | number) => apiPath(`/projects/${id}/`),
    DELETE: (id: string | number) => apiPath(`/projects/${id}/`),
    TASKS: (id: string | number) => apiPath(`/projects/${id}/tasks/`),
} as const;

/**
 * Task endpoints
 */
export const TASK_ENDPOINTS = {
    LIST: apiPath('/tasks/'),
    DETAIL: (id: string | number) => apiPath(`/tasks/${id}/`),
    CREATE: apiPath('/tasks/'),
    UPDATE: (id: string | number) => apiPath(`/tasks/${id}/`),
    DELETE: (id: string | number) => apiPath(`/tasks/${id}/`),
    ASSIGN: (id: string | number) => apiPath(`/tasks/${id}/assign/`),
    COMPLETE: (id: string | number) => apiPath(`/tasks/${id}/complete/`),
} as const;

/**
 * Report endpoints
 */
export const REPORT_ENDPOINTS = {
    DASHBOARD: apiPath('/reports/dashboard/'),
    ANALYTICS: apiPath('/reports/analytics/'),
    CUSTOM: apiPath('/reports/custom/'),
    EXPORT: apiPath('/reports/export/'),
} as const;

/**
 * File upload endpoints
 */
export const UPLOAD_ENDPOINTS = {
    IMAGE: apiPath('/uploads/image/'),
    DOCUMENT: apiPath('/uploads/document/'),
    AVATAR: apiPath('/uploads/avatar/'),
} as const;

/**
 * All endpoints combined
 */
export const API_ENDPOINTS = {
    AUTH: AUTH_ENDPOINTS,
    USERS: USER_ENDPOINTS,
    ORGANIZATIONS: ORGANIZATION_ENDPOINTS,
    CRM: CRM_ENDPOINTS,
    WORK_ORDERS: WORK_ORDER_ENDPOINTS,
    ASSETS: ASSET_ENDPOINTS,
    PROJECTS: PROJECT_ENDPOINTS,
    TASKS: TASK_ENDPOINTS,
    REPORTS: REPORT_ENDPOINTS,
    UPLOADS: UPLOAD_ENDPOINTS,
} as const;

// Export for backward compatibility
export { API_ENDPOINTS as default };
