import { apiClient } from '@/lib/api/client';
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
        return apiClient.get('/api/v1/cmms/asset-categories/', { params });
    },

    createCategory: async (data: CreateAssetCategoryPayload): Promise<AssetCategory> => {
        return apiClient.post('/api/v1/cmms/asset-categories/', data);
    },

    getCategory: async (id: string): Promise<AssetCategory> => {
        return apiClient.get(`/api/v1/cmms/asset-categories/${id}/`);
    },

    updateCategory: async (id: string, data: Partial<CreateAssetCategoryPayload>): Promise<AssetCategory> => {
        return apiClient.patch(`/api/v1/cmms/asset-categories/${id}/`, data);
    },

    deleteCategory: async (id: string): Promise<void> => {
        return apiClient.delete(`/api/v1/cmms/asset-categories/${id}/`);
    },

    // Assets
    listAssets: async (params?: Record<string, any>): Promise<PaginatedResponse<Asset>> => {
        return apiClient.get('/api/v1/cmms/assets/', { params });
    },

    createAsset: async (data: CreateAssetPayload): Promise<Asset> => {
        return apiClient.post('/api/v1/cmms/assets/', data);
    },

    getAsset: async (id: string): Promise<Asset> => {
        return apiClient.get(`/api/v1/cmms/assets/${id}/`);
    },

    updateAsset: async (id: string, data: UpdateAssetPayload): Promise<Asset> => {
        return apiClient.patch(`/api/v1/cmms/assets/${id}/`, data);
    },

    deleteAsset: async (id: string): Promise<void> => {
        return apiClient.delete(`/api/v1/cmms/assets/${id}/`);
    },

    getAssetStats: async (params?: Record<string, any>): Promise<AssetStats> => {
        return apiClient.get('/api/v1/cmms/assets/stats/', { params });
    },

    // Asset Actions
    getAssetBuildings: async (id: string): Promise<any[]> => {
        return apiClient.get(`/api/v1/cmms/assets/${id}/buildings/`);
    },

    getAssetMeters: async (id: string): Promise<AssetMeter[]> => {
        return apiClient.get(`/api/v1/cmms/assets/${id}/meters/`);
    },

    getAssetDocuments: async (id: string): Promise<AssetDocument[]> => {
        return apiClient.get(`/api/v1/cmms/assets/${id}/documents/`);
    },

    getAssetWorkOrders: async (id: string, params?: Record<string, any>): Promise<PaginatedResponse<WorkOrder>> => {
        return apiClient.get(`/api/v1/cmms/assets/${id}/work_orders/`, { params });
    },

    deprecateAsset: async (id: string): Promise<Asset> => {
        return apiClient.post(`/api/v1/cmms/assets/${id}/deprecate/`);
    },

    transferAsset: async (id: string, data: TransferAssetPayload): Promise<Asset> => {
        return apiClient.post(`/api/v1/cmms/assets/${id}/transfer/`, data);
    },

    getAssetLifecycleCosts: async (id: string): Promise<any> => {
        return apiClient.get(`/api/v1/cmms/assets/${id}/lifecycle-costs/`);
    },

    getAssetReplacementAnalysis: async (id: string, params?: { threshold?: number }): Promise<any> => {
        return apiClient.get(`/api/v1/cmms/assets/${id}/replacement-analysis/`, { params });
    },

    // Asset Meters
    listMeters: async (params?: Record<string, any>): Promise<PaginatedResponse<AssetMeter>> => {
        return apiClient.get('/api/v1/cmms/asset-meters/', { params });
    },

    createMeter: async (data: CreateAssetMeterPayload): Promise<AssetMeter> => {
        return apiClient.post('/api/v1/cmms/asset-meters/', data);
    },

    getMeter: async (id: string): Promise<AssetMeter> => {
        return apiClient.get(`/api/v1/cmms/asset-meters/${id}/`);
    },

    updateMeter: async (id: string, data: Partial<CreateAssetMeterPayload>): Promise<AssetMeter> => {
        return apiClient.patch(`/api/v1/cmms/asset-meters/${id}/`, data);
    },

    deleteMeter: async (id: string): Promise<void> => {
        return apiClient.delete(`/api/v1/cmms/asset-meters/${id}/`);
    },

    recordMeterReading: async (meterId: string, data: RecordMeterReadingPayload): Promise<AssetMeterReading> => {
        return apiClient.post(`/api/v1/cmms/asset-meters/${meterId}/record_reading/`, data);
    },

    // Asset Documents
    listDocuments: async (params?: Record<string, any>): Promise<PaginatedResponse<AssetDocument>> => {
        return apiClient.get('/api/v1/cmms/asset-documents/', { params });
    },

    uploadDocument: async (formData: FormData): Promise<AssetDocument> => {
        return apiClient.post('/api/v1/cmms/asset-documents/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    deleteDocument: async (id: string): Promise<void> => {
        return apiClient.delete(`/api/v1/cmms/asset-documents/${id}/`);
    },

    // Asset Assignments
    listAssignments: async (params?: Record<string, any>): Promise<PaginatedResponse<AssetAssignment>> => {
        return apiClient.get('/api/v1/cmms/asset-assignments/', { params });
    },

    createAssignment: async (data: any): Promise<AssetAssignment> => {
        return apiClient.post('/api/v1/cmms/asset-assignments/', data);
    },

    deleteAssignment: async (id: string): Promise<void> => {
        return apiClient.delete(`/api/v1/cmms/asset-assignments/${id}/`);
    },

    // Asset Custody
    listCustody: async (params?: Record<string, any>): Promise<PaginatedResponse<AssetCustody>> => {
        return apiClient.get('/api/v1/cmms/asset-custody/', { params });
    },

    createCustody: async (data: any): Promise<AssetCustody> => {
        return apiClient.post('/api/v1/cmms/asset-custody/', data);
    },

    // Asset Check Logs
    checkOutAsset: async (data: CheckOutAssetPayload): Promise<AssetCheckLog> => {
        return apiClient.post('/api/v1/cmms/asset-check-logs/check_out/', data);
    },

    checkInAsset: async (data: CheckInAssetPayload): Promise<AssetCheckLog> => {
        return apiClient.post('/api/v1/cmms/asset-check-logs/check_in/', data);
    },

    listCheckLogs: async (params?: Record<string, any>): Promise<PaginatedResponse<AssetCheckLog>> => {
        return apiClient.get('/api/v1/cmms/asset-check-logs/', { params });
    },

    // Asset Transfers
    listTransfers: async (params?: Record<string, any>): Promise<PaginatedResponse<AssetTransfer>> => {
        return apiClient.get('/api/v1/cmms/asset-transfers/', { params });
    },

    createTransfer: async (data: any): Promise<AssetTransfer> => {
        return apiClient.post('/api/v1/cmms/asset-transfers/', data);
    },

    // Asset Parts
    listAssetParts: async (params?: Record<string, any>): Promise<PaginatedResponse<AssetPart>> => {
        return apiClient.get('/api/v1/cmms/asset-parts/', { params });
    },

    linkPartToAsset: async (data: any): Promise<AssetPart> => {
        return apiClient.post('/api/v1/cmms/asset-parts/', data);
    },

    deleteAssetPart: async (id: string): Promise<void> => {
        return apiClient.delete(`/api/v1/cmms/asset-parts/${id}/`);
    },
};
