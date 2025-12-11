import { apiClient } from '@/lib/api/client';
import type { DynamicDashboardData } from '@/types/dashboard';

/**
 * Dashboard API Client
 * Based on CMMS Dynamic Dashboard API
 */
export const dashboardApi = {
    getDynamicDashboard: async (): Promise<DynamicDashboardData> => {
        return apiClient.get('/api/v1/cmms/dynamic-dashboard/');
    },
};
