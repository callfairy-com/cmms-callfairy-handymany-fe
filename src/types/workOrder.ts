/**
 * Work Order Type Definitions
 * Based on CMMS MVP API Documentation
 */

export type WorkOrderStatus = 
    | 'draft'
    | 'open'
    | 'assigned'
    | 'in_progress'
    | 'on_hold'
    | 'completed'
    | 'closed'
    | 'cancelled';

export type WorkOrderPriority = 
    | 'low'
    | 'medium'
    | 'high'
    | 'urgent'
    | 'emergency';

export interface WorkOrderType {
    id: string;
    name: string;
    code: string;
    description?: string;
    color?: string;
    is_active?: boolean;
}

export interface WorkOrder {
    id: string;
    organization: string;
    work_order_number: string;
    title: string;
    description: string;
    work_order_type: WorkOrderType;
    category?: string;
    status: WorkOrderStatus;
    priority: WorkOrderPriority;
    site?: {
        id: string;
        name: string;
    };
    building?: {
        id: string;
        name: string;
    };
    floor?: {
        id: string;
        name: string;
    };
    zone?: {
        id: string;
        name: string;
    };
    asset?: {
        id: string;
        name: string;
        asset_tag?: string;
    };
    assigned_to?: {
        id: string;
        email: string;
        first_name?: string;
        last_name?: string;
    };
    assigned_team?: {
        id: string;
        name: string;
    } | null;
    scheduled_start?: string;
    scheduled_end?: string;
    actual_start?: string;
    actual_end?: string;
    due_date?: string;
    estimated_hours?: number;
    actual_hours?: number;
    estimated_cost?: string;
    actual_cost?: string;
    currency?: string;
    location_notes?: string;
    completion_notes?: string;
    failure_code?: string;
    root_cause?: string;
    tags?: string[];
    created_by: {
        id: string;
        email: string;
        first_name?: string;
        last_name?: string;
    };
    created_at: string;
    updated_at: string;
}

// Work Order Task
export interface WorkOrderTask {
    id: string;
    work_order: string;
    title: string;
    description?: string;
    sequence: number;
    estimated_duration_minutes?: number;
    is_completed: boolean;
    completed_at?: string;
    completed_by?: {
        id: string;
        email: string;
        first_name?: string;
        last_name?: string;
    };
    created_at: string;
    updated_at?: string;
}

// Work Order Comment
export interface WorkOrderComment {
    id: string;
    work_order: string;
    comment: string;
    is_internal: boolean;
    created_by: {
        id: string;
        email: string;
        first_name?: string;
        last_name?: string;
    };
    created_at: string;
    updated_at?: string;
}

// Work Order Attachment
export interface WorkOrderAttachment {
    id: string;
    work_order: string;
    file: string;
    file_name: string;
    file_size: number;
    description?: string;
    uploaded_by: {
        id: string;
        email: string;
        first_name?: string;
        last_name?: string;
    };
    created_at: string;
}

// API Payloads
export interface CreateWorkOrderPayload {
    organization: string;
    title: string;
    description: string;
    work_order_type: string;
    site?: string;
    building?: string;
    floor?: string;
    zone?: string;
    asset?: string;
    priority: WorkOrderPriority;
    status?: WorkOrderStatus;
    assigned_to?: string;
    assigned_team?: string;
    scheduled_start?: string;
    scheduled_end?: string;
    due_date?: string;
    estimated_hours?: number;
    estimated_cost?: string;
    currency?: string;
    location_notes?: string;
    category?: string;
    tags?: string[];
}

export interface UpdateWorkOrderPayload {
    organization?: string;
    title?: string;
    description?: string;
    work_order_type?: string;
    site?: string;
    building?: string;
    floor?: string;
    zone?: string;
    asset?: string;
    priority?: WorkOrderPriority;
    status?: WorkOrderStatus;
    assigned_to?: string;
    assigned_team?: string;
    scheduled_start?: string;
    scheduled_end?: string;
    actual_start?: string;
    actual_end?: string;
    due_date?: string;
    estimated_hours?: number;
    actual_hours?: number;
    estimated_cost?: string;
    actual_cost?: string;
    currency?: string;
    location_notes?: string;
    completion_notes?: string;
    failure_code?: string;
    root_cause?: string;
    category?: string;
    tags?: string[];
}

export interface AssignWorkOrderPayload {
    assigned_to?: string;
    assigned_team?: string | null;
}

export interface CompleteWorkOrderPayload {
    completion_notes?: string;
    actual_hours?: number;
    actual_cost?: string;
}

export interface CreateTaskPayload {
    work_order: string;
    title: string;
    description?: string;
    sequence: number;
    estimated_duration_minutes?: number;
}

export interface CreateCommentPayload {
    work_order: string;
    comment: string;
    is_internal?: boolean;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}
