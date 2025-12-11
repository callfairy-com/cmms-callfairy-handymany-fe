import { apiClient } from '@/lib/api/client';
import type {
    WorkOrder,
    WorkOrderTask,
    WorkOrderComment,
    WorkOrderAttachment,
    WorkOrderType,
    CreateWorkOrderPayload,
    UpdateWorkOrderPayload,
    AssignWorkOrderPayload,
    CompleteWorkOrderPayload,
    CreateTaskPayload,
    CreateCommentPayload,
    PaginatedResponse,
} from '@/types/workOrder';

/**
 * Work Orders API Client
 * Based on CMMS MVP API Documentation
 */
export const workOrderApi = {
    // Work Order Types
    listWorkOrderTypes: async (params?: Record<string, any>): Promise<PaginatedResponse<WorkOrderType> | WorkOrderType[]> => {
        return apiClient.get('/api/v1/cmms/work-order-types/', { params });
    },

    // Work Order CRUD
    listWorkOrders: async (params?: Record<string, any>): Promise<PaginatedResponse<WorkOrder>> => {
        return apiClient.get('/api/v1/cmms/work-orders/', { params });
    },

    createWorkOrder: async (data: CreateWorkOrderPayload): Promise<WorkOrder> => {
        return apiClient.post('/api/v1/cmms/work-orders/', data);
    },

    getWorkOrder: async (id: string): Promise<WorkOrder> => {
        return apiClient.get(`/api/v1/cmms/work-orders/${id}/`);
    },

    fullUpdateWorkOrder: async (id: string, data: UpdateWorkOrderPayload): Promise<WorkOrder> => {
        return apiClient.put(`/api/v1/cmms/work-orders/${id}/`, data);
    },

    updateWorkOrder: async (id: string, data: Partial<UpdateWorkOrderPayload>): Promise<WorkOrder> => {
        return apiClient.patch(`/api/v1/cmms/work-orders/${id}/`, data);
    },

    deleteWorkOrder: async (id: string): Promise<void> => {
        return apiClient.delete(`/api/v1/cmms/work-orders/${id}/`);
    },

    // Work Order Actions
    assignWorkOrder: async (id: string, data: AssignWorkOrderPayload): Promise<WorkOrder> => {
        return apiClient.post(`/api/v1/cmms/work-orders/${id}/assign/`, data);
    },

    startWorkOrder: async (id: string): Promise<{ message: string }> => {
        return apiClient.post(`/api/v1/cmms/work-orders/${id}/start/`);
    },

    completeWorkOrder: async (id: string, data?: CompleteWorkOrderPayload): Promise<{ message: string }> => {
        return apiClient.post(`/api/v1/cmms/work-orders/${id}/complete/`, data || {});
    },

    closeWorkOrder: async (id: string): Promise<{ message: string }> => {
        return apiClient.post(`/api/v1/cmms/work-orders/${id}/close/`);
    },

    cancelWorkOrder: async (id: string, reason?: string): Promise<{ message: string }> => {
        return apiClient.post(`/api/v1/cmms/work-orders/${id}/cancel/`, reason ? { reason } : {});
    },

    // Work Order Statistics & Costs
    getWorkOrderStats: async (): Promise<{
        total: number;
        by_status: Array<{ status: string; count: number }>;
        by_priority: Array<{ priority: string; count: number }>;
        open: number;
        in_progress: number;
        completed: number;
        overdue: number;
        avg_completion_time: number;
    }> => {
        return apiClient.get('/api/v1/cmms/work-orders/stats/');
    },

    getCostBreakdown: async (id: string): Promise<{
        labor_cost: string;
        parts_cost: string;
        contractor_cost: string;
        other_cost: string;
        total_cost: string;
        currency: string;
    }> => {
        return apiClient.get(`/api/v1/cmms/work-orders/${id}/cost-breakdown/`);
    },

    updateCosts: async (id: string): Promise<{ message: string; work_order: WorkOrder }> => {
        return apiClient.post(`/api/v1/cmms/work-orders/${id}/update-costs/`);
    },


    getOverdueWorkOrders: async (params?: Record<string, any>): Promise<PaginatedResponse<WorkOrder>> => {
        return apiClient.get('/api/v1/cmms/work-orders/overdue/', { params });
    },

    // Work Order Tasks
    listTasks: async (params?: Record<string, any>): Promise<PaginatedResponse<WorkOrderTask>> => {
        return apiClient.get('/api/v1/cmms/work-order-tasks/', { params });
    },

    createTask: async (data: CreateTaskPayload): Promise<WorkOrderTask> => {
        return apiClient.post('/api/v1/cmms/work-order-tasks/', data);
    },

    getTask: async (id: string): Promise<WorkOrderTask> => {
        return apiClient.get(`/api/v1/cmms/work-order-tasks/${id}/`);
    },

    updateTask: async (id: string, data: Partial<CreateTaskPayload>): Promise<WorkOrderTask> => {
        return apiClient.patch(`/api/v1/cmms/work-order-tasks/${id}/`, data);
    },

    deleteTask: async (id: string): Promise<void> => {
        return apiClient.delete(`/api/v1/cmms/work-order-tasks/${id}/`);
    },

    completeTask: async (id: string): Promise<{ message: string; task: WorkOrderTask }> => {
        return apiClient.post(`/api/v1/cmms/work-order-tasks/${id}/complete/`);
    },

    // Work Order Comments
    listComments: async (params?: Record<string, any>): Promise<PaginatedResponse<WorkOrderComment>> => {
        return apiClient.get('/api/v1/cmms/work-order-comments/', { params });
    },

    createComment: async (data: CreateCommentPayload): Promise<WorkOrderComment> => {
        return apiClient.post('/api/v1/cmms/work-order-comments/', data);
    },

    getComment: async (id: string): Promise<WorkOrderComment> => {
        return apiClient.get(`/api/v1/cmms/work-order-comments/${id}/`);
    },

    updateComment: async (id: string, data: Partial<CreateCommentPayload>): Promise<WorkOrderComment> => {
        return apiClient.patch(`/api/v1/cmms/work-order-comments/${id}/`, data);
    },

    deleteComment: async (id: string): Promise<void> => {
        return apiClient.delete(`/api/v1/cmms/work-order-comments/${id}/`);
    },

    // Work Order Attachments
    listAttachments: async (params?: Record<string, any>): Promise<PaginatedResponse<WorkOrderAttachment>> => {
        return apiClient.get('/api/v1/cmms/work-order-attachments/', { params });
    },

    uploadAttachment: async (formData: FormData): Promise<WorkOrderAttachment> => {
        return apiClient.post('/api/v1/cmms/work-order-attachments/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    getAttachment: async (id: string): Promise<WorkOrderAttachment> => {
        return apiClient.get(`/api/v1/cmms/work-order-attachments/${id}/`);
    },

    deleteAttachment: async (id: string): Promise<void> => {
        return apiClient.delete(`/api/v1/cmms/work-order-attachments/${id}/`);
    },
};
