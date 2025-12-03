import type { Role, Permission, RolePermissions } from '@/types/rbac';
import { ROLE_PERMISSIONS } from '@/types/rbac';

// Re-export ROLE_PERMISSIONS as PERMISSION_MATRIX for backward compatibility
export const PERMISSION_MATRIX = ROLE_PERMISSIONS;

/**
 * Convert a string to a Role type
 * @param roleStr - The role string to convert
 * @returns The Role type
 */
export function toRole(roleStr: string): Role {
    const validRoles: Role[] = ['superadmin', 'orgadmin', 'manager', 'viewer', 'staff_employee'];
    if (validRoles.includes(roleStr as Role)) {
        return roleStr as Role;
    }

    // Handle legacy role names for backward compatibility
    const legacyRoleMap: Record<string, Role> = {
        'platform_owner': 'superadmin',
        'owner': 'orgadmin',
        'technician': 'staff_employee',
    };

    if (roleStr in legacyRoleMap) {
        return legacyRoleMap[roleStr];
    }

    // Default to viewer for unknown roles
    return 'viewer';
}

/**
 * Check if a role has a specific permission
 * @param role - The user's role
 * @param permission - The permission to check
 * @returns True if the role has the permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
    const rolePermissions = PERMISSION_MATRIX[role];
    return rolePermissions?.[permission] === true;
}

/**
 * Check if a role has any of the specified permissions
 * @param role - The user's role
 * @param permissions - Array of permissions to check
 * @returns True if the role has at least one of the permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
    return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 * @param role - The user's role
 * @param permissions - Array of permissions to check
 * @returns True if the role has all of the permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
    return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 * @param role - The user's role
 * @returns Object containing all permissions for the role
 */
export function getRolePermissions(role: Role): RolePermissions {
    return PERMISSION_MATRIX[role] || {};
}

/**
 * Get a list of all permissions that a role has (set to true)
 * @param role - The user's role
 * @returns Array of permission keys that are enabled for the role
 */
export function getEnabledPermissions(role: Role): Permission[] {
    const rolePermissions = getRolePermissions(role);
    return Object.entries(rolePermissions)
        .filter(([_, enabled]) => enabled === true)
        .map(([permission]) => permission as Permission);
}
