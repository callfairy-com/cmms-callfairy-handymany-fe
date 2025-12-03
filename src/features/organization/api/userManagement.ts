import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/config/endpoints';

export interface InviteUserPayload {
    user_email: string;
    role: string;
}

export interface CreateMemberPayload {
    email: string;
    name: string;
    password?: string;
    role: string;
    send_invitation_email?: boolean;
}

export interface UserManagementResponse {
    message: string;
    user_id?: string | number;
}

export const userManagementApi = {
    inviteUser: async (organizationId: string | number, data: InviteUserPayload): Promise<UserManagementResponse> => {
        const response = await apiClient.post<UserManagementResponse>(
            API_ENDPOINTS.ORGANIZATIONS.INVITE_USER(organizationId),
            data
        );
        return response;
    },

    createMember: async (organizationId: string | number, data: CreateMemberPayload): Promise<UserManagementResponse> => {
        const response = await apiClient.post<UserManagementResponse>(
            API_ENDPOINTS.ORGANIZATIONS.CREATE_MEMBER(organizationId),
            data
        );
        return response;
    },
};
