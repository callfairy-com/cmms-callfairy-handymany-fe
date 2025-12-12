import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Wrench,
    Plus,
    Search,
    Filter,
    CheckCircle,
    Clock,
    Edit,
    Trash2,
    AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useNotifications } from '@/app/providers/NotificationProvider';
import { maintenanceApi } from '@/features/maintenance/services/maintenanceApi';
import type {
    MaintenanceHistory,
    MaintenanceDashboard,
    MaintenanceStatus,
    MaintenancePriority,
} from '@/types/maintenance';

const statusColors: Record<MaintenanceStatus, string> = {
    scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200',
    in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-200',
    completed: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200',
    cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-200',
    overdue: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200',
    on_hold: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200',
};

const priorityColors: Record<MaintenancePriority, string> = {
    low: 'bg-slate-100 text-slate-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
};

export default function PreventativeMaintenance() {
    const { user, hasPermission } = useAuth();
    const { showToast } = useNotifications();
    const navigate = useNavigate();

    // RBAC checks
    const canCreateMaintenance = hasPermission('can_create_work_orders');
    const canStartMaintenance = hasPermission('can_accept_work_orders');

    const [maintenanceList, setMaintenanceList] = useState<MaintenanceHistory[]>([]);
    const [dashboard, setDashboard] = useState<MaintenanceDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'all'>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<MaintenancePriority | 'all'>('all');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [maintenanceToDelete, setMaintenanceToDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (user?.organization_id) {
            loadData();
        }
    }, [user?.organization_id, statusFilter, typeFilter, priorityFilter]);

    const loadData = async () => {
        if (!user?.organization_id) return;

        setLoading(true);
        try {
            const [dashboardData, maintenanceData] = await Promise.all([
                maintenanceApi.getDashboard({ organization: user.organization_id }),
                maintenanceApi.listHistory({
                    organization: user.organization_id,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
                })
            ]);
            setDashboard(dashboardData);
            setMaintenanceList(maintenanceData.results || []);
        } catch (error: any) {
            showToast('error', 'Failed to load maintenance data', error?.message || 'Unable to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, maintenanceId: string) => {
        e.stopPropagation(); // Prevent card click navigation
        setMaintenanceToDelete(maintenanceId);
        setDeleteModalOpen(true);
    };

    const handleEditClick = (e: React.MouseEvent, maintenanceId: string) => {
        e.stopPropagation(); // Prevent card click navigation
        navigate(`/preventative-maintenance/${maintenanceId}/edit`);
    };

    const handleDeleteConfirm = async () => {
        if (!maintenanceToDelete) return;
        
        setDeleting(true);
        try {
            await maintenanceApi.deleteHistory(maintenanceToDelete);
            showToast('success', 'Maintenance deleted', 'Maintenance task has been successfully deleted');
            setDeleteModalOpen(false);
            setMaintenanceToDelete(null);
            loadData(); // Refresh the list
        } catch (error: any) {
            showToast('error', 'Failed to delete maintenance', error?.message || 'Unable to delete maintenance task');
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModalOpen(false);
        setMaintenanceToDelete(null);
    };

    const handleStartMaintenance = async (id: string) => {
        try {
            await maintenanceApi.startMaintenance(id);
            showToast('success', 'Maintenance started', 'Work has been marked as in progress');
            loadData();
        } catch (error: any) {
            showToast('error', 'Failed to start', error?.message || 'Unable to start maintenance');
        }
    };

    const filteredMaintenance = maintenanceList.filter((m) =>
        searchTerm
            ? m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              m.description?.toLowerCase().includes(searchTerm.toLowerCase())
            : true
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Loading maintenance...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-bold text-foreground">Preventative Maintenance</h1>
                    {canCreateMaintenance && (
                        <button
                            onClick={() => navigate('/preventative-maintenance/new')}
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            <Plus className="w-4 h-4" />
                            New Maintenance
                        </button>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                    Schedule and track preventative maintenance tasks
                </p>
            </div>

            {/* Dashboard Stats */}
            {dashboard && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-muted-foreground">Total</p>
                            <Calendar className="w-5 h-5 text-slate-400" />
                        </div>
                        <p className="text-3xl font-bold text-foreground">{dashboard.total_maintenance}</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                            <Clock className="w-5 h-5 text-yellow-500" />
                        </div>
                        <p className="text-3xl font-bold text-foreground">{dashboard.in_progress}</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                            <AlertCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <p className="text-3xl font-bold text-red-600">{dashboard.overdue}</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-muted-foreground">Completed</p>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <p className="text-3xl font-bold text-foreground">{dashboard.completed}</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search maintenance..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-slate-50"
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                </div>

                {showFilters && (
                    <div className="grid gap-4 md:grid-cols-3 p-4 rounded-lg border border-slate-200 bg-slate-50">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as MaintenanceStatus | 'all')}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="all">All Statuses</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="overdue">Overdue</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Type</label>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="all">All Types</option>
                                <option value="preventive">Preventive</option>
                                <option value="corrective">Corrective</option>
                                <option value="predictive">Predictive</option>
                                <option value="emergency">Emergency</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value as MaintenancePriority | 'all')}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="all">All Priorities</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Maintenance List */}
            <div className="space-y-4">
                {filteredMaintenance.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                        <Wrench className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-foreground">No maintenance records found</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {canCreateMaintenance
                                ? 'Create your first maintenance task to get started'
                                : 'No maintenance tasks assigned yet'}
                        </p>
                    </div>
                ) : (
                    filteredMaintenance.map((maintenance) => (
                        <div
                            key={maintenance.id}
                            className="group rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-indigo-200"
                            onClick={() => navigate(`/preventative-maintenance/${maintenance.id}`)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-foreground group-hover:text-indigo-600 transition-colors">{maintenance.title}</h3>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[maintenance.status]}`}
                                        >
                                            {maintenance.status.replace('_', ' ')}
                                        </span>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${priorityColors[maintenance.priority]}`}
                                        >
                                            {maintenance.priority}
                                        </span>
                                    </div>
                                    {maintenance.description && (
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{maintenance.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Wrench className="w-3 h-3" />
                                            {maintenance.maintenance_type}
                                        </span>
                                        {maintenance.asset_name && (
                                            <span>Asset: {maintenance.asset_name}</span>
                                        )}
                                        {maintenance.assigned_to_name && (
                                            <span>Assigned: {maintenance.assigned_to_name}</span>
                                        )}
                                        {maintenance.scheduled_date && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(maintenance.scheduled_date).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Action Buttons */}
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    {maintenance.status === 'scheduled' && canStartMaintenance && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleStartMaintenance(maintenance.id);
                                            }}
                                            className="inline-flex items-center gap-1 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-200 transition-colors"
                                        >
                                            <CheckCircle className="w-3 h-3" />
                                            Start
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => handleEditClick(e, maintenance.id)}
                                        className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200 transition-colors"
                                    >
                                        <Edit className="w-3 h-3" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteClick(e, maintenance.id)}
                                        className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Delete Maintenance Task</h3>
                                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-6">
                            Are you sure you want to delete this maintenance task? All associated data will be permanently removed.
                        </p>
                        <div className="flex items-center gap-3 justify-end">
                            <button
                                onClick={handleDeleteCancel}
                                disabled={deleting}
                                className="px-4 py-2 text-sm font-medium text-foreground border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deleting}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {deleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Delete Task
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
