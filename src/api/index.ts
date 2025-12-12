/**
 * Centralized API Client Exports
 * Following SOLID principles - Single Responsibility
 * All API clients exported from a single entry point
 */

export { workOrderApi } from '@/features/work-orders/services/workOrderApi';
export { locationApi } from '@/features/sites/services/locationApi';
export { assetApi } from '@/features/assets/services/assetApi';
export { organizationApi } from '@/features/organization/api/organizationApi';
export { dashboardApi } from '@/features/dashboard/api/dashboardApi';

// Re-export types for convenience
export type {
    WorkOrder,
    WorkOrderTask,
    WorkOrderComment,
    WorkOrderAttachment,
    WorkOrderStatus,
    WorkOrderPriority,
    CreateWorkOrderPayload,
    UpdateWorkOrderPayload,
    AssignWorkOrderPayload,
} from '@/types/workOrder';

export type {
    Site,
    Building,
    Floor,
    Zone,
    SiteStatistics,
    CreateSitePayload,
    UpdateSitePayload,
    CreateBuildingPayload,
    UpdateBuildingPayload,
    CreateFloorPayload,
    CreateZonePayload,
} from '@/types/location';

export type {
    Asset,
    AssetCategory,
    CreateAssetPayload,
    UpdateAssetPayload,
} from '@/types/asset';

export type {
    Organization,
    OrganizationMember,
} from '@/types/organization';
