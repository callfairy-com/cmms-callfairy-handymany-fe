import { useState, useEffect } from 'react';
import { Plus, MapPin, Building, Trash2, Package, X } from 'lucide-react';
import { dataService, Site } from '../../lib/dataService';
import { AddressFinder } from '../../components/shared/AddressFinder';
import { AddressSuggestion } from '../../services/postcodeService';

import { useAuth } from '../../contexts/AuthContext';
import { useDataAccess } from '../../hooks/useDataAccess';

export default function Sites() {
  const { hasPermission } = useAuth();
  const { userAccess } = useDataAccess();
  const assignedWorkOrders = userAccess?.assignedWorkOrders || [];
  const [sites, setSites] = useState<Site[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newSite, setNewSite] = useState({
    name: '',
    type: '',
    address: '',
    size: 0,
    sizeUnit: 'sq ft' as 'sq ft' | 'sq m',
    manager: '',
    operatingHours: '',
    buildings: [] as string[],
    newBuilding: '',
    coordinates: { lat: 0, lng: 0 },
  });

  useEffect(() => {
    const allSites = dataService.getSites();

    if (hasPermission('can_view_all_sites')) {
      setSites(allSites);
    } else if (hasPermission('can_view_assigned_sites')) {
      // Filter sites based on assigned work orders
      // Get all jobs assigned to user
      const allJobs = dataService.getJobs();
      const userJobs = allJobs.filter(job => assignedWorkOrders.includes(job.id));

      // Get unique site names/IDs from user jobs
      const userSiteNames = new Set(userJobs.map(job => job.site));

      // Filter sites
      const userSites = allSites.filter(site =>
        userSiteNames.has(site.name) || userSiteNames.has(site.id)
      );
      setSites(userSites);
    } else {
      setSites([]);
    }
  }, [hasPermission, assignedWorkOrders]);

  const handleAddSite = () => {
    if (!newSite.name || !newSite.address) {
      alert('Please fill in all required fields');
      return;
    }

    const site: Site = {
      id: `SITE-${Date.now()}`,
      name: newSite.name,
      type: newSite.type,
      address: newSite.address,
      size: newSite.size,
      sizeUnit: newSite.sizeUnit,
      buildings: newSite.buildings,
      assetCount: 0,
      activeJobs: 0,
      manager: newSite.manager,
      status: 'Active',
      operatingHours: newSite.operatingHours,
      emergencyContact: '',
      coordinates: newSite.coordinates,
    };

    setSites([...sites, site]);
    setNewSite({
      name: '',
      type: '',
      address: '',
      size: 0,
      sizeUnit: 'sq ft',
      manager: '',
      operatingHours: '',
      buildings: [],
      newBuilding: '',
      coordinates: { lat: 0, lng: 0 },
    });
    setShowAddModal(false);
    alert(`Site "${site.name}" created successfully!`);
  };

  const handleDeleteSite = (siteId: string) => {
    if (confirm('Are you sure you want to delete this site?')) {
      setSites(sites.filter(site => site.id !== siteId));
      alert('Site deleted successfully!');
    }
  };




  const addBuilding = () => {
    if (newSite.newBuilding.trim()) {
      setNewSite({
        ...newSite,
        buildings: [...newSite.buildings, newSite.newBuilding.trim()],
        newBuilding: '',
      });
    }
  };

  const removeBuilding = (index: number) => {
    setNewSite({
      ...newSite,
      buildings: newSite.buildings.filter((_, i) => i !== index),
    });
  };

  const handleAddressSelect = (addressSuggestion: AddressSuggestion) => {
    setNewSite({
      ...newSite,
      address: addressSuggestion.formatted_address,
      coordinates: {
        lat: addressSuggestion.latitude,
        lng: addressSuggestion.longitude,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sites & Locations</h1>
          <p className="text-slate-600 mt-1">Manage multiple sites and facilities</p>
        </div>
        {hasPermission('can_create_sites') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            <span>Add Site</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total Sites</p>
          <p className="text-2xl font-bold text-slate-900">{sites.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Active Sites</p>
          <p className="text-2xl font-bold text-green-600">
            {sites.filter(s => s.status === 'Active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total Assets</p>
          <p className="text-2xl font-bold text-blue-600">
            {sites.reduce((sum, s) => sum + s.assetCount, 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Active Jobs</p>
          <p className="text-2xl font-bold text-orange-600">
            {sites.reduce((sum, s) => sum + s.activeJobs, 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sites.map((site) => {
          const manager = dataService.getUserById(site.manager);

          return (
            <div key={site.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{site.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{site.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${site.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                    {site.status}
                  </span>

                  <button
                    onClick={() => handleDeleteSite(site.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                  <p className="text-sm text-slate-600">{site.address}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-slate-400" />
                  <p className="text-sm text-slate-600">
                    {site.size.toLocaleString()} {site.sizeUnit}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-xs text-slate-600">Buildings</p>
                  <p className="text-lg font-bold text-slate-900">{site.buildings.length}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Assets</p>
                  <p className="text-lg font-bold text-blue-600">{site.assetCount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Active Jobs</p>
                  <p className="text-lg font-bold text-orange-600">{site.activeJobs}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600">Site Manager</p>
                    <p className="text-sm font-medium text-slate-900">{manager?.name || 'Unassigned'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-600">Operating Hours</p>
                    <p className="text-sm font-medium text-slate-900">{site.operatingHours}</p>
                  </div>
                </div>
              </div>

              {site.buildings.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-600 mb-2">Buildings:</p>
                  <div className="flex flex-wrap gap-2">
                    {site.buildings.map((building) => (
                      <span key={building} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                        {building}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Site Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Add New Site</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Site Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSite.name}
                  onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter site name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Site Type</label>
                <select
                  value={newSite.type}
                  onChange={(e) => setNewSite({ ...newSite, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="Office Building">Office Building</option>
                  <option value="Warehouse">Warehouse</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Educational">Educational</option>
                  <option value="Mixed Use">Mixed Use</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Manager</label>
                <select
                  value={newSite.manager}
                  onChange={(e) => setNewSite({ ...newSite, manager: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Manager</option>
                  {dataService.getUsers().map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <AddressFinder
                  onAddressSelect={handleAddressSelect}
                  placeholder="Enter UK postcode (e.g., SW1A 1AA) to find address"
                  className="w-full"
                />
                {newSite.address && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Selected Address:</p>
                        <p className="text-sm text-green-700">{newSite.address}</p>
                        {newSite.coordinates.lat !== 0 && newSite.coordinates.lng !== 0 && (
                          <p className="text-xs text-green-600 mt-1">
                            Coordinates: {newSite.coordinates.lat.toFixed(6)}, {newSite.coordinates.lng.toFixed(6)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Size</label>
                <input
                  type="number"
                  min="0"
                  value={newSite.size}
                  onChange={(e) => setNewSite({ ...newSite, size: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Size Unit</label>
                <select
                  value={newSite.sizeUnit}
                  onChange={(e) => setNewSite({ ...newSite, sizeUnit: e.target.value as 'sq ft' | 'sq m' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sq ft">Square Feet</option>
                  <option value="sq m">Square Meters</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Operating Hours</label>
                <input
                  type="text"
                  value={newSite.operatingHours}
                  onChange={(e) => setNewSite({ ...newSite, operatingHours: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mon-Fri 9:00 AM - 5:00 PM"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Buildings</label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newSite.newBuilding}
                      onChange={(e) => setNewSite({ ...newSite, newBuilding: e.target.value })}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Building name"
                    />
                    <button
                      type="button"
                      onClick={addBuilding}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  {newSite.buildings.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newSite.buildings.map((building, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                        >
                          {building}
                          <button
                            type="button"
                            onClick={() => removeBuilding(index)}
                            className="ml-2 text-blue-500 hover:text-blue-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewSite({
                    name: '',
                    type: '',
                    address: '',
                    size: 0,
                    sizeUnit: 'sq ft',
                    manager: '',
                    operatingHours: '',
                    buildings: [],
                    newBuilding: '',
                    coordinates: { lat: 0, lng: 0 },
                  });
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSite}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Site</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
