import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Edit2,
    Trash2,
    Package,
    User,
    Calendar,
    DollarSign,
    MapPin,
    CheckSquare,
    MessageSquare,
    Paperclip,
    History,
    Play,
    CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useNotifications } from '@/app/providers/NotificationProvider';
import { workOrderApi } from '@/features/work-orders/services/workOrderApi';
import type { WorkOrder, WorkOrderTask, WorkOrderComment, WorkOrderAttachment, WorkOrderStatus } from '@/types/workOrder';

const statusColors: Record<WorkOrderStatus, string> = {
    draft: 'bg-gray-100 text-gray-700',
    open: 'bg-blue-100 text-blue-700',
    assigned: 'bg-purple-100 text-purple-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    on_hold: 'bg-orange-100 text-orange-700',
    completed: 'bg-green-100 text-green-700',
    closed: 'bg-slate-100 text-slate-700',
    cancelled: 'bg-red-100 text-red-700',
};

type TabType = 'overview' | 'tasks' | 'comments' | 'attachments' | 'history';

const toArray = <T,>(value: T | T[] | null | undefined): T[] => {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    return [value];
};

const getUserDisplayName = (user?: { first_name?: string; last_name?: string; email?: string }): string => {
    if (!user) return 'Unknown';
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return name || user.email || 'Unknown';
};

export default function WorkOrderDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, hasPermission, hasRole } = useAuth();
    const { showToast } = useNotifications();

    // RBAC checks
    // Creation is controlled at routing / list level; here we care about edit/delete/actions on an existing WO
    const isOrgAdminLike = hasRole('orgadmin') || hasRole('superadmin');
    // Allow editing for roles that can create or assign work orders (orgadmin, superadmin, manager)
    const canEditWorkOrders = hasPermission('can_create_work_orders') || hasPermission('can_assign_work_orders');
    // Restrict delete to orgadmin / superadmin only so managers cannot delete
    const canDeleteWorkOrders = isOrgAdminLike;
    const canStartWorkOrder = hasPermission('can_update_work_order_status');
    const canCompleteWorkOrder = hasPermission('can_update_work_order_status');

    const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
    const [tasks, setTasks] = useState<WorkOrderTask[]>([]);
    const [comments, setComments] = useState<WorkOrderComment[]>([]);
    const [attachments, setAttachments] = useState<WorkOrderAttachment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        if (id) {
            loadWorkOrderData();
        }
    }, [id]);

    const loadWorkOrderData = async () => {
        if (!id) return;

        setLoading(true);
        try {
            const [woData, tasksData, commentsData, attachmentsData] = await Promise.all([
                workOrderApi.getWorkOrder(id),
                workOrderApi.listTasks({ work_order: id }).catch(() => ({ results: [] })),
                workOrderApi.listComments({ work_order: id }).catch(() => ({ results: [] })),
                workOrderApi.listAttachments({ work_order: id }).catch(() => ({ results: [] })),
            ]);

            setWorkOrder(woData);
            setTasks(toArray((tasksData as any)?.results || tasksData));
            setComments(toArray((commentsData as any)?.results || commentsData));
            setAttachments(toArray((attachmentsData as any)?.results || attachmentsData));
        } catch (error: any) {
            showToast('error', 'Failed to load work order', error?.message || 'Unable to fetch work order details');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!id || !confirm('Are you sure you want to delete this work order?')) return;

        try {
            await workOrderApi.deleteWorkOrder(id);
            showToast('success', 'Work order deleted', 'Work order has been successfully deleted');
            navigate('/work-orders');
        } catch (error: any) {
            showToast('error', 'Delete failed', error?.message || 'Unable to delete work order');
        }
    };

    const handleStartWorkOrder = async () => {
        if (!id) return;

        try {
            await workOrderApi.startWorkOrder(id);
            showToast('success', 'Work order started', 'Work order status updated to In Progress');
            await loadWorkOrderData();
        } catch (error: any) {
            showToast('error', 'Failed to start', error?.message || 'Unable to start work order');
        }
    };

    const handleCompleteWorkOrder = async () => {
        if (!id) return;

        try {
            await workOrderApi.completeWorkOrder(id);
            showToast('success', 'Work order completed', 'Work order has been marked as completed');
            await loadWorkOrderData();
        } catch (error: any) {
            showToast('error', 'Failed to complete', error?.message || 'Unable to complete work order');
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !newComment.trim()) return;

        setSubmittingComment(true);
        try {
            await workOrderApi.createComment({
                work_order: id,
                comment: newComment,
                is_internal: false,
            });
            setNewComment('');
            showToast('success', 'Comment added', 'Your comment has been posted');
            await loadWorkOrderData();
        } catch (error: any) {
            showToast('error', 'Failed to add comment', error?.message || 'Unable to post comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleCompleteTask = async (taskId: string) => {
        try {
            await workOrderApi.completeTask(taskId);
            showToast('success', 'Task completed', 'Task has been marked as completed');
            await loadWorkOrderData();
        } catch (error: any) {
            showToast('error', 'Failed to complete task', error?.message || 'Unable to complete task');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Loading work order...</p>
            </div>
        );
    }

    if (!workOrder) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Package className="w-16 h-16 text-slate-400 mb-4" />
                <p className="text-lg font-medium text-foreground">Work order not found</p>
                <Link to="/work-orders" className="mt-4 text-sm text-indigo-600 hover:text-indigo-700">
                    ← Back to Work Orders
                </Link>
            </div>
        );
    }

    const tabs: { id: TabType; label: string; icon: any; count?: number }[] = [
        { id: 'overview', label: 'Overview', icon: Package },
        { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: tasks.length },
        { id: 'comments', label: 'Comments', icon: MessageSquare, count: comments.length },
        { id: 'attachments', label: 'Attachments', icon: Paperclip, count: attachments.length },
        { id: 'history', label: 'History', icon: History },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Link
                    to="/work-orders"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Work Orders
                </Link>

                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-foreground">{workOrder.work_order_number}</h1>
                            <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColors[workOrder.status]}`}>
                                {(workOrder as any).status_display || workOrder.status.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-lg text-foreground">{workOrder.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {(workOrder as any).work_order_type_name || (workOrder as any).work_order_type?.name || '—'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Priority:{' '}
                            {(workOrder as any).priority_display || (workOrder as any).priority || '—'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {canStartWorkOrder && workOrder.status === 'assigned' && (
                            <button
                                onClick={handleStartWorkOrder}
                                className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-white px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50"
                            >
                                <Play className="w-4 h-4" />
                                Start
                            </button>
                        )}
                        {canCompleteWorkOrder && workOrder.status === 'in_progress' && (
                            <button
                                onClick={handleCompleteWorkOrder}
                                className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-white px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Complete
                            </button>
                        )}
                        {canEditWorkOrders && (
                            <button
                                onClick={() => navigate(`/work-orders/${id}/edit`)}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-slate-50"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit
                            </button>
                        )}
                        {canDeleteWorkOrders && (
                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 mb-6">
                <div className="flex gap-6">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 pb-3 border-b-2 transition ${
                                    activeTab === tab.id
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm font-medium">{tab.label}</span>
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'overview' && (
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Description */}
                        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6">
                            <h3 className="text-lg font-semibold mb-3">Description</h3>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {workOrder.description || 'No description provided'}
                            </p>
                        </div>

                        {/* Assignment */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Assignment
                            </h3>
                            <dl className="space-y-3">
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Assigned To</dt>
                                    <dd className="mt-1 text-sm text-foreground">
                                        {(() => {
                                            const wo: any = workOrder as any;
                                            // Prefer explicit display/name fields from API
                                            const flatName =
                                                wo.assigned_to_name ||
                                                wo.assigned_to_full_name ||
                                                wo.assigned_to_display;
                                            if (flatName) return flatName;

                                            // If we have an object, format it nicely
                                            if (wo.assigned_to && typeof wo.assigned_to === 'object') {
                                                return getUserDisplayName(wo.assigned_to);
                                            }

                                            // If we have an ID string or email, show that instead of "Unassigned"
                                            if (typeof wo.assigned_to === 'string' && wo.assigned_to) {
                                                return wo.assigned_to_email || wo.assigned_to;
                                            }

                                            return 'Unassigned';
                                        })()}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Assigned By</dt>
                                    <dd className="mt-1 text-sm text-foreground">
                                        {(workOrder as any).assigned_by_name ||
                                            (workOrder as any).assigned_by_email ||
                                            (user ? getUserDisplayName(user as any) : '—')}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Created By</dt>
                                    <dd className="mt-1 text-sm text-foreground">
                                        {(workOrder as any).created_by_name
                                            || (workOrder as any).created_by_email
                                            || getUserDisplayName((workOrder as any).created_by as any)}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Schedule */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Schedule
                            </h3>
                            <dl className="space-y-3">
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Scheduled Start</dt>
                                    <dd className="mt-1 text-sm text-foreground">
                                        {workOrder.scheduled_start
                                            ? new Date(workOrder.scheduled_start).toLocaleString()
                                            : '—'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Due Date</dt>
                                    <dd className="mt-1 text-sm text-foreground">
                                        {workOrder.due_date ? new Date(workOrder.due_date).toLocaleString() : '—'}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Location */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Location
                            </h3>
                            <dl className="space-y-3">
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Site</dt>
                                    <dd className="mt-1 text-sm text-foreground">
                                        {(workOrder as any).site_name || (workOrder as any).site?.name || '—'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Building</dt>
                                    <dd className="mt-1 text-sm text-foreground">
                                        {(workOrder as any).building_name || (workOrder as any).building?.name || '—'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Asset</dt>
                                    <dd className="mt-1 text-sm text-foreground">
                                        {(workOrder as any).asset_name || (workOrder as any).asset?.name || '—'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Location Notes</dt>
                                    <dd className="mt-1 text-sm text-foreground">
                                        {(workOrder as any).location_notes || '—'}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Cost & Time */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <DollarSign className="w-5 h-5" />
                                Cost & Time
                            </h3>
                            <dl className="space-y-3">
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Estimated Hours</dt>
                                    <dd className="mt-1 text-sm text-foreground">{workOrder.estimated_hours || '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Actual Hours</dt>
                                    <dd className="mt-1 text-sm text-foreground">{workOrder.actual_hours || '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Estimated Cost</dt>
                                    <dd className="mt-1 text-sm text-foreground">
                                        {((workOrder as any).currency || 'USD')}{' '}
                                        {workOrder.estimated_cost || '0.00'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Actual Cost</dt>
                                    <dd className="mt-1 text-sm font-semibold text-foreground">
                                        {((workOrder as any).currency || 'USD')}{' '}
                                        {workOrder.actual_cost || '0.00'}
                                    </dd>
                                </div>
                                {(workOrder as any).tags && (workOrder as any).tags.length > 0 && (
                                    <div>
                                        <dt className="text-xs font-medium text-muted-foreground uppercase">Tags</dt>
                                        <dd className="mt-1 flex flex-wrap gap-1">
                                            {(workOrder as any).tags.map((tag: string) => (
                                                <span
                                                    key={tag}
                                                    className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>
                )}

                {activeTab === 'tasks' && (
                    <div>
                        {tasks.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
                                <CheckSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                <p className="text-sm font-medium text-foreground">No tasks yet</p>
                                <p className="text-xs text-muted-foreground mt-1">Tasks will appear here once added</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="rounded-lg border border-slate-200 bg-white p-4 flex items-start gap-3"
                                    >
                                        <button
                                            onClick={() => !task.is_completed && handleCompleteTask(task.id)}
                                            disabled={task.is_completed}
                                            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                                                task.is_completed
                                                    ? 'border-green-500 bg-green-500'
                                                    : 'border-slate-300 hover:border-indigo-500'
                                            }`}
                                        >
                                            {task.is_completed && <CheckCircle className="w-4 h-4 text-white" />}
                                        </button>
                                        <div className="flex-1">
                                            <h4
                                                className={`font-medium text-sm ${
                                                    task.is_completed
                                                        ? 'line-through text-muted-foreground'
                                                        : 'text-foreground'
                                                }`}
                                            >
                                                {task.title}
                                            </h4>
                                            {task.description && (
                                                <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                                            )}
                                            {task.completed_at && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Completed: {new Date(task.completed_at).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'comments' && (
                    <div className="space-y-4">
                        {/* Add Comment Form */}
                        <form onSubmit={handleAddComment} className="rounded-2xl border border-slate-200 bg-white p-4">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                            />
                            <div className="mt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || submittingComment}
                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submittingComment ? 'Posting...' : 'Post Comment'}
                                </button>
                            </div>
                        </form>

                        {/* Comments List */}
                        {comments.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
                                <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                <p className="text-sm font-medium text-foreground">No comments yet</p>
                                <p className="text-xs text-muted-foreground mt-1">Be the first to comment</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    {getUserDisplayName(comment.created_by as any)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(comment.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            {comment.is_internal && (
                                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                                    Internal
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-foreground whitespace-pre-wrap">{comment.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'attachments' && (
                    <div>
                        {attachments.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
                                <Paperclip className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                <p className="text-sm font-medium text-foreground">No attachments</p>
                                <p className="text-xs text-muted-foreground mt-1">Attachments will appear here</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-3">
                                {attachments.map((attachment) => (
                                    <div key={attachment.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-indigo-100 p-2">
                                                <Paperclip className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm text-foreground truncate">
                                                    {attachment.file_name}
                                                </h4>
                                                <p className="text-xs text-muted-foreground">
                                                    {(attachment.file_size / 1024).toFixed(2)} KB
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {new Date(attachment.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
                        <History className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-foreground">History coming soon</p>
                        <p className="text-xs text-muted-foreground mt-1">Track all changes to this work order</p>
                    </div>
                )}
            </div>
        </div>
    );
}
