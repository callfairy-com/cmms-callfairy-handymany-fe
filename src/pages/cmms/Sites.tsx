import { useState, useEffect } from 'react';
import { Plus, MapPin, Search, Edit2, Trash2, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { locationApi } from '@/features/locations/api/locationApi';
import type { Site } from '@/types/location';
import type { Role } from '@/types/rbac';

export default function Sites() {
    const { user, hasPermission } = useAuth();
    const { showToast } = useNotifications();
    const navigate = useNavigate();

    // Get user role and ID
    const userRole = user?.role as Role | undefined;
    const userId = user?.id as string;
    
    // Role checks
    const isManager = userRole === 'manager';
    const isViewer = userRole === 'viewer';
    const isStaffEmployee = userRole === 'staff_employee';

    // Deny access to staff employees
    if (isStaffEmployee) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-foreground mb-2">Access Denied</h2>
                    <p className="text-sm text-muted-foreground">
                        Staff employees do not have access to view sites. Please contact your administrator for assistance.
                    </p>
                </div>
            </div>
        );
    }

    // RBAC permission checks
    const canViewAllSites = hasPermission('can_view_all_sites'); // superadmin, orgadmin
    const canViewSupervisedSites = hasPermission('can_view_supervised_sites'); // manager
    const canViewOwnProjectSites = hasPermission('can_view_own_project_sites'); // viewer
    const canCreateSites = hasPermission('can_manage_organization');
    const canEditSites = hasPermission('can_manage_organization');
    const canDeleteSites = hasPermission('can_manage_organization');

    const [sites, setSites] = useState<Site[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [siteTypeFilter, setSiteTypeFilter] = useState<string>('');
    const [managerFilter, setManagerFilter] = useState<string>('');
    const [siteTypes, setSiteTypes] = useState<any[]>([]);
    const [managers, setManagers] = useState<any[]>([]);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [siteToDelete, setSiteToDelete] = useState<Site | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (user?.organization_id) {
            loadFilterOptions();
        }
    }, [user?.organization_id]);

    useEffect(() => {
        if (user?.organization_id) {
            loadSites();
        }
    }, [user?.organization_id, siteTypeFilter, managerFilter]);

    const loadFilterOptions = async () => {
        try {
            const [siteTypesData, usersData] = await Promise.all([
                locationApi.listSiteTypes({ page_size: 100 }),
                locationApi.listOrganizationUsers({ organization: user?.organization_id, page_size: 100 }),
            ]);

            setSiteTypes(Array.isArray(siteTypesData) ? siteTypesData : siteTypesData.results || []);
            setManagers(Array.isArray(usersData) ? usersData : usersData.results || []);
        } catch (error: any) {
            console.error('Failed to load filter options:', error);
        }
    };

    const loadSites = async () => {
        if (!user?.organization_id) {
            setSites([]);
            return;
        }

        setLoading(true);
        
        // Debug: Log user info
        console.log('Sites.loadSites - User info:', {
            role: user?.role,
            userId: userId,
            organizationId: user?.organization_id,
            canViewAllSites,
            canViewSupervisedSites,
            canViewOwnProjectSites
        });

        try {
            const params: any = {
                page_size: 100,
                status: 'active', // Default to active sites
            };

            // Role-based API parameters
            // Reference: CMMS API Documentation for Sites endpoint
            
            if (canViewAllSites) {
                // superadmin, orgadmin - can view all sites in organization
                params.organization = user.organization_id;
                // Apply optional filters
                if (siteTypeFilter) params.site_type = siteTypeFilter;
                if (managerFilter) params.manager = managerFilter;
            } else if (isManager && canViewSupervisedSites) {
                // manager - can view supervised sites (sites they manage)
                params.organization = user.organization_id;
                params.manager = userId; // Filter by sites where user is manager
                if (siteTypeFilter) params.site_type = siteTypeFilter;
            } else if (isViewer && canViewOwnProjectSites) {
                // viewer - can view own project sites
                params.organization = user.organization_id;
                // Viewers see sites related to their projects/tickets
                if (siteTypeFilter) params.site_type = siteTypeFilter;
            } else {
                // Fallback - use organization filter only
                params.organization = user.organization_id;
                if (siteTypeFilter) params.site_type = siteTypeFilter;
                if (managerFilter) params.manager = managerFilter;
            }

            // Debug: Log API parameters
            console.log('Sites.loadSites - API params:', params);

            const response = await locationApi.listSites(params);

            const normalizedResults: Site[] = Array.isArray(response)
                ? response
                : response && Array.isArray(response.results)
                    ? response.results
                    : [];

            setSites(normalizedResults);
        } catch (error: any) {
            showToast('error', 'Failed to load sites', error?.message || 'Unable to fetch sites');
            setSites([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (site: Site) => {
        setSiteToDelete(site);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!siteToDelete) return;

        setDeleting(true);
        try {
            await locationApi.deleteSite(siteToDelete.id);
            showToast('success', 'Site deleted', 'Site has been successfully deleted');
            setDeleteModalOpen(false);
            setSiteToDelete(null);
            await loadSites();
        } catch (error: any) {
            showToast('error', 'Delete failed', error?.message || 'Unable to delete site');
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModalOpen(false);
        setSiteToDelete(null);
    };

    const filteredSites = sites.filter((site) =>
        site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.address_line1?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Sites</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {isStaffEmployee 
                            ? 'Sites you manage'
                            : isManager
                                ? 'Sites under your supervision'
                                : isViewer
                                    ? 'Your project sites'
                                    : 'Manage facility sites and locations'
                        }
                    </p>
                </div>
                {canCreateSites && (
                    <button
                        onClick={() => navigate('/sites/new')}
                        className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
                    >
                        <Plus className="w-4 h-4" />
                        Add Site
                    </button>
                )}
            </div>

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search sites..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <select
                        value={siteTypeFilter}
                        onChange={(e) => setSiteTypeFilter(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                    >
                        <option value="">All Site Types</option>
                        {siteTypes.map((type: any) => (
                            <option key={type.id} value={type.id}>
                                {type.name || type.code}
                            </option>
                        ))}
                    </select>

                    {/* Manager filter - only visible to superadmin/orgadmin who can view all sites */}
                    {canViewAllSites && (
                        <select
                            value={managerFilter}
                            onChange={(e) => setManagerFilter(e.target.value)}
                            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                        >
                            <option value="">All Managers</option>
                            {managers.map((mgr: any) => (
                                <option key={mgr.id || mgr.user} value={mgr.user || mgr.id}>
                                    {mgr.user_name || mgr.user_email || mgr.email || `User ${mgr.user || mgr.id}`}
                                </option>
                            ))}
                        </select>
                    )}

                    {(siteTypeFilter || managerFilter) && (
                        <button
                            onClick={() => {
                                setSiteTypeFilter('');
                                setManagerFilter('');
                            }}
                            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Sites Grid */}
            {loading ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
                    <p className="text-sm text-muted-foreground">Loading sites...</p>
                </div>
            ) : filteredSites.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
                    <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">No sites found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {searchTerm
                            ? 'Try adjusting your search'
                            : isStaffEmployee
                                ? 'You are not managing any sites yet'
                                : isManager
                                    ? 'No sites are under your supervision'
                                    : isViewer
                                        ? 'No project sites available'
                                        : 'Get started by adding your first site'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredSites.map((site) => (
                        <div
                            key={site.id}
                            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-foreground group-hover:text-indigo-600">
                                        {site.name}
                                    </h3>
                                    {site.is_active ? (
                                        <span className="inline-block mt-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-block mt-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                                            Inactive
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    {canEditSites && (
                                        <button
                                            onClick={() => navigate(`/sites/${site.id}/edit`)}
                                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    {canDeleteSites && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteClick(site);
                                            }}
                                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 text-xs text-muted-foreground">
                                {site.address_line1 && (
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                        <span className="line-clamp-2">
                                            {site.address_line1}
                                            {site.city && `, ${site.city}`}
                                            {site.state && `, ${site.state}`}
                                            {site.postal_code && ` ${site.postal_code}`}
                                        </span>
                                    </div>
                                )}
                                {site.country && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{site.country}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={() => navigate(`/sites/${site.id}`)}
                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                >
                                    <BarChart3 className="w-3.5 h-3.5" />
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && siteToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 dark:bg-slate-900">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Delete Site</h3>
                                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                            Are you sure you want to delete <span className="font-semibold text-foreground">"{siteToDelete.name}"</span>?
                        </p>
                        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-3 mb-6">
                            ⚠️ All buildings, floors, zones, and associated data within this site will also be deleted.
                        </p>
                        <div className="flex items-center gap-3 justify-end">
                            <button
                                onClick={handleDeleteCancel}
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
                                        Delete Site
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
