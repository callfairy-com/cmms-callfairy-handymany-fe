import { apiClient } from '@/lib/api/client';
import { CMMS_ENDPOINTS } from '@/config';
import type {
    MaintenanceHistory,
    MaintenanceSchedule,
    MaintenanceTemplate,
    MaintenanceProcedure,
    MaintenanceAlert,
    MaintenanceAttachment,
    MaintenanceDashboard,
    CreateMaintenancePayload,
    UpdateMaintenancePayload,
    CompleteMaintenancePayload,
    CreateSchedulePayload,
    CreateTemplatePayload,
    PaginatedResponse,
} from '@/types/maintenance';

/**
 * Preventative Maintenance API Client
 * Based on CMMS API Specification
 */
export const maintenanceApi = {
    // ==================== Maintenance History ====================
    
    /**
     * List maintenance history records with filtering
     * Supports: organization, status, maintenance_type, asset, site, assigned_to, assigned_team, priority, date ranges
     */
    listHistory: async (params?: Record<string, any>): Promise<PaginatedResponse<MaintenanceHistory>> => {
        return apiClient.get(CMMS_ENDPOINTS.MAINTENANCE.HISTORY, { params });
    },

    /**
     * Get single maintenance history record
     */
    getHistory: async (id: string): Promise<MaintenanceHistory> => {
        return apiClient.get(CMMS_ENDPOINTS.MAINTENANCE.HISTORY_DETAIL(id));
    },

    /**
     * Create new maintenance record
     */
    createHistory: async (data: CreateMaintenancePayload): Promise<MaintenanceHistory> => {
        return apiClient.post(CMMS_ENDPOINTS.MAINTENANCE.HISTORY, data);
    },

    /**
     * Update maintenance record (partial update)
     */
    updateHistory: async (id: string, data: UpdateMaintenancePayload): Promise<MaintenanceHistory> => {
        return apiClient.patch(CMMS_ENDPOINTS.MAINTENANCE.HISTORY_DETAIL(id), data);
    },

    /**
     * Delete maintenance record
     */
    deleteHistory: async (id: string): Promise<void> => {
        return apiClient.delete(CMMS_ENDPOINTS.MAINTENANCE.HISTORY_DETAIL(id));
    },

    // ==================== Maintenance Actions ====================
    
    /**
     * Start maintenance work (technician action)
     */
    startMaintenance: async (id: string): Promise<{ message: string; maintenance: MaintenanceHistory }> => {
        return apiClient.post(CMMS_ENDPOINTS.MAINTENANCE.HISTORY_START(id), {});
    },

    /**
     * Complete maintenance work (technician action)
     */
    completeMaintenance: async (id: string, data: CompleteMaintenancePayload): Promise<{ message: string; maintenance: MaintenanceHistory }> => {
        return apiClient.post(CMMS_ENDPOINTS.MAINTENANCE.HISTORY_COMPLETE(id), data);
    },

    /**
     * Cancel maintenance
     */
    cancelMaintenance: async (id: string, reason?: string): Promise<{ message: string }> => {
        return apiClient.post(CMMS_ENDPOINTS.MAINTENANCE.HISTORY_CANCEL(id), reason ? { reason } : {});
    },

    /**
     * Reschedule maintenance
     */
    rescheduleMaintenance: async (id: string, newDate: string): Promise<MaintenanceHistory> => {
        return apiClient.post(CMMS_ENDPOINTS.MAINTENANCE.HISTORY_RESCHEDULE(id), { scheduled_date: newDate });
    },

    // ==================== Dashboard & Analytics ====================
    
    /**
     * Get maintenance dashboard with analytics
     */
    getDashboard: async (params?: {
        organization?: string;
        start_date?: string;
        end_date?: string;
        maintenance_type?: string;
        assigned_team?: string;
    }): Promise<MaintenanceDashboard> => {
        return apiClient.get(CMMS_ENDPOINTS.MAINTENANCE.HISTORY_DASHBOARD, { params });
    },

    /**
     * Get upcoming maintenance
     */
    getUpcoming: async (params?: Record<string, any>): Promise<PaginatedResponse<MaintenanceHistory>> => {
        return apiClient.get(CMMS_ENDPOINTS.MAINTENANCE.HISTORY_UPCOMING, { params });
    },

    /**
     * Get overdue maintenance
     */
    getOverdue: async (params?: Record<string, any>): Promise<PaginatedResponse<MaintenanceHistory>> => {
        return apiClient.get(CMMS_ENDPOINTS.MAINTENANCE.HISTORY_OVERDUE, { params });
    },

    // ==================== Maintenance Schedules ====================
    
    /**
     * List maintenance schedules
     */
    listSchedules: async (params?: Record<string, any>): Promise<PaginatedResponse<MaintenanceSchedule>> => {
        return apiClient.get(CMMS_ENDPOINTS.MAINTENANCE.SCHEDULE, { params });
    },

    /**
     * Get single schedule
     */
    getSchedule: async (id: string): Promise<MaintenanceSchedule> => {
        return apiClient.get(CMMS_ENDPOINTS.MAINTENANCE.SCHEDULE_DETAIL(id));
    },

    /**
     * Create maintenance schedule
     */
    createSchedule: async (data: CreateSchedulePayload): Promise<MaintenanceSchedule> => {
        return apiClient.post(CMMS_ENDPOINTS.MAINTENANCE.SCHEDULE, data);
    },

    /**
     * Update schedule
     */
    updateSchedule: async (id: string, data: Partial<CreateSchedulePayload>): Promise<MaintenanceSchedule> => {
        return apiClient.patch(CMMS_ENDPOINTS.MAINTENANCE.SCHEDULE_DETAIL(id), data);
    },

    /**
     * Delete schedule
     */
    deleteSchedule: async (id: string): Promise<void> => {
        return apiClient.delete(CMMS_ENDPOINTS.MAINTENANCE.SCHEDULE_DETAIL(id));
    },

    /**
     * Pause/Resume schedule
     */
    toggleSchedulePause: async (id: string, paused: boolean): Promise<MaintenanceSchedule> => {
        return apiClient.post(CMMS_ENDPOINTS.MAINTENANCE.SCHEDULE_TOGGLE_PAUSE(id), { is_paused: paused });
    },

    // ==================== Maintenance Templates ====================
    
    /**
     * List maintenance templates
     */
    listTemplates: async (params?: Record<string, any>): Promise<PaginatedResponse<MaintenanceTemplate>> => {
        return apiClient.get(CMMS_ENDPOINTS.MAINTENANCE.TEMPLATES, { params });
    },

    /**
     * Get single template
     */
    getTemplate: async (id: string): Promise<MaintenanceTemplate> => {
        return apiClient.get(CMMS_ENDPOINTS.MAINTENANCE.TEMPLATE_DETAIL(id));
    },

    /**
     * Create maintenance template
     */
    createTemplate: async (data: CreateTemplatePayload): Promise<MaintenanceTemplate> => {
        return apiClient.post(CMMS_ENDPOINTS.MAINTENANCE.TEMPLATES, data);
    },

    /**
     * Update template
     */
    updateTemplate: async (id: string, data: Partial<CreateTemplatePayload>): Promise<MaintenanceTemplate> => {
        return apiClient.patch(CMMS_ENDPOINTS.MAINTENANCE.TEMPLATE_DETAIL(id), data);
    },

    /**
     * Delete template
     */
    deleteTemplate: async (id: string): Promise<void> => {
        return apiClient.delete(CMMS_ENDPOINTS.MAINTENANCE.TEMPLATE_DETAIL(id));
    },

    // ==================== Maintenance Procedures ====================
    
    /**
     * List maintenance procedures
     */
    listProcedures: async (params?: Record<string, any>): Promise<PaginatedResponse<MaintenanceProcedure>> => {
        return apiClient.get(CMMS_ENDPOINTS.MAINTENANCE.PROCEDURES, { params });
    },

    /**
     * Get single procedure
     */
    getProcedure: async (id: string): Promise<MaintenanceProcedure> => {
        return apiClient.get(CMMS_ENDPOINTS.MAINTENANCE.PROCEDURE_DETAIL(id));
    },

    // ==================== Maintenance Alerts ====================
    
    /**
     * List maintenance alerts
     */
    listAlerts: async (params?: Record<string, any>): Promise<PaginatedResponse<MaintenanceAlert>> => {
        return apiClient.get(CMMS_ENDPOINTS.MAINTENANCE.ALERTS, { params });
    },

    /**
     * Get single alert
     */
    getAlert: async (id: string): Promise<MaintenanceAlert> => {
        return apiClient.get(CMMS_ENDPOINTS.MAINTENANCE.ALERT_DETAIL(id));
    },

    /**
     * Create maintenance alert
     */
    createAlert: async (data: any): Promise<MaintenanceAlert> => {
        return apiClient.post(CMMS_ENDPOINTS.MAINTENANCE.ALERTS, data);
    },

    /**
     * Mark alert as read
     */
    markAlertRead: async (id: string): Promise<MaintenanceAlert> => {
        return apiClient.post(CMMS_ENDPOINTS.MAINTENANCE.ALERT_MARK_READ(id), {});
    },

    /**
     * Resolve alert
     */
    resolveAlert: async (id: string): Promise<{ message: string }> => {
        return apiClient.post(CMMS_ENDPOINTS.MAINTENANCE.ALERT_RESOLVE(id), {});
    },

    // ==================== Maintenance Attachments ====================
    
    /**
     * List maintenance attachments
     */
    listAttachments: async (params?: Record<string, any>): Promise<PaginatedResponse<MaintenanceAttachment>> => {
        return apiClient.get(CMMS_ENDPOINTS.MAINTENANCE.ATTACHMENTS, { params });
    },

    /**
     * Upload maintenance attachment (multipart/form-data)
     */
    uploadAttachment: async (formData: FormData): Promise<MaintenanceAttachment> => {
        return apiClient.post(CMMS_ENDPOINTS.MAINTENANCE.ATTACHMENTS, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    /**
     * Delete attachment
     */
    deleteAttachment: async (id: string): Promise<void> => {
        return apiClient.delete(CMMS_ENDPOINTS.MAINTENANCE.ATTACHMENT_DETAIL(id));
    },
};
