/**
 * Simplified Data Access Hook
 * Uses RBAC from AuthContext instead of mock data
 * Deprecated in favor of direct hasPermission/hasRole usage
 */
import { useAuth } from '@/app/providers/AuthProvider';

export function useDataAccess() {
  const { user, hasPermission } = useAuth();

  // Check if user can view all work orders
  const canViewAllWorkOrders = hasPermission('can_view_all_work_orders');
  const canViewTeamWorkOrders = hasPermission('can_view_team_work_orders');
  const canViewAssignedWorkOrders = hasPermission('can_view_assigned_work_orders');

  // Check asset permissions
  const canViewAllAssets = hasPermission('can_view_assigned_assets') || hasPermission('can_add_assets');
  const canEditAssets = hasPermission('can_edit_assets');
  const canDeleteAssets = hasPermission('can_delete_assets');

  // Check document permissions
  const canUploadDocuments = hasPermission('can_upload_asset_documentation');

  // Check work order editing permissions
  const canCreateWorkOrders = hasPermission('can_create_work_orders');
  const canUpdateWorkOrderStatus = hasPermission('can_update_work_order_status');
  const canAssignWorkOrders = hasPermission('can_assign_work_orders');

  // Role checks - based on permission patterns
  const isAdmin = canViewAllWorkOrders && hasPermission('can_manage_organization');
  const isManager = canViewTeamWorkOrders;
  const isContractor = canViewAssignedWorkOrders;
  const isViewer = !canCreateWorkOrders && !canEditAssets;

  // Management permissions
  const canManageUsers = hasPermission('can_manage_users');
  const canManageOrganization = hasPermission('can_manage_organization');

  return {
    // Work Order Permissions
    canViewAllWorkOrders,
    canViewTeamWorkOrders,
    canViewAssignedWorkOrders,
    canCreateWorkOrders,
    canUpdateWorkOrderStatus,
    canAssignWorkOrders,

    // Asset Permissions
    canViewAllAssets,
    canEditAssets,
    canDeleteAssets,

    // Document Permissions
    canUploadDocuments,

    // Management Permissions
    canManageUsers,
    canManageOrganization,

    // Role Checks
    isAdmin,
    isManager,
    isContractor,
    isViewer,

    // User info
    user,
  };
}
