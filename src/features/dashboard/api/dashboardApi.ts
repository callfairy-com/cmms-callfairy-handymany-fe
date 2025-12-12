import { apiClient } from '@/lib/api/client';
import { CMMS_ENDPOINTS } from '@/config';
import type { DynamicDashboardData } from '@/types/dashboard';

/**
 * Dashboard API Client
 * Based on CMMS Dynamic Dashboard API
 */
export const dashboardApi = {
    getDynamicDashboard: async (): Promise<DynamicDashboardData> => {
        return apiClient.get(CMMS_ENDPOINTS.DYNAMIC_DASHBOARD);
    },
};
