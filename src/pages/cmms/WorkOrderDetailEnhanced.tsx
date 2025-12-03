import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  User,
  Package,
  FileText,
  CheckCircle,
  XCircle,
  Upload,
  Download,
  Clock,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { dataService } from '../../lib/dataService';
import { maintenanceApi } from '../../lib/api';
import type { Job } from '../../lib/dataService';

// Local type for checklist items (mirrors dataService.checklist items)
interface ChecklistItem {
  id: string;
  task: string;
  required: boolean;
  completed: boolean;
  notes: string;
}
import { useAuth } from '../../contexts/AuthContext';
import { useDataAccess } from '../../hooks/useDataAccess';
import { useNotifications } from '../../contexts/NotificationContext';
import { auditLog } from '../../lib/auditLog';

export default function WorkOrderDetailEnhanced() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canEditWorkOrder, canApproveWorkOrder, isContractor, isManager, isAdmin } = useDataAccess();
  const { addNotification, showToast } = useNotifications();
  const [job, setJob] = useState<Job | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approvalComments, setApprovalComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [workNotes, setWorkNotes] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (!id) return;

    let mounted = true;
    const load = async () => {
      try {
        const resp = await maintenanceApi.getJob(id as string);
        const fetched = resp as Job;
        if (!mounted) return;
        setJob(fetched);

        if (fetched.checklistId) {
          const checklistData = dataService.getChecklistById(fetched.checklistId);
          if (checklistData) setChecklist(checklistData.items);
        }

        if (fetched.startTime) setStartTime(fetched.startTime);
        if (fetched.endTime) setEndTime(fetched.endTime);

        if (user) auditLog.viewWorkOrder(String((user as any).id), (user as any).email || '', ((user as any).name || `${(user as any).first_name || ''} ${(user as any).last_name || ''}`).trim(), id as string);
      } catch (err) {
        // Fallback to local data
        const foundJob = dataService.getJobById(id as string);
        if (!mounted) return;
        if (foundJob) {
          setJob(foundJob);
          if (foundJob.checklistId) {
            const checklistData = dataService.getChecklistById(foundJob.checklistId);
            if (checklistData) setChecklist(checklistData.items);
          }

          if (foundJob.startTime) setStartTime(foundJob.startTime);
          if (foundJob.endTime) setEndTime(foundJob.endTime);

          if (user) auditLog.viewWorkOrder(String((user as any).id), (user as any).email || '', ((user as any).name || `${(user as any).first_name || ''} ${(user as any).last_name || ''}`).trim(), id as string);
        }
      }
    };

    load();
    return () => { mounted = false };
  }, [id, user]);

  const canEdit = id ? canEditWorkOrder(id) : false;
  const canApprove = id ? canApproveWorkOrder(id) : false;
  const isPendingApproval = (job?.status as string) === 'Pending Approval';
  const isPendingAcceptance = (job?.status as string) === 'Pending' && isContractor;
  const canSubmitForApproval = isContractor && job?.status === 'In Progress' && canEdit;

  const handleTaskToggle = (taskId: string) => {
    if (!canEdit) return;

    setChecklist(prev =>
      prev.map(item =>
        item.id === taskId ? { ...item, completed: !item.completed } : item
      )
    );

    // Audit log
    if (user && id) {
      auditLog.updateWorkOrder(String(user.id), user.email, `${user.firstName} ${user.lastName}`, id, {
        taskToggled: taskId,
      });
    }

    showToast('success', 'Task Updated', 'Task status has been updated');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Audit log
    if (user && id) {
      newFiles.forEach(file => {
        auditLog.uploadDocument(
          String(user.id),
          user.email,
          `${user.firstName} ${user.lastName}`,
          `DOC-${Date.now()}`,
          file.name
        );
      });
    }

    showToast('success', 'Files Uploaded', `${newFiles.length} file(s) uploaded successfully`);
  };

  const handleSubmitForApproval = () => {
    if (!job || !id || !user) return;

    // Check if all tasks are completed
    const allTasksComplete = checklist.every(task => task.completed);
    if (!allTasksComplete) {
      showToast('warning', 'Incomplete Tasks', 'Please complete all tasks before submitting');
      return;
    }

    // Update job status locally and attempt to persist
    const updatedJob = { ...job!, status: 'Pending Approval' } as any;
    setJob(updatedJob as any);

    (async () => {
      try {
        await maintenanceApi.updateJob(id as string, { status: 'Pending Approval' });
      } catch (err) {
        // ignore - local optimistic update already applied
      }
    })();

    // Audit log
    auditLog.submitWorkOrder(String(user.id), user.email, `${user.firstName} ${user.lastName}`, id);

    // Notify manager
    // Notify manager
    addNotification({
      type: 'info',
      title: 'Work Order Submitted',
      message: `${user.firstName} ${user.lastName} has submitted work order ${id} for approval`,
      actionUrl: `/work-orders/${id}`,
    });

    showToast('success', 'Submitted for Approval', 'Work order has been submitted to manager');
  };

  const handleApprove = () => {
    if (!job || !id || !user) return;
    // Update job status locally and persist
    const updatedJob = { ...job, status: 'Complete' } as any;
    setJob(updatedJob as any);

    (async () => {
      try {
        await maintenanceApi.updateJob(id as string, { status: 'Complete' });
      } catch (err) {
        // ignore - optimistic update
      }
    })();

    // Audit log
    auditLog.approveWorkOrder(String(user.id), user.email, `${user.firstName} ${user.lastName}`, id, approvalComments);

    // Notify contractor
    const assignedUser = dataService.getUserById(job.assignedTo);
    if (assignedUser) {
      addNotification({
        type: 'success',
        title: 'Work Order Approved',
        message: `Your work on ${job.title} has been approved by ${user.firstName} ${user.lastName}`,
        actionUrl: `/work-orders/${id}`,
      });
    }

    showToast('success', 'Work Order Approved', 'Work order has been marked as complete');
    setShowApprovalModal(false);
    setApprovalComments('');
  };

  const handleAccept = () => {
    if (!job || !id || !user) return;

    // Update job status locally and persist
    const updatedJob = { ...job, status: 'In Progress' } as any;
    setJob(updatedJob as any);

    (async () => {
      try {
        await maintenanceApi.updateJob(id as string, { status: 'In Progress' });
      } catch (err) {
        // ignore
      }
    })();

    // Audit log
    auditLog.updateWorkOrder(String(user.id), user.email, `${user.firstName} ${user.lastName}`, id, { status: 'In Progress' });

    showToast('success', 'Work Order Accepted', 'You can now begin work');
  };

  const handleReject = () => {
    if (!job || !id || !user || !rejectionReason) return;

    // Determine new status based on who is rejecting
    // Manager rejecting approval -> In Progress
    // Technician rejecting assignment -> Rejected (or Pending/Unassigned depending on workflow)
    const newStatus = isPendingApproval ? 'In Progress' : 'Rejected';

    // Update job status locally and persist
    const updatedJob = { ...job, status: newStatus } as any;
    setJob(updatedJob as any);

    (async () => {
      try {
        await maintenanceApi.updateJob(id as string, { status: newStatus });
      } catch (err) {
        // ignore
      }
    })();

    // Audit log
    auditLog.rejectWorkOrder(String(user.id), user.email, `${user.firstName} ${user.lastName}`, id, rejectionReason);

    // Notify relevant party
    if (isPendingApproval) {
      // Notify contractor
      const assignedUser = dataService.getUserById(job.assignedTo);
      if (assignedUser) {
        addNotification({
          type: 'warning',
          title: 'Work Order Rejected',
          message: `Work on ${job.title} needs revision: ${rejectionReason}`,
          actionUrl: `/work-orders/${id}`,
        });
      }
      showToast('info', 'Work Order Rejected', 'Contractor has been notified to make corrections');
    } else {
      // Notify manager (Technician rejected assignment)
      // Assuming manager is the creator or we notify all managers
      addNotification({
        type: 'warning',
        title: 'Assignment Rejected',
        message: `${user.firstName} ${user.lastName} rejected work order ${job.title}: ${rejectionReason}`,
        actionUrl: `/work-orders/${id}`,
      });
      showToast('info', 'Work Order Rejected', 'Manager has been notified');
    }

    setShowRejectModal(false);
    setRejectionReason('');
  };

  const handleTimeUpdate = (type: 'start' | 'end', value: string) => {
    if (type === 'start') setStartTime(value);
    else setEndTime(value);

    // In a real app, we would save this to the backend immediately or on submit
    // For now, we'll just update local state and assume it's sent with other updates
    if (job) {
      const updatedJob = { ...job, [type === 'start' ? 'startTime' : 'endTime']: value };
      setJob(updatedJob as any);

      // Persist to backend (mock)
      (async () => {
        try {
          await maintenanceApi.updateJob(id as string, { [type === 'start' ? 'startTime' : 'endTime']: value });
        } catch (err) {
          // ignore
        }
      })();
    }
  };

  const handleAddWorkNotes = () => {
    if (!workNotes.trim() || !user || !id) return;

    // Audit log
    // Audit log
    auditLog.updateWorkOrder(String(user.id), user.email, `${user.firstName} ${user.lastName}`, id, {
      notesAdded: workNotes,
    });

    showToast('success', 'Notes Added', 'Work notes have been saved');
    setWorkNotes('');
  };

  if (!job) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Work order not found</p>
          <Link to="/work-orders" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to Work Orders
          </Link>
        </div>
      </div>
    );
  }

  const asset = job.assetId ? dataService.getAssetById(job.assetId) : null;
  const assignedUser = dataService.getUserById(job.assignedTo);
  const costs = dataService.getCostsByJob(job.id);
  const documents = dataService.getDocumentsByJob(job.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Pending Approval': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const completedTasks = checklist.filter(t => t.completed).length;
  const totalTasks = checklist.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/work-orders')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
            <p className="text-sm text-slate-600 mt-1">Work Order #{job.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(job.priority)}`}>
            {job.priority}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(job.status)}`}>
            {job.status}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      {(canSubmitForApproval || (isPendingApproval && canApprove) || isPendingAcceptance) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">
                  {canSubmitForApproval && 'Ready to submit for approval?'}
                  {isPendingApproval && canApprove && 'This work order is pending your approval'}
                  {isPendingAcceptance && 'New Work Order Assigned'}
                </p>
                <p className="text-sm text-blue-700 mt-0.5">
                  {canSubmitForApproval && 'All tasks must be completed before submission'}
                  {isPendingApproval && canApprove && 'Review the work and approve or request changes'}
                  {isPendingAcceptance && 'Please accept or reject this assignment'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {canSubmitForApproval && (
                <button
                  onClick={handleSubmitForApproval}
                  disabled={progressPercentage < 100}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit for Approval</span>
                </button>
              )}
              {isPendingApproval && canApprove && (
                <>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => setShowApprovalModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                </>
              )}
              {isPendingAcceptance && (
                <>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={handleAccept}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Accept</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Description</h2>
            <p className="text-slate-600">{job.description}</p>
          </div>

          {/* Task Checklist */}
          {checklist.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Task Checklist</h2>
                <span className="text-sm text-slate-600">
                  {completedTasks} of {totalTasks} completed
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {checklist.map(task => (
                  <div
                    key={task.id}
                    className="flex items-start space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleTaskToggle(task.id)}
                      disabled={!canEdit}
                      className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
                    />
                    <div className="flex-1">
                      <p className={`text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {task.task}
                      </p>
                      {task.notes && (
                        <p className="text-xs text-slate-500 mt-1">{task.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work Notes & Time */}
          {canEdit && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Work Report</h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => handleTimeUpdate('start', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => handleTimeUpdate('end', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <label className="block text-sm font-medium text-slate-700 mb-1">Work Notes</label>
              <textarea
                value={workNotes}
                onChange={(e) => setWorkNotes(e.target.value)}
                placeholder="Add notes about work performed, issues encountered, etc..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
              />
              <button
                onClick={handleAddWorkNotes}
                disabled={!workNotes.trim()}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Add Notes</span>
              </button>
            </div>
          )}

          {/* Document Upload */}
          {canEdit && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Upload Documents/Photos</h2>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-2">Drag and drop files here, or click to browse</p>
                <p className="text-sm text-slate-500 mb-4">Supported: Images, PDFs, Documents</p>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose Files</span>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-slate-700">Uploaded Files:</p>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <span className="text-sm text-slate-900">{file.name}</span>
                        <span className="text-xs text-slate-500">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Documents */}
          {documents.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Related Documents</h2>
              <div className="space-y-2">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{doc.name}</p>
                        <p className="text-xs text-slate-500">{doc.type} • {doc.size}</p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <Download className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Details</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Due Date</p>
                  <p className="text-sm font-medium text-slate-900">{job.dueDate}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Assigned To</p>
                  <p className="text-sm font-medium text-slate-900">
                    {assignedUser?.name || 'Unassigned'}
                  </p>
                </div>
              </div>

              {asset && (
                <div className="flex items-start space-x-3">
                  <Package className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-600">Asset</p>
                    <Link
                      to={`/assets/${asset.id}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      {asset.name}
                    </Link>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Created</p>
                  <p className="text-sm font-medium text-slate-900">{job.createdAt}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Costs */}
          {(isAdmin || isManager) && costs.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Costs</h2>
              <div className="space-y-3">
                {costs.map((cost: any) => (
                  <div key={cost.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{cost.category}</p>
                      <p className="text-xs text-slate-500">{cost.description}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      ${cost.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">Total</p>
                    <p className="text-lg font-bold text-slate-900">
                      ${costs.reduce((sum: number, c: any) => sum + c.amount, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Approve Work Order</h3>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to approve this work order? This will mark it as complete.
            </p>
            <textarea
              value={approvalComments}
              onChange={(e) => setApprovalComments(e.target.value)}
              placeholder="Add approval comments (optional)..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none mb-4"
              rows={3}
            />
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
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
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Reject Work Order</h3>
            <p className="text-sm text-slate-600 mb-4">
              Please provide a reason for rejection. The contractor will be notified to make corrections.
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
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
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
