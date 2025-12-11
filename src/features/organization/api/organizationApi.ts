import { apiClient } from '@/lib/api/client';
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
        return apiClient.get('/api/v1/cmms/organizations/', { params });
    },

    getOrganization: async (id: string): Promise<Organization> => {
        return apiClient.get(`/api/v1/cmms/organizations/${id}/`);
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
        return apiClient.get(`/api/v1/cmms/organizations/${orgId}/members/`, { params });
    },

    // Branding - Update logo by URL
    updateBranding: async (orgId: string, data: {
        logo?: string;
        primary_color?: string;
        secondary_color?: string;
        company_tagline?: string;
    }): Promise<Organization> => {
        return apiClient.patch(`/api/v1/cmms/organizations/${orgId}/branding/`, data);
    },

    // Upload logo file
    uploadLogo: async (orgId: string, file: File, logoType: 'main' | 'billing' | 'favicon' = 'main'): Promise<Organization> => {
        const formData = new FormData();
        formData.append('logo', file);
        formData.append('logo_type', logoType);
        return apiClient.post(`/api/v1/cmms/organizations/${orgId}/upload-logo/`, formData, {
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
        return apiClient.patch(`/api/v1/cmms/organizations/${orgId}/settings/`, data);
    },

    // Create Organization (Super Admin only)
    createOrganization: async (data: {
        name: string;
        slug: string;
        email: string;
        phone?: string;
        address?: string;
        plan?: string;
    }): Promise<Organization> => {
        return apiClient.post('/api/v1/cmms/organizations/', data);
    },

    // Add Member to Organization
    addMember: async (orgId: string, data: {
        user_id: string;
        role: string;
        employment_type?: string;
        is_active?: boolean;
    }): Promise<OrganizationMember> => {
        return apiClient.post(`/api/v1/cmms/organizations/${orgId}/members/`, data);
    },

    // Update Member Role
    updateMember: async (orgId: string, userId: string, data: {
        role?: string;
        is_active?: boolean;
        employment_type?: string;
    }): Promise<OrganizationMember> => {
        return apiClient.patch(`/api/v1/cmms/organizations/${orgId}/members/${userId}/`, data);
    },
};
