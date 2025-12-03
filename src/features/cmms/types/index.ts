export interface ClientCategory {
    id: number
    name: string
    color: string
    created_at: string
    updated_at: string
}

export interface Client {
    id: number
    name: string
    company_name: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    country: string
    postal_code: string
    category: ClientCategory | null
    status: 'active' | 'inactive'
    created_at: string
    updated_at: string
}

export interface LeadSource {
    id: number
    name: string
    color: string
    created_at: string
    updated_at: string
}

export interface LeadPipeline {
    id: number
    name: string
    description: string
    is_default: boolean
    created_at: string
    updated_at: string
}

export interface LeadStage {
    id: number
    name: string
    color: string
    order: number
    pipeline: LeadPipeline
    created_at: string
    updated_at: string
}

export interface Lead {
    id: number
    title: string
    description: string
    client: Client | null
    source: LeadSource | null
    stage: LeadStage | null
    value: number
    probability: number
    expected_close_date: string | null
    status: 'open' | 'qualified' | 'converted' | 'lost'
    created_at: string
    updated_at: string
}

export interface Deal {
    id: number
    title: string
    description: string
    client: Client
    value: number
    probability: number
    expected_close_date: string | null
    actual_close_date: string | null
    status: 'open' | 'won' | 'lost'
    created_at: string
    updated_at: string
}

export interface DashboardUser {
    id: string
    name: string
    email: string
}

export interface DashboardOrganization {
    id: string
    name: string
}

export interface DashboardTasks {
    work_orders_assigned: number
    work_orders_open: number
    work_orders_in_progress: number
    work_orders_due_today: number
    work_orders_overdue: number
}

export interface DashboardTickets {
    tickets_assigned: number
    tickets_open: number
}

export interface DashboardNotifications {
    unread_count: number
    recent: any[] // Replace 'any' with specific notification type if available
}

export interface DashboardAttendance {
    checked_in_today: boolean
    check_in_time: string | null
    check_out_time: string | null
}

export interface DynamicDashboardResponse {
    role: string
    user: DashboardUser
    organization: DashboardOrganization
    my_tasks: DashboardTasks
    my_tickets: DashboardTickets
    notifications: DashboardNotifications
    attendance: DashboardAttendance
    work_orders: any[] // Replace 'any' with specific work order type if available
    tickets: any[] // Replace 'any' with specific ticket type if available
}
