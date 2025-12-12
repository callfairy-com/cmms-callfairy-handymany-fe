import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings as SettingsIcon, Globe, Bell, Lock, Palette, DollarSign, Check, Loader2, Building2, Upload, Link as LinkIcon, Image } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useSettings } from '@/app/providers/SettingsProvider'
import { useAuth } from '@/app/providers/AuthProvider'
import { useOrganization } from '@/app/providers/OrganizationProvider'
import { authApi } from '@/features/auth/api'
import { organizationApi } from '@/features/organization/api/organizationApi'
import { toast } from 'react-hot-toast'

export const SettingsPage: React.FC = () => {
    const { user, hasPermission } = useAuth()
    const { settings, isLoading, updateCurrency, updateAppearance, updateLocalization, updateNotifications, updatePrivacy } = useSettings()
    const { organization, refetch: refetchOrganization } = useOrganization()
    const [activeTab, setActiveTab] = useState<'appearance' | 'branding' | 'currency' | 'localization' | 'notifications' | 'privacy'>('appearance')
    const [themes, setThemes] = useState<any[]>([])
    const [currencies, setCurrencies] = useState<any[]>([])
    const [isLoadingThemes, setIsLoadingThemes] = useState(false)
    const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(false)
    
    // Branding state
    const [logoUrl, setLogoUrl] = useState('')
    const [logoType, setLogoType] = useState<'main' | 'billing' | 'favicon'>('main')
    const [isSavingBranding, setIsSavingBranding] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    // Check if user can manage organization branding
    const canManageBranding = hasPermission('can_manage_organization')

    const tabs = [
        { id: 'appearance' as const, label: 'Appearance', icon: Palette, description: 'Theme and display settings' },
        ...(canManageBranding ? [{ id: 'branding' as const, label: 'Branding', icon: Building2, description: 'Organization logo & colors' }] : []),
        { id: 'currency' as const, label: 'Currency', icon: DollarSign, description: 'Preferred currency' },
        { id: 'localization' as const, label: 'Localization', icon: Globe, description: 'Language and timezone' },
        { id: 'notifications' as const, label: 'Notifications', icon: Bell, description: 'Alert preferences' },
        { id: 'privacy' as const, label: 'Privacy', icon: Lock, description: 'Profile visibility' },
    ]


    // Load available themes and currencies once
    useEffect(() => {
        const loadThemes = async () => {
            try {
                setIsLoadingThemes(true)
                const data = await authApi.getThemes()
                setThemes(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error('Failed to load themes', error)
            } finally {
                setIsLoadingThemes(false)
            }
        }

        const loadCurrencies = async () => {
            try {
                setIsLoadingCurrencies(true)
                const data = await authApi.getCurrencies()
                setCurrencies(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error('Failed to load currencies', error)
            } finally {
                setIsLoadingCurrencies(false)
            }
        }

        loadThemes()
        loadCurrencies()
    }, [])

    // Handle logo URL update
    const handleLogoUrlUpdate = async () => {
        if (!organization?.id || !logoUrl.trim()) {
            toast.error('Please enter a valid logo URL')
            return
        }

        setIsSavingBranding(true)
        try {
            await organizationApi.updateBranding(organization.id, { logo: logoUrl.trim() })
            toast.success('Logo URL updated successfully')
            setLogoUrl('')
            await refetchOrganization()
        } catch (error: any) {
            console.error('Failed to update logo URL:', error)
            toast.error(error?.response?.data?.detail || 'Failed to update logo URL')
        } finally {
            setIsSavingBranding(false)
        }
    }

    // Handle logo file upload
    const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !organization?.id) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file')
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB')
            return
        }

        setIsSavingBranding(true)
        try {
            await organizationApi.uploadLogo(organization.id, file, logoType)
            toast.success(`${logoType.charAt(0).toUpperCase() + logoType.slice(1)} logo uploaded successfully`)
            await refetchOrganization()
        } catch (error: any) {
            console.error('Failed to upload logo:', error)
            toast.error(error?.response?.data?.detail || 'Failed to upload logo')
        } finally {
            setIsSavingBranding(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    // Derive current theme from loaded list
    const currentTheme = themes.find((t: any) => t.id === settings.theme)
    const isDarkTheme = currentTheme?.mode === 'dark' || currentTheme?.colors?.colorScheme === 'dark'

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-5xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-xl">
                            <SettingsIcon className="h-8 w-8 text-primary-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-brutal font-bold text-foreground">Settings</h1>
                            <p className="text-muted-foreground mt-1">Manage your preferences, {user?.firstName || 'User'}</p>
                        </div>
                    </div>
                    {isLoading && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Saving...</span>
                        </div>
                    )}
                </div>

                {/* Tabs - Grid Layout for Better Mobile Experience */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative p-4 rounded-xl border-2 transition-all text-left ${isActive
                                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-border hover:border-primary-300 hover:bg-muted/50'
                                    }`}
                            >
                                <div className="flex items-center space-x-2 mb-1">
                                    <Icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : 'text-muted-foreground'}`} />
                                    <span className={`font-semibold text-sm ${isActive ? 'text-primary-600' : 'text-foreground'}`}>
                                        {tab.label}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground hidden md:block">{tab.description}</p>
                            </button>
                        )
                    })}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'appearance' && (
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-brutal font-bold text-foreground">Appearance</h2>
                                        <p className="text-sm text-muted-foreground mt-1">Customize how the app looks</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Theme Selection - Card Grid */}
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-3">Theme</h3>
                                        <p className="text-sm text-muted-foreground mb-4">Choose a visual theme for the application</p>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                            {themes.map((theme: any) => {
                                                const isSelected = settings.theme === theme.id
                                                return (
                                                    <button
                                                        key={theme.id}
                                                        onClick={() => {
                                                            updateAppearance({
                                                                theme_id: theme.id,
                                                                dark_mode: isDarkTheme,
                                                                compact_mode: settings.layout_density === 'compact',
                                                            })
                                                        }}
                                                        disabled={isLoading || isLoadingThemes}
                                                        className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                                                            isSelected
                                                                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                                                                : 'border-border hover:border-primary-300'
                                                        }`}
                                                    >
                                                        <div className="text-center">
                                                            <div className="text-xl font-bold text-foreground mb-1">
                                                                {theme.mode === 'dark' ? '🌙' : '☀️'}
                                                            </div>
                                                            <div className="text-sm font-semibold text-foreground">{theme.name}</div>
                                                            <div className="text-xs text-muted-foreground mt-1">{theme.description}</div>
                                                        </div>
                                                        {isSelected && (
                                                            <div className="absolute top-1 right-1">
                                                                <Check className="h-4 w-4 text-primary-600" />
                                                            </div>
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Compact Mode */}
                                    <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-foreground">Compact Mode</h3>
                                            <p className="text-sm text-muted-foreground">Reduce spacing for a denser layout</p>
                                        </div>
                                        <button
                                            onClick={() => updateAppearance({ theme_id: currentTheme?.id, dark_mode: isDarkTheme, compact_mode: settings.layout_density !== 'compact' })}
                                            disabled={isLoading}
                                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${settings.layout_density === 'compact' ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${settings.layout_density === 'compact' ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {activeTab === 'branding' && canManageBranding && (
                            <Card className="p-6">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-brutal font-bold text-foreground">Organization Branding</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Customize your organization's logo and branding</p>
                                </div>

                                {/* Current Logo Preview */}
                                <div className="mb-8">
                                    <h3 className="font-semibold text-foreground mb-3">Current Logo</h3>
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden">
                                            {organization?.logo_upload || organization?.logo ? (
                                                <img
                                                    src={organization.logo_upload || organization.logo}
                                                    alt="Organization logo"
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <Building2 className="w-10 h-10 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{organization?.name}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {organization?.logo_upload ? 'Uploaded logo' : organization?.logo ? 'URL logo' : 'No logo set'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {/* Upload Logo File */}
                                    <div className="p-4 rounded-lg border border-border">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Upload className="w-5 h-5 text-primary-600" />
                                            <h3 className="font-semibold text-foreground">Upload Logo File</h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Upload an image file from your computer. Supported formats: PNG, JPG, SVG. Max size: 5MB.
                                        </p>
                                        
                                        <div className="flex flex-wrap items-end gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-2">Logo Type</label>
                                                <select
                                                    value={logoType}
                                                    onChange={(e) => setLogoType(e.target.value as 'main' | 'billing' | 'favicon')}
                                                    className="px-4 py-2 border-2 border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                >
                                                    <option value="main">Main Logo</option>
                                                    <option value="billing">Billing Logo</option>
                                                    <option value="favicon">Favicon</option>
                                                </select>
                                            </div>
                                            <div>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleLogoFileUpload}
                                                    className="hidden"
                                                    id="logo-upload"
                                                />
                                                <label
                                                    htmlFor="logo-upload"
                                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                                                        isSavingBranding
                                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            : 'bg-primary-600 text-white hover:bg-primary-700'
                                                    }`}
                                                >
                                                    {isSavingBranding ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-4 h-4" />
                                                            Choose File
                                                        </>
                                                    )}
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Set Logo by URL */}
                                    <div className="p-4 rounded-lg border border-border">
                                        <div className="flex items-center gap-2 mb-3">
                                            <LinkIcon className="w-5 h-5 text-primary-600" />
                                            <h3 className="font-semibold text-foreground">Set Logo by URL</h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Enter a URL to an image hosted on a CDN or external server.
                                        </p>
                                        
                                        <div className="flex gap-3">
                                            <input
                                                type="url"
                                                value={logoUrl}
                                                onChange={(e) => setLogoUrl(e.target.value)}
                                                placeholder="https://cdn.example.com/logo.png"
                                                className="flex-1 px-4 py-2 border-2 border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                            <button
                                                onClick={handleLogoUrlUpdate}
                                                disabled={isSavingBranding || !logoUrl.trim()}
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                                    isSavingBranding || !logoUrl.trim()
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-primary-600 text-white hover:bg-primary-700'
                                                }`}
                                            >
                                                {isSavingBranding ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="w-4 h-4" />
                                                        Save URL
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Logo Type Info */}
                                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Image className="w-5 h-5 text-muted-foreground" />
                                            <h4 className="font-medium text-foreground">Logo Types</h4>
                                        </div>
                                        <ul className="text-sm text-muted-foreground space-y-1">
                                            <li><strong>Main Logo:</strong> Displayed in the header and navigation</li>
                                            <li><strong>Billing Logo:</strong> Used on invoices and billing documents</li>
                                            <li><strong>Favicon:</strong> Browser tab icon (recommended: 32x32 or 64x64 pixels)</li>
                                        </ul>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {activeTab === 'currency' && (
                            <Card className="p-6">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-brutal font-bold text-foreground">Currency</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Select your preferred currency for displaying prices</p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {currencies.map((curr: any) => {
                                        const code = curr.code
                                        const isSelected = settings.default_currency === code
                                        return (
                                            <button
                                                key={code}
                                                onClick={() => updateCurrency(code)}
                                                disabled={isLoading || isLoadingCurrencies}
                                                className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${isSelected
                                                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                                                        : 'border-border hover:border-primary-300'
                                                    }`}
                                            >
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-foreground mb-1">
                                                        {curr.symbol || code}
                                                    </div>
                                                    <div className="text-xs font-semibold text-muted-foreground">{code}</div>
                                                    <div className="text-xs text-muted-foreground mt-1">{curr.name}</div>
                                                </div>
                                                {isSelected && (
                                                    <div className="absolute top-1 right-1">
                                                        <Check className="h-4 w-4 text-primary-600" />
                                                    </div>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </Card>
                        )}

                        {activeTab === 'localization' && (
                            <Card className="p-6">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-brutal font-bold text-foreground">Localization</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Set your language and timezone preferences</p>
                                </div>
                                <div className="space-y-6">
                                    {/* Timezone */}
                                    <div>
                                        <label className="block text-sm font-semibold text-foreground mb-3">Timezone</label>
                                        <select
                                            value={settings.date_format}
                                            onChange={() => updateLocalization({ timezone: 'UTC', language: 'en' })}
                                            disabled={isLoading}
                                            className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                        >
                                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                        </select>
                                        <p className="text-xs text-muted-foreground mt-2">All dates and times will be displayed in this timezone</p>
                                    </div>

                                    {/* Time Format */}
                                    <div>
                                        <label className="block text-sm font-semibold text-foreground mb-3">Time Format</label>
                                        <select
                                            value={settings.time_format}
                                            onChange={() => updateLocalization({ timezone: 'UTC', language: 'en' })}
                                            disabled={isLoading}
                                            className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                        >
                                            <option value="12">12-hour (AM/PM)</option>
                                            <option value="24">24-hour</option>
                                        </select>
                                        <p className="text-xs text-muted-foreground mt-2">Choose between 12-hour and 24-hour time format</p>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {activeTab === 'notifications' && (
                            <Card className="p-6">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-brutal font-bold text-foreground">Notifications</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Manage how you receive notifications</p>
                                </div>
                                <div className="space-y-4">
                                    {/* Email Notifications */}
                                    <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-foreground">Email Notifications</h3>
                                            <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                                        </div>
                                        <button
                                            onClick={() => updateNotifications({
                                                email_notifications_enabled: !settings.email_notifications,
                                                push_notifications_enabled: settings.push_notifications,
                                                sms_notifications_enabled: settings.sms_notifications,
                                            })}
                                            disabled={isLoading}
                                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${settings.email_notifications ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${settings.email_notifications ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Push Notifications */}
                                    <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-foreground">Push Notifications</h3>
                                            <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                                        </div>
                                        <button
                                            onClick={() => updateNotifications({
                                                email_notifications_enabled: settings.email_notifications,
                                                push_notifications_enabled: !settings.push_notifications,
                                                sms_notifications_enabled: settings.sms_notifications,
                                            })}
                                            disabled={isLoading}
                                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${settings.push_notifications ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${settings.push_notifications ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    {/* SMS Notifications */}
                                    <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-foreground">SMS Notifications</h3>
                                            <p className="text-sm text-muted-foreground">Receive notifications via text message</p>
                                        </div>
                                        <button
                                            onClick={() => updateNotifications({
                                                email_notifications_enabled: settings.email_notifications,
                                                push_notifications_enabled: settings.push_notifications,
                                                sms_notifications_enabled: !settings.sms_notifications,
                                            })}
                                            disabled={isLoading}
                                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${settings.sms_notifications ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${settings.sms_notifications ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {activeTab === 'privacy' && (
                            <Card className="p-6">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-brutal font-bold text-foreground">Privacy & Security</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Control your profile visibility and data sharing</p>
                                </div>
                                <div className="space-y-6">
                                    {/* Profile Visibility */}
                                    <div>
                                        <label className="block text-sm font-semibold text-foreground mb-3">Profile Visibility</label>
                                        <select
                                            value={settings.profile_visibility}
                                            onChange={(e) => updatePrivacy({
                                                profile_visibility: e.target.value as 'public' | 'organization' | 'private',
                                                show_email_to_team: settings.show_email,
                                            })}
                                            disabled={isLoading}
                                            className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                        >
                                            <option value="public">Public - Visible to everyone</option>
                                            <option value="organization">Organization Only - Visible to your organization</option>
                                            <option value="private">Private - Only visible to you</option>
                                        </select>
                                        <p className="text-xs text-muted-foreground mt-2">Control who can see your profile information</p>
                                    </div>

                                    {/* Show Email to Team */}
                                    <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-foreground">Show Email to Team</h3>
                                            <p className="text-sm text-muted-foreground">Allow team members to see your email address</p>
                                        </div>
                                        <button
                                            onClick={() => updatePrivacy({
                                                profile_visibility: settings.profile_visibility,
                                                show_email_to_team: !settings.show_email,
                                            })}
                                            disabled={isLoading}
                                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${settings.show_email ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${settings.show_email ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
