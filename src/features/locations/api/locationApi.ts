import { apiClient } from '@/lib/api/client';
import type {
    Site,
    SiteStatistics,
    Building,
    Floor,
    Zone,
    CreateSitePayload,
    UpdateSitePayload,
    CreateBuildingPayload,
    UpdateBuildingPayload,
    CreateFloorPayload,
    UpdateFloorPayload,
    CreateZonePayload,
    UpdateZonePayload,
    PaginatedResponse,
} from '@/types/location';

/**
 * Location Hierarchy API Client
 * Based on CMMS MVP API Documentation
 */
export const locationApi = {
    // Sites
    listSites: async (params?: Record<string, any>): Promise<PaginatedResponse<Site>> => {
        return apiClient.get('/api/v1/cmms/sites/', { params });
    },

    createSite: async (data: CreateSitePayload): Promise<Site> => {
        return apiClient.post('/api/v1/cmms/sites/', data);
    },

    getSite: async (id: string): Promise<Site> => {
        return apiClient.get(`/api/v1/cmms/sites/${id}/`);
    },

    updateSite: async (id: string, data: UpdateSitePayload): Promise<Site> => {
        return apiClient.put(`/api/v1/cmms/sites/${id}/`, data);
    },

    partialUpdateSite: async (id: string, data: Partial<UpdateSitePayload>): Promise<Site> => {
        return apiClient.patch(`/api/v1/cmms/sites/${id}/`, data);
    },

    deleteSite: async (id: string): Promise<void> => {
        return apiClient.delete(`/api/v1/cmms/sites/${id}/`);
    },

    getSiteStatistics: async (id: string): Promise<SiteStatistics> => {
        return apiClient.get(`/api/v1/cmms/sites/${id}/stats/`);
    },

    // Get sites assigned to a specific user (for staff_employee role)
    getAssignedSites: async (userId: string, params?: Record<string, any>): Promise<PaginatedResponse<Site>> => {
        return apiClient.get('/api/v1/cmms/sites/', { 
            params: { ...params, assigned_to: userId } 
        });
    },

    // Get sites where user is the manager
    getManagedSites: async (managerId: string, params?: Record<string, any>): Promise<PaginatedResponse<Site>> => {
        return apiClient.get('/api/v1/cmms/sites/', { 
            params: { ...params, manager: managerId } 
        });
    },

    getSiteBuildings: async (id: string, params?: Record<string, any>): Promise<PaginatedResponse<Building>> => {
        return apiClient.get(`/api/v1/cmms/sites/${id}/buildings/`, { params });
    },

    getSiteAssets: async (id: string, params?: Record<string, any>): Promise<any> => {
        return apiClient.get(`/api/v1/cmms/sites/${id}/assets/`, { params });
    },

    // Check if site exists by code (for upsert logic)
    findSiteByCode: async (orgId: string, code: string): Promise<Site | null> => {
        try {
            const response = await apiClient.get<PaginatedResponse<Site>>('/api/v1/cmms/sites/', {
                params: { organization: orgId, code, page_size: 1 }
            });
            return response.results && response.results.length > 0 ? response.results[0] : null;
        } catch {
            return null;
        }
    },

    // Upsert site - create if not exists, update if exists
    upsertSite: async (data: CreateSitePayload): Promise<{ site: Site; created: boolean }> => {
        // Check if site with same code exists
        if (data.code) {
            const existingSite = await locationApi.findSiteByCode(data.organization, data.code);
            if (existingSite) {
                const updatedSite = await locationApi.partialUpdateSite(existingSite.id, data);
                return { site: updatedSite, created: false };
            }
        }
        // Create new site
        const newSite = await locationApi.createSite(data);
        return { site: newSite, created: true };
    },

    // Buildings
    listBuildings: async (params?: Record<string, any>): Promise<PaginatedResponse<Building>> => {
        return apiClient.get('/api/v1/cmms/buildings/', { params });
    },

    createBuilding: async (data: CreateBuildingPayload): Promise<Building> => {
        return apiClient.post('/api/v1/cmms/buildings/', data);
    },

    getBuilding: async (id: string): Promise<Building> => {
        return apiClient.get(`/api/v1/cmms/buildings/${id}/`);
    },

    updateBuilding: async (id: string, data: UpdateBuildingPayload): Promise<Building> => {
        return apiClient.patch(`/api/v1/cmms/buildings/${id}/`, data);
    },

    deleteBuilding: async (id: string): Promise<void> => {
        return apiClient.delete(`/api/v1/cmms/buildings/${id}/`);
    },

    getBuildingFloors: async (id: string, params?: Record<string, any>): Promise<PaginatedResponse<Floor>> => {
        return apiClient.get(`/api/v1/cmms/buildings/${id}/floors/`, { params });
    },

    // Check if building exists by code (for upsert logic)
    findBuildingByCode: async (siteId: string, code: string): Promise<Building | null> => {
        try {
            const response = await apiClient.get<PaginatedResponse<Building>>('/api/v1/cmms/buildings/', {
                params: { site: siteId, code, page_size: 1 }
            });
            return response.results && response.results.length > 0 ? response.results[0] : null;
        } catch {
            return null;
        }
    },

    // Upsert building - create if not exists, update if exists
    upsertBuilding: async (data: CreateBuildingPayload): Promise<{ building: Building; created: boolean }> => {
        if (data.code) {
            const existingBuilding = await locationApi.findBuildingByCode(data.site, data.code);
            if (existingBuilding) {
                const updatedBuilding = await locationApi.updateBuilding(existingBuilding.id, data);
                return { building: updatedBuilding, created: false };
            }
        }
        const newBuilding = await locationApi.createBuilding(data);
        return { building: newBuilding, created: true };
    },

    // Floors
    listFloors: async (params?: Record<string, any>): Promise<PaginatedResponse<Floor>> => {
        return apiClient.get('/api/v1/cmms/floors/', { params });
    },

    createFloor: async (data: CreateFloorPayload): Promise<Floor> => {
        return apiClient.post('/api/v1/cmms/floors/', data);
    },

    getFloor: async (id: string): Promise<Floor> => {
        return apiClient.get(`/api/v1/cmms/floors/${id}/`);
    },

    updateFloor: async (id: string, data: UpdateFloorPayload): Promise<Floor> => {
        return apiClient.patch(`/api/v1/cmms/floors/${id}/`, data);
    },

    deleteFloor: async (id: string): Promise<void> => {
        return apiClient.delete(`/api/v1/cmms/floors/${id}/`);
    },

    getFloorZones: async (id: string, params?: Record<string, any>): Promise<PaginatedResponse<Zone>> => {
        return apiClient.get(`/api/v1/cmms/floors/${id}/zones/`, { params });
    },

    // Zones
    listZones: async (params?: Record<string, any>): Promise<PaginatedResponse<Zone>> => {
        return apiClient.get('/api/v1/cmms/zones/', { params });
    },

    createZone: async (data: CreateZonePayload): Promise<Zone> => {
        return apiClient.post('/api/v1/cmms/zones/', data);
    },

    getZone: async (id: string): Promise<Zone> => {
        return apiClient.get(`/api/v1/cmms/zones/${id}/`);
    },

    updateZone: async (id: string, data: UpdateZonePayload): Promise<Zone> => {
        return apiClient.patch(`/api/v1/cmms/zones/${id}/`, data);
    },

    deleteZone: async (id: string): Promise<void> => {
        return apiClient.delete(`/api/v1/cmms/zones/${id}/`);
    },

    // Site Types - hardcoded since endpoint doesn't exist
    listSiteTypes: async (_params?: Record<string, any>): Promise<{ results: Array<{ id: string; name: string; code: string }> }> => {
        // Return common site types as the endpoint doesn't exist
        return Promise.resolve({
            results: [
                { id: 'office', name: 'Office', code: 'office' },
                { id: 'warehouse', name: 'Warehouse', code: 'warehouse' },
                { id: 'factory', name: 'Factory', code: 'factory' },
                { id: 'retail', name: 'Retail', code: 'retail' },
                { id: 'datacenter', name: 'Data Center', code: 'datacenter' },
                { id: 'hospital', name: 'Hospital', code: 'hospital' },
                { id: 'school', name: 'School', code: 'school' },
                { id: 'residential', name: 'Residential', code: 'residential' },
                { id: 'mixed_use', name: 'Mixed Use', code: 'mixed_use' },
                { id: 'other', name: 'Other', code: 'other' },
            ]
        });
    },

    // Organization Users (for manager filter) - use organization members endpoint
    listOrganizationUsers: async (params?: Record<string, any>): Promise<any> => {
        const orgId = params?.organization;
        if (!orgId) {
            return { results: [] };
        }
        // Use the organization members endpoint instead
        return apiClient.get(`/api/v1/cmms/organizations/${orgId}/members/`, { params });
    },
};
