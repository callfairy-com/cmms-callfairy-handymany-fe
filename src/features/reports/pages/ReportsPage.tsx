import { useState, useEffect } from 'react';
import {
    BarChart3,
    PieChart,
    TrendingUp,
    FileText,
    Plus,
    Download,
    RefreshCw,
    Calendar,
    Filter,
    Eye,
    Trash2,
    Clock,
    CheckCircle,
    AlertCircle,
    Target,
    Activity,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useNotifications } from '@/app/providers/NotificationProvider';
import { reportsApi } from '@/features/reports/api/reportsApi';
import type {
    Report,
    ReportTemplate,
    KPI,
    ReportStatus,
    ReportFormat,
} from '@/types/reports';

type TabType = 'reports' | 'templates' | 'kpis' | 'analytics';

export default function Reports() {
    const { user, hasPermission } = useAuth();
    const { showToast } = useNotifications();

    // RBAC checks
    const canCreateReports = hasPermission('can_manage_organization');
    const canDeleteReports = hasPermission('can_manage_organization');

    // State
    const [activeTab, setActiveTab] = useState<TabType>('reports');
    const [reports, setReports] = useState<Report[]>([]);
    const [templates, setTemplates] = useState<ReportTemplate[]>([]);
    const [kpis, setKPIs] = useState<KPI[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');

    // Generate Report Modal
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [generateForm, setGenerateForm] = useState({
        template_id: '',
        name: '',
        description: '',
        format: 'pdf' as ReportFormat,
        date_range_start: '',
        date_range_end: '',
    });

    // Delete Modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; type: 'report' | 'template' | 'kpi' } | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (user?.organization_id) {
            loadData();
        }
    }, [user?.organization_id, activeTab, statusFilter]);

    const loadData = async () => {
        if (!user?.organization_id) return;

        setLoading(true);
        try {
            const params: Record<string, any> = {
                organization: user.organization_id,
                page_size: 50,
            };

            if (activeTab === 'reports') {
                if (statusFilter !== 'all') params.status = statusFilter;
                const response = await reportsApi.listReports(params);
                setReports(response.results || []);
            } else if (activeTab === 'templates') {
                params.is_active = true;
                const response = await reportsApi.listReportTemplates(params);
                setTemplates(response.results || []);
            } else if (activeTab === 'kpis') {
                params.is_active = true;
                const response = await reportsApi.listKPIs(params);
                setKPIs(response.results || []);
            }
        } catch (error: any) {
            showToast('error', 'Failed to load data', error?.message || 'Unable to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = async () => {
        if (!generateForm.name.trim()) {
            showToast('error', 'Validation Error', 'Report name is required');
            return;
        }

        setGenerating(true);
        try {
            await reportsApi.generateReport({
                template_id: generateForm.template_id || undefined,
                name: generateForm.name.trim(),
                description: generateForm.description.trim() || undefined,
                format: generateForm.format,
                date_range_start: generateForm.date_range_start || undefined,
                date_range_end: generateForm.date_range_end || undefined,
            });
            showToast('success', 'Report Generated', 'Report has been queued for generation');
            setShowGenerateModal(false);
            setGenerateForm({
                template_id: '',
                name: '',
                description: '',
                format: 'pdf',
                date_range_start: '',
                date_range_end: '',
            });
            loadData();
        } catch (error: any) {
            showToast('error', 'Generation Failed', error?.message || 'Unable to generate report');
        } finally {
            setGenerating(false);
        }
    };

    const handleExportReport = async (report: Report) => {
        try {
            const blob = await reportsApi.exportReport(report.id, report.format === 'excel' ? 'excel' : 'csv');
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${report.name}.${report.format === 'excel' ? 'xlsx' : 'csv'}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showToast('success', 'Export Started', 'Report download has started');
        } catch (error: any) {
            showToast('error', 'Export Failed', error?.message || 'Unable to export report');
        }
    };

    const handleCalculateKPI = async (kpi: KPI) => {
        try {
            await reportsApi.calculateKPI(kpi.id);
            showToast('success', 'KPI Calculated', `${kpi.name} has been recalculated`);
            loadData();
        } catch (error: any) {
            showToast('error', 'Calculation Failed', error?.message || 'Unable to calculate KPI');
        }
    };

    const handleDeleteClick = (id: string, name: string, type: 'report' | 'template' | 'kpi') => {
        setItemToDelete({ id, name, type });
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;

        setDeleting(true);
        try {
            if (itemToDelete.type === 'report') {
                await reportsApi.deleteReport(itemToDelete.id);
            } else if (itemToDelete.type === 'template') {
                await reportsApi.deleteReportTemplate(itemToDelete.id);
            } else if (itemToDelete.type === 'kpi') {
                await reportsApi.deleteKPI(itemToDelete.id);
            }
            showToast('success', 'Deleted', `${itemToDelete.name} has been deleted`);
            setDeleteModalOpen(false);
            setItemToDelete(null);
            loadData();
        } catch (error: any) {
            showToast('error', 'Delete Failed', error?.message || 'Unable to delete item');
        } finally {
            setDeleting(false);
        }
    };

    const getStatusBadge = (status: ReportStatus) => {
        const styles: Record<ReportStatus, string> = {
            pending: 'bg-yellow-100 text-yellow-700',
            processing: 'bg-blue-100 text-blue-700',
            completed: 'bg-green-100 text-green-700',
            failed: 'bg-red-100 text-red-700',
        };
        const icons: Record<ReportStatus, React.ReactNode> = {
            pending: <Clock className="w-3 h-3" />,
            processing: <RefreshCw className="w-3 h-3 animate-spin" />,
            completed: <CheckCircle className="w-3 h-3" />,
            failed: <AlertCircle className="w-3 h-3" />,
        };
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
                {icons[status]}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
        if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
        if (trend === 'down') return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
        return <Activity className="w-4 h-4 text-gray-400" />;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Generate reports, track KPIs, and analyze data
                    </p>
                </div>
                {canCreateReports && activeTab === 'reports' && (
                    <button
                        onClick={() => setShowGenerateModal(true)}
                        className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
                    >
                        <Plus className="w-4 h-4" />
                        Generate Report
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-6 w-fit dark:bg-slate-800">
                {[
                    { id: 'reports', label: 'Reports', icon: FileText },
                    { id: 'templates', label: 'Templates', icon: BarChart3 },
                    { id: 'kpis', label: 'KPIs', icon: Target },
                    { id: 'analytics', label: 'Analytics', icon: PieChart },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === tab.id
                                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400'
                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filters for Reports Tab */}
            {activeTab === 'reports' && (
                <div className="flex items-center gap-3 mb-6">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'all')}
                        className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                    </select>
                    <button
                        onClick={loadData}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-700"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
                    <RefreshCw className="w-8 h-8 text-slate-400 mx-auto mb-3 animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            ) : (
                <>
                    {/* Reports Tab */}
                    {activeTab === 'reports' && (
                        <div className="space-y-4">
                            {reports.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
                                    <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                    <p className="text-sm font-medium text-foreground">No reports found</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Generate your first report to get started
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {reports.map((report) => (
                                        <div
                                            key={report.id}
                                            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow dark:border-slate-700 dark:bg-slate-900"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="font-semibold text-foreground">{report.name}</h3>
                                                        {getStatusBadge(report.status)}
                                                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600 uppercase">
                                                            {report.format}
                                                        </span>
                                                    </div>
                                                    {report.description && (
                                                        <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                        {report.generated_at && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                Generated: {new Date(report.generated_at).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                        {report.row_count !== undefined && (
                                                            <span>{report.row_count} rows</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {report.status === 'completed' && (
                                                        <button
                                                            onClick={() => handleExportReport(report)}
                                                            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                                                            title="Download"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {/* View report details */}}
                                                        className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                                        title="View"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {canDeleteReports && (
                                                        <button
                                                            onClick={() => handleDeleteClick(report.id, report.name, 'report')}
                                                            className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Templates Tab */}
                    {activeTab === 'templates' && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {templates.length === 0 ? (
                                <div className="col-span-full rounded-lg border border-dashed border-slate-300 p-12 text-center">
                                    <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                    <p className="text-sm font-medium text-foreground">No templates found</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Report templates will appear here
                                    </p>
                                </div>
                            ) : (
                                templates.map((template) => (
                                    <div
                                        key={template.id}
                                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow dark:border-slate-700 dark:bg-slate-900"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                <BarChart3 className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {template.is_system && (
                                                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-xs font-medium text-purple-700">
                                                        System
                                                    </span>
                                                )}
                                                {template.is_public && (
                                                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-xs font-medium text-green-700">
                                                        Public
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                                        {template.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                                {template.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="px-2 py-0.5 rounded bg-slate-100 capitalize">
                                                {template.report_type}
                                            </span>
                                            <span className="px-2 py-0.5 rounded bg-slate-100 capitalize">
                                                {template.category}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* KPIs Tab */}
                    {activeTab === 'kpis' && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {kpis.length === 0 ? (
                                <div className="col-span-full rounded-lg border border-dashed border-slate-300 p-12 text-center">
                                    <Target className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                    <p className="text-sm font-medium text-foreground">No KPIs found</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Key Performance Indicators will appear here
                                    </p>
                                </div>
                            ) : (
                                kpis.map((kpi) => (
                                    <div
                                        key={kpi.id}
                                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow dark:border-slate-700 dark:bg-slate-900"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="font-semibold text-foreground">{kpi.name}</h3>
                                                <p className="text-xs text-muted-foreground capitalize">
                                                    {kpi.kpi_type.replace('_', ' ')} • {kpi.frequency}
                                                </p>
                                            </div>
                                            {getTrendIcon(kpi.trend)}
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <p className="text-2xl font-bold text-foreground">
                                                    {kpi.current_value || '--'}
                                                    <span className="text-sm font-normal text-muted-foreground ml-1">
                                                        {kpi.unit === 'percentage' ? '%' : kpi.unit}
                                                    </span>
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Target: {kpi.target_value}{kpi.unit === 'percentage' ? '%' : ''}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleCalculateKPI(kpi)}
                                                className="p-2 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                                                title="Recalculate"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
                            <PieChart className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                            <p className="text-sm font-medium text-foreground">Analytics Dashboard</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Interactive charts and analytics coming soon
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* Generate Report Modal */}
            {showGenerateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 dark:bg-slate-900">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Generate Report</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
                                    Report Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={generateForm.name}
                                    onChange={(e) => setGenerateForm({ ...generateForm, name: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                                    placeholder="e.g., Monthly Maintenance Report"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Template</label>
                                <select
                                    value={generateForm.template_id}
                                    onChange={(e) => setGenerateForm({ ...generateForm, template_id: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                                >
                                    <option value="">No template (custom report)</option>
                                    {templates.map((t) => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Format</label>
                                <select
                                    value={generateForm.format}
                                    onChange={(e) => setGenerateForm({ ...generateForm, format: e.target.value as ReportFormat })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                                >
                                    <option value="pdf">PDF</option>
                                    <option value="excel">Excel</option>
                                    <option value="csv">CSV</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={generateForm.date_range_start}
                                        onChange={(e) => setGenerateForm({ ...generateForm, date_range_start: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={generateForm.date_range_end}
                                        onChange={(e) => setGenerateForm({ ...generateForm, date_range_end: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                                <textarea
                                    value={generateForm.description}
                                    onChange={(e) => setGenerateForm({ ...generateForm, description: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                                    placeholder="Optional description"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 justify-end mt-6">
                            <button
                                onClick={() => setShowGenerateModal(false)}
                                disabled={generating}
                                className="px-4 py-2 text-sm font-medium text-foreground border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerateReport}
                                disabled={generating}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {generating ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="w-4 h-4" />
                                        Generate
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && itemToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 dark:bg-slate-900">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Delete {itemToDelete.type}</h3>
                                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-6">
                            Are you sure you want to delete <span className="font-semibold text-foreground">"{itemToDelete.name}"</span>?
                        </p>
                        <div className="flex items-center gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setDeleteModalOpen(false);
                                    setItemToDelete(null);
                                }}
                                disabled={deleting}
                                className="px-4 py-2 text-sm font-medium text-foreground border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700"
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
                                        Delete
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
