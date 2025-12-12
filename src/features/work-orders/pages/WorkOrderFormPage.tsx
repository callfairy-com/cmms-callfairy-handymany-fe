import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useNotifications } from '@/app/providers/NotificationProvider';
import { workOrderApi } from '@/features/work-orders/services/workOrderApi';
import { locationApi } from '@/features/sites/services/locationApi';
import { assetApi } from '@/features/assets/services/assetApi';
import { organizationApi } from '@/features/organization/api/organizationApi';
import type { WorkOrder, WorkOrderType, CreateWorkOrderPayload } from '@/types/workOrder';
import type { Site, Building } from '@/types/location';
import type { Asset } from '@/types/asset';

const toDateTimeLocal = (iso?: string | null): string => {
    if (!iso) return '';
    const date = new Date(iso);
    // Convert to local time and format as yyyy-MM-ddTHH:mm for datetime-local inputs
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toIsoString = (local?: string | null): string | undefined => {
    if (!local) return undefined;
    // Browser will give yyyy-MM-ddTHH:mm for datetime-local; construct a Date and serialize to ISO
    const date = new Date(local);
    return date.toISOString();
};

export default function WorkOrderForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useNotifications();

    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);
    const [sites, setSites] = useState<Site[]>([]);
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [workOrderTypes, setWorkOrderTypes] = useState<WorkOrderType[]>([]);
    // Members come back in a flattened shape from the API (user, user_email, user_name, role, is_active)
    const [members, setMembers] = useState<any[]>([]);
    const [existingWorkOrder, setExistingWorkOrder] = useState<WorkOrder | null>(null);

    const [formData, setFormData] = useState<CreateWorkOrderPayload>({
        organization: (user as any)?.organization?.id || (user as any)?.organization_id || '',
        title: '',
        description: '',
        work_order_type: '',
        priority: 'medium',
        status: 'open',
        site: '',
        building: '',
        asset: '',
        assigned_to: '',
        scheduled_start: '',
        scheduled_end: '',
        due_date: '',
        estimated_hours: undefined,
        estimated_cost: '',
        currency: 'USD',
    });

    useEffect(() => {
        // Wait for authenticated user so we have an organization id for members query
        if (!user) return;

        loadOptions();
        if (isEditMode && id) {
            loadWorkOrder(id);
        }
    }, [id, isEditMode, user]);

    const loadOptions = async () => {
        try {
            const orgId = (user as any)?.organization?.id || (user as any)?.organization_id;
            const [sitesData, assetsData, woTypesData, membersData] = await Promise.all([
                locationApi.listSites({ page_size: 100 }),
                assetApi.listAssets({ page_size: 100 }),
                workOrderApi.listWorkOrderTypes({ page_size: 100 }).catch(() => ({ results: [] })),
                orgId
                    ? organizationApi.listMembers(orgId, {
                          role: 'staff_employee',
                      })
                    : Promise.resolve({ results: [] }),
            ]);

            setSites(sitesData.results || []);
            setAssets(assetsData.results || []);
            setMembers(membersData.results || []);

            const types = Array.isArray(woTypesData)
                ? woTypesData
                : (woTypesData as any)?.results || [];
            setWorkOrderTypes(types);
        } catch (error: any) {
            showToast('error', 'Failed to load options', error?.message);
        }
    };

    const loadWorkOrder = async (woId: string) => {
        setLoading(true);
        try {
            const wo = await workOrderApi.getWorkOrder(woId);
            setExistingWorkOrder(wo as any);
            setFormData({
                organization: (wo as any).organization || formData.organization,
                title: wo.title,
                description: wo.description,
                work_order_type: (wo as any).work_order_type?.id || (wo as any).work_order_type || '',
                priority: wo.priority,
                status: wo.status,
                site: (wo as any).site?.id || (wo as any).site || '',
                building: (wo as any).building?.id || (wo as any).building || '',
                asset: (wo as any).asset?.id || (wo as any).asset || '',
                assigned_to: (wo as any).assigned_to?.id || (wo as any).assigned_to || '',
                scheduled_start: toDateTimeLocal(wo.scheduled_start as any),
                scheduled_end: toDateTimeLocal(wo.scheduled_end as any),
                due_date: toDateTimeLocal(wo.due_date as any),
                estimated_hours: typeof wo.estimated_hours === 'number' ? wo.estimated_hours : parseFloat((wo as any).estimated_hours) || undefined,
                estimated_cost: (wo as any).estimated_cost || '',
                currency: (wo as any).currency || formData.currency || 'USD',
            });
        } catch (error: any) {
            showToast('error', 'Failed to load work order', error?.message);
            navigate('/work-orders');
        } finally {
            setLoading(false);
        }
    };

    const loadBuildings = async (siteId: string) => {
        try {
            const buildingsData = await locationApi.listBuildings({ site: siteId, page_size: 100 });
            setBuildings(buildingsData.results || []);
        } catch (error: any) {
            console.error('Failed to load buildings:', error);
        }
    };

    const handleSiteChange = (siteId: string) => {
        setFormData({ ...formData, site: siteId, building: '' });
        if (siteId) {
            loadBuildings(siteId);
        } else {
            setBuildings([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.description) {
            showToast('error', 'Validation Error', 'Title and description are required');
            return;
        }

        if (!formData.work_order_type) {
            showToast('error', 'Validation Error', 'Work order type is required');
            return;
        }

        if (!formData.currency) {
            showToast('error', 'Validation Error', 'Currency is required');
            return;
        }

        setSubmitting(true);
        try {
            const payload: any = {
                ...formData,
                scheduled_start: toIsoString(formData.scheduled_start),
                scheduled_end: toIsoString(formData.scheduled_end),
                due_date: toIsoString(formData.due_date),
                currency: formData.currency || 'USD',
            };

            if (isEditMode && id) {
                await workOrderApi.updateWorkOrder(id, payload);
                showToast('success', 'Work order updated', 'Work order has been successfully updated');
            } else {
                await workOrderApi.createWorkOrder(payload);
                showToast('success', 'Work order created', 'Work order has been successfully created');
            }
            navigate('/work-orders');
        } catch (error: any) {
            showToast('error', 'Failed to save', error?.message || 'Unable to save work order');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/work-orders')}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Work Orders
                </button>
                <h1 className="text-2xl font-bold text-foreground">
                    {isEditMode ? 'Edit Work Order' : 'Create Work Order'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {isEditMode ? 'Update work order details' : 'Create a new maintenance work order'}
                </p>

                {isEditMode && existingWorkOrder && (
                    <div className="mt-4 grid gap-4 md:grid-cols-3 text-xs text-muted-foreground">
                        <div>
                            <div className="font-medium text-foreground">Assigned To</div>
                            <div>
                                {(() => {
                                    const wo: any = existingWorkOrder as any;
                                    const flatName =
                                        wo.assigned_to_name ||
                                        wo.assigned_to_full_name ||
                                        wo.assigned_to_display;
                                    if (flatName) return flatName;

                                    if (wo.assigned_to && typeof wo.assigned_to === 'object') {
                                        const name = `${wo.assigned_to.first_name || ''} ${
                                            wo.assigned_to.last_name || ''
                                        }`.trim();
                                        return name || wo.assigned_to.email || 'Unassigned';
                                    }

                                    if (typeof wo.assigned_to === 'string' && wo.assigned_to) {
                                        return wo.assigned_to_email || wo.assigned_to;
                                    }

                                    return 'Unassigned';
                                })()}
                            </div>
                        </div>

                        <div>
                            <div className="font-medium text-foreground">Assigned By</div>
                            <div>
                                {(existingWorkOrder as any).assigned_by_name ||
                                    (existingWorkOrder as any).assigned_by_email ||
                                    '—'}
                            </div>
                        </div>

                        <div>
                            <div className="font-medium text-foreground">Created By</div>
                            <div>
                                {(existingWorkOrder as any).created_by_name ||
                                    (existingWorkOrder as any).created_by_email ||
                                    '—'}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter work order title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                placeholder="Describe the work to be done"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Work Order Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.work_order_type}
                                onChange={(e) => setFormData({ ...formData, work_order_type: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select type...</option>
                                {workOrderTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Priority</label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="on_hold">On Hold</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Currency <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.currency}
                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                                <option value="INR">INR</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h3 className="text-lg font-semibold mb-4">Location</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Site</label>
                            <select
                                value={formData.site}
                                onChange={(e) => handleSiteChange(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select site...</option>
                                {sites.map((site) => (
                                    <option key={site.id} value={site.id}>
                                        {site.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Building</label>
                            <select
                                value={formData.building}
                                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                disabled={!formData.site}
                            >
                                <option value="">Select building...</option>
                                {buildings.map((building) => (
                                    <option key={building.id} value={building.id}>
                                        {building.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Asset</label>
                            <select
                                value={formData.asset}
                                onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select asset...</option>
                                {assets.map((asset) => (
                                    <option key={asset.id} value={asset.id}>
                                        {asset.name} {asset.serial_number ? `(${asset.serial_number})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Assignment */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h3 className="text-lg font-semibold mb-4">Assignment</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Assigned To</label>
                            <select
                                value={formData.assigned_to}
                                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Unassigned</option>
                                {members
                                    .filter((m) => m.is_active)
                                    .map((member) => {
                                        const id = member.user as string;
                                        const name = (member.user_name as string) || (member.user_email as string) || id;
                                        return (
                                            <option key={id} value={id}>
                                                {name} ({member.role})
                                            </option>
                                        );
                                    })}
                            </select>
                            {members.length === 0 && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    No staff employees found for this organization or you may not have permission to view
                                    members.
                                </p>
                            )}
                        </div>

                        {isEditMode && existingWorkOrder && (
                            <>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Assigned By</label>
                                    <p className="text-sm text-foreground">
                                        {(existingWorkOrder as any).assigned_by_name ||
                                            (existingWorkOrder as any).assigned_by_email ||
                                            (user
                                                ? `${(user as any).first_name || ''} ${(user as any).last_name || ''}`.trim() ||
                                                  (user as any).email
                                                : '—')}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Created By</label>
                                    <p className="text-sm text-foreground">
                                        {(existingWorkOrder as any).created_by_name ||
                                            (existingWorkOrder as any).created_by_email ||
                                            '—'}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Schedule */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h3 className="text-lg font-semibold mb-4">Schedule & Estimates</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Scheduled Start</label>
                                <input
                                    type="datetime-local"
                                    value={formData.scheduled_start}
                                    onChange={(e) => setFormData({ ...formData, scheduled_start: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Scheduled End</label>
                                <input
                                    type="datetime-local"
                                    value={formData.scheduled_end}
                                    onChange={(e) => setFormData({ ...formData, scheduled_end: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Due Date</label>
                            <input
                                type="datetime-local"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Estimated Hours</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={formData.estimated_hours || ''}
                                    onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) || undefined })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g., 4.0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Estimated Cost ($)</label>
                                <input
                                    type="text"
                                    value={formData.estimated_cost}
                                    onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g., 500.00"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4" />
                        {submitting ? 'Saving...' : isEditMode ? 'Update Work Order' : 'Create Work Order'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/work-orders')}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-foreground hover:bg-slate-50"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
