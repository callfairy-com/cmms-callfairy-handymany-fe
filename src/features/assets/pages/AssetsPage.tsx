import { useState, useEffect } from 'react';
import { Plus, Search, Package, MapPin, DollarSign } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useNotifications } from '@/app/providers/NotificationProvider';
import { assetApi } from '@/features/assets/services/assetApi';
import type { Asset, AssetStatus, AssetCategory } from '@/types/asset';
import type { Site } from '@/types/location';
import { locationApi } from '@/features/sites/services/locationApi';
import { useNavigate } from 'react-router-dom';

const statusColors: Record<AssetStatus, string> = {
    operational: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200',
    maintenance: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-200',
    down: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200',
    retired: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-200',
    disposed: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-200',
    reserved: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200',
};

const criticalityColors = {
    low: 'bg-slate-100 text-slate-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
};

export default function Assets() {
    const { user, hasPermission } = useAuth();
    const { showToast } = useNotifications();
    const navigate = useNavigate();

    // RBAC checks
    const canAddAssets = hasPermission('can_add_assets');

    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [siteFilter, setSiteFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [sites, setSites] = useState<Site[]>([]);
    const [categories, setCategories] = useState<AssetCategory[]>([]);

    useEffect(() => {
        if (user?.organization_id) {
            loadOptions();
            loadAssets();
        }
    }, [user?.organization_id]);

    useEffect(() => {
        if (user?.organization_id) {
            loadAssets();
        }
    }, [statusFilter, siteFilter, categoryFilter]);

    const loadOptions = async () => {
        try {
            const [sitesData, categoriesData] = await Promise.all([
                locationApi.listSites({ organization: user?.organization_id, page_size: 100 }),
                assetApi.listCategories({ organization: user?.organization_id, page_size: 100 }),
            ]);

            setSites(sitesData.results || []);
            setCategories(categoriesData.results || []);
        } catch (error: any) {
            console.error('Failed to load filter options:', error);
        }
    };

    const loadAssets = async () => {
        if (!user?.organization_id) {
            setAssets([]);
            return;
        }

        setLoading(true);
        try {
            const params: Record<string, any> = {
                organization: user.organization_id,
                page: 1,
                page_size: 100,
            };

            // Add filters only if they're not 'all'
            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }
            if (siteFilter !== 'all') {
                params.site = siteFilter;
            }
            if (categoryFilter !== 'all') {
                params.category = categoryFilter;
            }

            const response = await assetApi.listAssets(params);

            const normalizedResults: Asset[] = Array.isArray(response)
                ? response
                : response && Array.isArray(response.results)
                    ? response.results
                    : [];

            setAssets(normalizedResults);
        } catch (error: any) {
            showToast('error', 'Failed to load assets', error?.message || 'Unable to fetch assets');
            setAssets([]);
        } finally {
            setLoading(false);
        }
    };

    // Client-side search filtering (status/site/category already filtered by API)
    const filteredAssets = assets.filter((asset) => {
        const matchesSearch =
            asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.model_number?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Assets</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your organization's assets and equipment
                    </p>
                </div>
                {canAddAssets && (
                    <button
                        onClick={() => navigate('/assets/new')}
                        className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
                    >
                        <Plus className="w-4 h-4" />
                        Add Asset
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="mb-6 grid gap-4 md:grid-cols-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search assets..."
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
                    <option value="operational">Operational</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="down">Down</option>
                    <option value="retired">Retired</option>
                    <option value="disposed">Disposed</option>
                </select>

                <select
                    value={siteFilter}
                    onChange={(e) => setSiteFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                >
                    <option value="all">All Sites</option>
                    {sites.map((site) => (
                        <option key={site.id} value={site.id}>
                            {site.name}
                        </option>
                    ))}
                </select>

                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
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
                            <p className="text-2xl font-bold text-foreground">{filteredAssets.length}</p>
                            <p className="text-xs text-muted-foreground">Total Assets</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-green-100 p-2 dark:bg-green-500/20">
                            <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">
                                {filteredAssets.filter((a) => a.status === 'operational').length}
                            </p>
                            <p className="text-xs text-muted-foreground">Operational</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-500/20">
                            <Package className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">
                                {filteredAssets.filter((a) => a.status === 'maintenance').length}
                            </p>
                            <p className="text-xs text-muted-foreground">Maintenance</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-500/20">
                            <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">
                                ${filteredAssets
                                    .reduce((sum, a) => sum + Number(a.purchase_cost || 0), 0)
                                    .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-muted-foreground">Total Value</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assets Grid */}
            {loading ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
                    <p className="text-sm text-muted-foreground">Loading assets...</p>
                </div>
            ) : filteredAssets.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
                    <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">No assets found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {searchTerm || statusFilter !== 'all' || siteFilter !== 'all' || categoryFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Get started by adding your first asset'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredAssets.map((asset) => (
                        <div
                            key={asset.id}
                            onClick={() => navigate(`/assets/${asset.id}`)}
                            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-foreground group-hover:text-indigo-600">
                                        {asset.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                                        {asset.asset_type}
                                    </p>
                                </div>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                                        statusColors[asset.status]
                                    }`}
                                >
                                    {asset.status}
                                </span>
                            </div>

                            <div className="space-y-2 text-xs text-muted-foreground">
                                {asset.serial_number && (
                                    <div className="flex items-center gap-2">
                                        <Package className="w-3.5 h-3.5" />
                                        <span>SN: {asset.serial_number}</span>
                                    </div>
                                )}
                                {asset.site_name && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>{asset.site_name}</span>
                                    </div>
                                )}
                                {asset.manufacturer && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{asset.manufacturer}</span>
                                        {asset.model_number && <span>• {asset.model_number}</span>}
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                                        criticalityColors[asset.criticality]
                                    }`}
                                >
                                    {asset.criticality}
                                </span>
                                {asset.purchase_cost && (
                                    <span className="text-sm font-semibold text-foreground">
                                        ${Number(asset.purchase_cost).toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
