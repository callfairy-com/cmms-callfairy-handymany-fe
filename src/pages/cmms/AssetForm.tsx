import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { assetApi } from '@/features/assets/api/assetApi';
import { locationApi } from '@/features/locations/api/locationApi';
import type { Asset, AssetStatus, AssetCriticality, AssetCategory } from '@/types/asset';
import type { Site } from '@/types/location';

interface AssetFormData {
    organization: string;
    name: string;
    asset_type: Asset['asset_type'];
    status: AssetStatus;
    criticality: AssetCriticality;
    site?: string;
    category?: string;
    serial_number?: string;
    manufacturer?: string;
    model_number?: string;
    purchase_cost?: number | '';
    image?: string;
}

const emptyForm = (orgId: string): AssetFormData => ({
    organization: orgId,
    name: '',
    asset_type: 'equipment',
    status: 'operational',
    criticality: 'medium',
    site: undefined,
    category: undefined,
    serial_number: '',
    manufacturer: '',
    model_number: '',
    purchase_cost: '',
    image: '',
});

export default function AssetForm() {
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useNotifications();

    const orgId = (user as any)?.organization_id || (user as any)?.organization?.id || '';

    const [loading, setLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState<AssetFormData>(() => emptyForm(orgId));
    const [sites, setSites] = useState<Site[]>([]);
    const [categories, setCategories] = useState<AssetCategory[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    useEffect(() => {
        if (!orgId) return;
        loadOptions();
        if (isEditMode && id) {
            loadAsset(id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orgId, isEditMode, id]);

    const loadOptions = async () => {
        try {
            const [sitesData, categoriesData] = await Promise.all([
                locationApi.listSites({ organization: orgId, page_size: 100 }),
                assetApi.listCategories({ organization: orgId, page_size: 100 }),
            ]);
            setSites(sitesData.results || []);
            setCategories(categoriesData.results || []);
        } catch (error: any) {
            console.error('Failed to load asset options', error);
        }
    };

    const loadAsset = async (assetId: string) => {
        setLoading(true);
        try {
            const asset = await assetApi.getAsset(assetId);
            setFormData({
                organization: asset.organization,
                name: asset.name,
                asset_type: asset.asset_type,
                status: asset.status,
                criticality: asset.criticality,
                site: asset.site,
                category: asset.category,
                serial_number: asset.serial_number,
                manufacturer: asset.manufacturer,
                model_number: asset.model_number,
                purchase_cost:
                    typeof asset.purchase_cost === 'number' ? asset.purchase_cost : asset.purchase_cost || '',
                image: asset.image || '',
            });
            setImagePreview(asset.image || '');
        } catch (error: any) {
            showToast('error', 'Failed to load asset', error?.message || 'Unable to load asset for editing');
            navigate('/assets');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('error', 'Invalid file', 'Please select an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('error', 'File too large', 'Image must be smaller than 5MB');
            return;
        }

        setImageFile(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview('');
        setFormData({ ...formData, image: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            showToast('error', 'Validation Error', 'Name is required');
            return;
        }
        if (!formData.asset_type) {
            showToast('error', 'Validation Error', 'Asset type is required');
            return;
        }
        if (!formData.status) {
            showToast('error', 'Validation Error', 'Status is required');
            return;
        }

        setSubmitting(true);
        try {
            // Use FormData if there's an image file
            if (imageFile) {
                const formDataPayload = new FormData();
                formDataPayload.append('organization', formData.organization);
                formDataPayload.append('name', formData.name);
                formDataPayload.append('asset_type', formData.asset_type);
                formDataPayload.append('status', formData.status);
                formDataPayload.append('criticality', formData.criticality);
                
                if (formData.site) formDataPayload.append('site', formData.site);
                if (formData.category) formDataPayload.append('category', formData.category);
                if (formData.serial_number) formDataPayload.append('serial_number', formData.serial_number);
                if (formData.manufacturer) formDataPayload.append('manufacturer', formData.manufacturer);
                if (formData.model_number) formDataPayload.append('model_number', formData.model_number);
                if (formData.purchase_cost !== '' && formData.purchase_cost != null) {
                    formDataPayload.append('purchase_cost', String(Number(formData.purchase_cost)));
                }
                
                formDataPayload.append('image', imageFile);

                if (isEditMode && id) {
                    await assetApi.updateAsset(id, formDataPayload as any);
                    showToast('success', 'Asset updated', 'Asset has been successfully updated');
                } else {
                    await assetApi.createAsset(formDataPayload as any);
                    showToast('success', 'Asset created', 'Asset has been successfully created');
                }
            } else {
                // Regular JSON payload if no image
                const payload: any = {
                    ...formData,
                    purchase_cost:
                        formData.purchase_cost === '' || formData.purchase_cost == null
                            ? undefined
                            : Number(formData.purchase_cost),
                    image: imagePreview || undefined,
                };

                if (isEditMode && id) {
                    await assetApi.updateAsset(id, payload as any);
                    showToast('success', 'Asset updated', 'Asset has been successfully updated');
                } else {
                    await assetApi.createAsset(payload as any);
                    showToast('success', 'Asset created', 'Asset has been successfully created');
                }
            }

            navigate('/assets');
        } catch (error: any) {
            showToast('error', 'Failed to save asset', error?.message || 'Unable to save asset');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Loading asset...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/assets')}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Assets
                </button>
                <h1 className="text-2xl font-bold text-foreground">
                    {isEditMode ? 'Edit Asset' : 'Add Asset'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {isEditMode ? 'Update asset details' : 'Create a new asset'}
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Asset Image */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Asset Image</label>
                            <div className="space-y-3">
                                {imagePreview ? (
                                    <div className="relative inline-block">
                                        <img
                                            src={imagePreview}
                                            alt="Asset preview"
                                            className="w-32 h-32 object-cover rounded-lg border border-slate-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400">
                                        <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                                        <span className="text-xs text-slate-500">Add Image</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                        />
                                    </label>
                                )}
                                {!imagePreview && (
                                    <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-slate-50 cursor-pointer">
                                        <Upload className="w-4 h-4" />
                                        Choose File
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                        />
                                    </label>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    JPEG, PNG, GIF up to 5MB
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Type</label>
                                <select
                                    value={formData.asset_type}
                                    onChange={(e) =>
                                        setFormData({ ...formData, asset_type: e.target.value as Asset['asset_type'] })
                                    }
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="equipment">Equipment</option>
                                    <option value="vehicle">Vehicle</option>
                                    <option value="tool">Tool</option>
                                    <option value="facility">Facility</option>
                                    <option value="infrastructure">Infrastructure</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as AssetStatus })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="operational">Operational</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="down">Down</option>
                                    <option value="retired">Retired</option>
                                    <option value="disposed">Disposed</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Criticality</label>
                                <select
                                    value={formData.criticality}
                                    onChange={(e) =>
                                        setFormData({ ...formData, criticality: e.target.value as AssetCriticality })
                                    }
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                                <select
                                    value={formData.category || ''}
                                    onChange={(e) =>
                                        setFormData({ ...formData, category: e.target.value || undefined })
                                    }
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Uncategorized</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Site</label>
                                <select
                                    value={formData.site || ''}
                                    onChange={(e) => setFormData({ ...formData, site: e.target.value || undefined })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">No site</option>
                                    {sites.map((site) => (
                                        <option key={site.id} value={site.id}>
                                            {site.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Purchase Cost</label>
                                <input
                                    type="number"
                                    value={formData.purchase_cost === '' ? '' : formData.purchase_cost}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            purchase_cost: e.target.value === '' ? '' : Number(e.target.value),
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g., 5000"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Serial Number</label>
                                <input
                                    type="text"
                                    value={formData.serial_number || ''}
                                    onChange={(e) =>
                                        setFormData({ ...formData, serial_number: e.target.value || undefined })
                                    }
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Manufacturer</label>
                                <input
                                    type="text"
                                    value={formData.manufacturer || ''}
                                    onChange={(e) =>
                                        setFormData({ ...formData, manufacturer: e.target.value || undefined })
                                    }
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Model Number</label>
                                <input
                                    type="text"
                                    value={formData.model_number || ''}
                                    onChange={(e) =>
                                        setFormData({ ...formData, model_number: e.target.value || undefined })
                                    }
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
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
                        {submitting ? 'Saving...' : isEditMode ? 'Update Asset' : 'Create Asset'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/assets')}
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
