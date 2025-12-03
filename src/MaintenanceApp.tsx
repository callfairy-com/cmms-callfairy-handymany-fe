import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { NotificationProvider } from './contexts/NotificationContext.tsx';
import { SettingsProvider } from './contexts/SettingsContext.tsx';
import { Layout } from './components/maintenance/Layout.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import Login from './pages/Login.tsx';
import { RoleDashboard as Dashboard } from './pages/dashboard/RoleDashboard.tsx';
import UserManagement from './pages/users/UserManagement.tsx';
import WorkOrders from './pages/cmms/WorkOrders.tsx';
import WorkOrderDetail from './pages/cmms/WorkOrderDetail.tsx';
import WorkOrderDetailEnhanced from './pages/cmms/WorkOrderDetailEnhanced.tsx';
import Assets from './pages/cmms/Assets.tsx';
import AssetDetail from './pages/cmms/AssetDetail.tsx';
import PreventativeMaintenance from './pages/cmms/PreventativeMaintenance.tsx';
import Compliance from './pages/cmms/Compliance.tsx';
import CostTracking from './pages/cmms/CostTracking.tsx';
import Quotes from './pages/cmms/Quotes.tsx';
import QuoteDetail from './pages/cmms/QuoteDetail.tsx';
import Variations from './pages/cmms/Variations.tsx';
import Documents from './pages/cmms/Documents.tsx';
import Sites from './pages/cmms/Sites.tsx';
import Attendance from './pages/cmms/Attendance.tsx';
import Reports from './pages/cmms/Reports.tsx';
import Settings from './pages/cmms/Settings.tsx';

function MaintenanceApp() {
  // Initialize dark mode on app start
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <SettingsProvider>
            <Routes>
              {/* Public Route - Login */}
              <Route path="/login" element={<Login />} />

              {/* Protected Routes - Require Authentication */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />

                        {/* Dashboard - All authenticated users */}
                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute>
                              <Dashboard />
                            </ProtectedRoute>
                          }
                        />

                        {/* Work Orders - View permission required */}
                        <Route
                          path="/work-orders"
                          element={
                            <ProtectedRoute requiredPermission={['can_view_all_work_orders', 'can_view_assigned_work_orders']}>
                              <WorkOrders />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/work-orders/:id"
                          element={
                            <ProtectedRoute>
                              <WorkOrderDetail />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/work-orders/:id/enhanced"
                          element={
                            <ProtectedRoute>
                              <WorkOrderDetailEnhanced />
                            </ProtectedRoute>
                          }
                        />

                        {/* Assets - View permission required */}
                        <Route
                          path="/assets"
                          element={
                            <ProtectedRoute requiredPermission={['can_view_assigned_assets', 'can_add_assets', 'can_edit_assets']}>
                              <Assets />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/assets/:id"
                          element={
                            <ProtectedRoute>
                              <AssetDetail />
                            </ProtectedRoute>
                          }
                        />

                        {/* Preventative Maintenance */}
                        <Route
                          path="/preventative-maintenance"
                          element={
                            <ProtectedRoute requiredPermission={['can_track_asset_maintenance']}>
                              <PreventativeMaintenance />
                            </ProtectedRoute>
                          }
                        />

                        {/* Compliance & Safety */}
                        <Route
                          path="/compliance"
                          element={
                            <ProtectedRoute requiredPermission={['can_manage_security_policies', 'can_escalate_safety_concerns']}>
                              <Compliance />
                            </ProtectedRoute>
                          }
                        />

                        {/* Cost Tracking */}
                        <Route
                          path="/cost-tracking"
                          element={
                            <ProtectedRoute requiredPermission={['can_view_organization_costs']}>
                              <CostTracking />
                            </ProtectedRoute>
                          }
                        />

                        {/* Quotes */}
                        <Route
                          path="/quotes"
                          element={
                            <ProtectedRoute requiredPermission={['can_create_invoices', 'can_view_own_invoices']}>
                              <Quotes />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/quotes/:id"
                          element={
                            <ProtectedRoute>
                              <QuoteDetail />
                            </ProtectedRoute>
                          }
                        />

                        {/* Variations - View permission required */}
                        <Route
                          path="/variations"
                          element={
                            <ProtectedRoute requiredPermission={['can_create_work_orders']}>
                              <Variations />
                            </ProtectedRoute>
                          }
                        />

                        {/* Documents */}
                        <Route
                          path="/documents"
                          element={
                            <ProtectedRoute requiredPermission={['can_upload_asset_documentation']}>
                              <Documents />
                            </ProtectedRoute>
                          }
                        />

                        {/* Sites */}
                        <Route
                          path="/sites"
                          element={
                            <ProtectedRoute requiredPermission={['can_view_all_sites', 'can_view_assigned_sites']}>
                              <Sites />
                            </ProtectedRoute>
                          }
                        />

                        {/* Attendance */}
                        <Route
                          path="/attendance"
                          element={
                            <ProtectedRoute requiredPermission={['can_view_all_attendance', 'can_view_own_attendance']}>
                              <Attendance />
                            </ProtectedRoute>
                          }
                        />

                        {/* Reports */}
                        <Route
                          path="/reports"
                          element={
                            <ProtectedRoute requiredPermission={['can_generate_custom_reports', 'can_view_team_reports']}>
                              <Reports />
                            </ProtectedRoute>
                          }
                        />

                        {/* User Management - Platform Owner, Owner, Manager */}
                        <Route
                          path="/user-management"
                          element={
                            <ProtectedRoute requiredPermission={['can_manage_users']}>
                              <UserManagement />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/settings"
                          element={
                            <ProtectedRoute requiredPermission={['can_configure_system_settings', 'can_manage_organization']}>
                              <Settings />
                            </ProtectedRoute>
                          }
                        />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </SettingsProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default MaintenanceApp;
