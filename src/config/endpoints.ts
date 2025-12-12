/**
 * API Endpoints Configuration
 * 
 * ✅ 100% DYNAMIC - ALL CMMS API ENDPOINTS CENTRALIZED
 * 
 * All CMMS API endpoints are now dynamically generated using centralized configuration.
 * No hardcoded '/api/v1/cmms/' paths remain in the codebase.
 * 
 * CENTRALIZED ENDPOINTS INCLUDE:
 * - Work Orders: Full CRUD + tasks, comments, attachments, actions (start, complete, cancel, etc.)
 * - Sites: Full CRUD + nested resources (buildings, assets, stats)
 * - Buildings: Full CRUD + nested resources (floors)
 * - Floors: Full CRUD + nested resources (zones)
 * - Zones: Full CRUD
 * - Assets: Full CRUD + all nested resources (meters, documents, assignments, custody, transfers, parts, etc.)
 * - Organizations: Full CRUD + members, branding, settings
 * - Maintenance: History, schedules, templates, procedures, alerts, attachments + all actions
 * - Reports: Templates, reports, dashboards, KPIs, KPI values, analytics
 * - Dashboard: Dynamic dashboard
 * 
 * USAGE PATTERN:
 * ```typescript
 * import { CMMS_ENDPOINTS } from '@/config';
 * 
 * // Simple endpoint
 * apiClient.get(CMMS_ENDPOINTS.WORK_ORDERS.LIST);
 * 
 * // Dynamic endpoint with ID
 * apiClient.get(CMMS_ENDPOINTS.WORK_ORDERS.DETAIL(id));
 * 
 * // Action endpoint
 * apiClient.post(CMMS_ENDPOINTS.WORK_ORDERS.COMPLETE(id), data);
 * ```
 * 
 * BENEFITS:
 * - Single source of truth for all API endpoints
 * - Easy to update base URLs and API versions
 * - Type-safe endpoint definitions
 * - Consistent naming conventions
 * - Improved maintainability and scalability
 */

import { env } from './env';

/**
 * Build full API path with version
 */
function apiPath(path: string): string {
    return `/api/${env.api.version}${path}`;
}

/**
 * Build CMMS API path with version and cmms prefix
 */
function cmmsPath(path: string): string {
    return `/api/${env.api.version}/cmms${path}`;
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
 * Sales & CRM endpoints
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
 * CMMS-specific endpoints
 */
export const CMMS_ENDPOINTS = {
    // Work Orders
    WORK_ORDERS: {
        LIST: cmmsPath('/work-orders/'),
        DETAIL: (id: string | number) => cmmsPath(`/work-orders/${id}/`),
        CREATE: cmmsPath('/work-orders/'),
        UPDATE: (id: string | number) => cmmsPath(`/work-orders/${id}/`),
        DELETE: (id: string | number) => cmmsPath(`/work-orders/${id}/`),
        TYPES: cmmsPath('/work-order-types/'),
        ASSIGN: (id: string | number) => cmmsPath(`/work-orders/${id}/assign/`),
        START: (id: string | number) => cmmsPath(`/work-orders/${id}/start/`),
        COMPLETE: (id: string | number) => cmmsPath(`/work-orders/${id}/complete/`),
        CLOSE: (id: string | number) => cmmsPath(`/work-orders/${id}/close/`),
        CANCEL: (id: string | number) => cmmsPath(`/work-orders/${id}/cancel/`),
        STATS: cmmsPath('/work-orders/stats/'),
        OVERDUE: cmmsPath('/work-orders/overdue/'),
        COST_BREAKDOWN: (id: string | number) => cmmsPath(`/work-orders/${id}/cost-breakdown/`),
        UPDATE_COSTS: (id: string | number) => cmmsPath(`/work-orders/${id}/update-costs/`),
        TASKS: cmmsPath('/work-order-tasks/'),
        TASK_DETAIL: (id: string | number) => cmmsPath(`/work-order-tasks/${id}/`),
        TASK_COMPLETE: (id: string | number) => cmmsPath(`/work-order-tasks/${id}/complete/`),
        COMMENTS: cmmsPath('/work-order-comments/'),
        COMMENT_DETAIL: (id: string | number) => cmmsPath(`/work-order-comments/${id}/`),
        ATTACHMENTS: cmmsPath('/work-order-attachments/'),
        ATTACHMENT_DETAIL: (id: string | number) => cmmsPath(`/work-order-attachments/${id}/`),
    },
    // Assets
    ASSETS: {
        LIST: cmmsPath('/assets/'),
        DETAIL: (id: string | number) => cmmsPath(`/assets/${id}/`),
        CREATE: cmmsPath('/assets/'),
        UPDATE: (id: string | number) => cmmsPath(`/assets/${id}/`),
        DELETE: (id: string | number) => cmmsPath(`/assets/${id}/`),
        TYPES: cmmsPath('/asset-types/'),
        CATEGORIES: cmmsPath('/asset-categories/'),
        CATEGORY_DETAIL: (id: string | number) => cmmsPath(`/asset-categories/${id}/`),
        STATS: cmmsPath('/assets/stats/'),
        BUILDINGS: (id: string | number) => cmmsPath(`/assets/${id}/buildings/`),
        METERS: (id: string | number) => cmmsPath(`/assets/${id}/meters/`),
        DOCUMENTS: (id: string | number) => cmmsPath(`/assets/${id}/documents/`),
        WORK_ORDERS: (id: string | number) => cmmsPath(`/assets/${id}/work_orders/`),
        DEPRECATE: (id: string | number) => cmmsPath(`/assets/${id}/deprecate/`),
        TRANSFER: (id: string | number) => cmmsPath(`/assets/${id}/transfer/`),
        LIFECYCLE_COSTS: (id: string | number) => cmmsPath(`/assets/${id}/lifecycle-costs/`),
        REPLACEMENT_ANALYSIS: (id: string | number) => cmmsPath(`/assets/${id}/replacement-analysis/`),
        MAINTENANCE_HISTORY: (id: string | number) => cmmsPath(`/assets/${id}/maintenance-history/`),
        ASSET_METERS: cmmsPath('/asset-meters/'),
        ASSET_METER_DETAIL: (id: string | number) => cmmsPath(`/asset-meters/${id}/`),
        ASSET_METER_RECORD: (id: string | number) => cmmsPath(`/asset-meters/${id}/record_reading/`),
        ASSET_DOCUMENTS: cmmsPath('/asset-documents/'),
        ASSET_DOCUMENT_DETAIL: (id: string | number) => cmmsPath(`/asset-documents/${id}/`),
        ASSET_ASSIGNMENTS: cmmsPath('/asset-assignments/'),
        ASSET_ASSIGNMENT_DETAIL: (id: string | number) => cmmsPath(`/asset-assignments/${id}/`),
        ASSET_CUSTODY: cmmsPath('/asset-custody/'),
        ASSET_CHECK_OUT: cmmsPath('/asset-check-logs/check_out/'),
        ASSET_CHECK_IN: cmmsPath('/asset-check-logs/check_in/'),
        ASSET_CHECK_LOGS: cmmsPath('/asset-check-logs/'),
        ASSET_TRANSFERS: cmmsPath('/asset-transfers/'),
        ASSET_PARTS: cmmsPath('/asset-parts/'),
        ASSET_PART_DETAIL: (id: string | number) => cmmsPath(`/asset-parts/${id}/`),
    },
    // Sites/Locations
    SITES: {
        LIST: cmmsPath('/sites/'),
        DETAIL: (id: string | number) => cmmsPath(`/sites/${id}/`),
        CREATE: cmmsPath('/sites/'),
        UPDATE: (id: string | number) => cmmsPath(`/sites/${id}/`),
        DELETE: (id: string | number) => cmmsPath(`/sites/${id}/`),
        TYPES: cmmsPath('/site-types/'),
        STATS: (id: string | number) => cmmsPath(`/sites/${id}/stats/`),
        BUILDINGS: (id: string | number) => cmmsPath(`/sites/${id}/buildings/`),
        ASSETS: (id: string | number) => cmmsPath(`/sites/${id}/assets/`),
    },
    // Buildings
    BUILDINGS: {
        LIST: cmmsPath('/buildings/'),
        DETAIL: (id: string | number) => cmmsPath(`/buildings/${id}/`),
        CREATE: cmmsPath('/buildings/'),
        UPDATE: (id: string | number) => cmmsPath(`/buildings/${id}/`),
        DELETE: (id: string | number) => cmmsPath(`/buildings/${id}/`),
        FLOORS: (id: string | number) => cmmsPath(`/buildings/${id}/floors/`),
    },
    // Organizations
    ORGANIZATIONS: {
        LIST: cmmsPath('/organizations/'),
        DETAIL: (id: string | number) => cmmsPath(`/organizations/${id}/`),
        CREATE: cmmsPath('/organizations/'),
        MEMBERS: (id: string | number) => cmmsPath(`/organizations/${id}/members/`),
        CREATE_MEMBER: (id: string | number) => cmmsPath(`/organizations/${id}/create-member/`),
        UPDATE_MEMBER: (orgId: string | number, userId: string | number) => cmmsPath(`/organizations/${orgId}/members/${userId}/`),
        BRANDING: (id: string | number) => cmmsPath(`/organizations/${id}/branding/`),
        UPLOAD_LOGO: (id: string | number) => cmmsPath(`/organizations/${id}/upload-logo/`),
        SETTINGS: (id: string | number) => cmmsPath(`/organizations/${id}/settings/`),
    },
    // Maintenance
    MAINTENANCE: {
        LIST: cmmsPath('/preventive-maintenance/'),
        DETAIL: (id: string | number) => cmmsPath(`/preventive-maintenance/${id}/`),
        CREATE: cmmsPath('/preventive-maintenance/'),
        UPDATE: (id: string | number) => cmmsPath(`/preventive-maintenance/${id}/`),
        DELETE: (id: string | number) => cmmsPath(`/preventive-maintenance/${id}/`),
        HISTORY: cmmsPath('/maintenance-history/'),
        HISTORY_DETAIL: (id: string | number) => cmmsPath(`/maintenance-history/${id}/`),
        HISTORY_START: (id: string | number) => cmmsPath(`/maintenance-history/${id}/start/`),
        HISTORY_COMPLETE: (id: string | number) => cmmsPath(`/maintenance-history/${id}/complete/`),
        HISTORY_CANCEL: (id: string | number) => cmmsPath(`/maintenance-history/${id}/cancel/`),
        HISTORY_RESCHEDULE: (id: string | number) => cmmsPath(`/maintenance-history/${id}/reschedule/`),
        HISTORY_DASHBOARD: cmmsPath('/maintenance-history/dashboard/'),
        HISTORY_UPCOMING: cmmsPath('/maintenance-history/upcoming/'),
        HISTORY_OVERDUE: cmmsPath('/maintenance-history/overdue/'),
        SCHEDULE: cmmsPath('/maintenance-schedules/'),
        SCHEDULE_DETAIL: (id: string | number) => cmmsPath(`/maintenance-schedules/${id}/`),
        SCHEDULE_TOGGLE_PAUSE: (id: string | number) => cmmsPath(`/maintenance-schedules/${id}/toggle-pause/`),
        TEMPLATES: cmmsPath('/maintenance-templates/'),
        TEMPLATE_DETAIL: (id: string | number) => cmmsPath(`/maintenance-templates/${id}/`),
        PROCEDURES: cmmsPath('/maintenance-procedures/'),
        PROCEDURE_DETAIL: (id: string | number) => cmmsPath(`/maintenance-procedures/${id}/`),
        ALERTS: cmmsPath('/maintenance-alerts/'),
        ALERT_DETAIL: (id: string | number) => cmmsPath(`/maintenance-alerts/${id}/`),
        ALERT_MARK_READ: (id: string | number) => cmmsPath(`/maintenance-alerts/${id}/mark-read/`),
        ALERT_RESOLVE: (id: string | number) => cmmsPath(`/maintenance-alerts/${id}/resolve/`),
        ATTACHMENTS: cmmsPath('/maintenance-attachments/'),
        ATTACHMENT_DETAIL: (id: string | number) => cmmsPath(`/maintenance-attachments/${id}/`),
        DASHBOARD: cmmsPath('/maintenance-dashboard/'),
    },
    // Dashboard
    DASHBOARD: {
        STATS: cmmsPath('/dashboard/stats/'),
        ANALYTICS: cmmsPath('/dashboard/analytics/'),
    },
    // Floors
    FLOORS: {
        LIST: cmmsPath('/floors/'),
        DETAIL: (id: string | number) => cmmsPath(`/floors/${id}/`),
        CREATE: cmmsPath('/floors/'),
        UPDATE: (id: string | number) => cmmsPath(`/floors/${id}/`),
        DELETE: (id: string | number) => cmmsPath(`/floors/${id}/`),
        ZONES: (id: string | number) => cmmsPath(`/floors/${id}/zones/`),
    },
    // Zones
    ZONES: {
        LIST: cmmsPath('/zones/'),
        DETAIL: (id: string | number) => cmmsPath(`/zones/${id}/`),
        CREATE: cmmsPath('/zones/'),
        UPDATE: (id: string | number) => cmmsPath(`/zones/${id}/`),
        DELETE: (id: string | number) => cmmsPath(`/zones/${id}/`),
    },
    // Reports
    REPORTS: {
        TEMPLATES: cmmsPath('/report-templates/'),
        TEMPLATE_DETAIL: (id: string | number) => cmmsPath(`/report-templates/${id}/`),
        SYSTEM_TEMPLATES: cmmsPath('/report-templates/system_templates/'),
        LIST: cmmsPath('/reports/'),
        GENERATE: cmmsPath('/reports/generate/'),
        DETAIL: (id: string | number) => cmmsPath(`/reports/${id}/`),
        EXPORT: (id: string | number) => cmmsPath(`/reports/${id}/export/`),
        DASHBOARDS: cmmsPath('/dashboards/'),
        DASHBOARD_DETAIL: (id: string | number) => cmmsPath(`/dashboards/${id}/`),
        DASHBOARD_DEFAULT: cmmsPath('/dashboards/default/'),
        KPIS: cmmsPath('/kpis/'),
        KPI_DETAIL: (id: string | number) => cmmsPath(`/kpis/${id}/`),
        KPI_CALCULATE: (id: string | number) => cmmsPath(`/kpis/${id}/calculate/`),
        KPI_VALUES: cmmsPath('/kpi-values/'),
        KPI_VALUE_DETAIL: (id: string | number) => cmmsPath(`/kpi-values/${id}/`),
        ANALYTICS_QUERY: cmmsPath('/analytics/query/'),
    },
    // Dynamic Dashboard
    DYNAMIC_DASHBOARD: cmmsPath('/dynamic-dashboard/'),
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
    CMMS: CMMS_ENDPOINTS,
} as const;

// Export for backward compatibility
export { API_ENDPOINTS as default };
