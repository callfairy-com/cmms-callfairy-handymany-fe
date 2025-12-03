import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import MaintenanceApp from './MaintenanceApp.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MaintenanceApp />
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
    </QueryClientProvider>
  </React.StrictMode>,
)
