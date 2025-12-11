import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Users, TrendingUp, Briefcase, CheckSquare,
  BarChart3, Settings, Menu, X, LogOut, User, ChevronDown,
  Bell, Edit, Shield
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { Button } from '@/components/ui/button'
import { NotificationSidebar } from '@/components/shared/NotificationSidebar'
import { Roles } from '@/types/rbac'

interface LayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Clients', href: '/crm/clients', icon: Users },
  { name: 'Leads', href: '/crm/leads', icon: TrendingUp },
  { name: 'Deals', href: '/crm/deals', icon: Briefcase },
  { name: 'Projects', href: '/projects', icon: Briefcase },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [notificationSidebarOpen, setNotificationSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, hasRole } = useAuth()
  const { unreadCount } = useNotifications()
  React.useEffect(() => {
    console.log('[Sidebar] User object:', user);
  }, [user]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setUserDropdownOpen(false)
    }

    if (userDropdownOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [userDropdownOpen])

  // Close notification sidebar when user dropdown opens and vice versa
  React.useEffect(() => {
    if (userDropdownOpen) {
      setNotificationSidebarOpen(false)
    }
  }, [userDropdownOpen])

  React.useEffect(() => {
    if (notificationSidebarOpen) {
      setUserDropdownOpen(false)
    }
  }, [notificationSidebarOpen])

  return (
    <div className="min-h-screen bg-neu-100">
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)} />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed top-0 left-0 z-50 w-64 h-full bg-neu-100 shadow-neu-lg"
            >
              <div className="flex items-center justify-between p-4 border-b border-neu-300">
                <h1 className="text-xl font-brutal font-bold text-brutal-gradient">CRM FAIRY</h1>
                <Button size="sm" onClick={() => setSidebarOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <nav className="p-4 space-y-2">
                {navigation.map((item) => {
                  // decide visibility per item based on role/permissions
                  const canView = (() => {
                    switch (item.name) {
                      case 'Dashboard':
                        return !!user && hasRole([Roles.SUPERADMIN, Roles.ORGADMIN, Roles.MANAGER, Roles.STAFF_EMPLOYEE, Roles.VIEWER])
                      case 'Clients':
                      case 'Leads':
                      case 'Deals':
                        return hasRole([Roles.SUPERADMIN, Roles.ORGADMIN, Roles.MANAGER])
                      case 'Projects':
                        return hasRole([Roles.SUPERADMIN, Roles.ORGADMIN, Roles.MANAGER, Roles.STAFF_EMPLOYEE])
                      case 'Tasks':
                        return hasRole([Roles.SUPERADMIN, Roles.ORGADMIN, Roles.MANAGER, Roles.STAFF_EMPLOYEE])
                      case 'Reports':
                        return hasRole([Roles.SUPERADMIN, Roles.ORGADMIN, Roles.MANAGER, Roles.VIEWER])
                      case 'Settings':
                        return !!user // All authenticated users can access settings
                      default:
                        return true
                    }
                  })()

                  if (!canView) return null

                  const Icon = item.icon
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${isActive
                        ? 'bg-primary-100 text-primary-700 shadow-neu-inset'
                        : 'text-neu-700 hover:bg-neu-200 hover:shadow-neu'
                        }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-neu-100 shadow-neu-lg">
          <div className="flex items-center h-16 px-4 border-b border-neu-300">
            <h1 className="text-xl font-brutal font-bold text-brutal-gradient">CRM FAIRY</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              // Decide visibility per item based on role/permissions
              const canView = (() => {
                switch (item.name) {
                  case 'Dashboard':
                    return !!user && hasRole([Roles.SUPERADMIN, Roles.ORGADMIN, Roles.MANAGER, Roles.STAFF_EMPLOYEE, Roles.VIEWER])
                  case 'Clients':
                  case 'Leads':
                  case 'Deals':
                    return hasRole([Roles.SUPERADMIN, Roles.ORGADMIN, Roles.MANAGER])
                  case 'Projects':
                    return hasRole([Roles.SUPERADMIN, Roles.ORGADMIN, Roles.MANAGER, Roles.STAFF_EMPLOYEE])
                  case 'Tasks':
                    return hasRole([Roles.SUPERADMIN, Roles.ORGADMIN, Roles.MANAGER, Roles.STAFF_EMPLOYEE])
                  case 'Reports':
                    return hasRole([Roles.SUPERADMIN, Roles.ORGADMIN, Roles.MANAGER, Roles.VIEWER])
                  case 'Settings':
                    return !!user // All authenticated users can access settings
                  default:
                    return true
                }
              })()

              if (!canView) return null

              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-primary-100 text-primary-700 shadow-neu-inset'
                    : 'text-neu-700 hover:bg-neu-200 hover:shadow-neu'
                    }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User menu */}
          <div className="p-4 border-t border-neu-300">
            <div className="flex items-center space-x-3 mb-3">
              <div className="neu-card p-2">
                <User className="h-6 w-6 text-neu-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-neu-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-neu-500">{user?.email}</p>
              </div>
            </div>
            <Button

              size="sm"
              onClick={logout}
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-neu-300 bg-neu-100 px-4 shadow-neu sm:gap-x-6 sm:px-6 lg:px-8">
          <Button

            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <Button

                size="sm"
                className="relative"
                onClick={() => setNotificationSidebarOpen(true)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>

              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-neu-300" />

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setUserDropdownOpen(!userDropdownOpen)
                  }}
                  className="flex items-center space-x-3 neu-card p-3 hover:shadow-neu-lg transition-all duration-200"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-neu-900">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-neu-500">{user?.role}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-neu-500" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-80 bg-neu-100 rounded-lg shadow-neu-lg border border-neu-300 z-50"
                    >
                      {/* Profile Header */}
                      <div className="p-4 border-b border-neu-300">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                          </div>
                          <div className="flex-1">
                            <p className="font-brutal font-bold text-foreground">{user?.firstName} {user?.lastName}</p>
                            <p className="text-sm text-neu-600">{user?.email}</p>
                            <div className="flex items-center mt-1">
                              <Shield className="h-3 w-3 text-primary-600 mr-1" />
                              <span className="text-xs text-primary-600 font-bold">{user?.role?.toUpperCase()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="p-2">
                        <button
                          onClick={() => {
                            navigate('/profile')
                            setUserDropdownOpen(false)
                          }}
                          className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-neu-200 transition-colors text-left"
                        >
                          <Edit className="h-4 w-4 text-neu-600" />
                          <span className="text-sm font-medium text-neu-900">Edit Profile</span>
                        </button>

                        <button
                          onClick={() => {
                            navigate('/settings')
                            setUserDropdownOpen(false)
                          }}
                          className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-neu-200 transition-colors text-left"
                        >
                          <Settings className="h-4 w-4 text-neu-600" />
                          <span className="text-sm font-medium text-neu-900">Account Settings</span>
                        </button>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false)
                          }}
                          className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-neu-200 transition-colors text-left"
                        >
                          <Bell className="h-4 w-4 text-neu-600" />
                          <div className="flex-1 flex items-center justify-between">
                            <span className="text-sm font-medium text-neu-900">Notifications</span>
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>
                          </div>
                        </button>

                        <div className="border-t border-neu-300 my-2"></div>

                        <button
                          onClick={() => {
                            logout()
                            setUserDropdownOpen(false)
                          }}
                          className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-100 transition-colors text-left text-red-600"
                        >
                          <LogOut className="h-4 w-4" />
                          <span className="text-sm font-medium">Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Notification Sidebar */}
      <NotificationSidebar
        isOpen={notificationSidebarOpen}
        onClose={() => setNotificationSidebarOpen(false)}
      />
    </div>
  )
}
