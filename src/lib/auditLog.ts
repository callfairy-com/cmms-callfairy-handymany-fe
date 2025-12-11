export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail: string;
  userName: string;
  action: AuditAction;
  resourceType: ResourceType;
  resourceId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export type AuditAction =
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'submit'
  | 'upload'
  | 'download'
  | 'login'
  | 'logout'
  | 'access_denied';

export type ResourceType =
  | 'work_order'
  | 'asset'
  | 'document'
  | 'variation'
  | 'quote'
  | 'user'
  | 'report'
  | 'dashboard';

class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private readonly MAX_LOGS = 1000; // Keep last 1000 entries in memory

  log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const logEntry: AuditLogEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    this.logs.unshift(logEntry);

    // Keep only MAX_LOGS entries
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }

    // Store in localStorage for persistence
    this.persistLogs();

    // In production, send to backend API
    this.sendToBackend(logEntry);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('[AUDIT]', logEntry);
    }
  }

  private persistLogs(): void {
    try {
      const recentLogs = this.logs.slice(0, 100); // Store only last 100
      localStorage.setItem('audit_logs', JSON.stringify(recentLogs));
    } catch (error) {
      console.error('Failed to persist audit logs:', error);
    }
  }

  private sendToBackend(_entry: AuditLogEntry): void {
    // In production, send to backend API
    // fetch('/api/audit-logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(entry),
    // });
  }

  loadLogs(): void {
    try {
      const stored = localStorage.getItem('audit_logs');
      if (stored) {
        this.logs = JSON.parse(stored).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    }
  }

  getLogs(filters?: {
    userId?: string;
    action?: AuditAction;
    resourceType?: ResourceType;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): AuditLogEntry[] {
    let filtered = [...this.logs];

    if (filters) {
      if (filters.userId) {
        filtered = filtered.filter(log => log.userId === filters.userId);
      }
      if (filters.action) {
        filtered = filtered.filter(log => log.action === filters.action);
      }
      if (filters.resourceType) {
        filtered = filtered.filter(log => log.resourceType === filters.resourceType);
      }
      if (filters.resourceId) {
        filtered = filtered.filter(log => log.resourceId === filters.resourceId);
      }
      if (filters.startDate) {
        filtered = filtered.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filtered = filtered.filter(log => log.timestamp <= filters.endDate!);
      }
      if (filters.limit) {
        filtered = filtered.slice(0, filters.limit);
      }
    }

    return filtered;
  }

  getRecentActivity(limit: number = 20): AuditLogEntry[] {
    return this.logs.slice(0, limit);
  }

  getUserActivity(userId: string, limit: number = 50): AuditLogEntry[] {
    return this.logs
      .filter(log => log.userId === userId)
      .slice(0, limit);
  }

  getResourceActivity(resourceType: ResourceType, resourceId: string): AuditLogEntry[] {
    return this.logs.filter(
      log => log.resourceType === resourceType && log.resourceId === resourceId
    );
  }

  clearLogs(): void {
    this.logs = [];
    localStorage.removeItem('audit_logs');
  }

  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2);
    } else {
      // CSV export
      const headers = ['Timestamp', 'User', 'Action', 'Resource Type', 'Resource ID', 'Details'];
      const rows = this.logs.map(log => [
        log.timestamp.toISOString(),
        `${log.userName} (${log.userEmail})`,
        log.action,
        log.resourceType,
        log.resourceId,
        JSON.stringify(log.details),
      ]);

      return [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');
    }
  }
}

// Singleton instance
export const auditLogger = new AuditLogger();

// Load logs on initialization
auditLogger.loadLogs();

// Helper functions for common audit actions
export const auditLog = {
  viewWorkOrder: (userId: string, userEmail: string, userName: string, workOrderId: string) => {
    auditLogger.log({
      userId,
      userEmail,
      userName,
      action: 'view',
      resourceType: 'work_order',
      resourceId: workOrderId,
      details: {},
    });
  },

  updateWorkOrder: (userId: string, userEmail: string, userName: string, workOrderId: string, changes: Record<string, any>) => {
    auditLogger.log({
      userId,
      userEmail,
      userName,
      action: 'update',
      resourceType: 'work_order',
      resourceId: workOrderId,
      details: { changes },
    });
  },

  approveWorkOrder: (userId: string, userEmail: string, userName: string, workOrderId: string, comments?: string) => {
    auditLogger.log({
      userId,
      userEmail,
      userName,
      action: 'approve',
      resourceType: 'work_order',
      resourceId: workOrderId,
      details: { comments },
    });
  },

  rejectWorkOrder: (userId: string, userEmail: string, userName: string, workOrderId: string, reason: string) => {
    auditLogger.log({
      userId,
      userEmail,
      userName,
      action: 'reject',
      resourceType: 'work_order',
      resourceId: workOrderId,
      details: { reason },
    });
  },

  submitWorkOrder: (userId: string, userEmail: string, userName: string, workOrderId: string) => {
    auditLogger.log({
      userId,
      userEmail,
      userName,
      action: 'submit',
      resourceType: 'work_order',
      resourceId: workOrderId,
      details: {},
    });
  },

  uploadDocument: (userId: string, userEmail: string, userName: string, documentId: string, fileName: string) => {
    auditLogger.log({
      userId,
      userEmail,
      userName,
      action: 'upload',
      resourceType: 'document',
      resourceId: documentId,
      details: { fileName },
    });
  },

  viewDashboard: (userId: string, userEmail: string, userName: string) => {
    auditLogger.log({
      userId,
      userEmail,
      userName,
      action: 'view',
      resourceType: 'dashboard',
      resourceId: 'main',
      details: {},
    });
  },

  accessDenied: (userId: string, userEmail: string, userName: string, resourceType: ResourceType, resourceId: string, reason: string) => {
    auditLogger.log({
      userId,
      userEmail,
      userName,
      action: 'access_denied',
      resourceType,
      resourceId,
      details: { reason },
    });
  },
};
