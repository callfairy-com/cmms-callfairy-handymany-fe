import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { NotificationProvider } from './contexts/NotificationContext.tsx';
import { SettingsProvider } from './contexts/SettingsContext.tsx';
import { OrganizationProvider } from './contexts/OrganizationContext.tsx';
import { Layout } from './components/maintenance/Layout.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import Login from './pages/Login.tsx';
import { RoleDashboard as Dashboard } from './pages/dashboard/RoleDashboard.tsx';
import UserManagement from './pages/users/UserManagement.tsx';
import WorkOrders from './pages/cmms/WorkOrders.tsx';
import WorkOrderDetail from './pages/cmms/WorkOrderDetail.tsx';
import WorkOrderForm from './pages/cmms/WorkOrderForm.tsx';
import Assets from './pages/cmms/Assets.tsx';
import AssetDetail from './pages/cmms/AssetDetail.tsx';
import AssetForm from './pages/cmms/AssetForm.tsx';
import PreventativeMaintenance from './pages/cmms/PreventativeMaintenance.tsx';
import MaintenanceForm from './pages/cmms/MaintenanceForm.tsx';
import Compliance from './pages/cmms/Compliance.tsx';
import CostTracking from './pages/cmms/CostTracking.tsx';
import Quotes from './pages/cmms/Quotes.tsx';
import QuoteDetail from './pages/cmms/QuoteDetail.tsx';
import Variations from './pages/cmms/Variations.tsx';
import Documents from './pages/cmms/Documents.tsx';
import Sites from './pages/cmms/Sites.tsx';
import SiteForm from './pages/cmms/SiteForm.tsx';
import Attendance from './pages/cmms/Attendance.tsx';
import Reports from './pages/cmms/Reports.tsx';
import { SettingsPage } from './pages/settings/SettingsPage.tsx';

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
          <Routes>
            {/* Public Route - Login */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes - Require Authentication */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <SettingsProvider>
                    <OrganizationProvider>
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

                        {/* Work Orders - View permission required (any view: all, assigned, or team) */}
                        <Route
                          path="/work-orders"
                          element={
                            <ProtectedRoute requiredPermission={['can_view_all_work_orders', 'can_view_assigned_work_orders', 'can_view_team_work_orders']}>
                              <WorkOrders />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/work-orders/new"
                          element={
                            <ProtectedRoute requiredPermission="can_create_work_orders">
                              <WorkOrderForm />
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
                          path="/work-orders/:id/edit"
                          element={
                            <ProtectedRoute requiredPermission="can_create_work_orders">
                              <WorkOrderForm />
                            </ProtectedRoute>
                          }
                        />

                        {/* Assets */}
                        <Route
                          path="/assets"
                          element={
                            <ProtectedRoute requiredPermission={['can_view_assigned_assets', 'can_add_assets', 'can_edit_assets']}>
                              <Assets />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/assets/new"
                          element={
                            <ProtectedRoute requiredPermission="can_add_assets">
                              <AssetForm />
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
                        <Route
                          path="/assets/:id/edit"
                          element={
                            <ProtectedRoute requiredPermission="can_edit_assets">
                              <AssetForm />
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
                        <Route
                          path="/preventative-maintenance/new"
                          element={
                            <ProtectedRoute requiredPermission="can_create_work_orders">
                              <MaintenanceForm />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/preventative-maintenance/:id"
                          element={
                            <ProtectedRoute>
                              <MaintenanceForm />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/preventative-maintenance/:id/edit"
                          element={
                            <ProtectedRoute requiredPermission="can_create_work_orders">
                              <MaintenanceForm />
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
                        <Route
                          path="/sites/new"
                          element={
                            <ProtectedRoute requiredPermission="can_manage_organization">
                              <SiteForm />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/sites/:id/edit"
                          element={
                            <ProtectedRoute requiredPermission="can_manage_organization">
                              <SiteForm />
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
                          path="/users"
                          element={
                            <ProtectedRoute requiredPermission={['can_manage_users']}>
                              <UserManagement />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/user-management"
                          element={
                            <ProtectedRoute requiredPermission={['can_manage_users']}>
                              <UserManagement />
                            </ProtectedRoute>
                          }
                        />
                        {/* Settings - Personal settings accessible to all users */}
                        <Route
                          path="/settings"
                          element={
                            <ProtectedRoute>
                              <SettingsPage />
                            </ProtectedRoute>
                          }
                        />
                      </Routes>
                      </Layout>
                    </OrganizationProvider>
                  </SettingsProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default MaintenanceApp;
