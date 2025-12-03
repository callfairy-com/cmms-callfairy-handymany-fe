import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, CheckCircle2, FileText, Image, Download } from 'lucide-react';
import { dataService, Job, Asset, User as UserType, Checklist, Cost, Document } from '../../lib/dataService';

export default function WorkOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [assignedUser, setAssignedUser] = useState<UserType | null>(null);
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [costs, setCosts] = useState<Cost[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    if (id) {
      const jobData = dataService.getJobById(id);
      if (jobData) {
        setJob(jobData);

        const assetData = dataService.getAssetById(jobData.assetId);
        setAsset(assetData || null);

        const userData = dataService.getUserById(jobData.assignedTo);
        setAssignedUser(userData || null);

        if (jobData.checklistId) {
          const checklistData = dataService.getChecklistById(jobData.checklistId);
          setChecklist(checklistData || null);
        }

        const costData = dataService.getCostsByJob(id);
        setCosts(costData);

        const docData = dataService.getDocumentsByJob(id);
        setDocuments(docData);
      }
    }
  }, [id]);

  if (!job) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-700';
      case 'High': return 'bg-orange-100 text-orange-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'bg-green-100 text-green-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const totalCosts = dataService.getTotalCostByJob(id || '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/work-orders" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Work Orders
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{job.title}</h1>
            <p className="text-slate-600 mt-1">Job ID: {job.id}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(job.priority)}`}>
              {job.priority} Priority
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
              {job.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Details */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Job Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Description</label>
                <p className="text-slate-900 mt-1">{job.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Category</label>
                  <p className="text-slate-900 mt-1">{job.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Site</label>
                  <p className="text-slate-900 mt-1">{job.site}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Location</label>
                  <p className="text-slate-900 mt-1">{job.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Progress</label>
                  <div className="mt-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${job.progress}%` }}></div>
                      </div>
                      <span className="text-sm font-medium text-slate-900">{job.progress}%</span>
                    </div>
                  </div>
                </div>
              </div>
              {job.notes && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Notes</label>
                  <p className="text-slate-900 mt-1 bg-slate-50 p-3 rounded-lg">{job.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Checklist */}
          {checklist && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Checklist: {checklist.name}</h2>
              <div className="space-y-3">
                {checklist.items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50">
                    <div className={`w-5 h-5 rounded flex items-center justify-center mt-0.5 ${item.completed ? 'bg-green-500' : 'bg-slate-200'
                      }`}>
                      {item.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${item.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                        {item.task}
                        {item.required && <span className="text-red-500 ml-1">*</span>}
                      </p>
                      {item.notes && <p className="text-sm text-slate-600 mt-1">{item.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  Compliance: <span className="font-medium text-slate-900">{checklist.compliance}</span>
                </p>
              </div>
            </div>
          )}

          {/* Cost Breakdown */}
          {costs.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Cost Breakdown</h2>
              <div className="space-y-3">
                {costs.map((cost) => (
                  <div key={cost.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{cost.description}</p>
                      <p className="text-sm text-slate-600">{cost.type} • {cost.quantity} {cost.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">£{cost.actualCost.toLocaleString()}</p>
                      {cost.estimatedCost !== cost.actualCost && (
                        <p className="text-xs text-slate-500">Est: £{cost.estimatedCost.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Estimated</span>
                  <span className="font-medium text-slate-900">£{totalCosts.estimated.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-slate-900">Total Actual</span>
                  <span className="text-slate-900">£{totalCosts.actual.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Documents & Photos */}
          {documents.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Documents & Photos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {doc.type === 'image' ? (
                          <Image className="w-5 h-5 text-blue-600" />
                        ) : (
                          <FileText className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{doc.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{doc.category}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                      {doc.url.startsWith('http') && (
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    {doc.type === 'image' && doc.url.startsWith('http') && (
                      <img src={doc.url} alt={doc.name} className="mt-3 rounded-lg w-full h-32 object-cover" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Scheduled</p>
                  <p className="text-sm text-slate-600">{new Date(job.scheduledDate).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Due Date</p>
                  <p className="text-sm text-slate-600">{new Date(job.dueDate).toLocaleString()}</p>
                </div>
              </div>
              {job.completedDate && (
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Completed</p>
                    <p className="text-sm text-slate-600">{new Date(job.completedDate).toLocaleString()}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Time Tracking</p>
                  <p className="text-sm text-slate-600">Estimated: {job.estimatedHours}h</p>
                  <p className="text-sm text-slate-600">Actual: {job.actualHours}h</p>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned To */}
          {assignedUser && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Assigned To</h2>
              <div className="flex items-center space-x-3">
                <img src={assignedUser.avatar} alt={assignedUser.name} className="w-12 h-12 rounded-full" />
                <div>
                  <p className="font-medium text-slate-900">{assignedUser.name}</p>
                  <p className="text-sm text-slate-600">{assignedUser.role}</p>
                  <p className="text-sm text-slate-600">{assignedUser.phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Related Asset */}
          {asset && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Related Asset</h2>
              <Link to={`/assets/${asset.id}`} className="block hover:bg-slate-50 p-3 rounded-lg transition-colors">
                <p className="font-medium text-blue-600">{asset.name}</p>
                <p className="text-sm text-slate-600 mt-1">{asset.type}</p>
                <p className="text-sm text-slate-600">{asset.location}</p>
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <p className="text-xs text-slate-500">Serial: {asset.serialNumber}</p>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
