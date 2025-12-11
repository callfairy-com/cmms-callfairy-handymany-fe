import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    AlertCircle,
    Clock,
    CheckCircle,
    Package,
    User,
    Calendar,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { workOrderApi } from '@/features/workOrders/api/workOrderApi';
import type { WorkOrder, WorkOrderStatus, WorkOrderPriority } from '@/types/workOrder';

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

const priorityColors: Record<WorkOrderPriority, string> = {
    low: 'bg-slate-100 text-slate-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
    emergency: 'bg-red-500 text-white',
};

export default function WorkOrders() {
    const { user, hasPermission } = useAuth();
    const { showToast } = useNotifications();
    const navigate = useNavigate();

    // RBAC checks
    const canCreateWorkOrders = hasPermission('can_create_work_orders');
    const canViewAllWorkOrders = hasPermission('can_view_all_work_orders');

    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');

    useEffect(() => {
        loadWorkOrders();
    }, [user?.organization_id]);

    const loadWorkOrders = async () => {
        if (!user?.organization_id) {
            setWorkOrders([]);
            return;
        }

        setLoading(true);
        try {
            const response = await workOrderApi.listWorkOrders(
                canViewAllWorkOrders
                    ? {
                          organization: user.organization_id,
                          page_size: 100,
                      }
                    : {
                          organization: user.organization_id,
                          assigned_to: user.id,
                          page_size: 100,
                      },
            );

            const normalizedResults: WorkOrder[] = Array.isArray(response)
                ? response
                : response && Array.isArray(response.results)
                    ? response.results
                    : [];

            setWorkOrders(normalizedResults);
        } catch (error: any) {
            showToast('error', 'Failed to load work orders', error?.message || 'Unable to fetch work orders');
            setWorkOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredWorkOrders = workOrders.filter((wo) => {
        const matchesSearch =
            wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            wo.work_order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            wo.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || wo.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    const stats = {
        total: filteredWorkOrders.length,
        open: filteredWorkOrders.filter((wo) => wo.status === 'open').length,
        inProgress: filteredWorkOrders.filter((wo) => wo.status === 'in_progress').length,
        completed: filteredWorkOrders.filter((wo) => wo.status === 'completed').length,
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Work Orders</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage and track maintenance work orders
                    </p>
                </div>
                {canCreateWorkOrders && (
                    <button
                        onClick={() => navigate('/work-orders/new')}
                        className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
                    >
                        <Plus className="w-4 h-4" />
                        Create Work Order
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="mb-6 grid gap-4 md:grid-cols-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search work orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                >
                    <option value="all">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="open">Open</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="closed">Closed</option>
                    <option value="cancelled">Cancelled</option>
                </select>

                <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                </select>
            </div>

            {/* Stats */}
            <div className="mb-6 grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-indigo-100 p-2 dark:bg-indigo-500/20">
                            <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                            <p className="text-xs text-muted-foreground">Total Work Orders</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-500/20">
                            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{stats.open}</p>
                            <p className="text-xs text-muted-foreground">Open</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-500/20">
                            <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
                            <p className="text-xs text-muted-foreground">In Progress</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-green-100 p-2 dark:bg-green-500/20">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
                            <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Work Orders List */}
            {loading ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
                    <p className="text-sm text-muted-foreground">Loading work orders...</p>
                </div>
            ) : filteredWorkOrders.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
                    <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">No work orders found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Get started by creating your first work order'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredWorkOrders.map((wo) => (
                        <div
                            key={wo.id}
                            onClick={() => navigate(`/work-orders/${wo.id}`)}
                            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-foreground group-hover:text-indigo-600">
                                            {wo.work_order_number}
                                        </h3>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                                                statusColors[wo.status]
                                            }`}
                                        >
                                            {((wo as any).status_display as string) ||
                                                wo.status.replace('_', ' ')}
                                        </span>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                                                priorityColors[wo.priority]
                                            }`}
                                        >
                                            {((wo as any).priority_display as string) || wo.priority}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-foreground">{wo.title}</p>
                                    {wo.description && (
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {wo.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
                                {/* Work Order Type */}
                                {(((wo as any).work_order_type_name as string) || (wo as any).work_order_type?.name) && (
                                    <div className="flex items-center gap-1.5">
                                        <Package className="w-3.5 h-3.5" />
                                        <span>
                                            {(wo as any).work_order_type_name ||
                                                (wo as any).work_order_type?.name}
                                        </span>
                                    </div>
                                )}

                                {/* Assigned To */}
                                {(((wo as any).assigned_to_name as string) || (wo as any).assigned_to_display || (wo as any).assigned_to) && (
                                    <div className="flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" />
                                        <span>
                                            {(() => {
                                                const anyWo: any = wo as any;
                                                const flatName =
                                                    anyWo.assigned_to_name ||
                                                    anyWo.assigned_to_full_name ||
                                                    anyWo.assigned_to_display;
                                                if (flatName) return flatName;

                                                if (anyWo.assigned_to && typeof anyWo.assigned_to === 'object') {
                                                    const name = `${anyWo.assigned_to.first_name || ''} ${
                                                        anyWo.assigned_to.last_name || ''
                                                    }`.trim();
                                                    return name || anyWo.assigned_to.email || 'Unassigned';
                                                }

                                                if (typeof anyWo.assigned_to === 'string' && anyWo.assigned_to) {
                                                    return anyWo.assigned_to_email || anyWo.assigned_to;
                                                }

                                                return 'Unassigned';
                                            })()}
                                        </span>
                                    </div>
                                )}

                                {/* Site */}
                                {(((wo as any).site_name as string) || (wo as any).site?.name) && (
                                    <div className="flex items-center gap-1.5">
                                        <Package className="w-3.5 h-3.5" />
                                        <span>{(wo as any).site_name || (wo as any).site?.name}</span>
                                    </div>
                                )}
                                {wo.due_date && (
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>Due: {new Date(wo.due_date).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
