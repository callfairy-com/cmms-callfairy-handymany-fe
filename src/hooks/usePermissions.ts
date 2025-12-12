import { useAuth } from '@/app/providers/AuthProvider';
import type { Permission, Role } from '@/types/rbac';
import { hasPermission, hasAnyPermission, hasAllPermissions, getRolePermissions } from '@/lib/permissions';

/**
 * Hook to check user permissions based on their role
 */
export function usePermissions() {
    const { user } = useAuth();
    const role = (user?.role as Role) || null;

    return {
        role,
        permissions: role ? getRolePermissions(role) : [],
        hasPermission: (permission: Permission) => hasPermission(role, permission),
        hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(role, permissions),
        hasAllPermissions: (permissions: Permission[]) => hasAllPermissions(role, permissions),
    };
}
