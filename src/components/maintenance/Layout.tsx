import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Calendar,
  Shield,
  DollarSign,
  FileText,
  GitBranch,
  FolderOpen,
  MapPin,
  BarChart3,
  Menu,
  X,
  Bell,
  Settings,
  Users,
  LogOut
} from 'lucide-react';
import ThemeSwitcher from '../shared/ThemeSwitcher';
import { OnlineStatus } from '../shared/OnlineStatus';
import { NotificationSidebar } from '../shared/NotificationSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useOrganization } from '../../contexts/OrganizationContext';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notificationSidebarOpen, setNotificationSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { organization, getLogo } = useOrganization();
  
  // Get organization logo or use default
  const logoUrl = getLogo();

  // All navigation items with required permissions
  // NOTE:
  // - Items with an empty permissions array are visible to all authenticated users
  // - Other items require at least one of the listed permissions
  const allNavigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      // Dashboard is available to all authenticated users; no specific permission required
      permissions: [] as string[], // All authenticated users can access dashboard
    },
    {
      name: 'Work Orders',
      href: '/work-orders',
      icon: ClipboardList,
      // Any of the work-order view permissions will grant access to this menu item
      permissions: ['can_view_all_work_orders', 'can_view_assigned_work_orders'],
    },
    {
      name: 'Assets',
      href: '/assets',
      icon: Package,
      permissions: ['can_view_assigned_assets', 'can_add_assets', 'can_edit_assets']
    },
    {
      name: 'Preventative Maintenance',
      href: '/preventative-maintenance',
      icon: Calendar,
      permissions: ['can_track_asset_maintenance']
    },
    {
      name: 'Compliance & Safety',
      href: '/compliance',
      icon: Shield,
      permissions: ['can_manage_security_policies', 'can_escalate_safety_concerns']
    },
    {
      name: 'Cost Tracking',
      href: '/cost-tracking',
      icon: DollarSign,
      permissions: ['can_view_organization_costs']
    },
    {
      name: 'Quotes',
      href: '/quotes',
      icon: FileText,
      permissions: ['can_create_invoices', 'can_view_own_invoices']
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      permissions: ['can_manage_users']
    },
    {
      name: 'Variations',
      href: '/variations',
      icon: GitBranch,
      permissions: ['can_create_work_orders']
    },
    {
      name: 'Documents',
      href: '/documents',
      icon: FolderOpen,
      permissions: ['can_upload_asset_documentation']
    },
    {
      name: 'Sites',
      href: '/sites',
      icon: MapPin,
      permissions: ['can_view_all_sites', 'can_view_assigned_sites']
    },
    {
      name: 'Attendance',
      href: '/attendance',
      icon: Users,
      permissions: ['can_view_all_attendance', 'can_view_own_attendance']
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
      permissions: ['can_generate_custom_reports', 'can_view_team_reports']
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      // Settings page is available to all authenticated users (personal settings), so no specific permission required
      permissions: [] as string[], // All authenticated users can access personal settings
    },
  ];

  // Filter navigation based on user permissions
  const { hasPermission } = useAuth();
  const navigation = allNavigation.filter(item =>
    item.permissions.length === 0 || item.permissions.some(permission => hasPermission(permission as any))
  );

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Top Navigation Bar */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-600" />
              ) : (
                <Menu className="w-5 h-5 text-slate-600" />
              )}
            </button>
            <div className="flex items-center space-x-3">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={organization?.name || 'Logo'} 
                  className="w-10 h-10 rounded-lg object-contain bg-white"
                  onError={(e) => {
                    // Fallback to default icon if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center ${logoUrl ? 'hidden' : ''}`}>
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  {organization?.name || 'CMMS'}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                  {organization?.settings?.branding?.company_tagline || 'Asset Management System'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Online Status Indicator */}
            <div className="hidden sm:block">
              <OnlineStatus size="sm" />
            </div>

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Notifications */}
            <button
              onClick={() => setNotificationSidebarOpen(true)}
              className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 pl-2 border-l border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-slate-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-slate-500">{user?.role || 'Role'}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                      <p className="font-medium text-slate-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{user?.email}</p>
                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          {user?.role}
                        </span>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/settings');
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Settings</span>
                      </button>
                      <button
                        onClick={() => {
                          // Close dropdown first
                          setShowUserMenu(false);
                          // Clear auth state
                          logout();
                          // Redirect to login and replace history to avoid back navigation
                          navigate('/login', { replace: true });
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:block fixed left-0 top-16 bottom-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0'
          } overflow-y-auto overflow-x-hidden z-40`}
      >
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${active
                  ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>


        {/* Quick Actions */}
        <div className="p-4 border-t border-slate-200 mt-auto">
          <button
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 top-16"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-50 overflow-y-auto">
            <nav className="p-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${active
                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Management - Admin Only (Mobile) */}
            {hasPermission('can_manage_users') && (
              <div className="px-4 pb-4">
                <Link
                  to="/users"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/users')
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">User Management</span>
                </Link>
              </div>
            )}

            <div className="p-4 border-t border-slate-200">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  navigate('/login', { replace: true });
                }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'
          }`}
      >
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
          {children}
        </div>
      </main>

      {/* Notification Sidebar */}
      <NotificationSidebar
        isOpen={notificationSidebarOpen}
        onClose={() => setNotificationSidebarOpen(false)}
      />
    </div>
  );
}
