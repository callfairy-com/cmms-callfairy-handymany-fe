import { apiClient } from '@/lib/api/client'
import type { PaginatedResponse } from '@/types/api'
import type { MaintenanceJob } from '../types/index'

export const maintenanceApi = {
    getJobs: (params?: { page?: number; search?: string }) =>
        apiClient.get<PaginatedResponse<MaintenanceJob>>('/api/v1/maintenance/jobs/', { params }),

    getJob: (id: string) =>
        apiClient.get<MaintenanceJob>(`/api/v1/maintenance/jobs/${id}/`),

    createJob: (data: Partial<MaintenanceJob>) =>
        apiClient.post<MaintenanceJob>('/api/v1/maintenance/jobs/', data),

    updateJob: (id: string, data: Partial<MaintenanceJob>) =>
        apiClient.patch<MaintenanceJob>(`/api/v1/maintenance/jobs/${id}/`, data),
}
