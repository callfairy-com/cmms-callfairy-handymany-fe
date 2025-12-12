import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

// Auth pages
import { LoginPage } from '@/features/auth/pages/LoginPage';

// Dashboard
import DashboardPage from '@/features/dashboard/pages/DashboardPage';

// Work Orders
import WorkOrdersPage from '@/features/work-orders/pages/WorkOrdersPage';
import WorkOrderDetailPage from '@/features/work-orders/pages/WorkOrderDetailPage';
import WorkOrderFormPage from '@/features/work-orders/pages/WorkOrderFormPage';

// Assets
import AssetsPage from '@/features/assets/pages/AssetsPage';
import AssetDetailPage from '@/features/assets/pages/AssetDetailPage';
import AssetFormPage from '@/features/assets/pages/AssetFormPage';

// Sites
import SitesPage from '@/features/sites/pages/SitesPage';
import SiteFormPage from '@/features/sites/pages/SiteFormPage';

// Maintenance
import MaintenancePage from '@/features/maintenance/pages/MaintenancePage';
import MaintenanceFormPage from '@/features/maintenance/pages/MaintenanceFormPage';

// Other features
import CompliancePage from '@/features/compliance/pages/CompliancePage';
import CostTrackingPage from '@/features/cost-tracking/pages/CostTrackingPage';
import QuotesPage from '@/features/quotes/pages/QuotesPage';
import QuoteDetailPage from '@/features/quotes/pages/QuoteDetailPage';
import VariationsPage from '@/features/variations/pages/VariationsPage';
import DocumentsPage from '@/features/documents/pages/DocumentsPage';
import AttendancePage from '@/features/attendance/pages/AttendancePage';
import ReportsPage from '@/features/reports/pages/ReportsPage';
import UserManagementPage from '@/features/users/pages/UserManagementPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';

export function AppRouter() {
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
    <Routes>
      {/* Public Route - Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes - Require Authentication */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Dashboard - All authenticated users */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Work Orders - View permission required */}
                <Route
                  path="/work-orders"
                  element={
                    <ProtectedRoute requiredPermission={['can_view_all_work_orders', 'can_view_assigned_work_orders', 'can_view_team_work_orders']}>
                      <WorkOrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/work-orders/new"
                  element={
                    <ProtectedRoute requiredPermission="can_create_work_orders">
                      <WorkOrderFormPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/work-orders/:id"
                  element={
                    <ProtectedRoute>
                      <WorkOrderDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/work-orders/:id/edit"
                  element={
                    <ProtectedRoute requiredPermission="can_create_work_orders">
                      <WorkOrderFormPage />
                    </ProtectedRoute>
                  }
                />

                {/* Assets */}
                <Route
                  path="/assets"
                  element={
                    <ProtectedRoute requiredPermission={['can_view_assigned_assets', 'can_add_assets', 'can_edit_assets']}>
                      <AssetsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/assets/new"
                  element={
                    <ProtectedRoute requiredPermission="can_add_assets">
                      <AssetFormPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/assets/:id"
                  element={
                    <ProtectedRoute>
                      <AssetDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/assets/:id/edit"
                  element={
                    <ProtectedRoute requiredPermission="can_edit_assets">
                      <AssetFormPage />
                    </ProtectedRoute>
                  }
                />

                {/* Preventative Maintenance */}
                <Route
                  path="/preventative-maintenance"
                  element={
                    <ProtectedRoute requiredPermission={['can_track_asset_maintenance']}>
                      <MaintenancePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/preventative-maintenance/new"
                  element={
                    <ProtectedRoute requiredPermission="can_create_work_orders">
                      <MaintenanceFormPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/preventative-maintenance/:id"
                  element={
                    <ProtectedRoute>
                      <MaintenanceFormPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/preventative-maintenance/:id/edit"
                  element={
                    <ProtectedRoute requiredPermission="can_create_work_orders">
                      <MaintenanceFormPage />
                    </ProtectedRoute>
                  }
                />

                {/* Compliance & Safety */}
                <Route
                  path="/compliance"
                  element={
                    <ProtectedRoute requiredPermission={['can_manage_security_policies', 'can_escalate_safety_concerns']}>
                      <CompliancePage />
                    </ProtectedRoute>
                  }
                />

                {/* Cost Tracking */}
                <Route
                  path="/cost-tracking"
                  element={
                    <ProtectedRoute requiredPermission={['can_view_organization_costs']}>
                      <CostTrackingPage />
                    </ProtectedRoute>
                  }
                />

                {/* Quotes */}
                <Route
                  path="/quotes"
                  element={
                    <ProtectedRoute requiredPermission={['can_create_invoices', 'can_view_own_invoices']}>
                      <QuotesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quotes/:id"
                  element={
                    <ProtectedRoute>
                      <QuoteDetailPage />
                    </ProtectedRoute>
                  }
                />

                {/* Variations */}
                <Route
                  path="/variations"
                  element={
                    <ProtectedRoute requiredPermission={['can_create_work_orders']}>
                      <VariationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Documents */}
                <Route
                  path="/documents"
                  element={
                    <ProtectedRoute requiredPermission={['can_upload_asset_documentation']}>
                      <DocumentsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Sites */}
                <Route
                  path="/sites"
                  element={
                    <ProtectedRoute requiredPermission={['can_view_all_sites', 'can_view_assigned_sites']}>
                      <SitesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sites/new"
                  element={
                    <ProtectedRoute requiredPermission="can_manage_organization">
                      <SiteFormPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sites/:id/edit"
                  element={
                    <ProtectedRoute requiredPermission="can_manage_organization">
                      <SiteFormPage />
                    </ProtectedRoute>
                  }
                />

                {/* Attendance */}
                <Route
                  path="/attendance"
                  element={
                    <ProtectedRoute requiredPermission={['can_view_all_attendance', 'can_view_own_attendance']}>
                      <AttendancePage />
                    </ProtectedRoute>
                  }
                />

                {/* Reports */}
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute requiredPermission={['can_generate_custom_reports', 'can_view_team_reports']}>
                      <ReportsPage />
                    </ProtectedRoute>
                  }
                />

                {/* User Management */}
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute requiredPermission={['can_manage_users']}>
                      <UserManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user-management"
                  element={
                    <ProtectedRoute requiredPermission={['can_manage_users']}>
                      <UserManagementPage />
                    </ProtectedRoute>
                  }
                />

                {/* Settings */}
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRouter;
