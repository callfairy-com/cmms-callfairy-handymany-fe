import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Save, Eye, EyeOff, Type, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings, FONT_FAMILIES, FONT_SIZES, CURRENCIES, FontFamily, FontSize, Currency } from '../../contexts/SettingsContext';
import ThemeSwitcher from '../../components/shared/ThemeSwitcher';
import { SettingsDemo } from '../../components/shared/SettingsDemo';

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    workOrderUpdates: boolean;
    maintenanceReminders: boolean;
    systemAlerts: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showEmail: boolean;
    showPhone: boolean;
  };
  preferences: {
    timezone: string;
    dateFormat: string;
  };
}

export default function Settings() {
  const { user } = useAuth();
  const { settings: globalSettings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      push: true,
      workOrderUpdates: true,
      maintenanceReminders: true,
      systemAlerts: false,
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: true,
      showPhone: false,
    },
    preferences: {
      timezone: 'Europe/London',
      dateFormat: 'DD/MM/YYYY',
    },
  });

  const [profileData, setProfileData] = useState({
    fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    email: user?.email || '',
    phone: '',
    department: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    // Show success message
    alert('Settings saved successfully!');
  };

  const handleSaveProfile = () => {
    // Validate password fields if changing password
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    // Save profile data
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    alert('Profile updated successfully!');
  };

  const { hasPermission } = useAuth();

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    ...(hasPermission('can_configure_system_settings') ? [
      { id: 'typography', name: 'Typography', icon: Type },
      { id: 'currency', name: 'Currency', icon: Globe },
    ] : []),
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield },
    { id: 'preferences', name: 'Preferences', icon: SettingsIcon },
    { id: 'appearance', name: 'Appearance', icon: Palette },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-slate-900">Profile Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                  <input
                    type="text"
                    value={profileData.department}
                    onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h4 className="text-md font-medium text-slate-900 mb-4">Change Password</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={profileData.currentPassword}
                        onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                        className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={profileData.newPassword}
                      onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={profileData.confirmPassword}
                      onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'typography' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-slate-900">Typography Settings</h3>

              <div className="space-y-6">
                {/* Font Family */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Font Family</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(FONT_FAMILIES).map(([key, font]) => (
                      <button
                        key={key}
                        onClick={() => updateSettings({ fontFamily: key as FontFamily })}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${globalSettings.fontFamily === key
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-300 hover:border-slate-400 text-slate-700'
                          }`}
                      >
                        <div className={`${font.class} font-medium`}>{font.name}</div>
                        <div className={`${font.class} text-sm text-slate-500 mt-1`}>Sample text</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Font Size</label>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(FONT_SIZES).map(([key, size]) => (
                      <button
                        key={key}
                        onClick={() => updateSettings({ fontSize: key as FontSize })}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${globalSettings.fontSize === key
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-300 hover:border-slate-400 text-slate-700'
                          }`}
                      >
                        <span className={size.class}>{size.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-slate-50 rounded-lg p-4 border">
                  <div className="text-sm text-slate-600 mb-2">Preview:</div>
                  <div className={`${FONT_FAMILIES[globalSettings.fontFamily].class} space-y-2`}>
                    <div className={`${FONT_SIZES[globalSettings.fontSize].class} font-medium text-slate-900`}>
                      Sample Heading Text
                    </div>
                    <div className={`${FONT_SIZES[globalSettings.fontSize].class} text-slate-700`}>
                      This is how your text will appear with the current font settings.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'currency' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-slate-900">Currency Settings</h3>

              <div className="space-y-6">
                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Default Currency</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(CURRENCIES).map(([key, currency]) => (
                      <button
                        key={key}
                        onClick={() => updateSettings({ currency: key as Currency })}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${globalSettings.currency === key
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-300 hover:border-slate-400 text-slate-700'
                          }`}
                      >
                        <div className="font-medium text-lg">{currency.symbol}</div>
                        <div className="text-xs text-slate-500 mt-1">{key}</div>
                        <div className="text-xs text-slate-400">{currency.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Settings Display */}
                <div className="bg-slate-50 rounded-lg p-4 border">
                  <div className="text-sm text-slate-600 mb-2">Current Currency:</div>
                  <div className="text-slate-700">
                    {CURRENCIES[globalSettings.currency].symbol} ({CURRENCIES[globalSettings.currency].name})
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-slate-900">Notification Preferences</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Email Notifications</p>
                    <p className="text-sm text-slate-600">Receive notifications via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.email}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, email: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Push Notifications</p>
                    <p className="text-sm text-slate-600">Receive push notifications in browser</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.push}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, push: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Work Order Updates</p>
                    <p className="text-sm text-slate-600">Get notified when work orders are updated</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.workOrderUpdates}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, workOrderUpdates: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Maintenance Reminders</p>
                    <p className="text-sm text-slate-600">Receive reminders for scheduled maintenance</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.maintenanceReminders}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, maintenanceReminders: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">System Alerts</p>
                    <p className="text-sm text-slate-600">Get notified about system maintenance and updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.systemAlerts}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, systemAlerts: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-slate-900">Privacy & Security</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Profile Visibility</label>
                  <select
                    value={settings.privacy.profileVisibility}
                    onChange={(e) => setSettings({
                      ...settings,
                      privacy: { ...settings.privacy, profileVisibility: e.target.value as 'public' | 'private' }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Show Email Address</p>
                    <p className="text-sm text-slate-600">Allow others to see your email address</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.privacy.showEmail}
                      onChange={(e) => setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, showEmail: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Show Phone Number</p>
                    <p className="text-sm text-slate-600">Allow others to see your phone number</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.privacy.showPhone}
                      onChange={(e) => setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, showPhone: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-slate-900">Preferences</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
                  <select
                    value={settings.preferences.timezone}
                    onChange={(e) => setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, timezone: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Europe/London">London (GMT)</option>
                    <option value="America/New_York">New York (EST)</option>
                    <option value="America/Los_Angeles">Los Angeles (PST)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date Format</label>
                  <select
                    value={settings.preferences.dateFormat}
                    onChange={(e) => setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, dateFormat: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-slate-900">Appearance</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Theme</p>
                    <p className="text-sm text-slate-600">Choose between light and dark mode</p>
                  </div>
                  <ThemeSwitcher />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Demo Component */}
      <div className="mt-6">
        <SettingsDemo />
      </div>
    </div>
  );
}
