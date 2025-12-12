import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, MapPin, Navigation } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useNotifications } from '@/app/providers/NotificationProvider';
import { locationApi } from '@/features/sites/services/locationApi';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface SiteFormData {
    organization: string;
    name: string;
    code: string;
    description: string;
    site_type?: string;
    manager?: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    latitude?: number | null;
    longitude?: number | null;
    total_area?: number | '';
    area_unit: string;
    contact_email: string;
    contact_phone: string;
    is_active: boolean;
}

const emptyForm = (orgId: string): SiteFormData => ({
    organization: orgId,
    name: '',
    code: '',
    description: '',
    site_type: undefined,
    manager: undefined,
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    latitude: null,
    longitude: null,
    total_area: '',
    area_unit: 'sqm',
    contact_email: '',
    contact_phone: '',
    is_active: true,
});

// Map click handler component
function LocationMarker({ position, setPosition }: { 
    position: [number, number] | null; 
    setPosition: (pos: [number, number]) => void;
}) {
    useMapEvents({
        click(e) {
            // Format coordinates to max 7 decimal places as per backend validation
            const formattedLat = parseFloat(e.latlng.lat.toFixed(7));
            const formattedLng = parseFloat(e.latlng.lng.toFixed(7));
            setPosition([formattedLat, formattedLng]);
        },
    });

    return position ? <Marker position={position} /> : null;
}

// Component to recenter map
function RecenterMap({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

export default function SiteForm() {
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useNotifications();

    const orgId = (user as any)?.organization_id || (user as any)?.organization?.id || '';

    const [loading, setLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState<SiteFormData>(() => emptyForm(orgId));
    const [siteTypes, setSiteTypes] = useState<any[]>([]);
    const [managers, setManagers] = useState<any[]>([]);
    const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // Default to India center

    useEffect(() => {
        if (!orgId) return;
        loadOptions();
        if (isEditMode && id) {
            loadSite(id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orgId, isEditMode, id]);

    const loadOptions = async () => {
        try {
            const [siteTypesData, usersData] = await Promise.all([
                locationApi.listSiteTypes({ page_size: 100 }),
                locationApi.listOrganizationUsers({ organization: orgId, page_size: 100 }),
            ]);
            setSiteTypes(Array.isArray(siteTypesData) ? siteTypesData : siteTypesData.results || []);
            setManagers(Array.isArray(usersData) ? usersData : usersData.results || []);
        } catch (error: any) {
            console.error('Failed to load site options', error);
        }
    };

    const loadSite = async (siteId: string) => {
        setLoading(true);
        try {
            const site = await locationApi.getSite(siteId);
            setFormData({
                organization: site.organization,
                name: site.name,
                code: site.code || '',
                description: site.description || '',
                site_type: typeof site.site_type === 'object' ? (site.site_type as any)?.id : site.site_type,
                manager: typeof site.manager === 'object' ? (site.manager as any)?.id : site.manager,
                address_line1: site.address_line1 || '',
                address_line2: site.address_line2 || '',
                city: site.city || '',
                state: site.state || '',
                postal_code: site.postal_code || '',
                country: site.country || '',
                latitude: site.latitude || null,
                longitude: site.longitude || null,
                total_area: site.total_area || '',
                area_unit: 'sqm',
                contact_email: site.contact_email || '',
                contact_phone: site.contact_phone || '',
                is_active: site.is_active,
            });
            // Set map position if coordinates exist
            if (site.latitude && site.longitude) {
                setMapPosition([site.latitude, site.longitude]);
            }
        } catch (error: any) {
            showToast('error', 'Failed to load site', error?.message || 'Unable to load site for editing');
            navigate('/sites');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            showToast('error', 'Validation Error', 'Site name is required');
            return;
        }

        setSubmitting(true);
        try {
            const payload: any = {
                organization: orgId,
                name: formData.name.trim(),
                code: formData.code.trim() || undefined,
                description: formData.description.trim() || undefined,
                site_type: formData.site_type || undefined,
                manager: formData.manager || undefined,
                address_line1: formData.address_line1.trim() || undefined,
                address_line2: formData.address_line2.trim() || undefined,
                city: formData.city.trim() || undefined,
                state: formData.state.trim() || undefined,
                postal_code: formData.postal_code.trim() || undefined,
                country: formData.country.trim() || undefined,
                latitude: formData.latitude || undefined,
                longitude: formData.longitude || undefined,
                total_area: formData.total_area || undefined,
                area_unit: formData.area_unit || undefined,
                contact_email: formData.contact_email.trim() || undefined,
                contact_phone: formData.contact_phone.trim() || undefined,
                is_active: formData.is_active,
            };

            if (isEditMode && id) {
                await locationApi.updateSite(id, payload);
                showToast('success', 'Site Updated', 'Site has been successfully updated');
            } else {
                await locationApi.createSite(payload);
                showToast('success', 'Site Created', 'Site has been successfully created');
            }
            navigate('/sites');
        } catch (error: any) {
            const message = error?.response?.data?.detail || error?.message || 'Failed to save site';
            showToast('error', 'Error', message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-64 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/sites')}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {isEditMode ? 'Edit Site' : 'New Site'}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {isEditMode ? 'Update site information' : 'Add a new facility site'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Basic Information</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Site Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                                placeholder="Enter site name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Site Code</label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                                placeholder="e.g., MAIN, WH-1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Site Type</label>
                            <select
                                name="site_type"
                                value={formData.site_type || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                            >
                                <option value="">Select site type</option>
                                {siteTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name || type.code}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Manager</label>
                            <select
                                name="manager"
                                value={formData.manager || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                            >
                                <option value="">Select manager</option>
                                {managers.map((mgr) => (
                                    <option key={mgr.id || mgr.user} value={mgr.user || mgr.id}>
                                        {mgr.user_name || mgr.user_email || mgr.email || `User ${mgr.user || mgr.id}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                                placeholder="Enter site description"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Address</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1">Address Line 1</label>
                            <input
                                type="text"
                                name="address_line1"
                                value={formData.address_line1}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                                placeholder="Street address"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1">Address Line 2</label>
                            <input
                                type="text"
                                name="address_line2"
                                value={formData.address_line2}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                                placeholder="Apt, suite, unit, etc."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">City</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                                placeholder="City"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">State / Province</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                                placeholder="State or province"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Postal Code</label>
                            <input
                                type="text"
                                name="postal_code"
                                value={formData.postal_code}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                                placeholder="Postal code"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Country</label>
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                                placeholder="Country code (e.g., IN, US)"
                            />
                        </div>
                    </div>
                </div>

                {/* Location Map Section */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-indigo-600" />
                        Location on Map
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Click on the map to set the site location, or enter coordinates manually.
                    </p>
                    
                    {/* Coordinate Inputs */}
                    <div className="grid gap-4 md:grid-cols-2 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Latitude</label>
                            <input
                                type="number"
                                step="any"
                                value={formData.latitude ?? ''}
                                onChange={(e) => {
                                    const lat = e.target.value ? parseFloat(e.target.value) : null;
                                    // Format to max 7 decimal places as per backend validation
                                    const formattedLat = lat !== null ? parseFloat(lat.toFixed(7)) : null;
                                    setFormData({ ...formData, latitude: formattedLat });
                                    if (formattedLat && formData.longitude) {
                                        setMapPosition([formattedLat, formData.longitude]);
                                        setMapCenter([formattedLat, formData.longitude]);
                                    }
                                }}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                                placeholder="e.g., 20.0063"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Longitude</label>
                            <input
                                type="number"
                                step="any"
                                value={formData.longitude ?? ''}
                                onChange={(e) => {
                                    const lng = e.target.value ? parseFloat(e.target.value) : null;
                                    // Format to max 7 decimal places as per backend validation
                                    const formattedLng = lng !== null ? parseFloat(lng.toFixed(7)) : null;
                                    setFormData({ ...formData, longitude: formattedLng });
                                    if (formData.latitude && formattedLng) {
                                        setMapPosition([formData.latitude, formattedLng]);
                                        setMapCenter([formData.latitude, formattedLng]);
                                    }
                                }}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                                placeholder="e.g., 73.7898"
                            />
                        </div>
                    </div>

                    {/* Get Current Location Button */}
                    <div className="mb-4">
                        <button
                            type="button"
                            onClick={() => {
                                if (navigator.geolocation) {
                                    navigator.geolocation.getCurrentPosition(
                                        (position) => {
                                            const lat = position.coords.latitude;
                                            const lng = position.coords.longitude;
                                            // Format to max 7 decimal places as per backend validation
                                            const formattedLat = parseFloat(lat.toFixed(7));
                                            const formattedLng = parseFloat(lng.toFixed(7));
                                            setFormData({ ...formData, latitude: formattedLat, longitude: formattedLng });
                                            setMapPosition([formattedLat, formattedLng]);
                                            setMapCenter([formattedLat, formattedLng]);
                                            showToast('success', 'Location detected', `Coordinates: ${formattedLat.toFixed(6)}, ${formattedLng.toFixed(6)}`);
                                        },
                                        (error) => {
                                            showToast('error', 'Location error', error.message);
                                        }
                                    );
                                } else {
                                    showToast('error', 'Not supported', 'Geolocation is not supported by your browser');
                                }
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
                        >
                            <Navigation className="w-4 h-4" />
                            Use My Current Location
                        </button>
                    </div>

                    {/* Map Container */}
                    <div className="h-[400px] rounded-xl overflow-hidden border border-slate-200">
                        <MapContainer
                            center={mapCenter}
                            zoom={5}
                            style={{ height: '100%', width: '100%' }}
                            className="z-0"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <LocationMarker
                                position={mapPosition}
                                setPosition={(pos) => {
                                    setMapPosition(pos);
                                    setFormData({ ...formData, latitude: pos[0], longitude: pos[1] });
                                }}
                            />
                            {mapPosition && <RecenterMap center={mapPosition} />}
                        </MapContainer>
                    </div>
                    
                    {mapPosition && typeof mapPosition[0] === 'number' && typeof mapPosition[1] === 'number' && (
                        <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            Selected: {mapPosition[0].toFixed(6)}, {mapPosition[1].toFixed(6)}
                        </p>
                    )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Additional Details</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Total Area</label>
                            <input
                                type="number"
                                name="total_area"
                                value={formData.total_area}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                                placeholder="Total area"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Area Unit</label>
                            <select
                                name="area_unit"
                                value={formData.area_unit}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                            >
                                <option value="sqm">Square Meters (sqm)</option>
                                <option value="sqft">Square Feet (sqft)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Contact Email</label>
                            <input
                                type="email"
                                name="contact_email"
                                value={formData.contact_email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                                placeholder="contact@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Contact Phone</label>
                            <input
                                type="tel"
                                name="contact_phone"
                                value={formData.contact_phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                                placeholder="+1 234 567 8900"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-foreground">Site is active</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/sites')}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {submitting ? 'Saving...' : isEditMode ? 'Update Site' : 'Create Site'}
                    </button>
                </div>
            </form>
        </div>
    );
}
