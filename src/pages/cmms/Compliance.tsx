import { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertTriangle, FileText, Download, X, Calendar, BarChart3, TrendingUp, Plus, Edit } from 'lucide-react';
import { dataService, Checklist } from '../../lib/dataService';
import { generateComplianceChecklistPDF, generateComplianceReportPDF } from '../../lib/pdfGenerator';

import { useAuth } from '../../contexts/AuthContext';

export default function Compliance() {
  const { hasPermission } = useAuth();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [newChecklist, setNewChecklist] = useState({
    name: '',
    description: '',
    category: '',
    compliance: '',
    frequency: '',
  });
  const [checklistItems, setChecklistItems] = useState<{ task: string; required: boolean }[]>([{ task: '', required: true }]);

  useEffect(() => {
    const allChecklists = dataService.getChecklists();
    setChecklists(allChecklists);
  }, []);

  const getTotalItems = () => checklists.reduce((sum, cl) => sum + cl.items.length, 0);
  const getCompletedItems = () => checklists.reduce((sum, cl) =>
    sum + cl.items.filter(item => item.completed).length, 0
  );
  const getComplianceRate = () => {
    const total = getTotalItems();
    return total > 0 ? Math.round((getCompletedItems() / total) * 100) : 0;
  };

  const generateReport = () => {
    const data = {
      totalChecklists: checklists.length,
      complianceRate: getComplianceRate(),
      completedItems: getCompletedItems(),
      pendingItems: getTotalItems() - getCompletedItems(),
      totalItems: getTotalItems(),
      generatedAt: new Date().toISOString(),
      generatedDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      checklists: checklists.map((cl: Checklist) => ({
        id: cl.id,
        name: cl.name,
        category: cl.category,
        completedItems: cl.items.filter(item => item.completed).length,
        totalItems: cl.items.length,
        completionRate: cl.items.length > 0 ? Math.round((cl.items.filter(item => item.completed).length / cl.items.length) * 100) : 0
      }))
    };

    setReportData(data);
    setShowReportModal(true);
  };

  const downloadPDF = () => {
    generateComplianceReportPDF(reportData);
  };

  const handleAddItem = () => {
    setChecklistItems([...checklistItems, { task: '', required: true }]);
  };

  const handleRemoveItem = (index: number) => {
    if (checklistItems.length > 1) {
      setChecklistItems(checklistItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: 'task' | 'required', value: string | boolean) => {
    const updated = [...checklistItems];
    updated[index] = { ...updated[index], [field]: value };
    setChecklistItems(updated);
  };

  const handleCreateChecklist = () => {
    if (!newChecklist.name || !newChecklist.category || checklistItems.some(item => !item.task)) {
      alert('Please fill in all required fields and ensure all checklist items have tasks.');
      return;
    }

    const newId = `CL-${Date.now()}`;
    const checklist: Checklist = {
      id: newId,
      name: newChecklist.name,
      description: newChecklist.description,
      category: newChecklist.category,
      items: checklistItems.map((item, idx) => ({
        id: `${newId}-${idx + 1}`,
        task: item.task,
        required: item.required,
        completed: false,
        notes: '',
      })),
      compliance: newChecklist.compliance,
      frequency: newChecklist.frequency,
    };

    setChecklists([checklist, ...checklists]);
    setNewChecklist({ name: '', description: '', category: '', compliance: '', frequency: '' });
    setChecklistItems([{ task: '', required: true }]);
    setShowCreateModal(false);
    alert(`Compliance checklist "${checklist.name}" created successfully!`);
  };

  const handleEditChecklist = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
    setShowEditModal(true);
  };

  const handleUpdateChecklist = () => {
    if (!selectedChecklist) return;

    const updated = checklists.map(c =>
      c.id === selectedChecklist.id ? selectedChecklist : c
    );
    setChecklists(updated);
    setShowEditModal(false);
    setSelectedChecklist(null);
    alert('Checklist updated successfully!');
  };

  const handleToggleItem = (checklistId: string, itemId: string) => {
    if (!hasPermission('can_mark_checklist_items_complete')) return;

    const updated = checklists.map(checklist => {
      if (checklist.id === checklistId) {
        return {
          ...checklist,
          items: checklist.items.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          )
        };
      }
      return checklist;
    });
    setChecklists(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Compliance & Safety</h1>
          <p className="text-slate-600 mt-1">Track inspections, checklists, and regulatory compliance</p>
        </div>
        <div className="flex items-center space-x-3">
          {hasPermission('can_create_checklists') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Compliance</span>
            </button>
          )}
          <button
            onClick={generateReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total Checklists</p>
          <p className="text-2xl font-bold text-slate-900">{checklists.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Compliance Rate</p>
          <p className="text-2xl font-bold text-green-600">{getComplianceRate()}%</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Completed Items</p>
          <p className="text-2xl font-bold text-blue-600">{getCompletedItems()}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Pending Items</p>
          <p className="text-2xl font-bold text-orange-600">{getTotalItems() - getCompletedItems()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {checklists.map((checklist) => {
          const completedCount = checklist.items.filter(item => item.completed).length;
          const totalCount = checklist.items.length;
          const completionRate = Math.round((completedCount / totalCount) * 100);

          return (
            <div key={checklist.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${completionRate === 100 ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                    <Shield className={`w-6 h-6 ${completionRate === 100 ? 'text-green-600' : 'text-orange-600'
                      }`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{checklist.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{checklist.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {hasPermission('can_create_checklists') && (
                    <button
                      onClick={() => handleEditChecklist(checklist)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit checklist"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => generateComplianceChecklistPDF(checklist)}
                    className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Download checklist"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-4">{checklist.description}</p>

              <div className="space-y-2 mb-4">
                {checklist.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start space-x-3 p-2 rounded hover:bg-slate-50 cursor-pointer"
                    onClick={() => handleToggleItem(checklist.id, item.id)}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center mt-0.5 ${item.completed ? 'bg-green-500' : 'bg-slate-200'
                      }`}>
                      {item.completed && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${item.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                        {item.task}
                        {item.required && <span className="text-red-500 ml-1">*</span>}
                      </p>
                      {item.notes && <p className="text-xs text-slate-500 mt-1">{item.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Progress</span>
                  <span className="font-medium text-slate-900">{completedCount}/{totalCount} items</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${completionRate === 100 ? 'bg-green-600' : 'bg-blue-600'}`}
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Compliance: {checklist.compliance}</span>
                  <span className="text-xs text-slate-600">Frequency: {checklist.frequency}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Modal */}
      {showReportModal && reportData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Compliance & Safety Report</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Generated on {reportData.generatedDate}</p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Checklists</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{reportData.totalChecklists}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">Compliance Rate</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">{reportData.complianceRate}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900 dark:to-emerald-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Completed Items</p>
                      <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{reportData.completedItems}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Pending Items</p>
                      <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{reportData.pendingItems}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-slate-600 dark:text-slate-400" />
                  Detailed Breakdown by Checklist
                </h4>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-100 dark:bg-slate-600">
                        <tr>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">Checklist Name</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">Category</th>
                          <th className="text-center px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">Progress</th>
                          <th className="text-center px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">Completion Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                        {reportData.checklists.map((checklist: any) => (
                          <tr key={checklist.id} className="hover:bg-slate-50 dark:hover:bg-slate-600">
                            <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{checklist.name}</td>
                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{checklist.category}</td>
                            <td className="px-4 py-3 text-sm text-center">
                              <span className="text-slate-700 dark:text-slate-300">
                                {checklist.completedItems}/{checklist.totalItems}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <div className="w-16 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${checklist.completionRate >= 80 ? 'bg-green-500' :
                                        checklist.completionRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                    style={{ width: `${checklist.completionRate}%` }}
                                  ></div>
                                </div>
                                <span className={`text-sm font-medium ${checklist.completionRate >= 80 ? 'text-green-600 dark:text-green-400' :
                                    checklist.completionRate >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                                  }`}>
                                  {checklist.completionRate}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Report generated on {reportData.generatedDate}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={downloadPDF}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Compliance Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Create New Compliance Checklist</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewChecklist({ name: '', description: '', category: '', compliance: '', frequency: '' });
                  setChecklistItems([{ task: '', required: true }]);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Checklist Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newChecklist.name}
                    onChange={(e) => setNewChecklist({ ...newChecklist, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter checklist name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={newChecklist.description}
                    onChange={(e) => setNewChecklist({ ...newChecklist, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={2}
                    placeholder="Brief description of this checklist"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newChecklist.category}
                    onChange={(e) => setNewChecklist({ ...newChecklist, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Safety">Safety</option>
                    <option value="Quality">Quality</option>
                    <option value="Environmental">Environmental</option>
                    <option value="Regulatory">Regulatory</option>
                    <option value="Operational">Operational</option>
                    <option value="Health & Safety">Health & Safety</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Compliance Standard</label>
                  <input
                    type="text"
                    value={newChecklist.compliance}
                    onChange={(e) => setNewChecklist({ ...newChecklist, compliance: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., ISO 9001, OSHA"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Frequency</label>
                  <select
                    value={newChecklist.frequency}
                    onChange={(e) => setNewChecklist({ ...newChecklist, frequency: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Frequency</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annually">Annually</option>
                    <option value="As Needed">As Needed</option>
                  </select>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Checklist Items <span className="text-red-500">*</span>
                  </label>
                  <button
                    onClick={handleAddItem}
                    className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {checklistItems.map((item, index) => (
                    <div key={index} className="flex items-start space-x-2 bg-slate-50 p-3 rounded-lg">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.task}
                          onChange={(e) => handleItemChange(index, 'task', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder={`Item ${index + 1} - Enter task description`}
                        />
                      </div>
                      <label className="flex items-center space-x-2 mt-2">
                        <input
                          type="checkbox"
                          checked={item.required}
                          onChange={(e) => handleItemChange(index, 'required', e.target.checked)}
                          className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-slate-600">Required</span>
                      </label>
                      {checklistItems.length > 1 && (
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center space-x-3 pt-4 mt-6 border-t border-slate-200">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewChecklist({ name: '', description: '', category: '', compliance: '', frequency: '' });
                  setChecklistItems([{ task: '', required: true }]);
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateChecklist}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Checklist</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Checklist Modal */}
      {showEditModal && selectedChecklist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Edit Compliance Checklist</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedChecklist(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Checklist Name</label>
                  <input
                    type="text"
                    value={selectedChecklist.name}
                    onChange={(e) => setSelectedChecklist({ ...selectedChecklist, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={selectedChecklist.description}
                    onChange={(e) => setSelectedChecklist({ ...selectedChecklist, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <select
                    value={selectedChecklist.category}
                    onChange={(e) => setSelectedChecklist({ ...selectedChecklist, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Safety">Safety</option>
                    <option value="Quality">Quality</option>
                    <option value="Environmental">Environmental</option>
                    <option value="Regulatory">Regulatory</option>
                    <option value="Operational">Operational</option>
                    <option value="Health & Safety">Health & Safety</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Compliance Standard</label>
                  <input
                    type="text"
                    value={selectedChecklist.compliance}
                    onChange={(e) => setSelectedChecklist({ ...selectedChecklist, compliance: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Frequency</label>
                  <select
                    value={selectedChecklist.frequency}
                    onChange={(e) => setSelectedChecklist({ ...selectedChecklist, frequency: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annually">Annually</option>
                    <option value="As Needed">As Needed</option>
                  </select>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="border-t border-slate-200 pt-4">
                <label className="block text-sm font-medium text-slate-700 mb-3">Checklist Items</label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedChecklist.items.map((item, index) => (
                    <div key={item.id} className="flex items-start space-x-3 bg-slate-50 p-3 rounded-lg">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={(e) => {
                          const updatedItems = [...selectedChecklist.items];
                          updatedItems[index] = { ...updatedItems[index], completed: e.target.checked };
                          setSelectedChecklist({ ...selectedChecklist, items: updatedItems });
                        }}
                        className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500 mt-1"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.task}
                          onChange={(e) => {
                            const updatedItems = [...selectedChecklist.items];
                            updatedItems[index] = { ...updatedItems[index], task: e.target.value };
                            setSelectedChecklist({ ...selectedChecklist, items: updatedItems });
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => {
                            const updatedItems = [...selectedChecklist.items];
                            updatedItems[index] = { ...updatedItems[index], notes: e.target.value };
                            setSelectedChecklist({ ...selectedChecklist, items: updatedItems });
                          }}
                          placeholder="Notes (optional)"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mt-2"
                        />
                      </div>
                      <label className="flex items-center space-x-2 mt-2">
                        <input
                          type="checkbox"
                          checked={item.required}
                          onChange={(e) => {
                            const updatedItems = [...selectedChecklist.items];
                            updatedItems[index] = { ...updatedItems[index], required: e.target.checked };
                            setSelectedChecklist({ ...selectedChecklist, items: updatedItems });
                          }}
                          className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-slate-600">Required</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center space-x-3 pt-4 mt-6 border-t border-slate-200">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedChecklist(null);
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateChecklist}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Update Checklist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
