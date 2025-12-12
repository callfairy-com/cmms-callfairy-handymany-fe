import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useNotifications } from '@/app/providers/NotificationProvider';
import { maintenanceApi } from '@/features/maintenance/services/maintenanceApi';
import { locationApi } from '@/features/sites/services/locationApi';
import { assetApi } from '@/features/assets/services/assetApi';
import { organizationApi } from '@/features/organization/api/organizationApi';
import type {
    CreateMaintenancePayload,
    UpdateMaintenancePayload,
    MaintenanceType,
    MaintenancePriority,
} from '@/types/maintenance';
import type { Asset } from '@/types/asset';
import type { Site } from '@/types/location';
import type { OrganizationMember } from '@/features/organization/api/userManagement';

// Extended type to match actual API response from organizationApi.listMembers
interface ExtendedOrganizationMember extends OrganizationMember {
    user: string; // User UUID that the maintenance API expects
}

interface MaintenanceFormData {
    title: string;
    description?: string;
    maintenance_type: MaintenanceType;
    priority: MaintenancePriority;
    asset?: string;
    site?: string;
    assigned_to?: string;
    assigned_team?: string;
    scheduled_date?: string;
    estimated_cost?: string;
    estimated_duration_hours?: number;
    currency?: string;
}

const emptyForm = (): MaintenanceFormData => ({
    title: '',
    description: '',
    maintenance_type: 'preventive',
    priority: 'medium',
    asset: '',
    site: '',
    assigned_to: '',
    assigned_team: '',
    scheduled_date: '',
    estimated_cost: '',
    estimated_duration_hours: 2,
    currency: 'USD',
});

export default function MaintenanceForm() {
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();
    const { user, hasPermission } = useAuth();
    const { showToast } = useNotifications();

    const orgId = (user as any)?.organization_id || (user as any)?.organization?.id || '';

    // RBAC checks
    const canCreateMaintenance = hasPermission('can_create_work_orders');

    const [loading, setLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState<MaintenanceFormData>(emptyForm());
    const [assets, setAssets] = useState<Asset[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [staff, setStaff] = useState<ExtendedOrganizationMember[]>([]);

    useEffect(() => {
        if (!canCreateMaintenance && !isEditMode) {
            showToast('error', 'Access Denied', 'You do not have permission to create maintenance');
            navigate('/preventative-maintenance');
            return;
        }

        if (!orgId) return;
        
        loadOptions();
        if (isEditMode && id) {
            loadMaintenance(id);
        }
    }, [orgId, isEditMode, id]);

    const loadOptions = async () => {
        try {
            const [assetsData, sitesData] = await Promise.all([
                assetApi.listAssets({ organization: orgId, page_size: 100 }),
                locationApi.listSites({ organization: orgId, page_size: 100 }),
            ]);

            setAssets(assetsData.results || []);
            setSites(sitesData.results || []);
            
            // Load staff separately to handle potential errors
            try {
                const staffData = await organizationApi.listMembers(orgId, {
                    role: 'staff_employee',
                });
                const staffMembers = (staffData.results || []) as unknown as ExtendedOrganizationMember[];
                
                // Runtime validation - warn if user is not a string
                staffMembers.forEach(member => {
                    if (typeof member.user !== 'string') {
                        console.warn('Unexpected user type in staff member:', member);
                    }
                });
                
                setStaff(staffMembers);
            } catch (staffError: any) {
                console.error('Failed to load staff:', staffError);
                setStaff([]); // Ensure staff is always an array
                showToast('warning', 'Staff loading failed', 'Unable to load staff members');
            }
        } catch (error: any) {
            showToast('error', 'Failed to load options', error?.message || 'Unable to load assets and sites');
            setStaff([]); // Ensure staff is always an array
        }
    };

    const loadMaintenance = async (maintenanceId: string) => {
        setLoading(true);
        try {
            const maintenance = await maintenanceApi.getHistory(maintenanceId);
            setFormData({
                title: maintenance.title,
                description: maintenance.description || '',
                maintenance_type: maintenance.maintenance_type,
                priority: maintenance.priority,
                asset: maintenance.asset || '',
                site: maintenance.site || '',
                assigned_to: maintenance.assigned_to || '',
                assigned_team: maintenance.assigned_team || '',
                scheduled_date: maintenance.scheduled_date || '',
                estimated_cost: maintenance.estimated_cost || '',
                estimated_duration_hours: maintenance.estimated_duration_hours || 2,
                currency: maintenance.currency || 'USD',
            });
        } catch (error: any) {
            showToast('error', 'Failed to load maintenance', error?.message || 'Unable to load maintenance for editing');
            navigate('/preventative-maintenance');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title) {
            showToast('error', 'Validation Error', 'Title is required');
            return;
        }
        if (!formData.maintenance_type) {
            showToast('error', 'Validation Error', 'Maintenance type is required');
            return;
        }
        if (!formData.priority) {
            showToast('error', 'Validation Error', 'Priority is required');
            return;
        }

        setSubmitting(true);
        try {
            const payload: CreateMaintenancePayload | UpdateMaintenancePayload = {
                title: formData.title,
                description: formData.description,
                maintenance_type: formData.maintenance_type,
                priority: formData.priority,
                organization: orgId,
                asset: formData.asset || undefined,
                site: formData.site || undefined,
                assigned_to: formData.assigned_to || undefined,
                assigned_team: formData.assigned_team || undefined,
                scheduled_date: formData.scheduled_date || undefined,
                estimated_cost: formData.estimated_cost || undefined,
                estimated_duration_hours: formData.estimated_duration_hours || undefined,
                currency: formData.currency || 'USD',
            };

            if (isEditMode && id) {
                await maintenanceApi.updateHistory(id, payload as UpdateMaintenancePayload);
                showToast('success', 'Maintenance updated', 'Maintenance has been successfully updated');
            } else {
                await maintenanceApi.createHistory(payload as CreateMaintenancePayload);
                showToast('success', 'Maintenance created', 'Maintenance has been successfully created');
            }

            navigate('/preventative-maintenance');
        } catch (error: any) {
            showToast('error', 'Failed to save maintenance', error?.message || 'Unable to save maintenance');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Loading maintenance...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/preventative-maintenance')}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Maintenance
                </button>
                <h1 className="text-3xl font-bold text-foreground">
                    {isEditMode ? 'Edit Maintenance' : 'Create New Maintenance'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {isEditMode ? 'Update maintenance details' : 'Schedule a new maintenance task'}
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter maintenance title"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                placeholder="Describe the maintenance work to be performed"
                            />
                        </div>

                        {/* Type and Priority */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
                                    Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.maintenance_type}
                                    onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value as MaintenanceType })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="preventive">Preventive</option>
                                    <option value="corrective">Corrective</option>
                                    <option value="predictive">Predictive</option>
                                    <option value="emergency">Emergency</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
                                    Priority <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as MaintenancePriority })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                        </div>

                        {/* Asset and Site */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Asset</label>
                                <select
                                    value={formData.asset}
                                    onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select an asset</option>
                                    {assets.map((asset) => (
                                        <option key={asset.id} value={asset.id}>
                                            {asset.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Site</label>
                                <select
                                    value={formData.site}
                                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select a site</option>
                                    {sites.map((site) => (
                                        <option key={site.id} value={site.id}>
                                            {site.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Assignment */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Assigned To</label>
                                <select
                                    value={formData.assigned_to}
                                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select staff member</option>
                                    {Array.isArray(staff) && staff.map((member) => (
                                        <option key={member.id} value={String(member.user)}>
                                            {member.user_name || member.user_email || `User ${member.user}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Assigned Team</label>
                                <input
                                    type="text"
                                    value={formData.assigned_team}
                                    onChange={(e) => setFormData({ ...formData, assigned_team: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Team ID"
                                />
                            </div>
                        </div>

                        {/* Schedule and Estimates */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Scheduled Date</label>
                                <input
                                    type="datetime-local"
                                    value={formData.scheduled_date}
                                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Estimated Cost</label>
                                <input
                                    type="text"
                                    value={formData.estimated_cost}
                                    onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                    placeholder="500.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Duration (hours)</label>
                                <input
                                    type="number"
                                    value={formData.estimated_duration_hours}
                                    onChange={(e) => setFormData({ ...formData, estimated_duration_hours: Number(e.target.value) })}
                                    min="0.5"
                                    step="0.5"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/preventative-maintenance')}
                        className="px-6 py-2 border border-slate-300 rounded-lg text-sm font-medium text-foreground hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {submitting ? 'Saving...' : isEditMode ? 'Update Maintenance' : 'Create Maintenance'}
                    </button>
                </div>
            </form>
        </div>
    );
}
