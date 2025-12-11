// Preventative Maintenance Types - Based on CMMS API Spec

export type MaintenanceType = 'preventive' | 'corrective' | 'predictive' | 'emergency';
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue' | 'on_hold';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';
export type ScheduleType = 'one_time' | 'recurring';
export type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
export type AlertType = 'overdue' | 'due_soon' | 'assigned' | 'completed' | 'cancelled';
export type AttachmentType = 'photo' | 'document' | 'video' | 'other';

// Maintenance History (Primary Entity)
export interface MaintenanceHistory {
    id: string;
    organization: string;
    title: string;
    description?: string;
    maintenance_type: MaintenanceType;
    status: MaintenanceStatus;
    priority: MaintenancePriority;
    
    // Asset & Location
    asset?: string;
    asset_name?: string;
    site?: string;
    site_name?: string;
    building?: string;
    floor?: string;
    
    // Assignment
    assigned_to?: string;
    assigned_to_name?: string;
    assigned_team?: string;
    assigned_team_name?: string;
    
    // Scheduling
    scheduled_date?: string;
    started_at?: string;
    completed_at?: string;
    due_date?: string;
    
    // Costs & Estimates
    estimated_cost?: string;
    actual_cost?: string;
    estimated_duration_hours?: number;
    actual_duration_hours?: number;
    currency?: string;
    
    // Work Details
    work_quality_rating?: number;
    staff_notes?: string;
    findings?: string;
    recommendations?: string;
    
    // Relations
    maintenance_schedule?: string;
    work_order?: string;
    parent_maintenance?: string;
    
    // Parts & Tools
    parts_used?: MaintenancePart[];
    tools_used?: string[];
    
    // Metadata
    created_by?: string;
    created_by_name?: string;
    updated_by?: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
}

export interface MaintenancePart {
    part_name: string;
    part_id?: string;
    quantity: number;
    cost?: string;
    notes?: string;
}

// Maintenance Schedule (Recurring Maintenance)
export interface MaintenanceSchedule {
    id: string;
    organization: string;
    title: string;
    description?: string;
    
    // Asset & Location
    asset?: string;
    asset_name?: string;
    site?: string;
    site_name?: string;
    
    // Schedule Configuration
    schedule_type: ScheduleType;
    frequency_type: FrequencyType;
    frequency_interval: number;
    start_date: string;
    end_date?: string;
    next_due?: string;
    last_generated?: string;
    
    // Assignment & Priority
    assigned_to?: string;
    assigned_to_name?: string;
    assigned_team?: string;
    priority: MaintenancePriority;
    
    // Estimates
    estimated_duration_hours?: number;
    estimated_cost?: string;
    currency?: string;
    
    // Status
    is_active: boolean;
    is_paused: boolean;
    
    // Metadata
    created_by?: string;
    created_at: string;
    updated_at: string;
}

// Maintenance Template
export interface MaintenanceTemplate {
    id: string;
    organization: string;
    title: string;
    description?: string;
    
    // Categorization
    asset_category?: string;
    asset_category_name?: string;
    maintenance_type: MaintenanceType;
    
    // Estimates
    estimated_duration_hours?: number;
    estimated_cost?: string;
    currency?: string;
    priority: MaintenancePriority;
    
    // Requirements
    required_skills?: string[];
    required_tools?: string[];
    required_parts?: string[];
    safety_requirements?: string[];
    
    // Instructions
    instructions?: string;
    checklist_items?: ChecklistItem[];
    
    // Metadata
    is_active: boolean;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface ChecklistItem {
    id?: string;
    title: string;
    description?: string;
    is_required: boolean;
    order: number;
    completed?: boolean;
}

// Maintenance Procedure (Detailed Instructions)
export interface MaintenanceProcedure {
    id: string;
    organization: string;
    title: string;
    description?: string;
    procedure_type: MaintenanceType;
    
    // Instructions
    steps: ProcedureStep[];
    safety_warnings?: string[];
    required_tools?: string[];
    required_skills?: string[];
    
    // Estimates
    estimated_duration_minutes: number;
    difficulty_level?: 'easy' | 'medium' | 'hard' | 'expert';
    
    // Metadata
    version: string;
    is_active: boolean;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface ProcedureStep {
    step_number: number;
    title: string;
    description: string;
    estimated_duration_minutes?: number;
    safety_notes?: string;
    image_url?: string;
}

// Maintenance Alert
export interface MaintenanceAlert {
    id: string;
    organization: string;
    alert_type: AlertType;
    title: string;
    message: string;
    priority: MaintenancePriority;
    
    // Relations
    maintenance_history?: string;
    asset?: string;
    asset_name?: string;
    assigned_to?: string;
    assigned_to_name?: string;
    
    // Timing
    trigger_date: string;
    due_date?: string;
    acknowledged_at?: string;
    acknowledged_by?: string;
    
    // Status
    is_read: boolean;
    is_resolved: boolean;
    
    // Metadata
    created_at: string;
    updated_at: string;
}

// Maintenance Attachment
export interface MaintenanceAttachment {
    id: string;
    organization: string;
    maintenance_history: string;
    
    // File Info
    file: string;
    file_name: string;
    file_size?: number;
    file_type?: string;
    attachment_type: AttachmentType;
    
    // Metadata
    description?: string;
    uploaded_by?: string;
    uploaded_by_name?: string;
    uploaded_at: string;
}

// Dashboard Stats
export interface MaintenanceDashboard {
    total_maintenance: number;
    scheduled: number;
    in_progress: number;
    completed: number;
    overdue: number;
    cancelled: number;
    
    // By Type
    by_type: { maintenance_type: MaintenanceType; count: number }[];
    
    // By Priority
    by_priority: { priority: MaintenancePriority; count: number }[];
    
    // By Status
    by_status: { status: MaintenanceStatus; count: number }[];
    
    // Cost Analytics
    total_estimated_cost: string;
    total_actual_cost: string;
    cost_variance: string;
    
    // Time Analytics
    avg_completion_time_hours: number;
    on_time_completion_rate: number;
    
    // Upcoming & Overdue
    upcoming_count: number;
    overdue_count: number;
    due_this_week: number;
    due_this_month: number;
    
    // Asset Analytics
    assets_with_maintenance: number;
    assets_overdue: number;
    
    // Performance
    avg_quality_rating: number;
    completion_rate: number;
}

// API Payloads
export interface CreateMaintenancePayload {
    title: string;
    description?: string;
    maintenance_type: MaintenanceType;
    organization: string;
    asset?: string;
    site?: string;
    assigned_to?: string;
    assigned_team?: string;
    scheduled_date?: string;
    priority: MaintenancePriority;
    estimated_cost?: string;
    estimated_duration_hours?: number;
    currency?: string;
    maintenance_schedule?: string;
}

export interface UpdateMaintenancePayload {
    title?: string;
    description?: string;
    status?: MaintenanceStatus;
    priority?: MaintenancePriority;
    assigned_to?: string;
    assigned_team?: string;
    scheduled_date?: string;
    estimated_cost?: string;
    actual_cost?: string;
    estimated_duration_hours?: number;
    actual_duration_hours?: number;
}

export interface CompleteMaintenancePayload {
    actual_cost?: string;
    actual_duration_hours?: number;
    work_quality_rating?: number;
    staff_notes?: string;
    findings?: string;
    recommendations?: string;
    parts_used?: MaintenancePart[];
    tools_used?: string[];
}

export interface CreateSchedulePayload {
    title: string;
    description?: string;
    organization: string;
    asset?: string;
    schedule_type: ScheduleType;
    frequency_type: FrequencyType;
    frequency_interval: number;
    start_date: string;
    end_date?: string;
    next_due?: string;
    assigned_to?: string;
    assigned_team?: string;
    priority: MaintenancePriority;
    estimated_duration_hours?: number;
    estimated_cost?: string;
}

export interface CreateTemplatePayload {
    title: string;
    description?: string;
    organization: string;
    asset_category?: string;
    maintenance_type: MaintenanceType;
    estimated_duration_hours?: number;
    estimated_cost?: string;
    priority: MaintenancePriority;
    required_skills?: string[];
    required_tools?: string[];
    required_parts?: string[];
    safety_requirements?: string[];
    instructions?: string;
}

// Paginated Response
export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}
