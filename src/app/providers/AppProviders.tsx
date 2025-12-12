import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './AuthProvider';
import { NotificationProvider } from './NotificationProvider';
import { SettingsProvider } from './SettingsProvider';
import { OrganizationProvider } from './OrganizationProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * AppProviders Component
 * 
 * Wraps the entire application with all necessary providers:
 * - QueryClientProvider: React Query for data fetching
 * - BrowserRouter: React Router for navigation
 * - AuthProvider: Authentication and authorization
 * - NotificationProvider: Notification system
 * - SettingsProvider: User settings
 * - OrganizationProvider: Organization context
 * - Toaster: Toast notifications
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <SettingsProvider>
              <OrganizationProvider>
                {children}
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#f1f5f9',
                      color: '#1e293b',
                      border: '2px solid #000',
                      boxShadow: '4px 4px 0px #000',
                      borderRadius: '8px',
                      fontWeight: '500',
                    },
                  }}
                />
              </OrganizationProvider>
            </SettingsProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default AppProviders;
