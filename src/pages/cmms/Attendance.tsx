import { useState, useEffect } from 'react';
import { Calendar, Users, Download, Check, X, Clock, TrendingUp, DollarSign, Star, Target } from 'lucide-react';
import {
  dataService,
  User,
  AttendanceRecord,
  AttendanceReport,
  WeeklyAttendanceReport,
  ProductivityReport,
  PaymentCalculation
} from '../../lib/dataService';
import { useAuth } from '../../contexts/AuthContext';
import { Roles } from '@/types/rbac';

export default function Attendance() {
  const { user, hasPermission } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [monthlyReport, setMonthlyReport] = useState<AttendanceReport[]>([]);
  const [showReport, setShowReport] = useState(false);

  // Weekly report state
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    return monday.toISOString().split('T')[0];
  });
  const [weeklyReport, setWeeklyReport] = useState<WeeklyAttendanceReport[]>([]);
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);

  // Productivity tracking state
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [productivityData, setProductivityData] = useState({
    hoursWorked: 8,
    tasksCompleted: 0,
    qualityScore: 8,
    efficiency: 85,
    notes: ''
  });
  const [productivityReports, setProductivityReports] = useState<ProductivityReport[]>([]);
  const [paymentCalculations, setPaymentCalculations] = useState<PaymentCalculation[]>([]);
  const [showProductivity, setShowProductivity] = useState(false);
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'productivity' | 'payment'>('daily');

  // Check if user can manage attendance (admin or manager only)
  const canManageAttendance = hasPermission('can_deactivate_users') || user?.role === Roles.MANAGER;

  useEffect(() => {
    if (!canManageAttendance) return;

    // Load employees (contractors and managers)
    const allUsers = dataService.getUsers();
    const employeeList = allUsers.filter(u => u.role === 'Contractor' || u.role === 'Manager');
    setEmployees(employeeList);

    // Load attendance records for selected date
    const records = dataService.getAttendanceByDate(selectedDate);
    setAttendanceRecords(records);
  }, [selectedDate, canManageAttendance]);

  const handleAttendanceToggle = (employeeId: string, status: 'Present' | 'Absent') => {
    if (!user?.id) return;

    const record = dataService.markAttendance({
      employeeId,
      date: selectedDate,
      status,
      markedBy: String(user.id),
    });

    // Update local state
    setAttendanceRecords(prev => {
      const existingIndex = prev.findIndex(r => r.employeeId === employeeId && r.date === selectedDate);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = record;
        return updated;
      } else {
        return [record, ...prev];
      }
    });
  };

  const getEmployeeAttendance = (employeeId: string): AttendanceRecord | null => {
    return attendanceRecords.find(record =>
      record.employeeId === employeeId && record.date === selectedDate
    ) || null;
  };

  const generateReport = () => {
    const report = dataService.generateAttendanceReport(selectedMonth);
    setMonthlyReport(report);
    setShowReport(true);
  };

  const downloadReport = () => {
    const csvContent = [
      ['Employee Name', 'Total Days', 'Present Days', 'Absent Days', 'Attendance %'].join(','),
      ...monthlyReport.map(emp => [
        emp.employeeName,
        emp.totalDays,
        emp.presentDays,
        emp.absentDays,
        `${emp.attendancePercentage}%`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${selectedMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Weekly report functions
  const generateWeeklyReport = () => {
    const report = dataService.generateWeeklyAttendanceReport(selectedWeek);
    setWeeklyReport(report);
    setShowWeeklyReport(true);
  };

  const downloadWeeklyReport = () => {
    const csvContent = [
      ['Employee Name', 'Week Start', 'Week End', 'Present Days', 'Absent Days', 'Attendance %'].join(','),
      ...weeklyReport.map(emp => [
        emp.employeeName,
        emp.weekStart,
        emp.weekEnd,
        emp.presentDays,
        emp.absentDays,
        `${emp.attendancePercentage}%`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-attendance-report-${selectedWeek}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Productivity functions
  const handleProductivitySubmit = () => {
    if (!selectedEmployee || !user?.id) return;

    dataService.recordProductivity({
      employeeId: selectedEmployee,
      date: selectedDate,
      hoursWorked: productivityData.hoursWorked,
      tasksCompleted: productivityData.tasksCompleted,
      qualityScore: productivityData.qualityScore,
      efficiency: productivityData.efficiency,
      notes: productivityData.notes,
      recordedBy: String(user.id),
    });

    // Reset form
    setProductivityData({
      hoursWorked: 8,
      tasksCompleted: 0,
      qualityScore: 8,
      efficiency: 85,
      notes: ''
    });

    alert('Productivity recorded successfully!');
  };

  const generateProductivityReport = () => {
    const report = dataService.generateProductivityReport(selectedMonth);
    setProductivityReports(report);
    setShowProductivity(true);
  };

  const generatePaymentCalculations = () => {
    const calculations = employees.map(employee =>
      dataService.calculatePayment(employee.id, selectedMonth, 1000)
    );
    setPaymentCalculations(calculations);
  };

  if (!canManageAttendance) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600">You don't have permission to manage attendance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Attendance Management</h1>
          <p className="text-slate-600 mt-1">Mark employee attendance and generate reports</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Daily View</option>
            <option value="weekly">Weekly Reports</option>
            <option value="monthly">Monthly Reports</option>
            <option value="productivity">Productivity Tracking</option>
            <option value="payment">Payment Calculations</option>
          </select>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Daily Attendance */}
      {reportType === 'daily' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Daily Attendance - {new Date(selectedDate).toLocaleDateString()}
              </h2>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                <span>{employees.length} Employees</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((employee) => {
                const attendance = getEmployeeAttendance(employee.id);
                return (
                  <div key={employee.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">{employee.name}</h3>
                        <p className="text-sm text-slate-500">{employee.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAttendanceToggle(employee.id, 'Present')}
                        className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${attendance?.status === 'Present'
                          ? 'bg-green-100 text-green-700 border-2 border-green-200'
                          : 'bg-slate-50 text-slate-600 hover:bg-green-50 hover:text-green-600'
                          }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>Present</span>
                      </button>
                      <button
                        onClick={() => handleAttendanceToggle(employee.id, 'Absent')}
                        className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${attendance?.status === 'Absent'
                          ? 'bg-red-100 text-red-700 border-2 border-red-200'
                          : 'bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600'
                          }`}
                      >
                        <X className="w-4 h-4" />
                        <span>Absent</span>
                      </button>
                    </div>

                    {attendance && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <div className="flex items-center space-x-2 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>Marked at {new Date(attendance.markedAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Weekly Reports */}
      {reportType === 'weekly' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Weekly Attendance Report</h2>
              <div className="flex items-center space-x-3">
                <input
                  type="week"
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={generateWeeklyReport}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Generate Report</span>
                </button>
                {showWeeklyReport && (
                  <button
                    onClick={downloadWeeklyReport}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download CSV</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {showWeeklyReport && (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-medium text-slate-900">Employee</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-900">Week Period</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-900">Present Days</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-900">Absent Days</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-900">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyReport.map((employee) => (
                      <tr key={employee.employeeId} className="border-b border-slate-100">
                        <td className="py-3 px-4 text-slate-900">{employee.employeeName}</td>
                        <td className="py-3 px-4 text-slate-600">{employee.weekStart} to {employee.weekEnd}</td>
                        <td className="py-3 px-4">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                            {employee.presentDays}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                            {employee.absentDays}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${employee.attendancePercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{employee.attendancePercentage}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Monthly Report */}
      {reportType === 'monthly' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Monthly Report</h2>
              <div className="flex items-center space-x-3">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={generateReport}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generate Report
                </button>
              </div>
            </div>
          </div>

          {showReport && monthlyReport.length > 0 && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Attendance Report - {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={downloadReport}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download CSV</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Employee</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Total Days</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Present</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Absent</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {monthlyReport.map((report) => (
                      <tr key={report.employeeId} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{report.employeeName}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{report.totalDays}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            {report.presentDays}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            {report.absentDays}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-slate-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${report.attendancePercentage >= 90 ? 'bg-green-500' :
                                  report.attendancePercentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                style={{ width: `${report.attendancePercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-slate-900">{report.attendancePercentage}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Productivity Tracking */}
      {reportType === 'productivity' && (
        <div className="space-y-6">
          {/* Productivity Input Form */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Record Employee Productivity</span>
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Employee</label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose an employee...</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} - {employee.role}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Hours Worked</label>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    step="0.5"
                    value={productivityData.hoursWorked}
                    onChange={(e) => setProductivityData({ ...productivityData, hoursWorked: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tasks Completed</label>
                  <input
                    type="number"
                    min="0"
                    value={productivityData.tasksCompleted}
                    onChange={(e) => setProductivityData({ ...productivityData, tasksCompleted: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Quality Score (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={productivityData.qualityScore}
                    onChange={(e) => setProductivityData({ ...productivityData, qualityScore: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Efficiency (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={productivityData.efficiency}
                    onChange={(e) => setProductivityData({ ...productivityData, efficiency: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                  <textarea
                    value={productivityData.notes}
                    onChange={(e) => setProductivityData({ ...productivityData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes about performance..."
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleProductivitySubmit}
                  disabled={!selectedEmployee}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors flex items-center space-x-2"
                >
                  <Star className="w-4 h-4" />
                  <span>Record Productivity</span>
                </button>
              </div>
            </div>
          </div>

          {/* Productivity Reports */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Productivity Reports</h2>
                <div className="flex items-center space-x-3">
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={generateProductivityReport}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Generate Report</span>
                  </button>
                </div>
              </div>
            </div>

            {showProductivity && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productivityReports.map((report) => (
                    <div key={report.employeeId} className="border border-slate-200 rounded-lg p-4">
                      <h3 className="font-medium text-slate-900 mb-3">{report.employeeName}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Avg Hours:</span>
                          <span className="font-medium">{report.averageHoursWorked}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Tasks:</span>
                          <span className="font-medium">{report.totalTasksCompleted}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Quality:</span>
                          <span className="font-medium">{report.averageQualityScore}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Efficiency:</span>
                          <span className="font-medium">{report.averageEfficiency}%</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-slate-600">Score:</span>
                          <span className={`font-bold ${report.productivityScore >= 90 ? 'text-green-600' :
                            report.productivityScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                            {report.productivityScore}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Pay Multiplier:</span>
                          <span className={`font-bold ${report.paymentMultiplier >= 1.1 ? 'text-green-600' :
                            report.paymentMultiplier >= 1.0 ? 'text-blue-600' : 'text-red-600'
                            }`}>
                            {report.paymentMultiplier}x
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Calculations */}
      {reportType === 'payment' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Payment Calculations</span>
              </h2>
              <div className="flex items-center space-x-3">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={generatePaymentCalculations}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Calculate Payments</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Base Pay</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Attendance Bonus</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Productivity Bonus</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Quality Bonus</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Total Pay</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentCalculations.map((payment) => (
                    <tr key={payment.employeeId} className="border-b border-slate-100">
                      <td className="py-3 px-4 text-slate-900 font-medium">{payment.employeeName}</td>
                      <td className="py-3 px-4 text-slate-600">${payment.basePay}</td>
                      <td className="py-3 px-4">
                        <span className="text-green-600 font-medium">+${payment.attendanceBonus}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-blue-600 font-medium">+${payment.productivityBonus}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-purple-600 font-medium">+${payment.qualityBonus}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-900 font-bold text-lg">${payment.totalPay}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs space-y-1">
                          <div>Attendance: {payment.attendancePercentage}%</div>
                          <div>Productivity: {payment.productivityScore}%</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
