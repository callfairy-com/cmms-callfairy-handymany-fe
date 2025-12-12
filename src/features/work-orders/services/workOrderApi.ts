import { apiClient } from '@/lib/api/client';
import { CMMS_ENDPOINTS } from '@/config';
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
        return apiClient.get(CMMS_ENDPOINTS.WORK_ORDERS.TYPES, { params });
    },

    // Work Order CRUD
    listWorkOrders: async (params?: Record<string, any>): Promise<PaginatedResponse<WorkOrder>> => {
        return apiClient.get(CMMS_ENDPOINTS.WORK_ORDERS.LIST, { params });
    },

    createWorkOrder: async (data: CreateWorkOrderPayload): Promise<WorkOrder> => {
        return apiClient.post(CMMS_ENDPOINTS.WORK_ORDERS.CREATE, data);
    },

    getWorkOrder: async (id: string): Promise<WorkOrder> => {
        return apiClient.get(CMMS_ENDPOINTS.WORK_ORDERS.DETAIL(id));
    },

    fullUpdateWorkOrder: async (id: string, data: UpdateWorkOrderPayload): Promise<WorkOrder> => {
        return apiClient.put(CMMS_ENDPOINTS.WORK_ORDERS.UPDATE(id), data);
    },

    updateWorkOrder: async (id: string, data: Partial<UpdateWorkOrderPayload>): Promise<WorkOrder> => {
        return apiClient.patch(CMMS_ENDPOINTS.WORK_ORDERS.UPDATE(id), data);
    },

    deleteWorkOrder: async (id: string): Promise<void> => {
        return apiClient.delete(CMMS_ENDPOINTS.WORK_ORDERS.DELETE(id));
    },

    // Work Order Actions
    assignWorkOrder: async (id: string, data: AssignWorkOrderPayload): Promise<WorkOrder> => {
        return apiClient.post(CMMS_ENDPOINTS.WORK_ORDERS.ASSIGN(id), data);
    },

    startWorkOrder: async (id: string): Promise<{ message: string }> => {
        return apiClient.post(CMMS_ENDPOINTS.WORK_ORDERS.START(id));
    },

    completeWorkOrder: async (id: string, data?: CompleteWorkOrderPayload): Promise<{ message: string }> => {
        return apiClient.post(CMMS_ENDPOINTS.WORK_ORDERS.COMPLETE(id), data || {});
    },

    closeWorkOrder: async (id: string): Promise<{ message: string }> => {
        return apiClient.post(CMMS_ENDPOINTS.WORK_ORDERS.CLOSE(id));
    },

    cancelWorkOrder: async (id: string, reason?: string): Promise<{ message: string }> => {
        return apiClient.post(CMMS_ENDPOINTS.WORK_ORDERS.CANCEL(id), reason ? { reason } : {});
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
        return apiClient.get(CMMS_ENDPOINTS.WORK_ORDERS.STATS);
    },

    getCostBreakdown: async (id: string): Promise<{
        labor_cost: string;
        parts_cost: string;
        contractor_cost: string;
        other_cost: string;
        total_cost: string;
        currency: string;
    }> => {
        return apiClient.get(CMMS_ENDPOINTS.WORK_ORDERS.COST_BREAKDOWN(id));
    },

    updateCosts: async (id: string): Promise<{ message: string; work_order: WorkOrder }> => {
        return apiClient.post(CMMS_ENDPOINTS.WORK_ORDERS.UPDATE_COSTS(id));
    },


    getOverdueWorkOrders: async (params?: Record<string, any>): Promise<PaginatedResponse<WorkOrder>> => {
        return apiClient.get(CMMS_ENDPOINTS.WORK_ORDERS.OVERDUE, { params });
    },

    // Work Order Tasks
    listTasks: async (params?: Record<string, any>): Promise<PaginatedResponse<WorkOrderTask>> => {
        return apiClient.get(CMMS_ENDPOINTS.WORK_ORDERS.TASKS, { params });
    },

    createTask: async (data: CreateTaskPayload): Promise<WorkOrderTask> => {
        return apiClient.post(CMMS_ENDPOINTS.WORK_ORDERS.TASKS, data);
    },

    getTask: async (id: string): Promise<WorkOrderTask> => {
        return apiClient.get(CMMS_ENDPOINTS.WORK_ORDERS.TASK_DETAIL(id));
    },

    updateTask: async (id: string, data: Partial<CreateTaskPayload>): Promise<WorkOrderTask> => {
        return apiClient.patch(CMMS_ENDPOINTS.WORK_ORDERS.TASK_DETAIL(id), data);
    },

    deleteTask: async (id: string): Promise<void> => {
        return apiClient.delete(CMMS_ENDPOINTS.WORK_ORDERS.TASK_DETAIL(id));
    },

    completeTask: async (id: string): Promise<{ message: string; task: WorkOrderTask }> => {
        return apiClient.post(CMMS_ENDPOINTS.WORK_ORDERS.TASK_COMPLETE(id));
    },

    // Work Order Comments
    listComments: async (params?: Record<string, any>): Promise<PaginatedResponse<WorkOrderComment>> => {
        return apiClient.get(CMMS_ENDPOINTS.WORK_ORDERS.COMMENTS, { params });
    },

    createComment: async (data: CreateCommentPayload): Promise<WorkOrderComment> => {
        return apiClient.post(CMMS_ENDPOINTS.WORK_ORDERS.COMMENTS, data);
    },

    getComment: async (id: string): Promise<WorkOrderComment> => {
        return apiClient.get(CMMS_ENDPOINTS.WORK_ORDERS.COMMENT_DETAIL(id));
    },

    updateComment: async (id: string, data: Partial<CreateCommentPayload>): Promise<WorkOrderComment> => {
        return apiClient.patch(CMMS_ENDPOINTS.WORK_ORDERS.COMMENT_DETAIL(id), data);
    },

    deleteComment: async (id: string): Promise<void> => {
        return apiClient.delete(CMMS_ENDPOINTS.WORK_ORDERS.COMMENT_DETAIL(id));
    },

    // Work Order Attachments
    listAttachments: async (params?: Record<string, any>): Promise<PaginatedResponse<WorkOrderAttachment>> => {
        return apiClient.get(CMMS_ENDPOINTS.WORK_ORDERS.ATTACHMENTS, { params });
    },

    uploadAttachment: async (formData: FormData): Promise<WorkOrderAttachment> => {
        return apiClient.post(CMMS_ENDPOINTS.WORK_ORDERS.ATTACHMENTS, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    getAttachment: async (id: string): Promise<WorkOrderAttachment> => {
        return apiClient.get(CMMS_ENDPOINTS.WORK_ORDERS.ATTACHMENT_DETAIL(id));
    },

    deleteAttachment: async (id: string): Promise<void> => {
        return apiClient.delete(CMMS_ENDPOINTS.WORK_ORDERS.ATTACHMENT_DETAIL(id));
    },
};
