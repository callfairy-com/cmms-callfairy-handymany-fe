import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import type { Permission } from '@/types/rbac';

interface PermissionGateProps {
    /** Single permission to check */
    permission?: Permission;
    /** Multiple permissions to check */
    permissions?: Permission[];
    /** Require all permissions (AND logic) or any permission (OR logic). Default: false (OR) */
    requireAll?: boolean;
    /** Content to show if user has permission */
    children: React.ReactNode;
    /** Optional fallback content to show if user doesn't have permission */
    fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 * 
 * @example
 * // Single permission
 * <PermissionGate permission="can_create_work_orders">
 *   <Button>Create Work Order</Button>
 * </PermissionGate>
 * 
 * @example
 * // Multiple permissions with OR logic
 * <PermissionGate permissions={['can_view_all_work_orders', 'can_view_assigned_work_orders']}>
 *   <WorkOrderList />
 * </PermissionGate>
 * 
 * @example
 * // Multiple permissions with AND logic
 * <PermissionGate permissions={['can_create_invoices', 'can_send_invoices']} requireAll>
 *   <InvoiceManager />
 * </PermissionGate>
 * 
 * @example
 * // With fallback
 * <PermissionGate permission="can_view_all_entities" fallback={<AccessDenied />}>
 *   <AdminPanel />
 * </PermissionGate>
 */
export function PermissionGate({
    permission,
    permissions,
    requireAll = false,
    children,
    fallback = null
}: PermissionGateProps) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    let hasAccess = false;

    if (permission) {
        hasAccess = hasPermission(permission);
    } else if (permissions && permissions.length > 0) {
        hasAccess = requireAll
            ? hasAllPermissions(permissions)
            : hasAnyPermission(permissions);
    }

    return hasAccess ? <>{children}</> : <>{fallback}</>;
}
