import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/layouts/AppShell'
import ProtectedRoute from '@/components/ProtectedRoute'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { RoleDashboard } from '@/pages/dashboard/RoleDashboard'
import UserManagement from '@/pages/users/UserManagement'
import { ROUTES } from '@/config'

export const router = createBrowserRouter([
    // Public routes
    {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
    },
    {
        path: ROUTES.REGISTER,
        element: <RegisterPage />,
    },
    {
        path: ROUTES.FORGOT_PASSWORD,
        element: <ForgotPasswordPage />,
    },

    // Protected routes
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <AppShell />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <Navigate to={ROUTES.DASHBOARD} replace />,
            },
            {
                path: ROUTES.DASHBOARD,
                element: <RoleDashboard />,
                children: [
                    {
                        path: ROUTES.USERS.LIST,
                        element: <ProtectedRoute><UserManagement /></ProtectedRoute>,
                    },
                    {
                        path: ROUTES.PRODUCTS,
                        element: <ProtectedRoute><div>Products Page</div></ProtectedRoute>,
                    },
                ],
            },
            {
                path: ROUTES.SETTINGS,
                element: <div>Settings Page (Coming Soon)</div>,
            },
            {
                path: ROUTES.PROFILE,
                element: <div>Profile Page (Coming Soon)</div>,
            },
        ],
    },

    // Catch all
    {
        path: '*',
        element: <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-2">404</h1>
                <p className="text-muted-foreground">Page not found</p>
            </div>
        </div>,
    },
])
