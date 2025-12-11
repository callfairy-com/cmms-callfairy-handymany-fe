/**
 * Comprehensive Role-Based Access Control (RBAC) Type Definitions
 * Maps roles to granular permissions as per RBAC specifications.
 */

// ==================== Role Definitions ====================
export type Role = 'superadmin' | 'orgadmin' | 'manager' | 'viewer' | 'staff_employee';

// Role constants for easier usage and autocomplete
export const Roles = {
    SUPERADMIN: 'superadmin' as Role,
    ORGADMIN: 'orgadmin' as Role,
    MANAGER: 'manager' as Role,
    VIEWER: 'viewer' as Role,
    STAFF_EMPLOYEE: 'staff_employee' as Role,
} as const;

// ==================== Permission Types ====================
export type Permission =
    // Tenant Management (Platform Owner only)
    | 'can_create_tenants'
    | 'can_manage_tenant_admins'
    | 'can_configure_tenant_permissions'
    | 'can_suspend_tenants'
    | 'can_terminate_tenants'
    | 'can_view_all_tenant_billing'
    | 'can_configure_billing_plans'
    | 'can_process_refunds'
    | 'can_generate_revenue_reports'
    | 'can_manage_payment_methods'
    | 'can_access_all_tenant_data'
    | 'can_configure_system_settings'
    | 'can_view_audit_logs'
    | 'can_manage_security_policies'

    // Organization & User Management
    | 'can_manage_organization'
    | 'can_manage_users'
    | 'can_create_managers'
    | 'can_create_staff'
    | 'can_create_viewers'
    | 'can_deactivate_users'
    | 'can_reset_user_credentials'
    | 'can_configure_roles'
    | 'can_define_departments'
    | 'can_establish_reporting_hierarchy'

    // Lead Management
    | 'can_create_leads'
    | 'can_assign_leads'
    | 'can_convert_leads'
    | 'can_view_lead_pipeline'

    // Work Order Management
    | 'can_create_work_orders'
    | 'can_assign_work_orders'
    | 'can_reassign_work_orders'
    | 'can_view_all_work_orders'
    | 'can_view_team_work_orders'
    | 'can_view_assigned_work_orders'
    | 'can_set_work_order_priorities'
    | 'can_approve_work_order_completion'
    | 'can_accept_work_orders'
    | 'can_reject_work_orders'
    | 'can_request_work_order_clarification'
    | 'can_view_work_order_priorities'
    | 'can_update_work_order_status'
    | 'can_track_work_order_completion'
    | 'can_view_work_order_milestones'
    | 'can_view_work_order_history'
    | 'can_view_work_order_checklists'
    | 'can_view_checklist_completion'
    | 'can_view_work_proof_images'
    | 'can_view_work_proof_videos'
    | 'can_view_completion_deadlines'
    | 'can_propose_alternative_deadlines'
    | 'can_receive_deadline_notifications'

    // Ticket Management
    | 'can_raise_tickets'
    | 'can_provide_ticket_descriptions'
    | 'can_attach_ticket_files'
    | 'can_set_ticket_priority'
    | 'can_view_own_tickets'
    | 'can_track_ticket_status'
    | 'can_view_ticket_responses'
    | 'can_receive_ticket_notifications'
    | 'can_view_all_tickets'
    | 'can_assign_tickets'
    | 'can_escalate_tickets'
    | 'can_close_tickets'
    | 'can_prioritize_tickets'
    | 'can_provide_ticket_updates'
    | 'can_close_resolved_tickets'
    | 'can_report_work_order_issues'
    | 'can_request_additional_resources'
    | 'can_escalate_safety_concerns'

    // Work Execution & Progress
    | 'can_mark_checklist_items_complete'
    | 'can_record_task_time'
    | 'can_log_materials_used'
    | 'can_upload_work_photos'
    | 'can_upload_work_videos'
    | 'can_provide_progress_reports'
    | 'can_document_work_issues'
    | 'can_view_work_progress'
    | 'can_view_activity_logs'

    // Checklist Management
    | 'can_create_checklists'
    | 'can_create_work_order_checklists'
    | 'can_define_checklist_items'
    | 'can_monitor_checklist_completion'
    | 'can_define_inspection_points'
    | 'can_assign_checklists'
    | 'can_view_assigned_checklists'
    | 'can_update_checklist_progress'
    | 'can_mark_checklist_complete'
    | 'can_add_checklist_notes'
    | 'can_request_checklist_assistance'
    | 'can_verify_work_quality'
    | 'can_request_corrections'

    // Asset Management
    | 'can_add_assets'
    | 'can_edit_assets'
    | 'can_delete_assets'
    | 'can_upload_asset_documentation'
    | 'can_track_asset_maintenance'
    | 'can_categorize_assets'
    | 'can_assign_assets_to_staff'
    | 'can_track_asset_utilization'
    | 'can_generate_asset_reports'
    | 'can_view_assigned_assets'
    | 'can_report_asset_condition'
    | 'can_document_asset_usage'
    | 'can_flag_asset_issues'
    | 'can_track_asset_condition'
    | 'can_request_asset_maintenance'

    // Deadline & Client Communication
    | 'can_set_completion_deadlines'
    | 'can_negotiate_deadline_extensions'
    | 'can_monitor_timeline_adherence'
    | 'can_report_work_progress'
    | 'can_provide_status_updates'
    | 'can_escalate_issues'

    // Financial Management - Invoicing
    | 'can_create_invoices'
    | 'can_send_invoices'
    | 'can_track_invoice_status'
    | 'can_apply_invoice_discounts'
    | 'can_view_own_invoices'
    | 'can_download_invoices'
    | 'can_view_payment_history'
    | 'can_make_payments'
    | 'can_view_payment_methods'
    | 'can_request_payment_plans'

    // Financial Management - Payments & Payroll
    | 'can_process_client_payments'
    | 'can_manage_payroll'
    | 'can_pay_staff'
    | 'can_pay_managers'
    | 'can_track_employee_payments'
    | 'can_view_all_payment_transactions'
    | 'can_view_own_payment_history'
    | 'can_track_own_earnings'
    | 'can_view_overtime_pay'
    | 'can_view_payment_schedules'
    | 'can_download_own_payslips'
    | 'can_process_staff_payments'
    | 'can_approve_overtime'
    | 'can_approve_bonuses'
    | 'can_calculate_staff_wages'
    | 'can_generate_payment_records'

    // Financial Management - Analytics
    | 'can_view_financial_dashboards'
    | 'can_view_revenue_reports'
    | 'can_view_profit_margins'
    | 'can_track_accounts_receivable'
    | 'can_track_accounts_payable'
    | 'can_generate_financial_forecasts'
    | 'can_view_organization_costs'

    // Subscription & Billing
    | 'can_view_subscription_plan'
    | 'can_manage_subscription'
    | 'can_process_subscription_payments'
    | 'can_view_billing_history'
    | 'can_upgrade_subscription'
    | 'can_manage_billing'

    // Attendance & HR Management
    | 'can_view_all_attendance'
    | 'can_manage_all_attendance'
    | 'can_manage_team_attendance'
    | 'can_view_own_attendance'
    | 'can_approve_time_off_requests'
    | 'can_approve_timesheets'
    | 'can_approve_expenses'
    | 'can_submit_time_off_requests'
    | 'can_track_work_hours'
    | 'can_track_team_work_hours'
    | 'can_track_own_work_hours'
    | 'can_track_overtime'
    | 'can_log_overtime_hours'
    | 'can_generate_attendance_reports'
    | 'can_calculate_wages'
    | 'can_process_overtime_payments'
    | 'can_manage_salary_structures'
    | 'can_generate_payslips'
    | 'can_view_leave_balance'
    | 'can_monitor_on_site_availability'
    | 'can_record_staff_attendance'

    // Performance Management
    | 'can_view_performance_metrics'
    | 'can_track_completion_rates'
    | 'can_monitor_customer_satisfaction'
    | 'can_analyze_resource_utilization'
    | 'can_track_staff_productivity'
    | 'can_monitor_work_quality'
    | 'can_provide_performance_feedback'

    // Reporting & Analytics
    | 'can_generate_custom_reports'
    | 'can_export_data'
    | 'can_schedule_automated_reports'
    | 'can_view_team_reports'
    | 'can_generate_team_reports'

    // Site Management
    | 'can_create_sites'
    | 'can_configure_sites'
    | 'can_view_all_sites'
    | 'can_assign_site_supervisors'
    | 'can_view_all_site_personnel'
    | 'can_manage_site_resources'
    | 'can_view_supervised_sites'
    | 'can_view_site_personnel'
    | 'can_coordinate_site_work'
    | 'can_view_own_project_sites'
    | 'can_view_assigned_site_personnel'
    | 'can_track_site_availability'
    | 'can_view_assigned_sites'
    | 'can_check_in_to_sites'
    | 'can_check_out_from_sites'

    // Communication
    | 'can_receive_progress_notifications'
    | 'can_view_project_comments'
    | 'can_view_communication_history'

    // Global Permissions
    | 'can_manage_all_entities'
    | 'can_view_all_entities';

// Role permissions type
export type RolePermissions = Partial<Record<Permission, boolean>>;

// ==================== Permission Matrix ====================
export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
    // Platform Owner (Super Administrator) - System-wide control
    superadmin: {
        // Tenant Management
        can_create_tenants: true,
        can_manage_tenant_admins: true,
        can_configure_tenant_permissions: true,
        can_suspend_tenants: true,
        can_terminate_tenants: true,
        can_view_all_tenant_billing: true,
        can_configure_billing_plans: true,
        can_process_refunds: true,
        can_generate_revenue_reports: true,
        can_manage_payment_methods: true,
        can_access_all_tenant_data: true,
        can_configure_system_settings: true,
        can_view_audit_logs: true,
        can_manage_security_policies: true,

        // Organization Management (inherits all orgadmin permissions)
        can_manage_organization: true,
        can_manage_users: true,
        can_manage_all_entities: true,
        can_view_all_entities: true,
        can_export_data: true,
        can_manage_billing: true,

        // Work Management
        can_create_leads: true,
        can_assign_leads: true,
        can_convert_leads: true,
        can_view_lead_pipeline: true,
        can_create_work_orders: true,
        can_assign_work_orders: true,
        can_view_all_work_orders: true,
        can_set_work_order_priorities: true,
        can_approve_work_order_completion: true,
        can_view_all_tickets: true,
        can_assign_tickets: true,
        can_escalate_tickets: true,
        can_close_tickets: true,
        can_view_work_progress: true,
        can_view_activity_logs: true,

        // Asset Management
        can_add_assets: true,
        can_edit_assets: true,
        can_delete_assets: true,
        can_upload_asset_documentation: true,
        can_track_asset_maintenance: true,
        can_categorize_assets: true,
        can_assign_assets_to_staff: true,
        can_track_asset_utilization: true,
        can_generate_asset_reports: true,

        // Financial Management
        can_create_invoices: true,
        can_send_invoices: true,
        can_track_invoice_status: true,
        can_apply_invoice_discounts: true,
        can_process_client_payments: true,
        can_manage_payroll: true,
        can_pay_staff: true,
        can_pay_managers: true,
        can_track_employee_payments: true,
        can_view_all_payment_transactions: true,
        can_view_financial_dashboards: true,
        can_view_revenue_reports: true,
        can_view_profit_margins: true,
        can_track_accounts_receivable: true,
        can_track_accounts_payable: true,
        can_generate_financial_forecasts: true,
        can_view_organization_costs: true,
        can_view_subscription_plan: true,
        can_manage_subscription: true,
        can_process_subscription_payments: true,
        can_view_billing_history: true,
        can_upgrade_subscription: true,

        // Attendance & HR Management
        can_view_all_attendance: true,
        can_manage_all_attendance: true,
        can_approve_time_off_requests: true,
        can_approve_timesheets: true,
        can_approve_expenses: true,
        can_track_work_hours: true,
        can_track_overtime: true,
        can_generate_attendance_reports: true,
        can_calculate_wages: true,
        can_process_overtime_payments: true,
        can_manage_salary_structures: true,
        can_generate_payslips: true,

        // Reporting & Analytics
        can_view_performance_metrics: true,
        can_track_completion_rates: true,
        can_monitor_customer_satisfaction: true,
        can_analyze_resource_utilization: true,
        can_generate_custom_reports: true,
        can_schedule_automated_reports: true,

        // Site Management
        can_create_sites: true,
        can_configure_sites: true,
        can_view_all_sites: true,
        can_assign_site_supervisors: true,
        can_view_all_site_personnel: true,
        can_manage_site_resources: true,

        // User Creation
        can_create_managers: true,
        can_create_staff: true,
        can_create_viewers: true,
        can_deactivate_users: true,
        can_reset_user_credentials: true,
        can_configure_roles: true,
        can_define_departments: true,
        can_establish_reporting_hierarchy: true,
    },

    // Tenant Admin (Organization Administrator) - Full control within organization
    orgadmin: {
        // Organization & Staff Management
        can_manage_organization: true,
        can_create_managers: true,
        can_create_staff: true,
        can_create_viewers: true,
        can_deactivate_users: true,
        can_reset_user_credentials: true,
        can_configure_roles: true,
        can_define_departments: true,
        can_establish_reporting_hierarchy: true,

        // Work Management
        can_create_leads: true,
        can_assign_leads: true,
        can_convert_leads: true,
        can_view_lead_pipeline: true,
        can_create_work_orders: true,
        can_assign_work_orders: true,
        can_view_all_work_orders: true,
        can_set_work_order_priorities: true,
        can_approve_work_order_completion: true,
        can_view_all_tickets: true,
        can_assign_tickets: true,
        can_escalate_tickets: true,
        can_close_tickets: true,
        can_view_work_progress: true,
        can_view_activity_logs: true,

        // Asset Management
        can_add_assets: true,
        can_edit_assets: true,
        can_delete_assets: true,
        can_upload_asset_documentation: true,
        can_track_asset_maintenance: true,
        can_categorize_assets: true,
        can_assign_assets_to_staff: true,
        can_track_asset_utilization: true,
        can_generate_asset_reports: true,

        // Financial Management
        can_create_invoices: true,
        can_send_invoices: true,
        can_track_invoice_status: true,
        can_apply_invoice_discounts: true,
        can_process_client_payments: true,
        can_manage_payroll: true,
        can_pay_staff: true,
        can_pay_managers: true,
        can_track_employee_payments: true,
        can_view_all_payment_transactions: true,
        can_view_financial_dashboards: true,
        can_view_revenue_reports: true,
        can_view_profit_margins: true,
        can_track_accounts_receivable: true,
        can_track_accounts_payable: true,
        can_generate_financial_forecasts: true,
        can_view_organization_costs: true,
        can_view_subscription_plan: true,
        can_manage_subscription: true,
        can_process_subscription_payments: true,
        can_view_billing_history: true,
        can_upgrade_subscription: true,

        // Attendance & HR Management
        can_view_all_attendance: true,
        can_manage_all_attendance: true,
        can_approve_time_off_requests: true,
        can_approve_timesheets: true,
        can_approve_expenses: true,
        can_track_work_hours: true,
        can_track_overtime: true,
        can_generate_attendance_reports: true,
        can_calculate_wages: true,
        can_process_overtime_payments: true,
        can_manage_salary_structures: true,
        can_generate_payslips: true,

        // Reporting & Analytics
        can_view_performance_metrics: true,
        can_track_completion_rates: true,
        can_monitor_customer_satisfaction: true,
        can_analyze_resource_utilization: true,
        can_generate_custom_reports: true,
        can_export_data: true,
        can_schedule_automated_reports: true,

        // Site Management
        can_create_sites: true,
        can_configure_sites: true,
        can_view_all_sites: true,
        can_assign_site_supervisors: true,
        can_view_all_site_personnel: true,
        can_manage_site_resources: true,

        // General
        can_manage_users: true,
        can_manage_all_entities: true,
        can_view_all_entities: true,
        can_manage_billing: true,
    },

    // Manager (Supervisor) - Operational coordination
    manager: {
        // Work Order & Ticket Management
        can_create_work_orders: true,
        can_assign_work_orders: true,
        can_reassign_work_orders: true,
        // Managers can view team work orders and also have general work-order view access
        can_view_team_work_orders: true,
        can_view_all_work_orders: true,
        can_create_work_order_checklists: true,
        can_define_checklist_items: true,
        can_monitor_checklist_completion: true,
        can_assign_tickets: true,
        can_view_all_tickets: true,
        can_prioritize_tickets: true,
        can_provide_ticket_updates: true,
        can_close_resolved_tickets: true,

        // Deadline & Client Communication
        can_set_completion_deadlines: true,
        can_negotiate_deadline_extensions: true,
        can_monitor_timeline_adherence: true,
        can_report_work_progress: true,
        can_provide_status_updates: true,
        can_escalate_issues: true,

        // Asset Management
        can_add_assets: true,
        can_edit_assets: true,
        can_upload_asset_documentation: true,
        can_assign_assets_to_staff: true,
        can_track_asset_condition: true,
        can_request_asset_maintenance: true,

        // Staff Management
        can_process_staff_payments: true,
        can_approve_overtime: true,
        can_approve_bonuses: true,
        can_calculate_staff_wages: true,
        can_generate_payment_records: true,
        can_record_staff_attendance: true,
        can_manage_team_attendance: true,
        can_approve_time_off_requests: true,
        can_approve_timesheets: true,
        can_approve_expenses: true,
        can_track_team_work_hours: true,
        can_monitor_on_site_availability: true,
        can_track_staff_productivity: true,
        can_monitor_work_quality: true,
        can_provide_performance_feedback: true,

        // Checklist & Quality Control
        can_create_checklists: true,
        can_define_inspection_points: true,
        can_assign_checklists: true,
        can_view_checklist_completion: true,
        can_verify_work_quality: true,
        can_request_corrections: true,

        // Site Management
        can_view_supervised_sites: true,
        can_view_site_personnel: true,
        can_coordinate_site_work: true,

        // Reporting
        can_view_team_reports: true,
        can_generate_team_reports: true,
        can_export_data: true,

        // General
        can_manage_all_entities: true,
        can_view_all_entities: true,
        can_manage_users: true,
    },

    // Viewer (Client) - External client/stakeholder
    viewer: {
        // Ticket Management
        can_raise_tickets: true,
        can_provide_ticket_descriptions: true,
        can_attach_ticket_files: true,
        can_set_ticket_priority: true,
        can_view_own_tickets: true,
        can_track_ticket_status: true,
        can_view_ticket_responses: true,
        can_receive_ticket_notifications: true,

        // Work Order Visibility
        can_view_assigned_work_orders: true,
        can_track_work_order_completion: true,
        can_view_work_order_milestones: true,
        can_view_work_order_history: true,
        can_view_work_order_checklists: true,
        can_view_checklist_completion: true,
        can_view_work_proof_images: true,
        can_view_work_proof_videos: true,
        can_view_completion_deadlines: true,
        can_propose_alternative_deadlines: true,
        can_receive_deadline_notifications: true,

        // Financial Management
        can_view_own_invoices: true,
        can_track_invoice_status: true,
        can_download_invoices: true,
        can_view_payment_history: true,
        can_make_payments: true,
        can_view_payment_methods: true,
        can_request_payment_plans: true,

        // Communication
        can_receive_progress_notifications: true,
        can_view_project_comments: true,
        can_view_communication_history: true,

        // Site Visibility
        can_view_own_project_sites: true,
        can_view_assigned_site_personnel: true,

        // General
        can_view_all_entities: false,
        can_manage_all_entities: false,
    },

    // Staff Employee (Field Worker) - Executes work orders
    staff_employee: {
        // Work Order Management
        can_view_assigned_work_orders: true,
        can_accept_work_orders: true,
        can_reject_work_orders: true,
        can_request_work_order_clarification: true,
        can_view_work_order_priorities: true,
        can_update_work_order_status: true,
        can_mark_checklist_items_complete: true,
        can_record_task_time: true,
        can_log_materials_used: true,
        can_upload_work_photos: true,
        can_upload_work_videos: true,
        can_provide_progress_reports: true,
        can_document_work_issues: true,

        // Checklist Management
        can_view_assigned_checklists: true,
        can_update_checklist_progress: true,
        can_mark_checklist_complete: true,
        can_add_checklist_notes: true,
        can_request_checklist_assistance: true,

        // Asset Interaction
        can_view_assigned_assets: true,
        can_report_asset_condition: true,
        can_document_asset_usage: true,
        can_flag_asset_issues: true,

        // Ticket Management
        can_raise_tickets: true,
        can_report_work_order_issues: true,
        can_request_additional_resources: true,
        can_escalate_safety_concerns: true,

        // Financial & Attendance
        can_view_own_payment_history: true,
        can_track_own_earnings: true,
        can_view_overtime_pay: true,
        can_view_payment_schedules: true,
        can_download_own_payslips: true,
        can_view_own_attendance: true,
        can_track_own_work_hours: true,
        can_submit_time_off_requests: true,
        can_view_leave_balance: true,
        can_log_overtime_hours: true,
        can_track_site_availability: true,

        // Site Access
        can_view_assigned_sites: true,
        can_check_in_to_sites: true,
        can_check_out_from_sites: true,

        // General
        can_view_all_entities: false,
        can_manage_all_entities: false,
    },
};

// ==================== Permission Categories ====================
export const PERMISSION_CATEGORIES = {
    'Tenant Management': [
        'can_create_tenants',
        'can_manage_tenant_admins',
        'can_configure_tenant_permissions',
        'can_suspend_tenants',
        'can_terminate_tenants',
    ],
    'User Management': [
        'can_manage_users',
        'can_create_managers',
        'can_create_staff',
        'can_create_viewers',
        'can_deactivate_users',
        'can_reset_user_credentials',
        'can_configure_roles',
        'can_define_departments',
        'can_establish_reporting_hierarchy',
    ],
    'Work Order Management': [
        'can_create_work_orders',
        'can_assign_work_orders',
        'can_reassign_work_orders',
        'can_view_all_work_orders',
        'can_view_team_work_orders',
        'can_view_assigned_work_orders',
        'can_accept_work_orders',
        'can_reject_work_orders',
        'can_update_work_order_status',
        'can_set_work_order_priorities',
        'can_approve_work_order_completion',
        'can_track_work_order_completion',
    ],
    'Lead Management': [
        'can_create_leads',
        'can_assign_leads',
        'can_convert_leads',
        'can_view_lead_pipeline',
    ],
    'Asset Management': [
        'can_add_assets',
        'can_edit_assets',
        'can_delete_assets',
        'can_assign_assets_to_staff',
        'can_view_assigned_assets',
        'can_track_asset_utilization',
        'can_upload_asset_documentation',
        'can_track_asset_maintenance',
        'can_categorize_assets',
        'can_generate_asset_reports',
        'can_report_asset_condition',
        'can_flag_asset_issues',
    ],
    'Financial Management': [
        'can_create_invoices',
        'can_send_invoices',
        'can_track_invoice_status',
        'can_view_own_invoices',
        'can_process_client_payments',
        'can_manage_payroll',
        'can_pay_staff',
        'can_pay_managers',
        'can_view_financial_dashboards',
        'can_view_revenue_reports',
        'can_manage_billing',
        'can_view_own_payment_history',
        'can_track_own_earnings',
        'can_view_subscription_plan',
        'can_manage_subscription',
    ],
    'Attendance Management': [
        'can_view_all_attendance',
        'can_manage_all_attendance',
        'can_manage_team_attendance',
        'can_view_own_attendance',
        'can_approve_time_off_requests',
        'can_approve_timesheets',
        'can_approve_expenses',
        'can_submit_time_off_requests',
        'can_track_work_hours',
        'can_track_team_work_hours',
        'can_track_own_work_hours',
        'can_track_overtime',
        'can_log_overtime_hours',
        'can_generate_attendance_reports',
    ],
    'Ticket Management': [
        'can_raise_tickets',
        'can_assign_tickets',
        'can_view_all_tickets',
        'can_view_own_tickets',
        'can_escalate_tickets',
        'can_close_tickets',
        'can_prioritize_tickets',
        'can_provide_ticket_updates',
    ],
    'Site Management': [
        'can_create_sites',
        'can_configure_sites',
        'can_view_all_sites',
        'can_view_supervised_sites',
        'can_view_assigned_sites',
        'can_view_own_project_sites',
        'can_view_site_personnel',
        'can_view_all_site_personnel',
        'can_assign_site_supervisors',
        'can_check_in_to_sites',
        'can_check_out_from_sites',
    ],
    'Checklist Management': [
        'can_create_checklists',
        'can_create_work_order_checklists',
        'can_assign_checklists',
        'can_view_assigned_checklists',
        'can_view_checklist_completion',
        'can_mark_checklist_items_complete',
        'can_mark_checklist_complete',
        'can_update_checklist_progress',
        'can_define_checklist_items',
        'can_monitor_checklist_completion',
    ],
    'Reporting & Analytics': [
        'can_view_performance_metrics',
        'can_generate_custom_reports',
        'can_export_data',
        'can_view_team_reports',
        'can_generate_team_reports',
        'can_track_completion_rates',
        'can_monitor_customer_satisfaction',
        'can_analyze_resource_utilization',
        'can_schedule_automated_reports',
    ],
} as const;

// ==================== Helper Functions ====================

/**
 * Get all permissions for a specific role
 */
export function getRolePermissions(role: Role): RolePermissions {
    return ROLE_PERMISSIONS[role] || {};
}

/**
 * Check if a role has a specific permission
 */
export function hasRolePermission(role: Role, permission: Permission): boolean {
    const rolePerms = ROLE_PERMISSIONS[role];
    return rolePerms?.[permission] === true;
}

/**
 * Get all permission keys in a specific category
 */
export function getPermissionsByCategory(category: string): readonly Permission[] {
    return (PERMISSION_CATEGORIES as Record<string, readonly Permission[]>)[category] || [];
}

/**
 * Get all unique permission keys across all roles
 */
export function getAllPermissions(): Permission[] {
    const allPerms = new Set<Permission>();
    Object.values(ROLE_PERMISSIONS).forEach(rolePerms => {
        Object.keys(rolePerms).forEach(perm => allPerms.add(perm as Permission));
    });
    return Array.from(allPerms).sort();
}

/**
 * Compare permissions between two roles
 */
export function compareRoles(role1: Role, role2: Role): {
    role1Only: Set<Permission>;
    role2Only: Set<Permission>;
    shared: Set<Permission>;
} {
    const perms1 = new Set<Permission>(
        Object.entries(ROLE_PERMISSIONS[role1])
            .filter(([_, v]) => v)
            .map(([k]) => k as Permission)
    );
    const perms2 = new Set<Permission>(
        Object.entries(ROLE_PERMISSIONS[role2])
            .filter(([_, v]) => v)
            .map(([k]) => k as Permission)
    );

    const role1Only = new Set([...perms1].filter(p => !perms2.has(p)));
    const role2Only = new Set([...perms2].filter(p => !perms1.has(p)));
    const shared = new Set([...perms1].filter(p => perms2.has(p)));

    return { role1Only, role2Only, shared };
}

/**
 * Get roles that a user can create/manage based on their role
 */
export function getUserAccessibleRoles(userRole: Role): Role[] {
    const roleHierarchy: Record<Role, Role[]> = {
        superadmin: ['superadmin', 'orgadmin', 'manager', 'viewer', 'staff_employee'],
        orgadmin: ['orgadmin', 'manager', 'viewer', 'staff_employee'],
        manager: [],
        viewer: [],
        staff_employee: [],
    };
    return roleHierarchy[userRole] || [];
}

/**
 * Validate if a role exists in the system
 */
export function validateRole(role: string): role is Role {
    const validRoles: Role[] = ['superadmin', 'orgadmin', 'manager', 'viewer', 'staff_employee'];
    return validRoles.includes(role as Role);
}

/**
 * Get display name for a role
 */
export function getRoleDisplayName(role: Role): string {
    const displayNames: Record<Role, string> = {
        superadmin: 'Super Admin',
        orgadmin: 'Organization Admin',
        manager: 'Manager',
        viewer: 'Viewer',
        staff_employee: 'Staff Employee',
    };
    return displayNames[role] || role;
}

// ==================== JWT & Organization Types ====================

// Organization info from JWT
export interface OrganizationInfo {
    id: string;
    name: string;
    slug: string;
    role: Role;
    role_display?: string;
    joined_at?: string;
}

// User info from JWT
export interface UserInfo {
    user_id: string;
    email: string;
    name: string;
    organizations: OrganizationInfo[];
    organization_id: string | null;
    organization_name: string | null;
    role: Role | null;
}
