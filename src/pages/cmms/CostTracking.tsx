import { useState, useEffect } from 'react';

import { TrendingUp, TrendingDown, Plus, X, Edit, Eye, Download } from 'lucide-react';
import { dataService, Cost, Job } from '../../lib/dataService';
import { generateCostTrackingPDF } from '../../lib/pdfGenerator';

import { useDataAccess } from '../../hooks/useDataAccess';

export default function CostTracking() {
  const { isAdmin, isManager, userAccess } = useDataAccess();
  const assignedWorkOrders = userAccess?.assignedWorkOrders || [];
  const [costs, setCosts] = useState<Cost[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCost, setSelectedCost] = useState<Cost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newCost, setNewCost] = useState({
    jobId: '',
    type: '',
    description: '',
    estimatedCost: 0,
    actualCost: 0,
    quantity: 1,
    unitCost: 0,
    unit: '',
    supplier: '',
    date: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
    status: 'Pending',
  });

  useEffect(() => {
    const allCosts = dataService.getCosts();
    const allJobs = dataService.getJobs();

    if (isAdmin || isManager) {
      setCosts(allCosts);
      setJobs(allJobs);
    } else {
      // Filter for technicians: only costs related to assigned work orders
      const userCosts = allCosts.filter(cost =>
        cost.jobId && assignedWorkOrders.includes(cost.jobId)
      );
      setCosts(userCosts);

      // Filter jobs to only assigned ones
      const userJobs = allJobs.filter(job =>
        assignedWorkOrders.includes(job.id)
      );
      setJobs(userJobs);
    }
  }, [isAdmin, isManager, assignedWorkOrders]);

  const totalEstimated = costs.reduce((sum, c) => sum + c.estimatedCost, 0);
  const totalActual = costs.reduce((sum, c) => sum + c.actualCost, 0);
  const variance = totalActual - totalEstimated;
  const variancePercentage = totalEstimated > 0 ? ((variance / totalEstimated) * 100).toFixed(1) : 0;

  const costsByType = costs.reduce((acc, cost) => {
    acc[cost.type] = (acc[cost.type] || 0) + cost.actualCost;
    return acc;
  }, {} as Record<string, number>);

  const handleViewCost = (cost: Cost) => {
    setSelectedCost(cost);
    setIsEditing(false);
    setShowDetailModal(true);
  };

  const handleEditCost = (cost: Cost) => {
    setSelectedCost(cost);
    setIsEditing(true);
    setShowDetailModal(true);
  };

  const handleUpdateCost = () => {
    if (!selectedCost) return;

    const updated = costs.map(c => c.id === selectedCost.id ? selectedCost : c);
    setCosts(updated);
    setShowDetailModal(false);
    setSelectedCost(null);
    setIsEditing(false);
    alert('Cost entry updated successfully!');
  };

  const handleAddCost = () => {
    if (!newCost.description || !newCost.type || newCost.actualCost <= 0) {
      alert('Please fill in all required fields (Description, Type, and Actual Cost).');
      return;
    }

    const newId = `COST-${Date.now()}`;
    const cost: Cost = {
      id: newId,
      jobId: newCost.jobId,
      type: newCost.type,
      description: newCost.description,
      estimatedCost: newCost.estimatedCost,
      actualCost: newCost.actualCost,
      quantity: newCost.quantity,
      unitCost: newCost.unitCost,
      unit: newCost.unit,
      supplier: newCost.supplier,
      date: newCost.date,
      invoiceNumber: newCost.invoiceNumber || null,
      status: newCost.status,
    };

    setCosts([cost, ...costs]);
    setNewCost({
      jobId: '',
      type: '',
      description: '',
      estimatedCost: 0,
      actualCost: 0,
      quantity: 1,
      unitCost: 0,
      unit: '',
      supplier: '',
      date: new Date().toISOString().split('T')[0],
      invoiceNumber: '',
      status: 'Pending',
    });
    setShowAddModal(false);
    alert(`Cost entry "${cost.description}" added successfully!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Cost Tracking & Budgeting</h1>
          <p className="text-slate-600 mt-1">Monitor expenses and budget variances</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Cost</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total Estimated</p>
          <p className="text-2xl font-bold text-slate-900">£{totalEstimated.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total Actual</p>
          <p className="text-2xl font-bold text-blue-600">£{totalActual.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Variance</p>
          <p className={`text-2xl font-bold ${variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {variance > 0 ? '+' : ''}£{Math.abs(variance).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">Variance %</p>
            {variance > 0 ? <TrendingUp className="w-5 h-5 text-red-500" /> : <TrendingDown className="w-5 h-5 text-green-500" />}
          </div>
          <p className={`text-2xl font-bold ${variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {variance > 0 ? '+' : ''}{variancePercentage}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Costs by Type</h2>
          <div className="space-y-3">
            {Object.entries(costsByType).map(([type, amount]) => {
              const percentage = (amount / totalActual) * 100;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-900">{type}</span>
                    <span className="text-sm font-bold text-slate-900">£{amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{percentage.toFixed(1)}% of total</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Cost Summary by Job</h2>
          <div className="space-y-3">
            {jobs.slice(0, 5).map((job) => {
              const jobCosts = dataService.getTotalCostByJob(job.id);
              return (
                <div key={job.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{job.title}</p>
                    <p className="text-xs text-slate-500">{job.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">£{jobCosts.actual.toLocaleString()}</p>
                    <p className={`text-xs ${jobCosts.actual > jobCosts.estimated ? 'text-red-600' : 'text-green-600'}`}>
                      Est: £{jobCosts.estimated.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Recent Costs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 uppercase">Description</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 uppercase">Type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 uppercase">Supplier</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-600 uppercase">Estimated</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-600 uppercase">Actual</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-600 uppercase">Variance</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {costs.map((cost) => {
                const costVariance = cost.actualCost - cost.estimatedCost;
                return (
                  <tr key={cost.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => handleViewCost(cost)}>
                    <td className="px-6 py-4 text-slate-600">{new Date(cost.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{cost.description}</p>
                      <p className="text-xs text-slate-500">{cost.quantity} {cost.unit}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                        {cost.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{cost.supplier}</td>
                    <td className="px-6 py-4 text-right text-slate-600">£{cost.estimatedCost.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">£{cost.actualCost.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-medium ${costVariance > 0 ? 'text-red-600' : costVariance < 0 ? 'text-green-600' : 'text-slate-600'}`}>
                        {costVariance > 0 ? '+' : ''}£{Math.abs(costVariance).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleViewCost(cost); }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditCost(cost); }}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit cost"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Cost Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Add New Cost Entry</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCost({
                    jobId: '',
                    type: '',
                    description: '',
                    estimatedCost: 0,
                    actualCost: 0,
                    quantity: 1,
                    unitCost: 0,
                    unit: '',
                    supplier: '',
                    date: new Date().toISOString().split('T')[0],
                    invoiceNumber: '',
                    status: 'Pending',
                  });
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCost.description}
                  onChange={(e) => setNewCost({ ...newCost, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What was purchased or paid for?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={newCost.type}
                  onChange={(e) => setNewCost({ ...newCost, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="Materials">Materials</option>
                  <option value="Labor">Labor</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Tools">Tools</option>
                  <option value="Subcontractor">Subcontractor</option>
                  <option value="Permits">Permits</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newCost.date}
                  onChange={(e) => setNewCost({ ...newCost, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Related Job</label>
                <select
                  value={newCost.jobId}
                  onChange={(e) => setNewCost({ ...newCost, jobId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Job (General Expense)</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>{job.id} - {job.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Supplier/Vendor</label>
                <input
                  type="text"
                  value={newCost.supplier}
                  onChange={(e) => setNewCost({ ...newCost, supplier: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Company or person paid"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Quantity</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={newCost.quantity}
                  onChange={(e) => setNewCost({ ...newCost, quantity: parseFloat(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Unit</label>
                <select
                  value={newCost.unit}
                  onChange={(e) => setNewCost({ ...newCost, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Unit</option>
                  <option value="unit">Unit(s)</option>
                  <option value="hours">Hour(s)</option>
                  <option value="days">Day(s)</option>
                  <option value="kg">Kilogram(s)</option>
                  <option value="m">Meter(s)</option>
                  <option value="m²">Square Meter(s)</option>
                  <option value="litre">Litre(s)</option>
                  <option value="box">Box(es)</option>
                  <option value="pallet">Pallet(s)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Unit Cost</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newCost.unitCost}
                  onChange={(e) => setNewCost({ ...newCost, unitCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="£0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Estimated Cost</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newCost.estimatedCost}
                  onChange={(e) => setNewCost({ ...newCost, estimatedCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="£0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Actual Cost <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newCost.actualCost}
                  onChange={(e) => setNewCost({ ...newCost, actualCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="£0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Invoice Number</label>
                <input
                  type="text"
                  value={newCost.invoiceNumber}
                  onChange={(e) => setNewCost({ ...newCost, invoiceNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="INV-12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={newCost.status}
                  onChange={(e) => setNewCost({ ...newCost, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Paid">Paid</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-4 mt-6 border-t border-slate-200">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCost({
                    jobId: '',
                    type: '',
                    description: '',
                    estimatedCost: 0,
                    actualCost: 0,
                    quantity: 1,
                    unitCost: 0,
                    unit: '',
                    supplier: '',
                    date: new Date().toISOString().split('T')[0],
                    invoiceNumber: '',
                    status: 'Pending',
                  });
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCost}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Cost</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View/Edit Cost Modal */}
      {showDetailModal && selectedCost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                {isEditing ? 'Edit Cost Entry' : 'Cost Entry Details'}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const relatedJob = jobs.find(j => j.id === selectedCost.jobId);
                    generateCostTrackingPDF(selectedCost, relatedJob);
                  }}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Download PDF"
                >
                  <Download className="w-5 h-5" />
                </button>
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
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedCost(null);
                    setIsEditing(false);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={selectedCost.description}
                    onChange={(e) => setSelectedCost({ ...selectedCost, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-slate-900 font-medium">{selectedCost.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                <p className="text-slate-600">{new Date(selectedCost.date).toLocaleDateString()}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                <p className="text-slate-600">{selectedCost.type}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Supplier</label>
                <p className="text-slate-600">{selectedCost.supplier}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Invoice Number</label>
                <p className="text-slate-600">{selectedCost.invoiceNumber || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Quantity</label>
                <p className="text-slate-600">{selectedCost.quantity} {selectedCost.unit}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Unit Cost</label>
                <p className="text-slate-600">£{selectedCost.unitCost.toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Estimated Cost</label>
                <p className="text-slate-900 font-semibold">£{selectedCost.estimatedCost.toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Actual Cost</label>
                <p className="text-blue-600 font-semibold text-lg">£{selectedCost.actualCost.toLocaleString()}</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Variance</label>
                {(() => {
                  const variance = selectedCost.actualCost - selectedCost.estimatedCost;
                  return (
                    <p className={`font-semibold text-lg ${variance > 0 ? 'text-red-600' : variance < 0 ? 'text-green-600' : 'text-slate-600'}`}>
                      {variance > 0 ? '+' : ''}£{Math.abs(variance).toLocaleString()}
                      <span className="text-sm ml-2">
                        ({variance > 0 ? 'Over Budget' : variance < 0 ? 'Under Budget' : 'On Budget'})
                      </span>
                    </p>
                  );
                })()}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                {isEditing ? (
                  <select
                    value={selectedCost.status}
                    onChange={(e) => setSelectedCost({ ...selectedCost, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Paid">Paid</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                ) : (
                  <p className="text-slate-600">{selectedCost.status}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Related Job</label>
                <p className="text-slate-600">
                  {selectedCost.jobId || 'General Expense'}
                </p>
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
                    onClick={handleUpdateCost}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedCost(null);
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
