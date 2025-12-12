import { apiClient } from '@/lib/api/client';
import { CMMS_ENDPOINTS } from '@/config';
import type {
    ReportTemplate,
    Report,
    Dashboard,
    KPI,
    KPIValue,
    AnalyticsQuery,
    AnalyticsResult,
    CreateReportTemplatePayload,
    UpdateReportTemplatePayload,
    GenerateReportPayload,
    CreateDashboardPayload,
    UpdateDashboardPayload,
    CreateKPIPayload,
    UpdateKPIPayload,
    PaginatedResponse,
} from '@/types/reports';

/**
 * Reports & Analytics API Client
 * Based on CMMS MVP API Documentation
 */
export const reportsApi = {
    // ==================== Report Templates ====================
    
    listReportTemplates: async (params?: Record<string, any>): Promise<PaginatedResponse<ReportTemplate>> => {
        return apiClient.get(CMMS_ENDPOINTS.REPORTS.TEMPLATES, { params });
    },

    createReportTemplate: async (data: CreateReportTemplatePayload): Promise<ReportTemplate> => {
        return apiClient.post(CMMS_ENDPOINTS.REPORTS.TEMPLATES, data);
    },

    getReportTemplate: async (id: string): Promise<ReportTemplate> => {
        return apiClient.get(CMMS_ENDPOINTS.REPORTS.TEMPLATE_DETAIL(id));
    },

    updateReportTemplate: async (id: string, data: UpdateReportTemplatePayload): Promise<ReportTemplate> => {
        return apiClient.patch(CMMS_ENDPOINTS.REPORTS.TEMPLATE_DETAIL(id), data);
    },

    deleteReportTemplate: async (id: string): Promise<void> => {
        return apiClient.delete(CMMS_ENDPOINTS.REPORTS.TEMPLATE_DETAIL(id));
    },

    getSystemTemplates: async (): Promise<ReportTemplate[]> => {
        return apiClient.get(CMMS_ENDPOINTS.REPORTS.SYSTEM_TEMPLATES);
    },

    // Find template by name (for upsert logic)
    findTemplateByName: async (orgId: string, name: string): Promise<ReportTemplate | null> => {
        try {
            const response = await apiClient.get<PaginatedResponse<ReportTemplate>>(CMMS_ENDPOINTS.REPORTS.TEMPLATES, {
                params: { organization: orgId, name, page_size: 1 }
            });
            return response.results && response.results.length > 0 ? response.results[0] : null;
        } catch {
            return null;
        }
    },

    // Upsert report template - create if not exists, update if exists
    upsertReportTemplate: async (data: CreateReportTemplatePayload): Promise<{ template: ReportTemplate; created: boolean }> => {
        const existingTemplate = await reportsApi.findTemplateByName(data.organization, data.name);
        if (existingTemplate) {
            const updatedTemplate = await reportsApi.updateReportTemplate(existingTemplate.id, data);
            return { template: updatedTemplate, created: false };
        }
        const newTemplate = await reportsApi.createReportTemplate(data);
        return { template: newTemplate, created: true };
    },

    // ==================== Reports ====================

    listReports: async (params?: Record<string, any>): Promise<PaginatedResponse<Report>> => {
        return apiClient.get(CMMS_ENDPOINTS.REPORTS.LIST, { params });
    },

    generateReport: async (data: GenerateReportPayload): Promise<Report> => {
        return apiClient.post(CMMS_ENDPOINTS.REPORTS.GENERATE, data);
    },

    getReport: async (id: string): Promise<Report> => {
        return apiClient.get(CMMS_ENDPOINTS.REPORTS.DETAIL(id));
    },

    deleteReport: async (id: string): Promise<void> => {
        return apiClient.delete(CMMS_ENDPOINTS.REPORTS.DETAIL(id));
    },

    exportReport: async (id: string, format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<Blob> => {
        return apiClient.get(CMMS_ENDPOINTS.REPORTS.EXPORT(id), {
            params: { format },
            responseType: 'blob'
        });
    },

    // ==================== Dashboards ====================

    listDashboards: async (params?: Record<string, any>): Promise<PaginatedResponse<Dashboard>> => {
        return apiClient.get(CMMS_ENDPOINTS.REPORTS.DASHBOARDS, { params });
    },

    createDashboard: async (data: CreateDashboardPayload): Promise<Dashboard> => {
        return apiClient.post(CMMS_ENDPOINTS.REPORTS.DASHBOARDS, data);
    },

    getDashboard: async (id: string): Promise<Dashboard> => {
        return apiClient.get(CMMS_ENDPOINTS.REPORTS.DASHBOARD_DETAIL(id));
    },

    updateDashboard: async (id: string, data: UpdateDashboardPayload): Promise<Dashboard> => {
        return apiClient.patch(CMMS_ENDPOINTS.REPORTS.DASHBOARD_DETAIL(id), data);
    },

    deleteDashboard: async (id: string): Promise<void> => {
        return apiClient.delete(CMMS_ENDPOINTS.REPORTS.DASHBOARD_DETAIL(id));
    },

    getDefaultDashboard: async (): Promise<Dashboard> => {
        return apiClient.get(CMMS_ENDPOINTS.REPORTS.DASHBOARD_DEFAULT);
    },

    // Find dashboard by name (for upsert logic)
    findDashboardByName: async (orgId: string, name: string): Promise<Dashboard | null> => {
        try {
            const response = await apiClient.get<PaginatedResponse<Dashboard>>(CMMS_ENDPOINTS.REPORTS.DASHBOARDS, {
                params: { organization: orgId, name, page_size: 1 }
            });
            return response.results && response.results.length > 0 ? response.results[0] : null;
        } catch {
            return null;
        }
    },

    // Upsert dashboard - create if not exists, update if exists
    upsertDashboard: async (data: CreateDashboardPayload): Promise<{ dashboard: Dashboard; created: boolean }> => {
        const existingDashboard = await reportsApi.findDashboardByName(data.organization, data.name);
        if (existingDashboard) {
            const updatedDashboard = await reportsApi.updateDashboard(existingDashboard.id, data);
            return { dashboard: updatedDashboard, created: false };
        }
        const newDashboard = await reportsApi.createDashboard(data);
        return { dashboard: newDashboard, created: true };
    },

    // ==================== KPIs ====================

    listKPIs: async (params?: Record<string, any>): Promise<PaginatedResponse<KPI>> => {
        return apiClient.get(CMMS_ENDPOINTS.REPORTS.KPIS, { params });
    },

    createKPI: async (data: CreateKPIPayload): Promise<KPI> => {
        return apiClient.post(CMMS_ENDPOINTS.REPORTS.KPIS, data);
    },

    getKPI: async (id: string): Promise<KPI> => {
        return apiClient.get(CMMS_ENDPOINTS.REPORTS.KPI_DETAIL(id));
    },

    updateKPI: async (id: string, data: UpdateKPIPayload): Promise<KPI> => {
        return apiClient.patch(CMMS_ENDPOINTS.REPORTS.KPI_DETAIL(id), data);
    },

    deleteKPI: async (id: string): Promise<void> => {
        return apiClient.delete(CMMS_ENDPOINTS.REPORTS.KPI_DETAIL(id));
    },

    calculateKPI: async (id: string): Promise<{ message: string; kpi: KPI; value: KPIValue }> => {
        return apiClient.post(CMMS_ENDPOINTS.REPORTS.KPI_CALCULATE(id), {});
    },

    // Find KPI by name (for upsert logic)
    findKPIByName: async (orgId: string, name: string): Promise<KPI | null> => {
        try {
            const response = await apiClient.get<PaginatedResponse<KPI>>(CMMS_ENDPOINTS.REPORTS.KPIS, {
                params: { organization: orgId, name, page_size: 1 }
            });
            return response.results && response.results.length > 0 ? response.results[0] : null;
        } catch {
            return null;
        }
    },

    // Upsert KPI - create if not exists, update if exists
    upsertKPI: async (data: CreateKPIPayload): Promise<{ kpi: KPI; created: boolean }> => {
        const existingKPI = await reportsApi.findKPIByName(data.organization, data.name);
        if (existingKPI) {
            const updatedKPI = await reportsApi.updateKPI(existingKPI.id, data);
            return { kpi: updatedKPI, created: false };
        }
        const newKPI = await reportsApi.createKPI(data);
        return { kpi: newKPI, created: true };
    },

    // ==================== KPI Values ====================

    listKPIValues: async (params?: Record<string, any>): Promise<PaginatedResponse<KPIValue>> => {
        return apiClient.get(CMMS_ENDPOINTS.REPORTS.KPI_VALUES, { params });
    },

    getKPIValue: async (id: string): Promise<KPIValue> => {
        return apiClient.get(CMMS_ENDPOINTS.REPORTS.KPI_VALUE_DETAIL(id));
    },

    // ==================== Analytics ====================

    queryAnalytics: async (data: AnalyticsQuery): Promise<AnalyticsResult> => {
        return apiClient.post(CMMS_ENDPOINTS.REPORTS.ANALYTICS_QUERY, data);
    },

    // Predefined analytics queries
    getAssetAnalytics: async (groupBy: string = 'category', filters?: Record<string, any>): Promise<AnalyticsResult> => {
        return reportsApi.queryAnalytics({
            metric: 'asset_count',
            group_by: groupBy,
            filters: filters || {}
        });
    },

    getWorkOrderAnalytics: async (groupBy: string = 'status', filters?: Record<string, any>, dateRange?: { start: string; end: string }): Promise<AnalyticsResult> => {
        return reportsApi.queryAnalytics({
            metric: 'work_order_count',
            group_by: groupBy,
            filters: filters || {},
            date_range_start: dateRange?.start,
            date_range_end: dateRange?.end
        });
    },

    getInventoryAnalytics: async (filters?: Record<string, any>): Promise<AnalyticsResult> => {
        return reportsApi.queryAnalytics({
            metric: 'inventory_value',
            filters: filters || {}
        });
    },

    getExpenseAnalytics: async (groupBy: string = 'category', filters?: Record<string, any>, dateRange?: { start: string; end: string }): Promise<AnalyticsResult> => {
        return reportsApi.queryAnalytics({
            metric: 'expense_total',
            group_by: groupBy,
            filters: filters || {},
            date_range_start: dateRange?.start,
            date_range_end: dateRange?.end
        });
    },
};
