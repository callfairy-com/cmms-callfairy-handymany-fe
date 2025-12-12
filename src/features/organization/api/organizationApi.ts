import { apiClient } from '@/lib/api/client';
import { CMMS_ENDPOINTS } from '@/config';
import type {
    Organization,
    OrganizationMember,
    PaginatedResponse,
} from '@/types/organization';

/**
 * Organizations API Client
 * Based on CMMS MVP API Documentation
 */
export const organizationApi = {
    // Organizations
    listOrganizations: async (params?: Record<string, any>): Promise<PaginatedResponse<Organization>> => {
        return apiClient.get(CMMS_ENDPOINTS.ORGANIZATIONS.LIST, { params });
    },

    getOrganization: async (id: string): Promise<Organization> => {
        return apiClient.get(CMMS_ENDPOINTS.ORGANIZATIONS.DETAIL(id));
    },

    // Organization Members
    listMembers: async (orgId: string, params?: Record<string, any>): Promise<{
        count: number;
        organization_id: string;
        organization_name: string;
        requesting_user: string;
        requesting_user_role: string;
        can_manage_members: boolean;
        results: OrganizationMember[];
    }> => {
        return apiClient.get(CMMS_ENDPOINTS.ORGANIZATIONS.MEMBERS(orgId), { params });
    },

    // Branding - Update logo by URL
    updateBranding: async (orgId: string, data: {
        logo?: string;
        primary_color?: string;
        secondary_color?: string;
        company_tagline?: string;
    }): Promise<Organization> => {
        return apiClient.patch(CMMS_ENDPOINTS.ORGANIZATIONS.BRANDING(orgId), data);
    },

    // Upload logo file
    uploadLogo: async (orgId: string, file: File, logoType: 'main' | 'billing' | 'favicon' = 'main'): Promise<Organization> => {
        const formData = new FormData();
        formData.append('logo', file);
        formData.append('logo_type', logoType);
        return apiClient.post(CMMS_ENDPOINTS.ORGANIZATIONS.UPLOAD_LOGO(orgId), formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Organization Settings
    updateOrganizationSettings: async (orgId: string, data: {
        regional?: {
            timezone?: string;
            date_format?: string;
            currency?: string;
        };
        security?: {
            require_2fa?: boolean;
            session_timeout_minutes?: number;
        };
    }): Promise<Organization> => {
        return apiClient.patch(CMMS_ENDPOINTS.ORGANIZATIONS.SETTINGS(orgId), data);
    },

    // Create Organization (Super Admin only)
    createOrganization: async (data: any): Promise<Organization> => {
        return apiClient.post(CMMS_ENDPOINTS.ORGANIZATIONS.CREATE, data);
    },

    // Add Member to Organization
    createOrganizationMember: async (orgId: string, data: any): Promise<any> => {
        return apiClient.post(CMMS_ENDPOINTS.ORGANIZATIONS.CREATE_MEMBER(orgId), data);
    },

    // Update Member Role
    updateOrganizationMember: async (orgId: string, userId: string, data: any): Promise<any> => {
        return apiClient.patch(CMMS_ENDPOINTS.ORGANIZATIONS.UPDATE_MEMBER(orgId, userId), data);
    },
};
