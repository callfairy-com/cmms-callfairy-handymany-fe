import { useState, useEffect } from 'react';
import { Plus, CheckCircle, AlertTriangle, Clock, Edit, Download, X } from 'lucide-react';
import { dataService, MaintenanceSchedule } from '../../lib/dataService';
import { generateMaintenanceSchedulePDF } from '../../lib/pdfGenerator';

export default function PreventativeMaintenance() {
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<MaintenanceSchedule | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    description: '',
    assetId: '',
    frequency: 'Monthly',
    interval: 1,
    intervalUnit: 'month',
    assignedTeam: '',
    estimatedDuration: 0,
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    autoGenerate: false,
  });

  useEffect(() => {
    const allSchedules = dataService.getMaintenanceSchedules();
    setSchedules(allSchedules);
  }, []);

  const filteredSchedules = filterStatus === 'all'
    ? schedules
    : schedules.filter(s => s.status.toLowerCase() === filterStatus.toLowerCase());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Overdue': return 'bg-red-100 text-red-700';
      case 'Completed': return 'bg-slate-100 text-slate-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const handleAddSchedule = () => {
    if (!newSchedule.name || !newSchedule.assetId || newSchedule.estimatedDuration <= 0) {
      alert('Please fill in all required fields (Name, Asset, and Estimated Duration).');
      return;
    }

    const newId = `MS-${Date.now()}`;
    const now = new Date();
    const nextDue = new Date(now);
    nextDue.setMonth(nextDue.getMonth() + 1);

    const schedule: MaintenanceSchedule = {
      id: newId,
      name: newSchedule.name,
      description: newSchedule.description,
      assetId: newSchedule.assetId,
      frequency: newSchedule.frequency,
      interval: newSchedule.interval,
      intervalUnit: newSchedule.intervalUnit,
      lastCompleted: now.toISOString(),
      nextDue: nextDue.toISOString(),
      assignedTeam: newSchedule.assignedTeam,
      estimatedDuration: newSchedule.estimatedDuration,
      priority: newSchedule.priority,
      status: 'Active',
      autoGenerate: newSchedule.autoGenerate,
      checklistTemplate: null,
      history: [],
    };

    setSchedules([schedule, ...schedules]);
    setNewSchedule({
      name: '',
      description: '',
      assetId: '',
      frequency: 'Monthly',
      interval: 1,
      intervalUnit: 'month',
      assignedTeam: '',
      estimatedDuration: 0,
      priority: 'Medium',
      autoGenerate: false,
    });
    setShowAddModal(false);
    alert(`Maintenance schedule "${schedule.name}" created successfully!`);
  };

  const handleEditSchedule = (schedule: MaintenanceSchedule) => {
    setSelectedSchedule(schedule);
    setShowEditModal(true);
  };

  const handleUpdateSchedule = () => {
    if (!selectedSchedule) return;

    const updated = schedules.map(s =>
      s.id === selectedSchedule.id ? selectedSchedule : s
    );
    setSchedules(updated);
    setShowEditModal(false);
    setSelectedSchedule(null);
    alert('Schedule updated successfully!');
  };

  const assets = dataService.getAssets();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Preventative Maintenance</h1>
          <p className="text-slate-600 mt-1">Schedule and track recurring maintenance tasks</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Schedule</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total Schedules</p>
          <p className="text-2xl font-bold text-slate-900">{schedules.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {schedules.filter(s => s.status === 'Active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Overdue</p>
          <p className="text-2xl font-bold text-red-600">
            {schedules.filter(s => s.status === 'Overdue').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Due This Month</p>
          <p className="text-2xl font-bold text-orange-600">
            {schedules.filter(s => {
              const due = new Date(s.nextDue);
              const now = new Date();
              return due.getMonth() === now.getMonth() && due.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchedules.map((schedule) => {
          const asset = dataService.getAssetById(schedule.assetId);
          const isOverdue = new Date(schedule.nextDue) < new Date() && schedule.status !== 'Completed';

          return (
            <div key={schedule.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isOverdue ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                    {isOverdue ? (
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    ) : (
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                    {schedule.status}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditSchedule(schedule)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit schedule"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const scheduleAsset = dataService.getAssetById(schedule.assetId);
                      generateMaintenanceSchedulePDF(schedule, scheduleAsset);
                    }}
                    className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Download schedule"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-slate-900 mb-2">{schedule.name}</h3>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{schedule.description}</p>

              {asset && (
                <p className="text-sm text-slate-600 mb-3">Asset: {asset.name}</p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Frequency</span>
                  <span className="font-medium text-slate-900">{schedule.frequency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Last Completed</span>
                  <span className="font-medium text-slate-900">
                    {new Date(schedule.lastCompleted).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Next Due</span>
                  <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-blue-600'}`}>
                    {new Date(schedule.nextDue).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-600">Duration</span>
                  <span className="font-medium text-slate-900">{schedule.estimatedDuration}h</span>
                </div>
              </div>

              {schedule.autoGenerate && (
                <div className="mt-4 flex items-center text-xs text-blue-600">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>Auto-generates work orders</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Add Maintenance Schedule</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewSchedule({
                    name: '',
                    description: '',
                    assetId: '',
                    frequency: 'Monthly',
                    interval: 1,
                    intervalUnit: 'month',
                    assignedTeam: '',
                    estimatedDuration: 0,
                    priority: 'Medium',
                    autoGenerate: false,
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
                  Schedule Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSchedule.name}
                  onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Monthly HVAC Inspection"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={newSchedule.description}
                  onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Brief description of maintenance task"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Asset <span className="text-red-500">*</span>
                </label>
                <select
                  value={newSchedule.assetId}
                  onChange={(e) => setNewSchedule({ ...newSchedule, assetId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Asset</option>
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>{asset.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Frequency</label>
                <select
                  value={newSchedule.frequency}
                  onChange={(e) => setNewSchedule({ ...newSchedule, frequency: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annually">Annually</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Estimated Duration (hours) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={newSchedule.estimatedDuration}
                  onChange={(e) => setNewSchedule({ ...newSchedule, estimatedDuration: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                <select
                  value={newSchedule.priority}
                  onChange={(e) => setNewSchedule({ ...newSchedule, priority: e.target.value as 'Low' | 'Medium' | 'High' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Assigned Team</label>
                <input
                  type="text"
                  value={newSchedule.assignedTeam}
                  onChange={(e) => setNewSchedule({ ...newSchedule, assignedTeam: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Team or person responsible"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newSchedule.autoGenerate}
                    onChange={(e) => setNewSchedule({ ...newSchedule, autoGenerate: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Auto-generate work orders</span>
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-4 mt-6 border-t border-slate-200">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewSchedule({
                    name: '',
                    description: '',
                    assetId: '',
                    frequency: 'Monthly',
                    interval: 1,
                    intervalUnit: 'month',
                    assignedTeam: '',
                    estimatedDuration: 0,
                    priority: 'Medium',
                    autoGenerate: false,
                  });
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSchedule}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Schedule</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {showEditModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Edit Maintenance Schedule</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSchedule(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Schedule Name</label>
                <input
                  type="text"
                  value={selectedSchedule.name}
                  onChange={(e) => setSelectedSchedule({ ...selectedSchedule, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={selectedSchedule.description}
                  onChange={(e) => setSelectedSchedule({ ...selectedSchedule, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={selectedSchedule.status}
                  onChange={(e) => setSelectedSchedule({ ...selectedSchedule, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                <select
                  value={selectedSchedule.priority}
                  onChange={(e) => setSelectedSchedule({ ...selectedSchedule, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Estimated Duration (hours)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={selectedSchedule.estimatedDuration}
                  onChange={(e) => setSelectedSchedule({ ...selectedSchedule, estimatedDuration: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Next Due Date</label>
                <input
                  type="date"
                  value={selectedSchedule.nextDue.split('T')[0]}
                  onChange={(e) => setSelectedSchedule({ ...selectedSchedule, nextDue: new Date(e.target.value).toISOString() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Assigned Team</label>
                <input
                  type="text"
                  value={selectedSchedule.assignedTeam}
                  onChange={(e) => setSelectedSchedule({ ...selectedSchedule, assignedTeam: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedSchedule.autoGenerate}
                    onChange={(e) => setSelectedSchedule({ ...selectedSchedule, autoGenerate: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Auto-generate work orders</span>
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-4 mt-6 border-t border-slate-200">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSchedule(null);
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSchedule}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
