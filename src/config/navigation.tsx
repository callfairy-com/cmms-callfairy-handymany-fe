import {
  LayoutDashboard,
  Users,
  Briefcase,
  TrendingUp,
  ClipboardList,
  CheckSquare,
  FileText,
  Wrench,
  Package,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  UserCircle,
  Bell,
  HelpCircle,
  Shield,
  CreditCard,
  Layers,
  Target,
  Activity,
  FolderKanban,
  Ticket,
  Box,
  Boxes,
  Gauge,
  FileSpreadsheet,
  PieChart,
  TrendingUpIcon,
  UserCog,
  Building,
  Wallet,
  Receipt,
  UserCheck,
  ClipboardCheck,
} from 'lucide-react';
import type { Role, Permission } from '@/types/rbac';
import type { LucideIcon } from 'lucide-react';

/**
 * Navigation Item Type Definition
 */
export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  section: NavSection;
  requiredRoles?: Role[];
  requiredPermissions?: Permission[];
  badge?: string | number | (() => number | string | null);
  children?: NavItem[];
  description?: string;
  /** Keyboard shortcut (e.g., 'g d' for go to dashboard) */
  shortcut?: string;
  /** Whether this item is expanded (for nested navigation) */
  defaultExpanded?: boolean;
}

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  keys: string;
  label: string;
  action: () => void;
  category: 'navigation' | 'actions' | 'global';
}

/**
 * Navigation Section Type
 */
export type NavSection =
  | 'home'
  | 'work'
  | 'assets'
  | 'locations'
  | 'crm'
  | 'reports'
  | 'people'
  | 'admin'
  | 'personal';

/**
 * Section Metadata
 */
export interface NavSectionMeta {
  id: NavSection;
  label: string;
  order: number;
  roles: Role[];
}

/**
 * Navigation Sections Configuration
 */
export const NAV_SECTIONS: NavSectionMeta[] = [
  {
    id: 'home',
    label: 'Home',
    order: 1,
    roles: ['superadmin', 'orgadmin', 'manager', 'staff_employee', 'viewer'],
  },
  {
    id: 'work',
    label: 'Work Management',
    order: 2,
    roles: ['superadmin', 'orgadmin', 'manager', 'staff_employee'],
  },
  {
    id: 'assets',
    label: 'Assets & Inventory',
    order: 3,
    roles: ['superadmin', 'orgadmin', 'manager', 'staff_employee'],
  },
  {
    id: 'locations',
    label: 'Locations & Sites',
    order: 4,
    roles: ['superadmin', 'orgadmin', 'manager', 'staff_employee'],
  },
  {
    id: 'crm',
    label: 'Sales & Customers',
    order: 5,
    roles: ['superadmin', 'orgadmin', 'manager'],
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    order: 6,
    roles: ['superadmin', 'orgadmin', 'manager', 'viewer'],
  },
  {
    id: 'people',
    label: 'People & HR',
    order: 7,
    roles: ['superadmin', 'orgadmin', 'manager', 'staff_employee'],
  },
  {
    id: 'admin',
    label: 'Administration',
    order: 8,
    roles: ['superadmin', 'orgadmin', 'manager'],
  },
  {
    id: 'personal',
    label: 'Personal',
    order: 9,
    roles: ['superadmin', 'orgadmin', 'manager', 'staff_employee', 'viewer'],
  },
];

/**
 * Master Navigation Configuration
 * All navigation items across the entire application
 */
export const NAVIGATION_ITEMS: NavItem[] = [
  // ==================== HOME & GLOBAL ====================
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    section: 'home',
    requiredRoles: ['superadmin', 'orgadmin', 'manager', 'staff_employee', 'viewer'],
    description: 'Overview and key metrics',
    shortcut: 'g d',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    href: '/notifications',
    section: 'home',
    requiredRoles: ['superadmin', 'orgadmin', 'manager', 'staff_employee', 'viewer'],
    description: 'View all notifications',
  },

  // ==================== WORK MANAGEMENT ====================
  {
    id: 'work-orders',
    label: 'Work Orders',
    icon: Wrench,
    href: '/work-orders',
    shortcut: 'g w',
    section: 'work',
    requiredRoles: ['superadmin', 'orgadmin', 'manager', 'staff_employee'],
    requiredPermissions: ['can_view_all_work_orders', 'can_view_assigned_work_orders'],
    description: 'Manage work orders',
    children: [
      {
        id: 'my-work-orders',
        label: 'My Work Orders',
        icon: ClipboardList,
        href: '/work-orders',
        section: 'work',
        requiredRoles: ['staff_employee'],
        requiredPermissions: ['can_view_assigned_work_orders'],
        description: 'My assigned work orders',
      },
      {
        id: 'maintenance',
        label: 'Preventive Maintenance',
        icon: Calendar,
        href: '/preventative-maintenance',
        section: 'work',
        requiredRoles: ['superadmin', 'orgadmin', 'manager'],
        requiredPermissions: ['can_create_work_orders'],
        description: 'Maintenance schedules and plans',
      },
    ],
  },
  {
    id: 'tickets',
    label: 'Service Requests',
    icon: Ticket,
    href: '/work-orders',
    shortcut: 'g t',
    section: 'work',
    requiredRoles: ['superadmin', 'orgadmin', 'manager', 'staff_employee', 'viewer'],
    requiredPermissions: ['can_view_all_tickets', 'can_view_own_tickets'],
    description: 'Service requests and tickets',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: CheckSquare,
    href: '/tasks',
    section: 'work',
    requiredRoles: ['superadmin', 'orgadmin', 'manager', 'staff_employee'],
    description: 'Task management',
  },

  // ==================== ASSETS & INVENTORY ====================
  {
    id: 'assets',
    label: 'Assets',
    icon: Package,
    href: '/assets',
    shortcut: 'g a',
    section: 'assets',
    requiredRoles: ['superadmin', 'orgadmin', 'manager', 'staff_employee'],
    requiredPermissions: ['can_add_assets', 'can_view_assigned_assets'],
    description: 'Asset registry and management',
    children: [
      {
        id: 'my-assets',
        label: 'My Assigned Assets',
        icon: Box,
        href: '/assets',
        section: 'assets',
        requiredRoles: ['staff_employee'],
        requiredPermissions: ['can_view_assigned_assets'],
        description: 'Assets assigned to me',
      },
      {
        id: 'asset-categories',
        label: 'Asset Categories',
        icon: Layers,
        href: '/assets',
        section: 'assets',
        requiredRoles: ['superadmin', 'orgadmin', 'manager'],
        requiredPermissions: ['can_categorize_assets'],
        description: 'Manage asset categories',
      },
    ],
  },
  {
    id: 'asset-meters',
    label: 'Asset Meters',
    icon: Gauge,
    href: '/assets',
    section: 'assets',
    requiredRoles: ['superadmin', 'orgadmin', 'manager'],
    description: 'Asset meter readings',
  },
  {
    id: 'asset-parts',
    label: 'Parts & Components',
    icon: Boxes,
    href: '/assets',
    section: 'assets',
    requiredRoles: ['superadmin', 'orgadmin', 'manager'],
    description: 'Asset parts inventory',
  },

  // ==================== LOCATIONS & SITES ====================
  {
    id: 'sites',
    label: 'Sites',
    icon: MapPin,
    href: '/sites',
    shortcut: 'g s',
    section: 'locations',
    requiredRoles: ['superadmin', 'orgadmin', 'manager'],
    requiredPermissions: ['can_view_all_sites', 'can_view_supervised_sites'],
    description: 'Site management',
    children: [
      {
        id: 'my-sites',
        label: 'My Sites',
        icon: MapPin,
        href: '/sites',
        section: 'locations',
        requiredRoles: ['staff_employee'],
        requiredPermissions: ['can_view_assigned_sites'],
        description: 'Sites assigned to me',
      },
      {
        id: 'buildings',
        label: 'Buildings',
        icon: Building2,
        href: '/sites',
        section: 'locations',
        requiredRoles: ['superadmin', 'orgadmin', 'manager'],
        requiredPermissions: ['can_configure_sites'],
        description: 'Building management',
      },
    ],
  },
  {
    id: 'floors-zones',
    label: 'Floors & Zones',
    icon: Layers,
    href: '/sites',
    section: 'locations',
    requiredRoles: ['superadmin', 'orgadmin', 'manager'],
    requiredPermissions: ['can_configure_sites'],
    description: 'Floor and zone management',
  },

  // ==================== SALES & CUSTOMER MANAGEMENT ====================
  {
    id: 'crm-dashboard',
    label: 'Sales Overview',
    icon: TrendingUp,
    href: '/crm/dashboard',
    section: 'crm',
    requiredRoles: ['superadmin', 'orgadmin', 'manager'],
    description: 'Sales pipeline and customer metrics',
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: Users,
    href: '/clients',
    section: 'crm',
    requiredRoles: ['superadmin', 'orgadmin', 'manager'],
    description: 'Client management',
  },
  {
    id: 'leads',
    label: 'Leads',
    icon: Target,
    href: '/leads',
    section: 'crm',
    requiredRoles: ['superadmin', 'orgadmin', 'manager'],
    requiredPermissions: ['can_create_leads', 'can_view_lead_pipeline'],
    description: 'Lead management and pipeline',
  },
  {
    id: 'deals',
    label: 'Deals',
    icon: Briefcase,
    href: '/deals',
    section: 'crm',
    requiredRoles: ['superadmin', 'orgadmin', 'manager'],
    description: 'Deal management',
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: FolderKanban,
    href: '/projects',
    section: 'crm',
    requiredRoles: ['superadmin', 'orgadmin', 'manager'],
    description: 'Project management',
  },

  // ==================== REPORTS & ANALYTICS ====================
  {
    id: 'reports',
    label: 'Reports',
    icon: FileText,
    href: '/reports',
    shortcut: 'g r',
    section: 'reports',
    requiredRoles: ['superadmin', 'orgadmin', 'manager', 'viewer'],
    requiredPermissions: ['can_generate_custom_reports'],
    description: 'Generate and view reports',
  },
  {
    id: 'dashboards',
    label: 'Dashboards',
    icon: BarChart3,
    href: '/reports',
    section: 'reports',
    requiredRoles: ['superadmin', 'orgadmin', 'manager'],
    requiredPermissions: ['can_view_financial_dashboards', 'can_view_performance_metrics'],
    description: 'Custom dashboards',
  },
  {
    id: 'kpis',
    label: 'KPIs',
    icon: TrendingUpIcon,
    href: '/reports',
    section: 'reports',
    requiredRoles: ['superadmin', 'orgadmin', 'manager'],
    description: 'Key performance indicators',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: PieChart,
    href: '/reports',
    section: 'reports',
    requiredRoles: ['superadmin', 'orgadmin', 'manager'],
    requiredPermissions: ['can_analyze_resource_utilization'],
    description: 'Advanced analytics',
  },
  {
    id: 'financial-reports',
    label: 'Financial Reports',
    icon: DollarSign,
    href: '/reports/financial',
    section: 'reports',
    requiredRoles: ['superadmin', 'orgadmin'],
    requiredPermissions: ['can_view_financial_dashboards', 'can_view_revenue_reports'],
    description: 'Financial reporting',
  },

  // ==================== PEOPLE & HR ====================
  {
    id: 'team-attendance',
    label: 'Team Attendance',
    icon: UserCheck,
    href: '/attendance',
    shortcut: 'g h',
    section: 'people',
    requiredRoles: ['superadmin', 'orgadmin', 'manager'],
    requiredPermissions: ['can_view_all_attendance', 'can_manage_team_attendance'],
    description: 'Team attendance management',
  },
  {
    id: 'my-attendance',
    label: 'My Attendance',
    icon: ClipboardCheck,
    href: '/attendance',
    section: 'people',
    requiredRoles: ['staff_employee'],
    requiredPermissions: ['can_view_own_attendance'],
    description: 'My attendance records',
  },
  {
    id: 'time-off',
    label: 'Time Off Requests',
    icon: Calendar,
    href: '/attendance',
    section: 'people',
    requiredRoles: ['superadmin', 'orgadmin', 'manager', 'staff_employee'],
    requiredPermissions: ['can_approve_time_off_requests', 'can_submit_time_off_requests'],
    description: 'Time off management',
  },
  {
    id: 'payroll',
    label: 'Payroll',
    icon: DollarSign,
    href: '/attendance',
    section: 'people',
    requiredRoles: ['superadmin', 'orgadmin'],
    requiredPermissions: ['can_manage_payroll'],
    description: 'Payroll management',
  },
  {
    id: 'my-earnings',
    label: 'My Earnings',
    icon: Wallet,
    href: '/attendance',
    section: 'people',
    requiredRoles: ['staff_employee', 'manager'],
    requiredPermissions: ['can_view_own_payment_history'],
    description: 'My earnings and payslips',
  },

  // ==================== ADMINISTRATION ====================
  {
    id: 'organization',
    label: 'Organization',
    icon: Building,
    href: '/settings/organization',
    section: 'admin',
    requiredRoles: ['superadmin', 'orgadmin'],
    requiredPermissions: ['can_manage_organization'],
    description: 'Organization settings',
  },
  {
    id: 'users',
    label: 'Users & Roles',
    icon: UserCog,
    href: '/users',
    shortcut: 'g u',
    section: 'admin',
    requiredRoles: ['superadmin', 'orgadmin', 'manager'],
    requiredPermissions: ['can_manage_users'],
    description: 'User management',
  },
  {
    id: 'billing',
    label: 'Billing & Subscription',
    icon: CreditCard,
    href: '/settings/billing',
    section: 'admin',
    requiredRoles: ['superadmin', 'orgadmin'],
    requiredPermissions: ['can_manage_billing', 'can_view_subscription_plan'],
    description: 'Billing and subscription',
  },
  {
    id: 'tenant-management',
    label: 'Tenant Management',
    icon: Shield,
    href: '/admin/tenants',
    section: 'admin',
    requiredRoles: ['superadmin'],
    requiredPermissions: ['can_create_tenants'],
    description: 'Platform tenant management',
  },
  {
    id: 'system-settings',
    label: 'System Settings',
    icon: Settings,
    href: '/admin/system',
    section: 'admin',
    requiredRoles: ['superadmin'],
    requiredPermissions: ['can_configure_system_settings'],
    description: 'System-wide settings',
  },
  {
    id: 'audit-logs',
    label: 'Audit Logs',
    icon: FileSpreadsheet,
    href: '/admin/audit-logs',
    section: 'admin',
    requiredRoles: ['superadmin'],
    requiredPermissions: ['can_view_audit_logs'],
    description: 'System audit logs',
  },

  // ==================== PERSONAL ====================
  {
    id: 'profile',
    label: 'My Profile',
    icon: UserCircle,
    href: '/profile',
    section: 'personal',
    requiredRoles: ['superadmin', 'orgadmin', 'manager', 'staff_employee', 'viewer'],
    description: 'Personal profile settings',
  },
  {
    id: 'my-work',
    label: 'My Work',
    icon: Activity,
    href: '/my-work',
    section: 'personal',
    requiredRoles: ['staff_employee', 'manager'],
    description: 'My work overview',
  },
  {
    id: 'my-invoices',
    label: 'My Invoices',
    icon: Receipt,
    href: '/my-invoices',
    section: 'personal',
    requiredRoles: ['viewer'],
    requiredPermissions: ['can_view_own_invoices'],
    description: 'View my invoices',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings',
    section: 'personal',
    requiredRoles: ['superadmin', 'orgadmin', 'manager', 'staff_employee', 'viewer'],
    description: 'Personal settings',
  },
  {
    id: 'help',
    label: 'Help & Support',
    icon: HelpCircle,
    href: '/help',
    section: 'personal',
    requiredRoles: ['superadmin', 'orgadmin', 'manager', 'staff_employee', 'viewer'],
    description: 'Help center and support',
  },
];

/**
 * Helper function to filter navigation items by role and permissions
 */
export function filterNavigationByRole(
  items: NavItem[],
  userRole: Role | null,
  hasPermission: (permission: Permission) => boolean
): NavItem[] {
  if (!userRole) return [];

  return items.filter((item) => {
    // Check role requirement
    if (item.requiredRoles && !item.requiredRoles.includes(userRole)) {
      return false;
    }

    // Check permission requirement (OR logic - user needs at least one)
    if (item.requiredPermissions && item.requiredPermissions.length > 0) {
      const hasAnyPermission = item.requiredPermissions.some((permission) =>
        hasPermission(permission)
      );
      if (!hasAnyPermission) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Helper function to group navigation items by section
 */
export function groupNavigationBySection(
  items: NavItem[]
): Record<NavSection, NavItem[]> {
  const grouped: Record<string, NavItem[]> = {};

  items.forEach((item) => {
    if (!grouped[item.section]) {
      grouped[item.section] = [];
    }
    grouped[item.section].push(item);
  });

  return grouped as Record<NavSection, NavItem[]>;
}

/**
 * Helper function to get visible sections for a role
 */
export function getVisibleSections(userRole: Role | null): NavSectionMeta[] {
  if (!userRole) return [];

  return NAV_SECTIONS.filter((section) =>
    section.roles.includes(userRole)
  ).sort((a, b) => a.order - b.order);
}

/**
 * Get navigation items for a specific role with sections
 */
export function getNavigationForRole(
  userRole: Role | null,
  hasPermission: (permission: Permission) => boolean
): { sections: NavSectionMeta[]; items: Record<NavSection, NavItem[]> } {
  const filteredItems = filterNavigationByRole(NAVIGATION_ITEMS, userRole, hasPermission);
  const groupedItems = groupNavigationBySection(filteredItems);
  const visibleSections = getVisibleSections(userRole);

  return {
    sections: visibleSections,
    items: groupedItems,
  };
}

/**
 * Filter navigation items including nested children
 */
export function filterNavigationWithChildren(
  items: NavItem[],
  userRole: Role | null,
  hasPermission: (permission: Permission) => boolean
): NavItem[] {
  if (!userRole) return [];

  return items
    .filter((item) => {
      // Check role requirement
      if (item.requiredRoles && !item.requiredRoles.includes(userRole)) {
        return false;
      }

      // Check permission requirement (OR logic)
      if (item.requiredPermissions && item.requiredPermissions.length > 0) {
        const hasAnyPermission = item.requiredPermissions.some((permission) =>
          hasPermission(permission)
        );
        if (!hasAnyPermission) {
          return false;
        }
      }

      return true;
    })
    .map((item) => {
      // Filter children if they exist
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterNavigationWithChildren(
          item.children,
          userRole,
          hasPermission
        );
        return { ...item, children: filteredChildren };
      }
      return item;
    });
}

/**
 * Get all keyboard shortcuts from navigation items
 */
export function getNavigationShortcuts(
  items: NavItem[],
  userRole: Role | null,
  hasPermission: (permission: Permission) => boolean
): { keys: string; label: string; href: string }[] {
  const filteredItems = filterNavigationWithChildren(items, userRole, hasPermission);
  const shortcuts: { keys: string; label: string; href: string }[] = [];

  function extractShortcuts(navItems: NavItem[]) {
    navItems.forEach((item) => {
      if (item.shortcut) {
        shortcuts.push({
          keys: item.shortcut,
          label: item.label,
          href: item.href,
        });
      }
      if (item.children) {
        extractShortcuts(item.children);
      }
    });
  }

  extractShortcuts(filteredItems);
  return shortcuts;
}

/**
 * Default keyboard shortcuts for the application
 */
export const DEFAULT_SHORTCUTS = [
  { keys: 'g d', label: 'Go to Dashboard', category: 'navigation' as const },
  { keys: 'g w', label: 'Go to Work Orders', category: 'navigation' as const },
  { keys: 'g a', label: 'Go to Assets', category: 'navigation' as const },
  { keys: 'g s', label: 'Go to Sites', category: 'navigation' as const },
  { keys: 'g r', label: 'Go to Reports', category: 'navigation' as const },
  { keys: 'g u', label: 'Go to Users', category: 'navigation' as const },
  { keys: 'g h', label: 'Go to Attendance', category: 'navigation' as const },
  { keys: '?', label: 'Show keyboard shortcuts', category: 'global' as const },
  { keys: 'Escape', label: 'Close dialog/modal', category: 'global' as const },
  { keys: '/', label: 'Focus search', category: 'global' as const },
];

/**
 * Role-specific navigation visibility matrix
 * Shows which sections and key items are visible for each role
 */
export const ROLE_NAVIGATION_MATRIX: Record<Role, {
  sections: NavSection[];
  primaryItems: string[];
  description: string;
}> = {
  superadmin: {
    sections: ['home', 'work', 'assets', 'locations', 'crm', 'reports', 'people', 'admin', 'personal'],
    primaryItems: ['dashboard', 'work-orders', 'assets', 'sites', 'reports', 'users', 'settings'],
    description: 'Full platform access with tenant management',
  },
  orgadmin: {
    sections: ['home', 'work', 'assets', 'locations', 'crm', 'reports', 'people', 'admin', 'personal'],
    primaryItems: ['dashboard', 'work-orders', 'assets', 'sites', 'reports', 'users', 'settings'],
    description: 'Full organization access with billing and user management',
  },
  manager: {
    sections: ['home', 'work', 'assets', 'locations', 'crm', 'reports', 'people', 'admin', 'personal'],
    primaryItems: ['dashboard', 'work-orders', 'assets', 'sites', 'reports', 'users', 'settings'],
    description: 'Team management and operational coordination',
  },
  staff_employee: {
    sections: ['home', 'work', 'assets', 'locations', 'people', 'personal'],
    primaryItems: ['dashboard', 'work-orders', 'assets', 'sites', 'attendance', 'settings'],
    description: 'Field worker with assigned work and assets',
  },
  viewer: {
    sections: ['home', 'work', 'reports', 'personal'],
    primaryItems: ['dashboard', 'work-orders', 'reports', 'settings'],
    description: 'Client/stakeholder with view-only access',
  },
};
