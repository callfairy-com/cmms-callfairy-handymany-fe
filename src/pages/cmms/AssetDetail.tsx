import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Edit2,
    Trash2,
    Package,
    MapPin,
    Calendar,
    DollarSign,
    FileText,
    Activity,
    History,
    Settings,
    Truck,
    Archive,
    TrendingUp,
    Plus,
    Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { assetApi } from '@/features/assets/api/assetApi';
import type { Asset, AssetMeter, AssetDocument, AssetStatus } from '@/types/asset';

const statusColors: Record<AssetStatus, string> = {
    operational: 'bg-green-100 text-green-700',
    maintenance: 'bg-yellow-100 text-yellow-700',
    down: 'bg-red-100 text-red-700',
    retired: 'bg-gray-100 text-gray-700',
    disposed: 'bg-red-100 text-red-700',
    reserved: 'bg-blue-100 text-blue-700',
};

type TabType = 'overview' | 'meters' | 'documents' | 'work-orders' | 'history' | 'lifecycle' | 'assignments';

const toArray = <T,>(value: T | T[] | null | undefined): T[] => {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    return [value];
};

export default function AssetDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { hasPermission } = useAuth();
    const { showToast } = useNotifications();

    // RBAC checks
    const canEditAssets = hasPermission('can_edit_assets');
    const canDeleteAssets = hasPermission('can_delete_assets');
    const canTransferAssets = hasPermission('can_assign_assets_to_staff');
    const canDepreciateAssets = hasPermission('can_edit_assets');

    const [asset, setAsset] = useState<Asset | null>(null);
    const [meters, setMeters] = useState<AssetMeter[]>([]);
    const [documents, setDocuments] = useState<AssetDocument[]>([]);
    const [workOrders, setWorkOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    
    // Action modals state
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showDepreciateModal, setShowDepreciateModal] = useState(false);
    const [transferData, setTransferData] = useState({ site: '', building: '', floor: '' });
    const [lifecycleCosts, setLifecycleCosts] = useState<any>(null);
    const [replacementAnalysis, setReplacementAnalysis] = useState<any>(null);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loadingActions, setLoadingActions] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        if (id) {
            loadAssetData();
        }
    }, [id]);

    const loadAssetData = async () => {
        if (!id) return;

        setLoading(true);
        try {
            const [assetData, metersData, documentsData, workOrdersData] = await Promise.all([
                assetApi.getAsset(id),
                assetApi.getAssetMeters(id),
                assetApi.getAssetDocuments(id),
                assetApi.getAssetWorkOrders(id),
            ]);

            setAsset(assetData);
            setMeters(toArray(metersData));
            setDocuments(toArray(documentsData));
            setWorkOrders(toArray(workOrdersData));
        } catch (error: any) {
            showToast('error', 'Failed to load asset', error?.message || 'Unable to fetch asset details');
        } finally {
            setLoading(false);
        }
    };

    const loadLifecycleData = async () => {
        if (!id) return;
        try {
            const [lifecycle, replacement] = await Promise.all([
                assetApi.getAssetLifecycleCosts(id),
                assetApi.getAssetReplacementAnalysis(id, { threshold: 75 }),
            ]);
            setLifecycleCosts(lifecycle);
            setReplacementAnalysis(replacement);
        } catch (error: any) {
            console.error('Failed to load lifecycle data:', error);
        }
    };

    const loadAssignments = async () => {
        if (!id) return;
        try {
            const data = await assetApi.listAssignments({ asset: id });
            setAssignments(data.results || []);
        } catch (error: any) {
            console.error('Failed to load assignments:', error);
        }
    };

    const handleTransfer = async () => {
        if (!id || !transferData.site) {
            showToast('error', 'Transfer failed', 'Please select a site');
            return;
        }

        setLoadingActions({ ...loadingActions, transfer: true });
        try {
            await assetApi.transferAsset(id, transferData);
            showToast('success', 'Asset transferred', 'Asset has been successfully transferred');
            setShowTransferModal(false);
            setTransferData({ site: '', building: '', floor: '' });
            loadAssetData();
        } catch (error: any) {
            showToast('error', 'Transfer failed', error?.message || 'Unable to transfer asset');
        } finally {
            setLoadingActions({ ...loadingActions, transfer: false });
        }
    };

    const handleDepreciate = async () => {
        if (!id) return;

        setLoadingActions({ ...loadingActions, depreciate: true });
        try {
            await assetApi.deprecateAsset(id);
            showToast('success', 'Asset deprecated', 'Asset has been marked as deprecated');
            setShowDepreciateModal(false);
            loadAssetData();
        } catch (error: any) {
            showToast('error', 'Depreciation failed', error?.message || 'Unable to depreciate asset');
        } finally {
            setLoadingActions({ ...loadingActions, depreciate: false });
        }
    };

    const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !id) return;

        const formData = new FormData();
        formData.append('asset', id);
        formData.append('document', file);
        formData.append('title', file.name);
        formData.append('document_type', 'manual');

        setLoadingActions({ ...loadingActions, upload: true });
        try {
            await assetApi.uploadDocument(formData);
            showToast('success', 'Document uploaded', 'Document has been successfully uploaded');
            loadAssetData();
        } catch (error: any) {
            showToast('error', 'Upload failed', error?.message || 'Unable to upload document');
        } finally {
            setLoadingActions({ ...loadingActions, upload: false });
        }
    };

    useEffect(() => {
        if (activeTab === 'lifecycle' && id) {
            loadLifecycleData();
        }
        if (activeTab === 'assignments' && id) {
            loadAssignments();
        }
    }, [activeTab, id]);

    const handleDelete = async () => {
        if (!id || !confirm('Are you sure you want to delete this asset?')) return;

        try {
            await assetApi.deleteAsset(id);
            showToast('success', 'Asset deleted', 'Asset has been successfully deleted');
            navigate('/assets');
        } catch (error: any) {
            showToast('error', 'Delete failed', error?.message || 'Unable to delete asset');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Loading asset...</p>
            </div>
        );
    }

    if (!asset) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Package className="w-16 h-16 text-slate-400 mb-4" />
                <p className="text-lg font-medium text-foreground">Asset not found</p>
                <Link to="/assets" className="mt-4 text-sm text-indigo-600 hover:text-indigo-700">
                    ← Back to Assets
                </Link>
            </div>
        );
    }

    const tabs: { id: TabType; label: string; icon: any }[] = [
        { id: 'overview', label: 'Overview', icon: Package },
        { id: 'meters', label: 'Meters', icon: Activity },
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'work-orders', label: 'Work Orders', icon: Settings },
        { id: 'history', label: 'History', icon: History },
        { id: 'lifecycle', label: 'Lifecycle', icon: TrendingUp },
        { id: 'assignments', label: 'Assignments', icon: Settings },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Link
                    to="/assets"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Assets
                </Link>

                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-6 flex-1">
                        {/* Asset Image */}
                        <div className="flex-shrink-0">
                            {asset.image ? (
                                <img
                                    src={asset.image}
                                    alt={asset.name}
                                    className="w-24 h-24 object-cover rounded-lg border border-slate-200"
                                />
                            ) : (
                                <div className="w-24 h-24 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center">
                                    <ImageIcon className="w-8 h-8 text-slate-400" />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-foreground">{asset.name}</h1>
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                                        statusColors[asset.status]
                                    }`}
                                >
                                    {asset.status}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground capitalize">{asset.asset_type}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {canEditAssets && (
                            <button
                                onClick={() => navigate(`/assets/${id}/edit`)}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-slate-50"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit
                            </button>
                        )}
                        {canTransferAssets && (
                            <button
                                onClick={() => setShowTransferModal(true)}
                                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                            >
                                <Truck className="w-4 h-4" />
                                Transfer
                            </button>
                        )}
                        {canDepreciateAssets && (
                            <button
                                onClick={() => setShowDepreciateModal(true)}
                                className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50"
                            >
                                <Archive className="w-4 h-4" />
                                Depreciate
                            </button>
                        )}
                        {canDeleteAssets && (
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
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'overview' && (
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Basic Information */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6">
                            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                            <dl className="space-y-3">
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Serial Number</dt>
                                    <dd className="mt-1 text-sm text-foreground">{asset.serial_number || '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Manufacturer</dt>
                                    <dd className="mt-1 text-sm text-foreground">{asset.manufacturer || '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Model Number</dt>
                                    <dd className="mt-1 text-sm text-foreground">{asset.model_number || '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Barcode</dt>
                                    <dd className="mt-1 text-sm text-foreground">{asset.barcode || '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Criticality</dt>
                                    <dd className="mt-1">
                                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize">
                                            {asset.criticality}
                                        </span>
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
                                    <dd className="mt-1 text-sm text-foreground">{asset.site_name || '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Building</dt>
                                    <dd className="mt-1 text-sm text-foreground">{asset.building || '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Floor</dt>
                                    <dd className="mt-1 text-sm text-foreground">{asset.floor || '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Details</dt>
                                    <dd className="mt-1 text-sm text-foreground">{asset.location_details || '—'}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Financial */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <DollarSign className="w-5 h-5" />
                                Financial
                            </h3>
                            <dl className="space-y-3">
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Purchase Cost</dt>
                                    <dd className="mt-1 text-sm text-foreground">
                                        ${asset.purchase_cost?.toLocaleString() || '—'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Current Value</dt>
                                    <dd className="mt-1 text-sm font-semibold text-foreground">
                                        ${asset.current_value?.toLocaleString() || '—'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Purchase Date</dt>
                                    <dd className="mt-1 text-sm text-foreground">
                                        {asset.purchase_date
                                            ? new Date(asset.purchase_date).toLocaleDateString()
                                            : '—'}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Dates */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Important Dates
                            </h3>
                            <dl className="space-y-3">
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Installation Date</dt>
                                    <dd className="mt-1 text-sm text-foreground">
                                        {asset.installation_date
                                            ? new Date(asset.installation_date).toLocaleDateString()
                                            : '—'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Warranty Start</dt>
                                    <dd className="mt-1 text-sm text-foreground">
                                        {asset.warranty_start_date
                                            ? new Date(asset.warranty_start_date).toLocaleDateString()
                                            : '—'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-muted-foreground uppercase">Warranty End</dt>
                                    <dd className="mt-1 text-sm text-foreground">
                                        {asset.warranty_end_date
                                            ? new Date(asset.warranty_end_date).toLocaleDateString()
                                            : '—'}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                )}


                {activeTab === 'meters' && (
                    <div>
                        {meters.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
                                <Activity className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                <p className="text-sm font-medium text-foreground">No meters configured</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Add meters to track usage and readings
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {meters.map((meter, index) => {
                                    const meterTypeLabel = typeof meter.meter_type === 'string'
                                        ? meter.meter_type.replace(/_/g, ' ')
                                        : 'meter';

                                    return (
                                        <div
                                            key={meter.id ?? `${meter.asset}-${index}`}
                                            className="rounded-2xl border border-slate-200 bg-white p-5"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h4 className="font-semibold text-foreground">{meter.name}</h4>
                                                    <p className="text-xs text-muted-foreground capitalize">{meterTypeLabel}</p>
                                                </div>
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        meter.is_active
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                    }`}
                                                >
                                                    {meter.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                <div>
                                                    <span className="text-2xl font-bold text-foreground">
                                                        {meter.current_reading}
                                                    </span>
                                                    <span className="ml-2 text-sm text-muted-foreground">
                                                        {meter.unit_of_measure}
                                                    </span>
                                                </div>
                                                {meter.last_reading_date && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Last reading: {new Date(meter.last_reading_date).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold">Documents</h3>
                            {canEditAssets && (
                                <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-slate-50 cursor-pointer">
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleUploadDocument}
                                        disabled={loadingActions.upload}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    />
                                    {loadingActions.upload ? 'Uploading...' : 'Upload Document'}
                                </label>
                            )}
                        </div>
                        
                        {documents.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
                                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                <p className="text-sm font-medium text-foreground">No documents uploaded</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Upload manuals, warranties, and other documents
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-3">
                                {documents.map((doc, index) => (
                                    <div
                                        key={doc.id ?? `${doc.title}-${index}`}
                                        className="rounded-2xl border border-slate-200 bg-white p-4"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-indigo-100 p-2">
                                                <FileText className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm text-foreground truncate">{doc.title}</h4>
                                                <p className="text-xs text-muted-foreground capitalize">
                                                    {doc.document_type}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {new Date(doc.uploaded_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'work-orders' && (
                    <div>
                        {workOrders.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
                                <Settings className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                <p className="text-sm font-medium text-foreground">No work orders</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Work orders related to this asset will appear here
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {workOrders.map((wo, index) => (
                                    <div
                                        key={wo.id ?? `wo-${index}`}
                                        className="rounded-2xl border border-slate-200 bg-white p-4"
                                    >
                                        <p className="font-medium text-foreground">{wo.title || 'Work Order'}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{wo.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'lifecycle' && (
                    <div className="space-y-6">
                        {/* Lifecycle Costs */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <DollarSign className="w-5 h-5" />
                                Lifecycle Costs
                            </h3>
                            {lifecycleCosts ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Cost of Ownership</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            ${lifecycleCosts.total_cost?.toLocaleString() || '0'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Annual Operating Cost</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            ${lifecycleCosts.annual_cost?.toLocaleString() || '0'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Loading lifecycle data...</p>
                            )}
                        </div>

                        {/* Replacement Analysis */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Replacement Analysis
                            </h3>
                            {replacementAnalysis ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Replacement Score</span>
                                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                                            replacementAnalysis.score > 75 
                                                ? 'bg-red-100 text-red-700' 
                                                : replacementAnalysis.score > 50 
                                                    ? 'bg-yellow-100 text-yellow-700' 
                                                    : 'bg-green-100 text-green-700'
                                        }`}>
                                            {replacementAnalysis.score}% - {replacementAnalysis.recommendation || 'Monitor'}
                                        </span>
                                    </div>
                                    {replacementAnalysis.reasons && (
                                        <div>
                                            <p className="text-sm font-medium mb-2">Key Factors:</p>
                                            <ul className="text-sm text-muted-foreground space-y-1">
                                                {replacementAnalysis.reasons.map((reason: string, idx: number) => (
                                                    <li key={idx}>• {reason}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Loading replacement analysis...</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'assignments' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Asset Assignments</h3>
                            {canEditAssets && (
                                <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-slate-50">
                                    <Plus className="w-4 h-4" />
                                    Assign Asset
                                </button>
                            )}
                        </div>
                        
                        {assignments.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
                                <Settings className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                <p className="text-sm font-medium text-foreground">No assignments found</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    This asset is not currently assigned to anyone
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {assignments.map((assignment) => (
                                    <div key={assignment.id} className="rounded-2xl border border-slate-200 bg-white p-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-semibold text-foreground">
                                                    {assignment.assigned_to?.name || 'Unassigned'}
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {assignment.assigned_to?.email || 'No email'}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Assigned: {assignment.assigned_date ? new Date(assignment.assigned_date).toLocaleDateString() : 'Unknown'}
                                                </p>
                                            </div>
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                assignment.is_active 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {assignment.is_active ? 'Active' : 'Inactive'}
                                            </span>
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
                        <p className="text-xs text-muted-foreground mt-1">
                            Track all changes and activities for this asset
                        </p>
                    </div>
                )}
            </div>

            {/* Transfer Modal */}
            {showTransferModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Truck className="w-5 h-5" />
                            Transfer Asset
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">New Site</label>
                                <select
                                    value={transferData.site}
                                    onChange={(e) => setTransferData({ ...transferData, site: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select a site</option>
                                    {/* Add site options here */}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowTransferModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-foreground hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleTransfer}
                                    disabled={loadingActions.transfer}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loadingActions.transfer ? 'Transferring...' : 'Transfer'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Depreciate Modal */}
            {showDepreciateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Archive className="w-5 h-5" />
                            Depreciate Asset
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Are you sure you want to mark this asset as deprecated? This will change its status to "retired" and remove it from active operations.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDepreciateModal(false)}
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-foreground hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDepreciate}
                                disabled={loadingActions.depreciate}
                                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
                            >
                                {loadingActions.depreciate ? 'Depreciating...' : 'Depreciate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
