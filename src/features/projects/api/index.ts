import { apiClient } from '@/lib/api/client'
import type { PaginatedResponse } from '@/types/api'
import type { Project, Task } from '../types/index'

export const projectsApi = {
    getProjects: (params?: { page?: number; search?: string; status?: string }) =>
        apiClient.get<PaginatedResponse<Project>>('/api/v1/projects/', { params }),

    getProject: (id: number) =>
        apiClient.get<Project>(`/api/v1/projects/${id}/`),

    createProject: (data: Partial<Project>) =>
        apiClient.post<Project>('/api/v1/projects/', data),

    updateProject: (id: number, data: Partial<Project>) =>
        apiClient.patch<Project>(`/api/v1/projects/${id}/`, data),

    deleteProject: (id: number) =>
        apiClient.delete(`/api/v1/projects/${id}/`),
}

export const tasksApi = {
    getTasks: (params?: { page?: number; search?: string; status?: string; project?: number }) =>
        apiClient.get<PaginatedResponse<Task>>('/api/v1/tasks/', { params }),

    getTask: (id: number) =>
        apiClient.get<Task>(`/api/v1/tasks/${id}/`),

    createTask: (data: Partial<Task>) =>
        apiClient.post<Task>('/api/v1/tasks/', data),

    updateTask: (id: number, data: Partial<Task>) =>
        apiClient.patch<Task>(`/api/v1/tasks/${id}/`, data),

    deleteTask: (id: number) =>
        apiClient.delete(`/api/v1/tasks/${id}/`),
}
