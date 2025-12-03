import { apiClient } from '@/lib/api/client'
import type { PaginatedResponse } from '@/types/api'
import type {
    Client,
    ClientCategory,
    Lead,
    LeadSource,
    LeadPipeline,
    LeadStage,
    Deal
} from '../types/index'

export const crmApi = {
    // Clients
    getClients: (params?: { page?: number; search?: string }) =>
        apiClient.get<PaginatedResponse<Client>>('/api/v1/crm/clients/', { params }),

    getClient: (id: number) =>
        apiClient.get<Client>(`/api/v1/crm/clients/${id}/`),

    createClient: (data: Partial<Client>) =>
        apiClient.post<Client>('/api/v1/crm/clients/', data),

    updateClient: (id: number, data: Partial<Client>) =>
        apiClient.patch<Client>(`/api/v1/crm/clients/${id}/`, data),

    deleteClient: (id: number) =>
        apiClient.delete(`/api/v1/crm/clients/${id}/`),

    // Client Categories
    getClientCategories: () =>
        apiClient.get<ClientCategory[]>('/api/v1/crm/client-categories/'),

    createClientCategory: (data: Partial<ClientCategory>) =>
        apiClient.post<ClientCategory>('/api/v1/crm/client-categories/', data),

    // Leads
    getLeads: (params?: { page?: number; search?: string; stage?: number }) =>
        apiClient.get<PaginatedResponse<Lead>>('/api/v1/crm/leads/', { params }),

    getLead: (id: number) =>
        apiClient.get<Lead>(`/api/v1/crm/leads/${id}/`),

    createLead: (data: Partial<Lead>) =>
        apiClient.post<Lead>('/api/v1/crm/leads/', data),

    updateLead: (id: number, data: Partial<Lead>) =>
        apiClient.patch<Lead>(`/api/v1/crm/leads/${id}/`, data),

    deleteLead: (id: number) =>
        apiClient.delete(`/api/v1/crm/leads/${id}/`),

    // Lead Sources
    getLeadSources: () =>
        apiClient.get<LeadSource[]>('/api/v1/crm/lead-sources/'),

    createLeadSource: (data: Partial<LeadSource>) =>
        apiClient.post<LeadSource>('/api/v1/crm/lead-sources/', data),

    // Lead Pipelines
    getLeadPipelines: () =>
        apiClient.get<LeadPipeline[]>('/api/v1/crm/lead-pipelines/'),

    getLeadStages: (pipelineId?: number) =>
        apiClient.get<LeadStage[]>('/api/v1/crm/lead-stages/', {
            params: pipelineId ? { pipeline: pipelineId } : undefined
        }),

    // Deals
    getDeals: (params?: { page?: number; search?: string; status?: string }) =>
        apiClient.get<PaginatedResponse<Deal>>('/api/v1/crm/deals/', { params }),

    getDeal: (id: number) =>
        apiClient.get<Deal>(`/api/v1/crm/deals/${id}/`),

    createDeal: (data: Partial<Deal>) =>
        apiClient.post<Deal>('/api/v1/crm/deals/', data),

    updateDeal: (id: number, data: Partial<Deal>) =>
        apiClient.patch<Deal>(`/api/v1/crm/deals/${id}/`, data),

    deleteDeal: (id: number) =>
        apiClient.delete(`/api/v1/crm/deals/${id}/`),
}
