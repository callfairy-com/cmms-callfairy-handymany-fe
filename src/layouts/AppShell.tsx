import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { cn } from '@/lib/utils'

export function AppShell() {
    const [sidebarOpen, setSidebarOpen] = useState(true)

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

            {/* Main Content */}
            <div
                className={cn(
                    'transition-all duration-300',
                    sidebarOpen ? 'lg:pl-64' : 'lg:pl-16'
                )}
            >
                {/* Header */}
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                {/* Page Content */}
                <main className="p-4 md:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
