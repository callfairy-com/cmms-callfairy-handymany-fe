/**
 * Reports & Analytics Type Definitions
 * Based on CMMS MVP API Documentation
 */

// Report Types
export type ReportType = 'work_order' | 'asset' | 'inventory' | 'maintenance' | 'expense' | 'custom';
export type ReportCategory = 'maintenance' | 'operations' | 'financial' | 'compliance' | 'performance';
export type ReportStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json';
export type KPIType = 'asset_uptime' | 'pm_compliance' | 'wo_completion' | 'inventory_turnover' | 'mttr' | 'mtbf' | 'custom';
export type KPIFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type KPIUnit = 'percentage' | 'ratio' | 'count' | 'currency' | 'hours' | 'days';

// Report Template
export interface ReportTemplate {
    id: string;
    organization: string;
    name: string;
    description?: string;
    report_type: ReportType;
    category: ReportCategory;
    is_active: boolean;
    is_public: boolean;
    is_system: boolean;
    parameters?: Record<string, any>;
    filters?: Record<string, any>;
    columns?: string[];
    created_by?: string;
    created_at: string;
    updated_at?: string;
}

// Report
export interface Report {
    id: string;
    organization: string;
    template?: string;
    template_name?: string;
    name: string;
    description?: string;
    status: ReportStatus;
    format: ReportFormat;
    parameters?: Record<string, any>;
    filters_applied?: Record<string, any>;
    data?: any[];
    summary?: Record<string, any>;
    row_count?: number;
    file_url?: string;
    generated_at?: string;
    generation_time_seconds?: number;
    error_message?: string;
    created_by?: string;
    created_at: string;
    updated_at?: string;
}

// Dashboard
export interface Dashboard {
    id: string;
    organization: string;
    name: string;
    description?: string;
    layout: DashboardLayout;
    is_default: boolean;
    is_public: boolean;
    is_active: boolean;
    created_by?: string;
    created_at: string;
    updated_at?: string;
}

export interface DashboardLayout {
    type: 'grid' | 'flex' | 'custom';
    columns?: number;
    widgets: DashboardWidget[];
}

export interface DashboardWidget {
    id: string;
    type: 'kpi_chart' | 'chart' | 'table' | 'metric' | 'list';
    title: string;
    position?: { x: number; y: number; w: number; h: number };
    kpi_id?: string;
    chart_config?: ChartConfig;
    data_source?: string;
    refresh_interval?: number;
}

export interface ChartConfig {
    type: 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'gauge';
    metric: string;
    group_by?: string;
    colors?: string[];
    show_legend?: boolean;
}

// KPI
export interface KPI {
    id: string;
    organization: string;
    name: string;
    description?: string;
    kpi_type: KPIType;
    unit: KPIUnit;
    target_value: string;
    current_value?: string;
    previous_value?: string;
    trend?: 'up' | 'down' | 'stable';
    frequency: KPIFrequency;
    is_active: boolean;
    last_calculated_at?: string;
    created_by?: string;
    created_at: string;
    updated_at?: string;
}

export interface KPIValue {
    id: string;
    kpi: string;
    kpi_name?: string;
    value: string;
    target_value: string;
    variance?: string;
    variance_percentage?: string;
    period_start: string;
    period_end: string;
    calculated_at: string;
    created_at: string;
}

// Analytics
export interface AnalyticsQuery {
    metric: string;
    group_by?: string;
    filters?: Record<string, any>;
    date_range_start?: string;
    date_range_end?: string;
}

export interface AnalyticsResult {
    data: Array<Record<string, any>>;
    summary?: Record<string, any>;
    query_time_ms?: number;
}

// API Payloads
export interface CreateReportTemplatePayload {
    organization: string;
    name: string;
    description?: string;
    report_type: ReportType;
    category: ReportCategory;
    is_active?: boolean;
    is_public?: boolean;
    parameters?: Record<string, any>;
    filters?: Record<string, any>;
    columns?: string[];
}

export interface UpdateReportTemplatePayload {
    name?: string;
    description?: string;
    report_type?: ReportType;
    category?: ReportCategory;
    is_active?: boolean;
    is_public?: boolean;
    parameters?: Record<string, any>;
    filters?: Record<string, any>;
    columns?: string[];
}

export interface GenerateReportPayload {
    template_id?: string;
    name: string;
    description?: string;
    format: ReportFormat;
    filters?: Record<string, any>;
    date_range_start?: string;
    date_range_end?: string;
}

export interface CreateDashboardPayload {
    organization: string;
    name: string;
    description?: string;
    layout: DashboardLayout;
    is_default?: boolean;
    is_public?: boolean;
    is_active?: boolean;
}

export interface UpdateDashboardPayload {
    name?: string;
    description?: string;
    layout?: DashboardLayout;
    is_default?: boolean;
    is_public?: boolean;
    is_active?: boolean;
}

export interface CreateKPIPayload {
    organization: string;
    name: string;
    description?: string;
    kpi_type: KPIType;
    unit: KPIUnit;
    target_value: string;
    frequency: KPIFrequency;
    is_active?: boolean;
}

export interface UpdateKPIPayload {
    name?: string;
    description?: string;
    kpi_type?: KPIType;
    unit?: KPIUnit;
    target_value?: string;
    frequency?: KPIFrequency;
    is_active?: boolean;
}

// Paginated Response
export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}
