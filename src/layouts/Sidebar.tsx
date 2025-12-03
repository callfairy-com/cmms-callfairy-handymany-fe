import { Link, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    Users,
    Package,
    Settings,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { config } from '@/config'

interface SidebarProps {
    isOpen: boolean
    onToggle: () => void
}

const navigation = [
    { name: 'Dashboard', href: config.routes.DASHBOARD, icon: LayoutDashboard },
    { name: 'Users', href: config.routes.USERS.LIST, icon: Users },
    { name: 'Products', href: config.routes.PRODUCTS, icon: Package },
    { name: 'Settings', href: config.routes.SETTINGS, icon: Settings },
]

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
    const location = useLocation()

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300',
                    isOpen ? 'w-64' : 'w-16'
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between border-b px-4">
                    {isOpen && (
                        <Link to={config.routes.DASHBOARD} className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                                <span className="text-primary-foreground font-bold text-lg">E</span>
                            </div>
                            <span className="font-bold text-lg">Enterprise</span>
                        </Link>
                    )}
                    {!isOpen && (
                        <Link
                            to={config.routes.DASHBOARD}
                            className="flex items-center justify-center w-full"
                        >
                            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                                <span className="text-primary-foreground font-bold text-lg">E</span>
                            </div>
                        </Link>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                                    !isOpen && 'justify-center'
                                )}
                                title={!isOpen ? item.name : undefined}
                            >
                                <Icon className={cn('h-5 w-5 shrink-0', isOpen && 'mr-3')} />
                                {isOpen && <span>{item.name}</span>}
                            </Link>
                        )
                    })}
                </nav>

                {/* Toggle Button */}
                <div className="border-t p-2">
                    <Button

                        size="icon"
                        onClick={onToggle}
                        className="w-full"
                    >
                        {isOpen ? (
                            <ChevronLeft className="h-5 w-5" />
                        ) : (
                            <ChevronRight className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </aside>
        </>
    )
}
