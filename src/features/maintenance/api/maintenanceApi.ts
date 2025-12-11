import { apiClient } from '@/lib/api/client';
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
        return apiClient.get('/api/v1/cmms/maintenance-history/', { params });
    },

    /**
     * Get single maintenance history record
     */
    getHistory: async (id: string): Promise<MaintenanceHistory> => {
        return apiClient.get(`/api/v1/cmms/maintenance-history/${id}/`);
    },

    /**
     * Create new maintenance record
     */
    createHistory: async (data: CreateMaintenancePayload): Promise<MaintenanceHistory> => {
        return apiClient.post('/api/v1/cmms/maintenance-history/', data);
    },

    /**
     * Update maintenance record (partial update)
     */
    updateHistory: async (id: string, data: UpdateMaintenancePayload): Promise<MaintenanceHistory> => {
        return apiClient.patch(`/api/v1/cmms/maintenance-history/${id}/`, data);
    },

    /**
     * Delete maintenance record
     */
    deleteHistory: async (id: string): Promise<void> => {
        return apiClient.delete(`/api/v1/cmms/maintenance-history/${id}/`);
    },

    // ==================== Maintenance Actions ====================
    
    /**
     * Start maintenance work (technician action)
     */
    startMaintenance: async (id: string): Promise<{ message: string; maintenance: MaintenanceHistory }> => {
        return apiClient.post(`/api/v1/cmms/maintenance-history/${id}/start/`, {});
    },

    /**
     * Complete maintenance work (technician action)
     */
    completeMaintenance: async (id: string, data: CompleteMaintenancePayload): Promise<{ message: string; maintenance: MaintenanceHistory }> => {
        return apiClient.post(`/api/v1/cmms/maintenance-history/${id}/complete/`, data);
    },

    /**
     * Cancel maintenance
     */
    cancelMaintenance: async (id: string, reason?: string): Promise<{ message: string }> => {
        return apiClient.post(`/api/v1/cmms/maintenance-history/${id}/cancel/`, reason ? { reason } : {});
    },

    /**
     * Reschedule maintenance
     */
    rescheduleMaintenance: async (id: string, newDate: string): Promise<MaintenanceHistory> => {
        return apiClient.post(`/api/v1/cmms/maintenance-history/${id}/reschedule/`, { scheduled_date: newDate });
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
        return apiClient.get('/api/v1/cmms/maintenance-history/dashboard/', { params });
    },

    /**
     * Get upcoming maintenance
     */
    getUpcoming: async (params?: Record<string, any>): Promise<PaginatedResponse<MaintenanceHistory>> => {
        return apiClient.get('/api/v1/cmms/maintenance-history/upcoming/', { params });
    },

    /**
     * Get overdue maintenance
     */
    getOverdue: async (params?: Record<string, any>): Promise<PaginatedResponse<MaintenanceHistory>> => {
        return apiClient.get('/api/v1/cmms/maintenance-history/overdue/', { params });
    },

    // ==================== Maintenance Schedules ====================
    
    /**
     * List maintenance schedules
     */
    listSchedules: async (params?: Record<string, any>): Promise<PaginatedResponse<MaintenanceSchedule>> => {
        return apiClient.get('/api/v1/cmms/maintenance-schedules/', { params });
    },

    /**
     * Get single schedule
     */
    getSchedule: async (id: string): Promise<MaintenanceSchedule> => {
        return apiClient.get(`/api/v1/cmms/maintenance-schedules/${id}/`);
    },

    /**
     * Create maintenance schedule
     */
    createSchedule: async (data: CreateSchedulePayload): Promise<MaintenanceSchedule> => {
        return apiClient.post('/api/v1/cmms/maintenance-schedules/', data);
    },

    /**
     * Update schedule
     */
    updateSchedule: async (id: string, data: Partial<CreateSchedulePayload>): Promise<MaintenanceSchedule> => {
        return apiClient.patch(`/api/v1/cmms/maintenance-schedules/${id}/`, data);
    },

    /**
     * Delete schedule
     */
    deleteSchedule: async (id: string): Promise<void> => {
        return apiClient.delete(`/api/v1/cmms/maintenance-schedules/${id}/`);
    },

    /**
     * Pause/Resume schedule
     */
    toggleSchedulePause: async (id: string, paused: boolean): Promise<MaintenanceSchedule> => {
        return apiClient.post(`/api/v1/cmms/maintenance-schedules/${id}/toggle-pause/`, { is_paused: paused });
    },

    // ==================== Maintenance Templates ====================
    
    /**
     * List maintenance templates
     */
    listTemplates: async (params?: Record<string, any>): Promise<PaginatedResponse<MaintenanceTemplate>> => {
        return apiClient.get('/api/v1/cmms/maintenance-templates/', { params });
    },

    /**
     * Get single template
     */
    getTemplate: async (id: string): Promise<MaintenanceTemplate> => {
        return apiClient.get(`/api/v1/cmms/maintenance-templates/${id}/`);
    },

    /**
     * Create maintenance template
     */
    createTemplate: async (data: CreateTemplatePayload): Promise<MaintenanceTemplate> => {
        return apiClient.post('/api/v1/cmms/maintenance-templates/', data);
    },

    /**
     * Update template
     */
    updateTemplate: async (id: string, data: Partial<CreateTemplatePayload>): Promise<MaintenanceTemplate> => {
        return apiClient.patch(`/api/v1/cmms/maintenance-templates/${id}/`, data);
    },

    /**
     * Delete template
     */
    deleteTemplate: async (id: string): Promise<void> => {
        return apiClient.delete(`/api/v1/cmms/maintenance-templates/${id}/`);
    },

    // ==================== Maintenance Procedures ====================
    
    /**
     * List maintenance procedures
     */
    listProcedures: async (params?: Record<string, any>): Promise<PaginatedResponse<MaintenanceProcedure>> => {
        return apiClient.get('/api/v1/cmms/maintenance-procedures/', { params });
    },

    /**
     * Get single procedure
     */
    getProcedure: async (id: string): Promise<MaintenanceProcedure> => {
        return apiClient.get(`/api/v1/cmms/maintenance-procedures/${id}/`);
    },

    // ==================== Maintenance Alerts ====================
    
    /**
     * List maintenance alerts
     */
    listAlerts: async (params?: Record<string, any>): Promise<PaginatedResponse<MaintenanceAlert>> => {
        return apiClient.get('/api/v1/cmms/maintenance-alerts/', { params });
    },

    /**
     * Get single alert
     */
    getAlert: async (id: string): Promise<MaintenanceAlert> => {
        return apiClient.get(`/api/v1/cmms/maintenance-alerts/${id}/`);
    },

    /**
     * Create maintenance alert
     */
    createAlert: async (data: any): Promise<MaintenanceAlert> => {
        return apiClient.post('/api/v1/cmms/maintenance-alerts/', data);
    },

    /**
     * Mark alert as read
     */
    markAlertRead: async (id: string): Promise<MaintenanceAlert> => {
        return apiClient.post(`/api/v1/cmms/maintenance-alerts/${id}/mark-read/`, {});
    },

    /**
     * Resolve alert
     */
    resolveAlert: async (id: string): Promise<MaintenanceAlert> => {
        return apiClient.post(`/api/v1/cmms/maintenance-alerts/${id}/resolve/`, {});
    },

    // ==================== Maintenance Attachments ====================
    
    /**
     * List maintenance attachments
     */
    listAttachments: async (params?: Record<string, any>): Promise<PaginatedResponse<MaintenanceAttachment>> => {
        return apiClient.get('/api/v1/cmms/maintenance-attachments/', { params });
    },

    /**
     * Upload maintenance attachment (multipart/form-data)
     */
    uploadAttachment: async (formData: FormData): Promise<MaintenanceAttachment> => {
        return apiClient.post('/api/v1/cmms/maintenance-attachments/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    /**
     * Delete attachment
     */
    deleteAttachment: async (id: string): Promise<void> => {
        return apiClient.delete(`/api/v1/cmms/maintenance-attachments/${id}/`);
    },
};
