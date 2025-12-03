// Data service for loading JSON data
import usersData from '../data/users.json';
import assetsData from '../data/assets.json';
import jobsData from '../data/jobs.json';
import maintenanceData from '../data/maintenance.json';
import costsData from '../data/costs.json';
import checklistsData from '../data/checklists.json';
import variationsData from '../data/variations.json';
import quotesData from '../data/quotes.json';
import sitesData from '../data/sites.json';
import documentsData from '../data/documents.json';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Contractor';
  phone: string;
  avatar: string;
  department: string;
  active: boolean;
  joinedDate: string;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  category: string;
  subCategory?: string;
  serialNumber: string;
  location: string;
  site: string;
  status: string;
  condition: string;
  manufacturer: string;
  model: string;
  installationDate: string;
  warrantyExpiry: string;
  purchasePrice: number;
  currentValue: number;
  expectedReplacement: string;
  qrCode: string;
  barcode: string;
  lastServiceDate: string;
  nextServiceDate: string;
  maintenanceHistory: string[];
  image: string;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  assetId: string;
  assignedTo: string;
  createdBy: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Complete';
  category: string;
  scheduledDate: string;
  dueDate: string;
  completedDate: string | null;
  estimatedHours: number;
  actualHours: number;
  estimatedCost?: number;
  site: string;
  location: string;
  progress: number;
  checklistId: string | null;
  attachments: string[];
  notes: string;
  startTime?: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceSchedule {
  id: string;
  name: string;
  description: string;
  assetId: string;
  frequency: string;
  interval: number;
  intervalUnit: string;
  lastCompleted: string;
  nextDue: string;
  assignedTeam: string;
  estimatedDuration: number;
  priority: string;
  status: string;
  autoGenerate: boolean;
  checklistTemplate: string | null;
  history: {
    date: string;
    jobId: string;
    status: string;
    notes: string;
  }[];
}

export interface Cost {
  id: string;
  jobId: string;
  type: string;
  description: string;
  estimatedCost: number;
  actualCost: number;
  quantity: number;
  unitCost: number;
  unit: string;
  supplier: string;
  date: string;
  invoiceNumber: string | null;
  status: string;
}

export interface Checklist {
  id: string;
  name: string;
  description: string;
  category: string;
  items: {
    id: string;
    task: string;
    required: boolean;
    completed: boolean;
    notes: string;
  }[];
  compliance: string;
  frequency: string;
}

export interface Variation {
  id: string;
  jobId: string;
  title: string;
  description: string;
  type: string;
  status: string;
  requestedBy: string;
  approvedBy: string | null;
  requestDate: string;
  approvalDate: string | null;
  originalCost: number;
  variationCost: number;
  totalCost: number;
  originalDuration: number;
  additionalDuration: number;
  totalDuration: number;
  reason: string;
  impact: string;
  version: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  title: string;
  clientName: string;
  clientContact: string;
  status: string;
  validUntil: string;
  createdDate: string;
  acceptedDate: string | null;
  items: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  terms: string;
  notes: string;
}

export interface Site {
  id: string;
  name: string;
  address: string;
  type: string;
  size: number;
  sizeUnit: string;
  buildings: string[];
  assetCount: number;
  activeJobs: number;
  manager: string;
  status: string;
  operatingHours: string;
  emergencyContact: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  size: number;
  uploadedBy: string;
  uploadDate: string;
  jobId: string;
  assetId: string;
  description: string;
  url: string;
  tags: string[];
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD format
  status: 'Present' | 'Absent';
  markedBy: string;
  markedAt: string;
  notes?: string;
}

export interface AttendanceReport {
  employeeId: string;
  employeeName: string;
  month: string; // YYYY-MM format
  totalDays: number;
  presentDays: number;
  absentDays: number;
  attendancePercentage: number;
}

export interface WeeklyAttendanceReport {
  employeeId: string;
  employeeName: string;
  weekStart: string; // YYYY-MM-DD format (Monday)
  weekEnd: string; // YYYY-MM-DD format (Sunday)
  totalDays: number;
  presentDays: number;
  absentDays: number;
  attendancePercentage: number;
}

export interface ProductivityRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD format
  hoursWorked: number;
  tasksCompleted: number;
  qualityScore: number; // 1-10 scale
  efficiency: number; // percentage
  notes?: string;
  recordedBy: string;
  recordedAt: string;
}

export interface ProductivityReport {
  employeeId: string;
  employeeName: string;
  period: string; // YYYY-MM or YYYY-WW format
  averageHoursWorked: number;
  totalTasksCompleted: number;
  averageQualityScore: number;
  averageEfficiency: number;
  productivityScore: number; // calculated overall score
  paymentMultiplier: number; // 0.8 - 1.2 based on performance
}

export interface PaymentCalculation {
  employeeId: string;
  employeeName: string;
  period: string;
  basePay: number;
  attendanceBonus: number;
  productivityBonus: number;
  qualityBonus: number;
  totalPay: number;
  attendancePercentage: number;
  productivityScore: number;
}

// Data Service
class DataService {
  private readonly ATTENDANCE_STORAGE_KEY = 'crm_fairy_attendance';
  private readonly PRODUCTIVITY_STORAGE_KEY = 'crm_fairy_productivity';
  private readonly JOB_STORAGE_KEY = 'crm_fairy_jobs';
  private readonly VARIATION_STORAGE_KEY = 'crm_fairy_variations';
  private readonly DOCUMENT_STORAGE_KEY = 'crm_fairy_documents';
  private users: User[] = usersData as User[];
  private assets: Asset[] = assetsData as Asset[];
  private jobs: Job[] = this.loadJobs();
  private maintenance: MaintenanceSchedule[] = maintenanceData as MaintenanceSchedule[];
  private costs: Cost[] = costsData as Cost[];
  private checklists: Checklist[] = checklistsData as Checklist[];
  private variations: Variation[] = this.loadVariations();
  private quotes: Quote[] = quotesData as Quote[];
  private sites: Site[] = sitesData as Site[];
  private documents: Document[] = this.loadDocuments();
  private attendance: AttendanceRecord[] = this.loadAttendance();
  private productivity: ProductivityRecord[] = this.loadProductivity();

  private loadDocuments(): Document[] {
    const initialDocs = documentsData as Document[];
    if (typeof window === 'undefined') {
      return [...initialDocs];
    }

    try {
      const stored = window.localStorage.getItem(this.DOCUMENT_STORAGE_KEY);
      if (!stored) {
        window.localStorage.setItem(this.DOCUMENT_STORAGE_KEY, JSON.stringify(initialDocs));
        return [...initialDocs];
      }

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        return [...initialDocs];
      }

      return parsed as Document[];
    } catch (error) {
      console.error('Failed to load documents from storage:', error);
      return [...initialDocs];
    }
  }

  private saveDocuments() {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(this.DOCUMENT_STORAGE_KEY, JSON.stringify(this.documents));
    } catch (error) {
      console.error('Failed to save documents to storage:', error);
    }
  }

  private loadJobs(): Job[] {
    const initialJobs = jobsData as Job[];
    if (typeof window === 'undefined') {
      return [...initialJobs];
    }

    try {
      const stored = window.localStorage.getItem(this.JOB_STORAGE_KEY);
      if (!stored) {
        window.localStorage.setItem(this.JOB_STORAGE_KEY, JSON.stringify(initialJobs));
        return [...initialJobs];
      }

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        return [...initialJobs];
      }

      return parsed as Job[];
    } catch (error) {
      console.error('Failed to load jobs from storage:', error);
      return [...initialJobs];
    }
  }

  private saveJobs() {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(this.JOB_STORAGE_KEY, JSON.stringify(this.jobs));
    } catch (error) {
      console.error('Failed to save jobs to storage:', error);
    }
  }

  private loadVariations(): Variation[] {
    const initialVariations = variationsData as Variation[];
    if (typeof window === 'undefined') {
      return [...initialVariations];
    }

    try {
      const stored = window.localStorage.getItem(this.VARIATION_STORAGE_KEY);
      if (!stored) {
        window.localStorage.setItem(this.VARIATION_STORAGE_KEY, JSON.stringify(initialVariations));
        return [...initialVariations];
      }

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        return [...initialVariations];
      }

      return parsed as Variation[];
    } catch (error) {
      console.error('Failed to load variations from storage:', error);
      return [...initialVariations];
    }
  }

  private saveVariations() {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(this.VARIATION_STORAGE_KEY, JSON.stringify(this.variations));
    } catch (error) {
      console.error('Failed to save variations to storage:', error);
    }
  }

  private loadAttendance(): AttendanceRecord[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const stored = window.localStorage.getItem(this.ATTENDANCE_STORAGE_KEY);
      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed as AttendanceRecord[];
    } catch (error) {
      console.error('Failed to load attendance from storage:', error);
      return [];
    }
  }

  private saveAttendance() {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(this.ATTENDANCE_STORAGE_KEY, JSON.stringify(this.attendance));
    } catch (error) {
      console.error('Failed to save attendance to storage:', error);
    }
  }

  private loadProductivity(): ProductivityRecord[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const stored = window.localStorage.getItem(this.PRODUCTIVITY_STORAGE_KEY);
      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed as ProductivityRecord[];
    } catch (error) {
      console.error('Failed to load productivity from storage:', error);
      return [];
    }
  }

  private saveProductivity() {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(this.PRODUCTIVITY_STORAGE_KEY, JSON.stringify(this.productivity));
    } catch (error) {
      console.error('Failed to save productivity to storage:', error);
    }
  }

  // Users
  getUsers(): User[] {
    return this.users;
  }

  getUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getUsersByRole(role: string): User[] {
    return this.users.filter(user => user.role === role);
  }

  // Assets
  getAssets(): Asset[] {
    return this.assets;
  }

  getAssetById(id: string): Asset | undefined {
    return this.assets.find(asset => asset.id === id);
  }

  getAssetsBySite(site: string): Asset[] {
    return this.assets.filter(asset => asset.site === site);
  }

  getAssetsByStatus(status: string): Asset[] {
    return this.assets.filter(asset => asset.status === status);
  }

  // Jobs
  getJobs(): Job[] {
    return this.jobs;
  }

  getJobById(id: string): Job | undefined {
    return this.jobs.find(job => job.id === id);
  }

  getJobsByStatus(status: string): Job[] {
    return this.jobs.filter(job => job.status === status);
  }

  getJobsByAssignee(userId: string): Job[] {
    return this.jobs.filter(job => job.assignedTo === userId);
  }

  getJobsByPriority(priority: string): Job[] {
    return this.jobs.filter(job => job.priority === priority);
  }

  private generateJobId(): string {
    let counter = this.jobs.length + 1;
    const existingIds = new Set(this.jobs.map(job => job.id));
    let candidate = `WO${counter.toString().padStart(4, '0')}`;
    while (existingIds.has(candidate)) {
      counter += 1;
      candidate = `WO${counter.toString().padStart(4, '0')}`;
    }
    return candidate;
  }

  createJob(data: {
    title: string;
    description: string;
    assetId: string;
    assignedTo: string;
    createdBy: string;
    priority: Job['priority'];
    category: string;
    scheduledDate: string;
    dueDate: string;
    estimatedHours: number;
    estimatedCost?: number;
    site: string;
    location: string;
    checklistId?: string | null;
    attachments?: string[];
    notes?: string;
  }): Job {
    const id = this.generateJobId();
    const now = new Date().toISOString();
    const job: Job = {
      id,
      title: data.title,
      description: data.description,
      assetId: data.assetId,
      assignedTo: data.assignedTo,
      createdBy: data.createdBy,
      priority: data.priority,
      status: 'Pending',
      category: data.category,
      scheduledDate: data.scheduledDate,
      dueDate: data.dueDate,
      completedDate: null,
      estimatedHours: data.estimatedHours,
      actualHours: 0,
      estimatedCost: data.estimatedCost,
      site: data.site,
      location: data.location,
      progress: 0,
      checklistId: data.checklistId ?? null,
      attachments: data.attachments ?? [],
      notes: data.notes ?? '',
      createdAt: now,
      updatedAt: now,
    };

    this.jobs = [job, ...this.jobs];
    this.saveJobs();
    return job;
  }

  // Maintenance
  getMaintenanceSchedules(): MaintenanceSchedule[] {
    return this.maintenance;
  }

  getMaintenanceById(id: string): MaintenanceSchedule | undefined {
    return this.maintenance.find(m => m.id === id);
  }

  getOverdueMaintenance(): MaintenanceSchedule[] {
    const now = new Date();
    return this.maintenance.filter(m => {
      const nextDue = new Date(m.nextDue);
      return nextDue < now && m.status !== 'Completed';
    });
  }

  // Costs
  getCosts(): Cost[] {
    return this.costs;
  }

  getCostsByJob(jobId: string): Cost[] {
    return this.costs.filter(cost => cost.jobId === jobId);
  }

  getTotalCostByJob(jobId: string): { estimated: number; actual: number } {
    const jobCosts = this.getCostsByJob(jobId);
    return {
      estimated: jobCosts.reduce((sum, cost) => sum + cost.estimatedCost, 0),
      actual: jobCosts.reduce((sum, cost) => sum + cost.actualCost, 0)
    };
  }

  // Checklists
  getChecklists(): Checklist[] {
    return this.checklists;
  }

  getChecklistById(id: string): Checklist | undefined {
    return this.checklists.find(c => c.id === id);
  }

  // Variations
  getVariations(): Variation[] {
    return this.variations;
  }

  getVariationsByJob(jobId: string): Variation[] {
    return this.variations.filter(v => v.jobId === jobId);
  }

  private generateVariationId(): string {
    let counter = this.variations.length + 1;
    const existingIds = new Set(this.variations.map(v => v.id));
    let candidate = `VAR${counter.toString().padStart(3, '0')}`;
    while (existingIds.has(candidate)) {
      counter += 1;
      candidate = `VAR${counter.toString().padStart(3, '0')}`;
    }
    return candidate;
  }

  createVariation(data: {
    jobId: string;
    title: string;
    description: string;
    type: string;
    requestedBy: string;
    originalCost: number;
    variationCost: number;
    originalDuration: number;
    additionalDuration: number;
    reason: string;
    impact: string;
  }): Variation {
    const id = this.generateVariationId();
    const versionsForJob = this.variations.filter(v => v.jobId === data.jobId).map(v => v.version);
    const version = versionsForJob.length > 0 ? Math.max(...versionsForJob) + 1 : 1;
    const totalCost = data.originalCost + data.variationCost;
    const totalDuration = data.originalDuration + data.additionalDuration;
    const variation: Variation = {
      id,
      jobId: data.jobId,
      title: data.title,
      description: data.description,
      type: data.type,
      status: 'Pending',
      requestedBy: data.requestedBy,
      approvedBy: null,
      requestDate: new Date().toISOString(),
      approvalDate: null,
      originalCost: data.originalCost,
      variationCost: data.variationCost,
      totalCost,
      originalDuration: data.originalDuration,
      additionalDuration: data.additionalDuration,
      totalDuration,
      reason: data.reason,
      impact: data.impact,
      version,
    };
    this.variations = [variation, ...this.variations];
    this.saveVariations();
    return variation;
  }

  updateVariationStatus(data: {
    id: string;
    status: 'Approved' | 'Rejected';
    approvedBy: string | null;
    approvalDate: string | null;
  }): Variation | null {
    let updated: Variation | null = null;
    this.variations = this.variations.map(variation => {
      if (variation.id !== data.id) {
        return variation;
      }

      updated = {
        ...variation,
        status: data.status,
        approvedBy: data.approvedBy,
        approvalDate: data.approvalDate,
      };

      return updated;
    });

    if (updated) {
      this.saveVariations();
    }

    return updated;
  }

  // Quotes
  getQuotes(): Quote[] {
    return this.quotes;
  }

  getQuoteById(id: string): Quote | undefined {
    return this.quotes.find(q => q.id === id);
  }

  // Sites
  getSites(): Site[] {
    return this.sites;
  }

  getSiteById(id: string): Site | undefined {
    return this.sites.find(s => s.id === id);
  }

  // Documents
  getDocuments(): Document[] {
    return this.documents;
  }

  getDocumentsByJob(jobId: string): Document[] {
    return this.documents.filter(d => d.jobId === jobId);
  }

  getDocumentsByAsset(assetId: string): Document[] {
    return this.documents.filter(d => d.assetId === assetId);
  }

  private generateDocumentId(): string {
    let counter = this.documents.length + 1;
    const existingIds = new Set(this.documents.map(doc => doc.id));
    let candidate = `DOC${counter.toString().padStart(3, '0')}`;
    while (existingIds.has(candidate)) {
      counter += 1;
      candidate = `DOC${counter.toString().padStart(3, '0')}`;
    }
    return candidate;
  }

  createDocument(data: {
    name: string;
    type: string;
    category: string;
    description: string;
    url: string;
    size: number;
    uploadedBy: string;
    tags: string[];
    jobId?: string;
    assetId?: string;
  }): Document {
    const document: Document = {
      id: this.generateDocumentId(),
      name: data.name,
      type: data.type,
      category: data.category,
      description: data.description,
      url: data.url,
      size: data.size,
      uploadedBy: data.uploadedBy,
      uploadDate: new Date().toISOString(),
      jobId: data.jobId ?? '',
      assetId: data.assetId ?? '',
      tags: data.tags,
    };

    this.documents = [document, ...this.documents];
    this.saveDocuments();
    return document;
  }

  // Attendance
  getAttendanceRecords(): AttendanceRecord[] {
    return this.attendance;
  }

  getAttendanceByEmployee(employeeId: string): AttendanceRecord[] {
    return this.attendance.filter(record => record.employeeId === employeeId);
  }

  getAttendanceByDate(date: string): AttendanceRecord[] {
    return this.attendance.filter(record => record.date === date);
  }

  getAttendanceByMonth(month: string): AttendanceRecord[] {
    return this.attendance.filter(record => record.date.startsWith(month));
  }

  markAttendance(data: {
    employeeId: string;
    date: string;
    status: 'Present' | 'Absent';
    markedBy: string;
    notes?: string;
  }): AttendanceRecord {
    // Check if attendance already exists for this employee on this date
    const existingIndex = this.attendance.findIndex(
      record => record.employeeId === data.employeeId && record.date === data.date
    );

    const attendanceRecord: AttendanceRecord = {
      id: existingIndex >= 0 ? this.attendance[existingIndex].id : `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      employeeId: data.employeeId,
      date: data.date,
      status: data.status,
      markedBy: data.markedBy,
      markedAt: new Date().toISOString(),
      notes: data.notes,
    };

    if (existingIndex >= 0) {
      // Update existing record
      this.attendance[existingIndex] = attendanceRecord;
    } else {
      // Add new record
      this.attendance = [attendanceRecord, ...this.attendance];
    }

    this.saveAttendance();
    return attendanceRecord;
  }

  generateAttendanceReport(month: string): AttendanceReport[] {
    const monthRecords = this.getAttendanceByMonth(month);
    const employeeReports: { [employeeId: string]: AttendanceReport } = {};

    // Get all employees (contractors and managers)
    const employees = this.users.filter(user => user.role === 'Contractor' || user.role === 'Manager');

    // Calculate days in month
    const [year, monthNum] = month.split('-').map(Number);
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    employees.forEach(employee => {
      const employeeRecords = monthRecords.filter(record => record.employeeId === employee.id);
      const presentDays = employeeRecords.filter(record => record.status === 'Present').length;
      const absentDays = employeeRecords.filter(record => record.status === 'Absent').length;

      employeeReports[employee.id] = {
        employeeId: employee.id,
        employeeName: employee.name,
        month,
        totalDays: daysInMonth,
        presentDays,
        absentDays,
        attendancePercentage: daysInMonth > 0 ? Math.round((presentDays / daysInMonth) * 100) : 0,
      };
    });

    return Object.values(employeeReports);
  }

  generateWeeklyAttendanceReport(weekStart: string): WeeklyAttendanceReport[] {
    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const weekEnd = endDate.toISOString().split('T')[0];
    const employees = this.users.filter(user => user.role === 'Contractor' || user.role === 'Manager');

    return employees.map(employee => {
      const weekRecords = this.attendance.filter(record => {
        const recordDate = new Date(record.date);
        return record.employeeId === employee.id &&
          recordDate >= startDate &&
          recordDate <= endDate;
      });

      const presentDays = weekRecords.filter(record => record.status === 'Present').length;
      const absentDays = weekRecords.filter(record => record.status === 'Absent').length;
      const totalDays = 7; // Working days in a week

      return {
        employeeId: employee.id,
        employeeName: employee.name,
        weekStart,
        weekEnd,
        totalDays,
        presentDays,
        absentDays,
        attendancePercentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
      };
    });
  }

  // Productivity Methods
  getProductivityRecords(): ProductivityRecord[] {
    return this.productivity;
  }

  getProductivityByEmployee(employeeId: string): ProductivityRecord[] {
    return this.productivity.filter(record => record.employeeId === employeeId);
  }

  getProductivityByDate(date: string): ProductivityRecord[] {
    return this.productivity.filter(record => record.date === date);
  }

  recordProductivity(data: {
    employeeId: string;
    date: string;
    hoursWorked: number;
    tasksCompleted: number;
    qualityScore: number;
    efficiency: number;
    notes?: string;
    recordedBy: string;
  }): ProductivityRecord {
    const existingIndex = this.productivity.findIndex(
      record => record.employeeId === data.employeeId && record.date === data.date
    );

    const productivityRecord: ProductivityRecord = {
      id: existingIndex >= 0 ? this.productivity[existingIndex].id : `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      employeeId: data.employeeId,
      date: data.date,
      hoursWorked: data.hoursWorked,
      tasksCompleted: data.tasksCompleted,
      qualityScore: data.qualityScore,
      efficiency: data.efficiency,
      notes: data.notes,
      recordedBy: data.recordedBy,
      recordedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.productivity[existingIndex] = productivityRecord;
    } else {
      this.productivity.push(productivityRecord);
    }

    this.saveProductivity();
    return productivityRecord;
  }

  generateProductivityReport(period: string, type: 'monthly' | 'weekly' = 'monthly'): ProductivityReport[] {
    const employees = this.users.filter(user => user.role === 'Contractor' || user.role === 'Manager');

    return employees.map(employee => {
      let periodRecords: ProductivityRecord[];

      if (type === 'weekly') {
        const startDate = new Date(period);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        periodRecords = this.productivity.filter(record => {
          const recordDate = new Date(record.date);
          return record.employeeId === employee.id &&
            recordDate >= startDate &&
            recordDate <= endDate;
        });
      } else {
        periodRecords = this.productivity.filter(record =>
          record.employeeId === employee.id && record.date.startsWith(period)
        );
      }

      const averageHoursWorked = periodRecords.length > 0 ?
        periodRecords.reduce((sum, record) => sum + record.hoursWorked, 0) / periodRecords.length : 0;

      const totalTasksCompleted = periodRecords.reduce((sum, record) => sum + record.tasksCompleted, 0);

      const averageQualityScore = periodRecords.length > 0 ?
        periodRecords.reduce((sum, record) => sum + record.qualityScore, 0) / periodRecords.length : 0;

      const averageEfficiency = periodRecords.length > 0 ?
        periodRecords.reduce((sum, record) => sum + record.efficiency, 0) / periodRecords.length : 0;

      // Calculate overall productivity score (0-100)
      const productivityScore = Math.round(
        (averageHoursWorked / 8 * 0.3 + // 30% weight for hours worked (8 hours = 100%)
          averageQualityScore / 10 * 0.4 + // 40% weight for quality score
          averageEfficiency / 100 * 0.3) * 100 // 30% weight for efficiency
      );

      // Calculate payment multiplier based on productivity score
      let paymentMultiplier = 1.0;
      if (productivityScore >= 90) paymentMultiplier = 1.2;
      else if (productivityScore >= 80) paymentMultiplier = 1.1;
      else if (productivityScore >= 70) paymentMultiplier = 1.0;
      else if (productivityScore >= 60) paymentMultiplier = 0.95;
      else paymentMultiplier = 0.8;

      return {
        employeeId: employee.id,
        employeeName: employee.name,
        period,
        averageHoursWorked: Math.round(averageHoursWorked * 100) / 100,
        totalTasksCompleted,
        averageQualityScore: Math.round(averageQualityScore * 100) / 100,
        averageEfficiency: Math.round(averageEfficiency * 100) / 100,
        productivityScore,
        paymentMultiplier,
      };
    });
  }

  calculatePayment(employeeId: string, period: string, basePay: number = 1000): PaymentCalculation {
    const employee = this.getUserById(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Get attendance report
    const attendanceReport = this.generateAttendanceReport(period);
    const employeeAttendance = attendanceReport.find(report => report.employeeId === employeeId);

    // Get productivity report
    const productivityReport = this.generateProductivityReport(period);
    const employeeProductivity = productivityReport.find(report => report.employeeId === employeeId);

    const attendancePercentage = employeeAttendance?.attendancePercentage || 0;
    const productivityScore = employeeProductivity?.productivityScore || 0;

    // Calculate bonuses
    let attendanceBonus = 0;
    if (attendancePercentage >= 95) attendanceBonus = basePay * 0.1;
    else if (attendancePercentage >= 90) attendanceBonus = basePay * 0.05;

    let productivityBonus = 0;
    if (productivityScore >= 90) productivityBonus = basePay * 0.15;
    else if (productivityScore >= 80) productivityBonus = basePay * 0.1;
    else if (productivityScore >= 70) productivityBonus = basePay * 0.05;

    let qualityBonus = 0;
    const avgQuality = employeeProductivity?.averageQualityScore || 0;
    if (avgQuality >= 9) qualityBonus = basePay * 0.1;
    else if (avgQuality >= 8) qualityBonus = basePay * 0.05;

    const totalPay = basePay + attendanceBonus + productivityBonus + qualityBonus;

    return {
      employeeId,
      employeeName: employee.name,
      period,
      basePay,
      attendanceBonus: Math.round(attendanceBonus),
      productivityBonus: Math.round(productivityBonus),
      qualityBonus: Math.round(qualityBonus),
      totalPay: Math.round(totalPay),
      attendancePercentage,
      productivityScore,
    };
  }

  // Dashboard Stats
  getDashboardStats() {
    const totalJobs = this.jobs.length;
    const completedJobs = this.jobs.filter(j => j.status === 'Complete').length;
    const inProgressJobs = this.jobs.filter(j => j.status === 'In Progress').length;
    const pendingJobs = this.jobs.filter(j => j.status === 'Pending').length;
    const urgentJobs = this.jobs.filter(j => j.priority === 'Urgent').length;

    const totalAssets = this.assets.length;
    const operationalAssets = this.assets.filter(a => a.status === 'Operational').length;
    const underMaintenanceAssets = this.assets.filter(a => a.status === 'Under Maintenance').length;

    const overdueMaintenance = this.getOverdueMaintenance().length;

    const totalCosts = this.costs.reduce((sum, cost) => sum + cost.actualCost, 0);
    const estimatedCosts = this.costs.reduce((sum, cost) => sum + cost.estimatedCost, 0);
    const costVariance = totalCosts - estimatedCosts;

    return {
      jobs: {
        total: totalJobs,
        completed: completedJobs,
        inProgress: inProgressJobs,
        pending: pendingJobs,
        urgent: urgentJobs,
        completionRate: totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0
      },
      assets: {
        total: totalAssets,
        operational: operationalAssets,
        underMaintenance: underMaintenanceAssets
      },
      maintenance: {
        overdue: overdueMaintenance,
        scheduled: this.maintenance.filter(m => m.status === 'Active').length
      },
      costs: {
        total: totalCosts,
        estimated: estimatedCosts,
        variance: costVariance,
        variancePercentage: estimatedCosts > 0 ? Math.round((costVariance / estimatedCosts) * 100) : 0
      }
    };
  }
}

export const dataService = new DataService();
