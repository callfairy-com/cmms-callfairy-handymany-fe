import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, Lock } from 'lucide-react';
import type { Role, Permission } from '@/types/rbac';
import { config } from '@/config';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: Permission | Permission[];
  requiredRole?: Role | Role[];
}

export default function ProtectedRoute({
  children,
  requiredPermission,
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, hasPermission, hasRole } = useAuth();

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to={config.routes.LOGIN} replace />;
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    const roleStr = Array.isArray(requiredRole) ? requiredRole.join(', ') : requiredRole;
    return <AccessDenied reason="role" requiredRole={roleStr} userRole={user?.role?.toString()} />;
  }

  // Check permission requirement
  if (requiredPermission) {
    const permissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
    const hasAccess = permissions.some(permission => hasPermission(permission));

    if (!hasAccess) {
      const permStr = permissions.join(' OR ');
      return <AccessDenied reason="permission" requiredPermission={permStr} />;
    }
  }

  // All checks passed - render the protected content
  return <>{children}</>;
}

// Access Denied Page
function AccessDenied({
  reason,
  requiredRole,
  requiredPermission,
  userRole,
}: {
  reason: 'role' | 'permission';
  requiredRole?: string;
  requiredPermission?: string;
  userRole?: string;
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {reason === 'role' ? (
              <Lock className="w-8 h-8 text-red-600" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-red-600" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>

          {reason === 'role' ? (
            <div className="space-y-3">
              <p className="text-slate-600">
                You don't have the required role to access this page.
              </p>
              <div className="bg-slate-50 rounded-lg p-4 text-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-600">Your Role:</span>
                  <span className="font-medium text-slate-900">{userRole}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Required Role:</span>
                  <span className="font-medium text-red-600">{requiredRole}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-slate-600">
                You don't have permission to access this feature.
              </p>
              <div className="bg-slate-50 rounded-lg p-4 text-sm">
                <div className="text-slate-600">Missing Permission:</div>
                <div className="font-medium text-red-600 mt-1">{requiredPermission}</div>
              </div>
            </div>
          )}

          <p className="text-sm text-slate-500 mt-6">
            Please contact your administrator if you believe this is an error.
          </p>

          <button
            onClick={() => window.history.back()}
            className="mt-6 px-6 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
