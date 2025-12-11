/**
 * Dashboard Types
 * Based on CMMS Dynamic Dashboard API
 */

export interface DashboardUser {
    id: string;
    name: string;
    email: string;
}

export interface DashboardOrganization {
    id: string;
    name: string;
}

export interface WorkOrderStats {
    total: number;
    open: number;
    in_progress: number;
    completed: number;
    overdue: number;
    completed_last_30_days: number;
}

export interface AssetStats {
    total: number;
    operational: number;
    maintenance: number;
    down: number;
}

export interface TicketStats {
    total: number;
    new: number;
    open: number;
    in_progress: number;
    resolved: number;
}

export interface TeamStats {
    total_employees: number;
    departments: number;
}

export interface FinancialStats {
    expenses_last_30_days: number;
    avg_work_order_cost: number;
}

export interface RecentWorkOrder {
    id: string;
    work_order_number: string;
    title: string;
    status: string;
    priority: string;
    created_at: string;
    assigned_to?: {
        id: string;
        name: string;
        email: string;
    };
}

export interface RecentTicket {
    id: string;
    ticket_number: string;
    title: string;
    status: string;
    priority: string;
    created_at: string;
}

export interface DynamicDashboardData {
    role: string;
    user: DashboardUser;
    organization: DashboardOrganization;
    work_orders: WorkOrderStats;
    assets: AssetStats;
    tickets: TicketStats;
    team: TeamStats;
    financials: FinancialStats;
    recent_work_orders: RecentWorkOrder[];
    recent_tickets: RecentTicket[];
}
