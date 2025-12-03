import { useState, useEffect } from 'react';
import { Plus, Search, Package, QrCode, Upload, X, Eye, Edit, Download } from 'lucide-react';
import { dataService, Asset } from '../../lib/dataService';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { generateAssetPDF } from '../../lib/pdfGenerator';

export default function Assets() {
  const { hasPermission } = useAuth();
  const { addNotification } = useNotifications();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: '',
    type: '',
    category: '',
    subCategory: '',
    serialNumber: '',
    location: '',
    site: '',
    manufacturer: '',
    model: '',
    installationDate: '',
    warrantyExpiry: '',
    purchasePrice: 0,
    currentValue: 0,
    image: '',
  });
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    const allAssets = dataService.getAssets();
    // Sort by creation date - newest first
    const sortedAssets = [...allAssets].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setAssets(sortedAssets);
    setFilteredAssets(sortedAssets);
  }, []);

  useEffect(() => {
    let filtered = assets;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(asset => asset.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAssets(filtered);
  }, [filterStatus, searchTerm, assets]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setNewAsset({ ...newAsset, image: result });
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAsset = () => {
    if (!newAsset.name || !newAsset.type || !newAsset.serialNumber || !newAsset.image) {
      alert('Please fill in all required fields including the asset image');
      return;
    }

    // Generate new asset ID
    const newId = `AST-${Date.now()}`;
    const now = new Date().toISOString();

    // Create new asset object
    const asset: Asset = {
      id: newId,
      name: newAsset.name,
      type: newAsset.type,
      category: newAsset.category,
      subCategory: newAsset.subCategory,
      serialNumber: newAsset.serialNumber,
      location: newAsset.location,
      site: newAsset.site,
      status: 'Operational',
      condition: 'Good',
      manufacturer: newAsset.manufacturer,
      model: newAsset.model,
      installationDate: newAsset.installationDate,
      warrantyExpiry: newAsset.warrantyExpiry,
      purchasePrice: newAsset.purchasePrice,
      currentValue: newAsset.currentValue,
      expectedReplacement: '',
      qrCode: `QR-${newId}`,
      barcode: `BC-${newId}`,
      lastServiceDate: '',
      nextServiceDate: '',
      maintenanceHistory: [],
      image: newAsset.image,
      createdAt: now,
    };

    // Add to assets list and sort by creation date (newest first)
    const updatedAssets = [asset, ...assets];
    setAssets(updatedAssets);
    setFilteredAssets(updatedAssets);

    // Generate notification for new asset creation
    addNotification({
      type: 'success',
      title: 'New Asset Created',
      message: `Asset "${newAsset.name}" (${newAsset.type}) has been successfully added to the system.`,
      actionUrl: `/assets/${newId}`
    });

    // Reset form and close modal
    setNewAsset({
      name: '',
      type: '',
      category: '',
      subCategory: '',
      serialNumber: '',
      location: '',
      site: '',
      manufacturer: '',
      model: '',
      installationDate: '',
      warrantyExpiry: '',
      purchasePrice: 0,
      currentValue: 0,
      image: '',
    });
    setImagePreview('');
    setShowAddModal(false);

    alert(`Asset ${newId} created successfully!`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Operational': return 'bg-green-100 text-green-700';
      case 'Under Maintenance': return 'bg-orange-100 text-orange-700';
      case 'Offline': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Excellent': return 'text-green-600';
      case 'Good': return 'text-blue-600';
      case 'Fair': return 'text-yellow-600';
      case 'Poor': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  const handleViewAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsEditing(false);
    setShowDetailModal(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsEditing(true);
    setShowDetailModal(true);
  };

  const handleUpdateAsset = () => {
    if (!selectedAsset) return;

    const updated = assets.map(a => a.id === selectedAsset.id ? selectedAsset : a);
    setAssets(updated);
    setFilteredAssets(updated.filter(a => {
      let match = true;
      if (filterStatus !== 'all') match = match && a.status === filterStatus;
      if (searchTerm) match = match && (a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      return match;
    }));

    setShowDetailModal(false);
    setSelectedAsset(null);
    setIsEditing(false);
    alert('Asset updated successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Asset Management</h1>
          <p className="text-slate-600 mt-1">Track and manage all facility assets</p>
        </div>
        {hasPermission('can_add_assets') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            <span>Add Asset</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Operational">Operational</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Offline">Offline</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total Assets</p>
          <p className="text-2xl font-bold text-slate-900">{assets.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Operational</p>
          <p className="text-2xl font-bold text-green-600">
            {assets.filter(a => a.status === 'Operational').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Under Maintenance</p>
          <p className="text-2xl font-bold text-orange-600">
            {assets.filter(a => a.status === 'Under Maintenance').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total Value</p>
          <p className="text-2xl font-bold text-slate-900">
            £{assets.reduce((sum, a) => sum + a.currentValue, 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleViewAsset(asset)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                {asset.image ? (
                  <img src={asset.image} alt={asset.name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                  {asset.status}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleViewAsset(asset); }}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleEditAsset(asset); }}
                  className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Edit asset"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-slate-900 mb-2">{asset.name}</h3>
            <p className="text-sm text-slate-600 mb-3">{asset.type} • {asset.category}</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Condition</span>
                <span className={`font-medium ${getConditionColor(asset.condition)}`}>{asset.condition}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Location</span>
                <span className="font-medium text-slate-900 text-xs">{asset.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Next Service</span>
                <span className="font-medium text-slate-900 text-xs">
                  {new Date(asset.nextServiceDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-600">Value</span>
                <span className="font-semibold text-slate-900">£{asset.currentValue.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-2 text-xs text-slate-500">
              <QrCode className="w-4 h-4" />
              <span>{asset.serialNumber}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Add New Asset</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Asset Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter asset name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Asset Image <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="w-full px-3 py-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 transition-colors flex items-center justify-center space-x-2">
                      <Upload className="w-5 h-5 text-slate-500" />
                      <span className="text-sm text-slate-600">
                        {newAsset.image ? 'Change Image' : 'Upload Image'}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-slate-200">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => {
                          setNewAsset({ ...newAsset, image: '' });
                          setImagePreview('');
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                {!newAsset.image && (
                  <p className="text-xs text-slate-500 mt-1">Upload a photo of the asset (required)</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Asset Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={newAsset.type}
                  onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Safety">Safety</option>
                  <option value="IT Equipment">IT Equipment</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select
                  value={newAsset.category}
                  onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  <option value="Critical">Critical</option>
                  <option value="Important">Important</option>
                  <option value="Standard">Standard</option>
                  <option value="Non-Critical">Non-Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sub-Category</label>
                <input
                  type="text"
                  value={newAsset.subCategory}
                  onChange={(e) => setNewAsset({ ...newAsset, subCategory: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter sub-category (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Serial Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAsset.serialNumber}
                  onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter serial number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Manufacturer</label>
                <input
                  type="text"
                  value={newAsset.manufacturer}
                  onChange={(e) => setNewAsset({ ...newAsset, manufacturer: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter manufacturer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Model</label>
                <input
                  type="text"
                  value={newAsset.model}
                  onChange={(e) => setNewAsset({ ...newAsset, model: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter model"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Site</label>
                <select
                  value={newAsset.site}
                  onChange={(e) => setNewAsset({ ...newAsset, site: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Site</option>
                  {dataService.getSites().map(site => (
                    <option key={site.id} value={site.name}>{site.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                <input
                  type="text"
                  value={newAsset.location}
                  onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Specific location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Installation Date</label>
                <input
                  type="date"
                  value={newAsset.installationDate}
                  onChange={(e) => setNewAsset({ ...newAsset, installationDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Warranty Expiry</label>
                <input
                  type="date"
                  value={newAsset.warrantyExpiry}
                  onChange={(e) => setNewAsset({ ...newAsset, warrantyExpiry: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Purchase Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newAsset.purchasePrice}
                  onChange={(e) => setNewAsset({ ...newAsset, purchasePrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Current Value</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newAsset.currentValue}
                  onChange={(e) => setNewAsset({ ...newAsset, currentValue: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewAsset({
                    name: '',
                    type: '',
                    category: '',
                    subCategory: '',
                    serialNumber: '',
                    location: '',
                    site: '',
                    manufacturer: '',
                    model: '',
                    installationDate: '',
                    warrantyExpiry: '',
                    purchasePrice: 0,
                    currentValue: 0,
                    image: '',
                  });
                  setImagePreview('');
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAsset}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Asset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View/Edit Asset Modal */}
      {showDetailModal && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                {isEditing ? 'Edit Asset' : 'Asset Details'}
              </h3>
              <div className="flex items-center space-x-2">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => generateAssetPDF(selectedAsset)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Download PDF"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    alert('QR Code would be generated here - integrate with a QR code library');
                  }}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title="Generate QR Code"
                >
                  <QrCode className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedAsset(null);
                    setIsEditing(false);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Asset Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Asset Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={selectedAsset.name}
                    onChange={(e) => setSelectedAsset({ ...selectedAsset, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-slate-900 font-medium">{selectedAsset.name}</p>
                )}
              </div>

              {/* Type & Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={selectedAsset.type}
                    onChange={(e) => setSelectedAsset({ ...selectedAsset, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-slate-600">{selectedAsset.type}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={selectedAsset.category}
                    onChange={(e) => setSelectedAsset({ ...selectedAsset, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-slate-600">{selectedAsset.category}</p>
                )}
              </div>

              {/* Serial & Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Serial Number</label>
                <p className="text-slate-600 flex items-center">
                  <QrCode className="w-4 h-4 mr-2" />
                  {selectedAsset.serialNumber}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                {isEditing ? (
                  <select
                    value={selectedAsset.status}
                    onChange={(e) => setSelectedAsset({ ...selectedAsset, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Offline">Offline</option>
                  </select>
                ) : (
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(selectedAsset.status)}`}>
                    {selectedAsset.status}
                  </span>
                )}
              </div>

              {/* Location & Site */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={selectedAsset.location}
                    onChange={(e) => setSelectedAsset({ ...selectedAsset, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-slate-600">{selectedAsset.location}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Site</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={selectedAsset.site}
                    onChange={(e) => setSelectedAsset({ ...selectedAsset, site: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-slate-600">{selectedAsset.site}</p>
                )}
              </div>

              {/* Manufacturer & Model */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Manufacturer</label>
                <p className="text-slate-600">{selectedAsset.manufacturer}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Model</label>
                <p className="text-slate-600">{selectedAsset.model}</p>
              </div>

              {/* Condition */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Condition</label>
                {isEditing ? (
                  <select
                    value={selectedAsset.condition}
                    onChange={(e) => setSelectedAsset({ ...selectedAsset, condition: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                ) : (
                  <span className={`font-medium ${getConditionColor(selectedAsset.condition)}`}>
                    {selectedAsset.condition}
                  </span>
                )}
              </div>

              {/* Values */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Purchase Price</label>
                <p className="text-slate-900 font-semibold">£{selectedAsset.purchasePrice.toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Current Value</label>
                <p className="text-green-600 font-semibold">£{selectedAsset.currentValue.toLocaleString()}</p>
              </div>

              {/* Service Date */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Next Service Date</label>
                <p className="text-slate-600">{new Date(selectedAsset.nextServiceDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-4 border-t border-slate-200">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateAsset}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedAsset(null);
                  }}
                  className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
