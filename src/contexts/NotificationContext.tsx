import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  showToast: (type: Notification['type'], title: string, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  // Initialize with sample notifications for demonstration
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif-init-1',
      type: 'success',
      title: 'Work Order Completed',
      message: 'Work order #WO-2024-001 has been successfully completed by John Doe.',
      timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      read: false,
      actionUrl: '/work-orders/1'
    },
    {
      id: 'notif-init-2',
      type: 'warning',
      title: 'Maintenance Due',
      message: 'Preventive maintenance is due for Asset #A-001 - HVAC System.',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      read: false,
      actionUrl: '/assets/1'
    },
    {
      id: 'notif-init-3',
      type: 'info',
      title: 'Maintenance Reminder',
      message: 'Elevator inspection scheduled for tomorrow at 10:00 AM.',
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      read: true,
      actionUrl: '/preventative-maintenance'
    },
  ]);
  const [toasts, setToasts] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const showToast = useCallback((type: Notification['type'], title: string, message: string) => {
    const toast: Notification = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
    };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id));
    }, 5000);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        showToast,
      }}
    >
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

function Toast({ toast, onClose }: { toast: Notification; onClose: () => void }) {
  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'info': return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getColors = () => {
    switch (toast.type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-orange-50 border-orange-200';
      case 'info': return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`${getColors()} border rounded-lg shadow-lg p-4 min-w-[320px] max-w-md animate-slide-in-right`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900">{toast.title}</p>
          <p className="text-sm text-slate-600 mt-1">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
