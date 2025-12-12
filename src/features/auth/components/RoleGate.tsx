import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import type { Role } from '@/types/rbac';

interface RoleGateProps {
    /** Single role to check */
    role?: Role;
    /** Multiple roles to check (OR logic) */
    roles?: Role[];
    /** Content to show if user has role */
    children: React.ReactNode;
    /** Optional fallback content to show if user doesn't have role */
    fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user role
 * 
 * @example
 * // Single role
 * <RoleGate role="platform_owner">
 *   <PlatformAdminPanel />
 * </RoleGate>
 * 
 * @example
 * // Multiple roles (OR logic)
 * <RoleGate roles={['platform_owner', 'owner']}>
 *   <OrganizationSettings />
 * </RoleGate>
 * 
 * @example
 * // With fallback
 * <RoleGate role="owner" fallback={<AccessDenied />}>
 *   <BillingSettings />
 * </RoleGate>
 */
export function RoleGate({
    role,
    roles,
    children,
    fallback = null
}: RoleGateProps) {
    const { role: userRole } = usePermissions();

    let hasAccess = false;

    if (role) {
        hasAccess = userRole === role;
    } else if (roles && roles.length > 0) {
        hasAccess = userRole ? roles.includes(userRole) : false;
    }

    return hasAccess ? <>{children}</> : <>{fallback}</>;
}
