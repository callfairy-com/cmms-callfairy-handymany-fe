import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Calendar as CalendarIcon, List, Grid, Eye, Edit, X, Clock, MapPin, Download } from 'lucide-react';
import { dataService, Job, User } from '../../lib/dataService';
import { maintenanceApi } from '../../lib/api';
import { useDataAccess } from '../../hooks/useDataAccess';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { generateWorkOrderPDF } from '../../lib/pdfGenerator';

export default function WorkOrders() {
  const { user, hasPermission } = useAuth();
  const { addNotification } = useNotifications();
  const { filterWorkOrders, isContractor, isViewer } = useDataAccess();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [availableAssignees, setAvailableAssignees] = useState<User[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newWorkOrder, setNewWorkOrder] = useState({
    title: '',
    description: '',
    assetId: '',
    assignedTo: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Urgent',
    category: '',
    scheduledDate: '',
    dueDate: '',
    estimatedHours: 0,
    estimatedCost: 0,
    site: '',
    location: '',
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const resp = await maintenanceApi.getJobs();
        // support both paginated and raw lists
        const jobsData: Job[] = (resp.results ?? resp) as Job[];
        const userJobs = filterWorkOrders(jobsData as Job[]);
        if (!mounted) return;
        setJobs(userJobs);
        setFilteredJobs(userJobs);

        // Users: fallback to local dataService for assignees
        const allUsers = dataService.getUsers();
        const contractors = allUsers.filter(u => u.role === 'Contractor');
        const managers = allUsers.filter(u => u.role === 'Manager');
        setAvailableAssignees([...contractors, ...managers]);
      } catch (error) {
        // Backend unavailable - fall back to demo data
        const allJobs = dataService.getJobs();
        const userJobs = filterWorkOrders(allJobs);
        if (!mounted) return;
        setJobs(userJobs);
        setFilteredJobs(userJobs);

        const allUsers = dataService.getUsers();
        const contractors = allUsers.filter(u => u.role === 'Contractor');
        const managers = allUsers.filter(u => u.role === 'Manager');
        setAvailableAssignees([...contractors, ...managers]);
      }
    };

    load();
    return () => { mounted = false };
  }, [filterWorkOrders]);

  useEffect(() => {
    let filtered = jobs;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(job => job.status === filterStatus);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(job => job.priority === filterPriority);
    }

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [filterStatus, filterPriority, searchTerm, jobs]);

  const handleCreateWorkOrder = async () => {
    if (!newWorkOrder.title || !newWorkOrder.description || !newWorkOrder.dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (!user?.id) {
      alert('Unable to create work order: user information unavailable.');
      return;
    }

    let createdJob: Job;
    try {
      const resp = await maintenanceApi.createJob({
        title: newWorkOrder.title,
        description: newWorkOrder.description,
        assetId: newWorkOrder.assetId,
        assignedTo: newWorkOrder.assignedTo,
        createdBy: String(user.id),
        priority: newWorkOrder.priority,
        category: newWorkOrder.category,
        scheduledDate: newWorkOrder.scheduledDate,
        dueDate: newWorkOrder.dueDate,
        estimatedHours: newWorkOrder.estimatedHours,
        estimatedCost: newWorkOrder.estimatedCost,
        site: newWorkOrder.site,
        location: newWorkOrder.location,
        checklistId: null,
        attachments: [],
        notes: '',
      })
      // Map backend response to local Job shape if needed
      createdJob = (resp as any) as Job;
    } catch (err) {
      // Fallback to local data service
      createdJob = dataService.createJob({
        title: newWorkOrder.title,
        description: newWorkOrder.description,
        assetId: newWorkOrder.assetId,
        assignedTo: newWorkOrder.assignedTo,
        createdBy: String(user.id),
        priority: newWorkOrder.priority,
        category: newWorkOrder.category,
        scheduledDate: newWorkOrder.scheduledDate,
        dueDate: newWorkOrder.dueDate,
        estimatedHours: newWorkOrder.estimatedHours,
        estimatedCost: newWorkOrder.estimatedCost,
        site: newWorkOrder.site,
        location: newWorkOrder.location,
        checklistId: null,
        attachments: [],
        notes: '',
      });
    }

    // Try to refresh from backend, otherwise use local
    try {
      const resp = await maintenanceApi.getJobs();
      const jobsData: Job[] = (resp.results ?? resp) as Job[];
      const refreshedJobs = filterWorkOrders(jobsData as Job[]);
      setJobs(refreshedJobs);
      setFilteredJobs(refreshedJobs);
    } catch (err) {
      const refreshedJobs = filterWorkOrders(dataService.getJobs());
      setJobs(refreshedJobs);
      setFilteredJobs(refreshedJobs);
    }

    // Generate notification for new work order
    const priorityColor = createdJob.priority === 'Urgent' ? 'error' :
      createdJob.priority === 'High' ? 'warning' : 'info';
    addNotification({
      type: priorityColor as 'error' | 'warning' | 'info' | 'success',
      title: 'New Work Order Created',
      message: `Work order "${newWorkOrder.title}" has been created with ${newWorkOrder.priority} priority${newWorkOrder.assignedTo ? ` and assigned to ${newWorkOrder.assignedTo}` : ''}.`,
      actionUrl: `/work-orders/${createdJob.id}`
    });

    // Reset form and close modal
    setNewWorkOrder({
      title: '',
      description: '',
      assetId: '',
      assignedTo: '',
      priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Urgent',
      category: '',
      scheduledDate: '',
      dueDate: '',
      estimatedHours: 0,
      estimatedCost: 0,
      site: '',
      location: '',
    });
    setShowCreateModal(false);

    alert(`Work order ${createdJob.id} created successfully!`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'bg-green-100 text-green-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setIsEditing(false);
    setShowDetailModal(true);
  };

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setIsEditing(true);
    setShowDetailModal(true);
  };

  const handleUpdateJob = () => {
    if (!selectedJob) return;

    // Update the job in the list
    const updated = jobs.map(j => j.id === selectedJob.id ? selectedJob : j);
    setJobs(updated);
    setFilteredJobs(updated.filter(j => {
      let match = true;
      if (filterStatus !== 'all') match = match && j.status === filterStatus;
      if (filterPriority !== 'all') match = match && j.priority === filterPriority;
      if (searchTerm) match = match && (j.title.toLowerCase().includes(searchTerm.toLowerCase()) || j.id.toLowerCase().includes(searchTerm.toLowerCase()));
      return match;
    }));

    // Persist update to backend when possible
    (async () => {
      try {
        await maintenanceApi.updateJob(selectedJob.id, selectedJob as any);
      } catch (err) {
        // ignore - local update already applied
      }
    })();

    setShowDetailModal(false);
    setSelectedJob(null);
    alert('Work order updated successfully!');
  };

  const handleStatusChange = (newStatus: string) => {
    if (selectedJob) {
      setSelectedJob({ ...selectedJob, status: newStatus as 'Pending' | 'In Progress' | 'Complete' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Work Orders</h1>
          <p className="text-slate-600 mt-1">
            {isContractor
              ? 'View and manage your assigned work orders'
              : 'Manage and track all maintenance work orders'}
          </p>
        </div>
        {hasPermission('can_create_work_orders') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Work Order</span>
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search work orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Complete">Complete</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
            <div className="flex items-center border border-slate-300 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-slate-100' : ''}`}
              >
                <List className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-slate-100' : ''}`}
              >
                <Grid className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total</p>
          <p className="text-2xl font-bold text-slate-900">{jobs.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">
            {jobs.filter(j => j.status === 'In Progress').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Pending</p>
          <p className="text-2xl font-bold text-slate-600">
            {jobs.filter(j => j.status === 'Pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {jobs.filter(j => j.status === 'Complete').length}
          </p>
        </div>
      </div>

      {/* Work Orders List/Grid */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 uppercase">Job ID</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 uppercase">Title</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 uppercase">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 uppercase">Priority</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 uppercase">Due Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 uppercase">Progress</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-slate-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => handleViewJob(job)}>
                    <td className="px-6 py-4">
                      <Link to={`/work-orders/${job.id}`} className="font-medium text-blue-600 hover:text-blue-700">
                        {job.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{job.title}</p>
                        <p className="text-sm text-slate-500">{job.location}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{job.category}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(job.priority)}`}>
                        {job.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(job.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-2 min-w-[80px]">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${job.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-slate-600">{job.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleViewJob(job); }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!isViewer && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditJob(job); }}
                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit work order"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleViewJob(job)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(job.priority)}`}>
                    {job.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleViewJob(job); }}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {!isViewer && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditJob(job); }}
                      className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit work order"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{job.title}</h3>
              <p className="text-sm text-slate-600 mb-3 line-clamp-2">{job.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-slate-600">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <span>Due: {new Date(job.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Progress</span>
                  <span className="font-medium text-slate-900">{job.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${job.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Work Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Create New Work Order</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newWorkOrder.title}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter work order title"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newWorkOrder.description}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe the work to be performed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                <select
                  value={newWorkOrder.priority}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, priority: e.target.value as 'Low' | 'Medium' | 'High' | 'Urgent' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select
                  value={newWorkOrder.category}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  <option value="Preventive Maintenance">Preventive Maintenance</option>
                  <option value="Corrective Maintenance">Corrective Maintenance</option>
                  <option value="Emergency Repair">Emergency Repair</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Installation">Installation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Assigned To</label>
                <select
                  value={newWorkOrder.assignedTo}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Assignee</option>
                  {availableAssignees.map(assignee => (
                    <option key={assignee.id} value={assignee.id}>{assignee.name} ({assignee.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Asset</label>
                <select
                  value={newWorkOrder.assetId}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, assetId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Asset</option>
                  {dataService.getAssets().map(asset => (
                    <option key={asset.id} value={asset.id}>{asset.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Site</label>
                <select
                  value={newWorkOrder.site}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, site: e.target.value })}
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
                  value={newWorkOrder.location}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Specific location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Scheduled Date</label>
                <input
                  type="date"
                  value={newWorkOrder.scheduledDate}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, scheduledDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newWorkOrder.dueDate}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Estimated Hours</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={newWorkOrder.estimatedHours}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, estimatedHours: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Estimated Cost</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newWorkOrder.estimatedCost}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, estimatedCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewWorkOrder({
                    title: '',
                    description: '',
                    assetId: '',
                    assignedTo: '',
                    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Urgent',
                    category: '',
                    scheduledDate: '',
                    dueDate: '',
                    estimatedHours: 0,
                    estimatedCost: 0,
                    site: '',
                    location: '',
                  });
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkOrder}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Work Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View/Edit Work Order Modal */}
      {showDetailModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                {isEditing ? 'Edit Work Order' : 'Work Order Details'}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => generateWorkOrderPDF(selectedJob)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Download PDF"
                >
                  <Download className="w-5 h-5" />
                </button>
                {!isEditing && !isViewer && (
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
                    setSelectedJob(null);
                    setIsEditing(false);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Job ID & Status */}
              <div className="md:col-span-2 flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600">Job ID</p>
                  <p className="text-lg font-bold text-slate-900">{selectedJob.id}</p>
                </div>
                <div className="flex items-center space-x-3">
                  {isEditing ? (
                    <select
                      value={selectedJob.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Complete">Complete</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(selectedJob.status)}`}>
                      {selectedJob.status}
                    </span>
                  )}
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getPriorityColor(selectedJob.priority)}`}>
                    {selectedJob.priority}
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={selectedJob.title}
                    onChange={(e) => setSelectedJob({ ...selectedJob, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-slate-900 font-medium">{selectedJob.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                {isEditing ? (
                  <textarea
                    value={selectedJob.description}
                    onChange={(e) => setSelectedJob({ ...selectedJob, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                ) : (
                  <p className="text-slate-600">{selectedJob.description}</p>
                )}
              </div>

              {/* Location & Site */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={selectedJob.location}
                    onChange={(e) => setSelectedJob({ ...selectedJob, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-slate-600">{selectedJob.location}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Site</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={selectedJob.site}
                    onChange={(e) => setSelectedJob({ ...selectedJob, site: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-slate-600">{selectedJob.site}</p>
                )}
              </div>

              {/* Dates */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Scheduled Date
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={selectedJob.scheduledDate}
                    onChange={(e) => setSelectedJob({ ...selectedJob, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-slate-600">{new Date(selectedJob.scheduledDate).toLocaleDateString()}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={selectedJob.dueDate}
                    onChange={(e) => setSelectedJob({ ...selectedJob, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-slate-600">{new Date(selectedJob.dueDate).toLocaleDateString()}</p>
                )}
              </div>

              {/* Hours & Cost */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Estimated Hours</label>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={selectedJob.estimatedHours}
                    onChange={(e) => setSelectedJob({ ...selectedJob, estimatedHours: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-slate-600">{selectedJob.estimatedHours}h</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Estimated Cost</label>
                <p className="text-slate-600">£{selectedJob.estimatedCost?.toLocaleString() || 0}</p>
              </div>

              {/* Progress */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Progress: {selectedJob.progress}%</label>
                {isEditing ? (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedJob.progress}
                    onChange={(e) => setSelectedJob({ ...selectedJob, progress: parseInt(e.target.value) })}
                    className="w-full"
                  />
                ) : (
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${selectedJob.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                {isEditing ? (
                  <textarea
                    value={selectedJob.notes}
                    onChange={(e) => setSelectedJob({ ...selectedJob, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Add notes..."
                  />
                ) : (
                  <p className="text-slate-600">{selectedJob.notes || 'No notes'}</p>
                )}
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
                    onClick={handleUpdateJob}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedJob(null);
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
