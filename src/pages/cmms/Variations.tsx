import { useState, useEffect } from 'react';
import { GitBranch, CheckCircle, Clock, XCircle, Plus } from 'lucide-react';
import { dataService, Variation, Job } from '../../lib/dataService';
import { useDataAccess } from '../../hooks/useDataAccess';
import { useAuth } from '../../contexts/AuthContext';

export default function Variations() {
  const { filterVariations, filterWorkOrders, isContractor, canApproveWorkOrder } = useDataAccess();
  const { hasPermission, user } = useAuth();
  const [variations, setVariations] = useState<Variation[]>([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [approvalComments, setApprovalComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    jobId: '',
    title: '',
    description: '',
    type: 'Scope Change',
    originalCost: '',
    variationCost: '',
    originalDuration: '',
    additionalDuration: '',
    reason: '',
    impact: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const canCreateVariation = hasPermission('can_create_work_orders');

  useEffect(() => {
    const allVariations = dataService.getVariations();
    // Filter variations based on user access
    const userVariations = filterVariations(allVariations);
    setVariations(userVariations);
  }, [filterVariations]);

  useEffect(() => {
    const allJobs = dataService.getJobs();
    const userJobs = filterWorkOrders(allJobs);
    setAvailableJobs(userJobs);
  }, [filterWorkOrders]);

  const handleApprove = (variation: Variation) => {
    setSelectedVariation(variation);
    setShowApprovalModal(true);
  };

  const handleReject = (variation: Variation) => {
    setSelectedVariation(variation);
    setShowRejectionModal(true);
  };

  const confirmApproval = () => {
    if (!selectedVariation) return;
    if (!user?.id) {
      alert('Unable to approve: user information is unavailable.');
      return;
    }

    const updated = dataService.updateVariationStatus({
      id: selectedVariation.id,
      status: 'Approved',
      approvedBy: String(user.id),
      approvalDate: new Date().toISOString(),
    });

    if (!updated) {
      alert('Failed to approve variation. Please try again.');
      return;
    }

    const refreshed = filterVariations(dataService.getVariations());
    setVariations(refreshed);

    alert(`Variation ${selectedVariation.id} has been approved successfully!`);

    setShowApprovalModal(false);
    setSelectedVariation(null);
    setApprovalComments('');
  };

  const confirmRejection = () => {
    if (!selectedVariation || !rejectionReason.trim()) return;
    if (!user?.id) {
      alert('Unable to reject: user information is unavailable.');
      return;
    }

    const updated = dataService.updateVariationStatus({
      id: selectedVariation.id,
      status: 'Rejected',
      approvedBy: String(user.id),
      approvalDate: new Date().toISOString(),
    });

    if (!updated) {
      alert('Failed to reject variation. Please try again.');
      return;
    }

    const refreshed = filterVariations(dataService.getVariations());
    setVariations(refreshed);

    alert(`Variation ${selectedVariation.id} has been rejected. Reason: ${rejectionReason}`);

    setShowRejectionModal(false);
    setSelectedVariation(null);
    setRejectionReason('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      case 'Pending': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Rejected': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'Pending': return <Clock className="w-5 h-5 text-orange-600" />;
      default: return <GitBranch className="w-5 h-5 text-slate-400" />;
    }
  };

  const openCreateModal = () => {
    setCreateForm(prev => ({
      jobId: availableJobs[0]?.id ?? prev.jobId ?? '',
      title: '',
      description: '',
      type: 'Scope Change',
      originalCost: '',
      variationCost: '',
      originalDuration: '',
      additionalDuration: '',
      reason: '',
      impact: '',
    }));
    setFormError('');
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setIsSubmitting(false);
  };

  const handleCreateChange = (field: keyof typeof createForm, value: string) => {
    setCreateForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.id) {
      setFormError('User information is unavailable.');
      return;
    }
    const requiredFields: (keyof typeof createForm)[] = ['jobId', 'title', 'description', 'type', 'originalCost', 'variationCost', 'originalDuration', 'additionalDuration', 'reason', 'impact'];
    for (const field of requiredFields) {
      if (createForm[field].trim() === '') {
        setFormError('Please complete all fields.');
        return;
      }
    }
    const originalCost = Number(createForm.originalCost);
    const variationCost = Number(createForm.variationCost);
    const originalDuration = Number(createForm.originalDuration);
    const additionalDuration = Number(createForm.additionalDuration);
    if ([originalCost, variationCost, originalDuration, additionalDuration].some(value => Number.isNaN(value))) {
      setFormError('Numeric fields must contain valid numbers.');
      return;
    }
    setIsSubmitting(true);
    try {
      const variation = dataService.createVariation({
        jobId: createForm.jobId,
        title: createForm.title,
        description: createForm.description,
        type: createForm.type,
        requestedBy: String(user.id),
        originalCost,
        variationCost,
        originalDuration,
        additionalDuration,
        reason: createForm.reason,
        impact: createForm.impact,
      });
      const refreshed = filterVariations(dataService.getVariations());
      setVariations(refreshed);
      closeCreateModal();
      alert(`Variation ${variation.id} has been created successfully!`);
    } catch (error) {
      setFormError('Failed to create variation.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Variations & Change Orders</h1>
          <p className="text-slate-600 mt-1">Track changes to work order scope, timeline, and costs</p>
        </div>
        {canCreateVariation && (
          <button
            onClick={openCreateModal}
            disabled={availableJobs.length === 0}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-white ${availableJobs.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            <Plus className="w-4 h-4" />
            <span>Create Variation</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total Variations</p>
          <p className="text-2xl font-bold text-slate-900">{variations.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {variations.filter(v => v.status === 'Approved').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Pending</p>
          <p className="text-2xl font-bold text-orange-600">
            {variations.filter(v => v.status === 'Pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total Cost Impact</p>
          <p className="text-2xl font-bold text-blue-600">
            £{variations.reduce((sum, v) => sum + v.variationCost, 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {variations.map((variation) => {
          const job = dataService.getJobById(variation.jobId);
          const requestedBy = dataService.getUserById(variation.requestedBy);
          const approvedBy = variation.approvedBy ? dataService.getUserById(variation.approvedBy) : null;

          return (
            <div key={variation.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    {getStatusIcon(variation.status)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{variation.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {job ? job.title : variation.jobId} • Version {variation.version}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(variation.status)}`}>
                  {variation.status}
                </span>
              </div>

              <p className="text-slate-600 mb-4">{variation.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Type</p>
                  <p className="font-medium text-slate-900">{variation.type}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Cost Impact</p>
                  <p className="font-bold text-blue-600">
                    {variation.variationCost > 0 ? '+' : ''}£{variation.variationCost.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Original: £{variation.originalCost.toLocaleString()} → New: £{variation.totalCost.toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Time Impact</p>
                  <p className="font-bold text-orange-600">
                    {variation.additionalDuration > 0 ? '+' : ''}{variation.additionalDuration}h
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Original: {variation.originalDuration}h → New: {variation.totalDuration}h
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Reason</p>
                  <p className="text-sm text-slate-900 bg-slate-50 p-3 rounded-lg">{variation.reason}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Impact</p>
                  <p className="text-sm text-slate-900 bg-slate-50 p-3 rounded-lg">{variation.impact}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center space-x-6 text-sm">
                  <div>
                    <p className="text-slate-600">Requested by</p>
                    <p className="font-medium text-slate-900">{requestedBy?.name || 'Unknown'}</p>
                    <p className="text-xs text-slate-500">{new Date(variation.requestDate).toLocaleDateString()}</p>
                  </div>
                  {approvedBy && variation.approvalDate && (
                    <div>
                      <p className="text-slate-600">Approved by</p>
                      <p className="font-medium text-slate-900">{approvedBy.name}</p>
                      <p className="text-xs text-slate-500">{new Date(variation.approvalDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
                {variation.status === 'Pending' && !isContractor && canApproveWorkOrder(variation.jobId) && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleApprove(variation)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm flex items-center space-x-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(variation)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm flex items-center space-x-1"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showCreateModal && canCreateVariation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Create Variation</h3>
            {formError && (
              <div className="mb-4 text-sm text-red-600 font-medium">
                {formError}
              </div>
            )}
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Work Order</label>
                  <select
                    value={createForm.jobId}
                    onChange={(e) => handleCreateChange('jobId', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="" disabled>Select work order</option>
                    {availableJobs.map(job => (
                      <option key={job.id} value={job.id}>
                        {job.id} — {job.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Variation Type</label>
                  <select
                    value={createForm.type}
                    onChange={(e) => handleCreateChange('type', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Scope Change">Scope Change</option>
                    <option value="Specification Change">Specification Change</option>
                    <option value="Timeline Change">Timeline Change</option>
                    <option value="Documentation">Documentation</option>
                    <option value="Cost Change">Cost Change</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(e) => handleCreateChange('title', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cost Impact (£)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={createForm.variationCost}
                    onChange={(e) => handleCreateChange('variationCost', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Original Cost (£)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={createForm.originalCost}
                    onChange={(e) => handleCreateChange('originalCost', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Additional Duration (hours)</label>
                  <input
                    type="number"
                    step="1"
                    value={createForm.additionalDuration}
                    onChange={(e) => handleCreateChange('additionalDuration', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Original Duration (hours)</label>
                  <input
                    type="number"
                    step="1"
                    value={createForm.originalDuration}
                    onChange={(e) => handleCreateChange('originalDuration', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Variation Impact</label>
                  <textarea
                    value={createForm.impact}
                    onChange={(e) => handleCreateChange('impact', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => handleCreateChange('description', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                  <textarea
                    value={createForm.reason}
                    onChange={(e) => handleCreateChange('reason', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || availableJobs.length === 0}
                  className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center justify-center space-x-2 ${isSubmitting || availableJobs.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Creating...' : 'Create Variation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedVariation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Approve Variation</h3>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to approve variation "{selectedVariation.title}"?
            </p>
            <div className="mb-4">
              <p className="text-sm font-medium text-slate-700 mb-2">Cost Impact:
                <span className="text-blue-600 font-bold ml-1">
                  {selectedVariation.variationCost > 0 ? '+' : ''}£{selectedVariation.variationCost.toLocaleString()}
                </span>
              </p>
              <p className="text-sm font-medium text-slate-700 mb-4">Time Impact:
                <span className="text-orange-600 font-bold ml-1">
                  {selectedVariation.additionalDuration > 0 ? '+' : ''}{selectedVariation.additionalDuration}h
                </span>
              </p>
            </div>
            <textarea
              value={approvalComments}
              onChange={(e) => setApprovalComments(e.target.value)}
              placeholder="Add approval comments (optional)..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none mb-4"
              rows={3}
            />
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedVariation(null);
                  setApprovalComments('');
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmApproval}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedVariation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Reject Variation</h3>
            <p className="text-sm text-slate-600 mb-4">
              Please provide a reason for rejecting variation "{selectedVariation.title}".
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection (required)..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none mb-4"
              rows={4}
              required
            />
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setSelectedVariation(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRejection}
                disabled={!rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
