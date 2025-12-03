import { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { dataService } from '../../lib/dataService';

export default function Reports() {
  const [stats, setStats] = useState(dataService.getDashboardStats());

  useEffect(() => {
    setStats(dataService.getDashboardStats());
  }, []);

  const reports = [
    {
      id: 1,
      title: 'Work Order Completion Report',
      description: 'Detailed analysis of completed work orders',
      period: 'Last 30 Days',
      icon: BarChart3,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 2,
      title: 'Cost Analysis Report',
      description: 'Budget vs actual cost breakdown',
      period: 'Current Month',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 3,
      title: 'Asset Maintenance History',
      description: 'Complete maintenance records for all assets',
      period: 'Last 12 Months',
      icon: Calendar,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 4,
      title: 'Compliance & Safety Report',
      description: 'Regulatory compliance status and safety inspections',
      period: 'Last Quarter',
      icon: AlertCircle,
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const generateReportData = (reportId: number) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return null;

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    switch (reportId) {
      case 1: // Work Order Completion Report
        return {
          title: report.title,
          period: report.period,
          generatedDate: currentDate,
          data: {
            totalWorkOrders: stats.jobs.total,
            completedWorkOrders: stats.jobs.completed,
            inProgressWorkOrders: stats.jobs.inProgress,
            pendingWorkOrders: stats.jobs.pending,
            completionRate: Math.round((stats.jobs.completed / stats.jobs.total) * 100),
            averageCompletionTime: '3.2 days',
            topCategories: ['Electrical', 'Plumbing', 'HVAC', 'General Maintenance']
          }
        };
      
      case 2: // Cost Analysis Report
        return {
          title: report.title,
          period: report.period,
          generatedDate: currentDate,
          data: {
            totalEstimated: stats.costs.estimated,
            totalActual: stats.costs.total,
            variance: stats.costs.variance,
            variancePercentage: stats.costs.variancePercentage,
            budgetUtilization: Math.round((stats.costs.total / stats.costs.estimated) * 100),
            costBreakdown: {
              labor: Math.round(stats.costs.total * 0.6),
              materials: Math.round(stats.costs.total * 0.3),
              equipment: Math.round(stats.costs.total * 0.1)
            }
          }
        };
      
      case 3: // Asset Maintenance History
        return {
          title: report.title,
          period: report.period,
          generatedDate: currentDate,
          data: {
            totalAssets: stats.assets.total,
            operationalAssets: stats.assets.operational,
            underMaintenanceAssets: stats.assets.underMaintenance,
            maintenanceScheduled: 45,
            maintenanceCompleted: 38,
            averageDowntime: '2.1 hours',
            criticalAssets: 8
          }
        };
      
      case 4: // Compliance & Safety Report
        return {
          title: report.title,
          period: report.period,
          generatedDate: currentDate,
          data: {
            totalInspections: 24,
            passedInspections: 22,
            failedInspections: 2,
            complianceRate: 92,
            safetyIncidents: 1,
            correctiveActions: 3,
            nextInspectionDue: '15 days'
          }
        };
      
      default:
        return null;
    }
  };

  const exportToPDF = (reportId: number) => {
    const reportData = generateReportData(reportId);
    if (!reportData) return;

    // Generate PDF content
    const pdfContent = `
${reportData.title.toUpperCase()}
Generated: ${reportData.generatedDate}
Period: ${reportData.period}

${'='.repeat(50)}

SUMMARY:
${Object.entries(reportData.data).map(([key, value]) => {
  const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  if (typeof value === 'object' && value !== null) {
    return `${formattedKey}:\n${Object.entries(value).map(([k, v]) => `  - ${k}: ${v}`).join('\n')}`;
  }
  return `${formattedKey}: ${value}`;
}).join('\n')}

${'='.repeat(50)}

This report was generated automatically by the Maintenance Management System.
For questions or additional information, please contact the system administrator.
    `;

    // Create and download PDF (simulated as text file)
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportData.title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    alert('PDF report downloaded successfully! In a real implementation, this would be a formatted PDF file.');
  };

  const exportToExcel = (reportId: number) => {
    const reportData = generateReportData(reportId);
    if (!reportData) return;

    // Generate Excel-like CSV content
    let csvContent = `${reportData.title}\n`;
    csvContent += `Generated,${reportData.generatedDate}\n`;
    csvContent += `Period,${reportData.period}\n\n`;
    
    csvContent += `Metric,Value\n`;
    
    Object.entries(reportData.data).forEach(([key, value]) => {
      const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      if (typeof value === 'object' && value !== null) {
        csvContent += `${formattedKey},\n`;
        Object.entries(value).forEach(([k, v]) => {
          csvContent += `,${k},${v}\n`;
        });
      } else {
        csvContent += `${formattedKey},${value}\n`;
      }
    });

    // Create and download Excel file (simulated as CSV)
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportData.title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    alert('Excel report downloaded successfully! In a real implementation, this would be a formatted Excel file.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-slate-600 mt-1">Generate insights and export data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Job Completion Rate</p>
          <p className="text-2xl font-bold text-green-600">{stats.jobs.completionRate}%</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Overdue Tasks</p>
          <p className="text-2xl font-bold text-red-600">{stats.maintenance.overdue}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Cost Variance</p>
          <p className={`text-2xl font-bold ${stats.costs.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {stats.costs.variancePercentage}%
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Operational Assets</p>
          <p className="text-2xl font-bold text-blue-600">{stats.assets.operational}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Available Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <div key={report.id} className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4 mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${report.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-1">{report.title}</h3>
                    <p className="text-sm text-slate-600 mb-2">{report.description}</p>
                    <p className="text-xs text-slate-500">Period: {report.period}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => exportToPDF(report.id)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export PDF</span>
                  </button>
                  <button 
                    onClick={() => exportToExcel(report.id)}
                    className="flex-1 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Excel</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Work Order Performance</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Completed</span>
                <span className="text-sm font-bold text-green-600">{stats.jobs.completed} ({stats.jobs.completionRate}%)</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full"
                  style={{ width: `${stats.jobs.completionRate}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">In Progress</span>
                <span className="text-sm font-bold text-blue-600">
                  {stats.jobs.inProgress} ({Math.round((stats.jobs.inProgress / stats.jobs.total) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{ width: `${(stats.jobs.inProgress / stats.jobs.total) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Pending</span>
                <span className="text-sm font-bold text-orange-600">
                  {stats.jobs.pending} ({Math.round((stats.jobs.pending / stats.jobs.total) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className="bg-orange-600 h-3 rounded-full"
                  style={{ width: `${(stats.jobs.pending / stats.jobs.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Cost Summary</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-slate-600">Total Estimated</span>
              <span className="text-lg font-bold text-slate-900">£{stats.costs.estimated.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-slate-600">Total Actual</span>
              <span className="text-lg font-bold text-blue-600">£{stats.costs.total.toLocaleString()}</span>
            </div>
            <div className={`flex items-center justify-between p-4 rounded-lg ${
              stats.costs.variance > 0 ? 'bg-red-50' : 'bg-green-50'
            }`}>
              <span className="text-sm font-medium text-slate-600">Variance</span>
              <span className={`text-lg font-bold ${stats.costs.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {stats.costs.variance > 0 ? '+' : ''}£{Math.abs(stats.costs.variance).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
