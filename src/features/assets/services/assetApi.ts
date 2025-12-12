import { apiClient } from '@/lib/api/client';
import { CMMS_ENDPOINTS } from '@/config';
import type {
    Asset,
    AssetCategory,
    AssetMeter,
    AssetMeterReading,
    AssetDocument,
    AssetAssignment,
    AssetCustody,
    AssetCheckLog,
    AssetTransfer,
    AssetPart,
    AssetStats,
    PaginatedResponse,
    CreateAssetPayload,
    UpdateAssetPayload,
    CreateAssetCategoryPayload,
    CreateAssetMeterPayload,
    RecordMeterReadingPayload,
    TransferAssetPayload,
    CheckOutAssetPayload,
    CheckInAssetPayload,
} from '@/types/asset';
import type { WorkOrder } from '@/types/workOrder';

export const assetApi = {
    // Asset Categories
    listCategories: async (params?: Record<string, any>): Promise<PaginatedResponse<AssetCategory>> => {
        return apiClient.get(CMMS_ENDPOINTS.ASSETS.CATEGORIES, { params });
    },

    createCategory: async (data: CreateAssetCategoryPayload): Promise<AssetCategory> => {
        return apiClient.post(CMMS_ENDPOINTS.ASSETS.CATEGORIES, data);
    },

    getCategory: async (id: string): Promise<AssetCategory> => {
        return apiClient.get(CMMS_ENDPOINTS.ASSETS.CATEGORY_DETAIL(id));
    },

    updateCategory: async (id: string, data: Partial<CreateAssetCategoryPayload>): Promise<AssetCategory> => {
        return apiClient.patch(CMMS_ENDPOINTS.ASSETS.CATEGORY_DETAIL(id), data);
    },

    deleteCategory: async (id: string): Promise<void> => {
        return apiClient.delete(CMMS_ENDPOINTS.ASSETS.CATEGORY_DETAIL(id));
    },

    // Assets
    listAssets: async (params?: Record<string, any>): Promise<PaginatedResponse<Asset>> => {
        return apiClient.get(CMMS_ENDPOINTS.ASSETS.LIST, { params });
    },

    createAsset: async (data: CreateAssetPayload): Promise<Asset> => {
        return apiClient.post(CMMS_ENDPOINTS.ASSETS.CREATE, data);
    },

    getAsset: async (id: string): Promise<Asset> => {
        return apiClient.get(CMMS_ENDPOINTS.ASSETS.DETAIL(id));
    },

    updateAsset: async (id: string, data: UpdateAssetPayload): Promise<Asset> => {
        return apiClient.patch(CMMS_ENDPOINTS.ASSETS.UPDATE(id), data);
    },

    deleteAsset: async (id: string): Promise<void> => {
        return apiClient.delete(CMMS_ENDPOINTS.ASSETS.DELETE(id));
    },

    getAssetStats: async (params?: Record<string, any>): Promise<AssetStats> => {
        return apiClient.get(CMMS_ENDPOINTS.ASSETS.STATS, { params });
    },

    // Asset Actions
    getAssetBuildings: async (id: string): Promise<any[]> => {
        return apiClient.get(CMMS_ENDPOINTS.ASSETS.BUILDINGS(id));
    },

    getAssetMeters: async (id: string): Promise<AssetMeter[]> => {
        return apiClient.get(CMMS_ENDPOINTS.ASSETS.METERS(id));
    },

    getAssetDocuments: async (id: string): Promise<AssetDocument[]> => {
        return apiClient.get(CMMS_ENDPOINTS.ASSETS.DOCUMENTS(id));
    },

    getAssetWorkOrders: async (id: string, params?: Record<string, any>): Promise<PaginatedResponse<WorkOrder>> => {
        return apiClient.get(CMMS_ENDPOINTS.ASSETS.WORK_ORDERS(id), { params });
    },

    deprecateAsset: async (id: string): Promise<Asset> => {
        return apiClient.post(CMMS_ENDPOINTS.ASSETS.DEPRECATE(id));
    },

    transferAsset: async (id: string, data: TransferAssetPayload): Promise<Asset> => {
        return apiClient.post(CMMS_ENDPOINTS.ASSETS.TRANSFER(id), data);
    },

    getAssetLifecycleCosts: async (id: string): Promise<any> => {
        return apiClient.get(CMMS_ENDPOINTS.ASSETS.LIFECYCLE_COSTS(id));
    },

    getAssetReplacementAnalysis: async (id: string, params?: Record<string, any>): Promise<any> => {
        return apiClient.get(CMMS_ENDPOINTS.ASSETS.REPLACEMENT_ANALYSIS(id), { params });
    },

    // Asset Meters
    listAssetMeters: async (params?: Record<string, any>): Promise<PaginatedResponse<AssetMeter>> => {
        return apiClient.get(CMMS_ENDPOINTS.ASSETS.ASSET_METERS, { params });
    },

    createAssetMeter: async (data: CreateAssetMeterPayload): Promise<AssetMeter> => {
        return apiClient.post(CMMS_ENDPOINTS.ASSETS.ASSET_METERS, data);
    },

    getAssetMeter: async (id: string): Promise<AssetMeter> => {
        return apiClient.get(CMMS_ENDPOINTS.ASSETS.ASSET_METER_DETAIL(id));
    },

    updateAssetMeter: async (id: string, data: Partial<CreateAssetMeterPayload>): Promise<AssetMeter> => {
        return apiClient.patch(CMMS_ENDPOINTS.ASSETS.ASSET_METER_DETAIL(id), data);
    },

    deleteAssetMeter: async (id: string): Promise<void> => {
        return apiClient.delete(CMMS_ENDPOINTS.ASSETS.ASSET_METER_DETAIL(id));
    },

    recordMeterReading: async (meterId: string, data: RecordMeterReadingPayload): Promise<AssetMeterReading> => {
        return apiClient.post(CMMS_ENDPOINTS.ASSETS.ASSET_METER_RECORD(meterId), data);
    },

    // Asset Documents
    listAssetDocuments: async (params?: Record<string, any>): Promise<PaginatedResponse<AssetDocument>> => {
        return apiClient.get(CMMS_ENDPOINTS.ASSETS.ASSET_DOCUMENTS, { params });
    },

    uploadAssetDocument: async (formData: FormData): Promise<AssetDocument> => {
        return apiClient.post(CMMS_ENDPOINTS.ASSETS.ASSET_DOCUMENTS, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    deleteAssetDocument: async (id: string): Promise<void> => {
        return apiClient.delete(CMMS_ENDPOINTS.ASSETS.ASSET_DOCUMENT_DETAIL(id));
    },

    // Asset Assignments
    listAssetAssignments: async (params?: Record<string, any>): Promise<PaginatedResponse<AssetAssignment>> => {
        return apiClient.get(CMMS_ENDPOINTS.ASSETS.ASSET_ASSIGNMENTS, { params });
    },

    createAssetAssignment: async (data: any): Promise<AssetAssignment> => {
        return apiClient.post(CMMS_ENDPOINTS.ASSETS.ASSET_ASSIGNMENTS, data);
    },

    deleteAssetAssignment: async (id: string): Promise<void> => {
        return apiClient.delete(CMMS_ENDPOINTS.ASSETS.ASSET_ASSIGNMENT_DETAIL(id));
    },

    // Asset Custody
    listAssetCustody: async (params?: Record<string, any>): Promise<PaginatedResponse<AssetCustody>> => {
        return apiClient.get(CMMS_ENDPOINTS.ASSETS.ASSET_CUSTODY, { params });
    },

    createAssetCustody: async (data: any): Promise<AssetCustody> => {
        return apiClient.post(CMMS_ENDPOINTS.ASSETS.ASSET_CUSTODY, data);
    },

    // Asset Check Logs
    checkOutAsset: async (data: CheckOutAssetPayload): Promise<AssetCheckLog> => {
        return apiClient.post(CMMS_ENDPOINTS.ASSETS.ASSET_CHECK_OUT, data);
    },

    checkInAsset: async (data: CheckInAssetPayload): Promise<AssetCheckLog> => {
        return apiClient.post(CMMS_ENDPOINTS.ASSETS.ASSET_CHECK_IN, data);
    },

    listAssetCheckLogs: async (params?: Record<string, any>): Promise<PaginatedResponse<AssetCheckLog>> => {
        return apiClient.get(CMMS_ENDPOINTS.ASSETS.ASSET_CHECK_LOGS, { params });
    },

    // Asset Transfers
    listAssetTransfers: async (params?: Record<string, any>): Promise<PaginatedResponse<AssetTransfer>> => {
        return apiClient.get(CMMS_ENDPOINTS.ASSETS.ASSET_TRANSFERS, { params });
    },

    createAssetTransfer: async (data: any): Promise<AssetTransfer> => {
        return apiClient.post(CMMS_ENDPOINTS.ASSETS.ASSET_TRANSFERS, data);
    },

    // Asset Parts
    listAssetParts: async (params?: Record<string, any>): Promise<PaginatedResponse<AssetPart>> => {
        return apiClient.get(CMMS_ENDPOINTS.ASSETS.ASSET_PARTS, { params });
    },

    createAssetPart: async (data: any): Promise<AssetPart> => {
        return apiClient.post(CMMS_ENDPOINTS.ASSETS.ASSET_PARTS, data);
    },

    deleteAssetPart: async (id: string): Promise<void> => {
        return apiClient.delete(CMMS_ENDPOINTS.ASSETS.ASSET_PART_DETAIL(id));
    },
};
