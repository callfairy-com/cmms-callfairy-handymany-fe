import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { authApi } from '@/features/auth/api';
import { UserSettings } from '@/features/auth/types';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

// Font families available in the application
export type FontFamily = 'inter' | 'roboto' | 'open-sans' | 'lato' | 'poppins' | 'montserrat';

// Font sizes
export type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';

// Supported languages
export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja' | 'ko' | 'ar';

// Supported currencies
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'INR' | 'BRL';

interface SettingsContextType {
  settings: UserSettings;
  isLoading: boolean;
  updateCurrency: (currency: string) => Promise<void>;
  updateAppearance: (data: { theme_id?: string; dark_mode: boolean; compact_mode: boolean }) => Promise<void>;
  updateLocalization: (data: { timezone: string; language: string }) => Promise<void>;
  updateNotifications: (data: { email_notifications_enabled: boolean; push_notifications_enabled: boolean; sms_notifications_enabled: boolean }) => Promise<void>;
  updatePrivacy: (data: { profile_visibility: 'public' | 'organization' | 'private'; show_email_to_team: boolean }) => Promise<void>;
  getFontSizeClass: () => string;
  getFontFamilyClass: () => string;
  getLanguageLabel: (lang: string) => string;
  getCurrencySymbol: (curr: string) => string;
}

const defaultSettings: UserSettings = {
  id: '',
  user: '',
  default_currency: 'USD',
  currency_details: null,
  theme: null,
  theme_details: null,
  layout_density: 'comfortable',
  sidebar_collapsed: false,
  dashboard_widgets: [],
  date_format: 'MM/DD/YYYY',
  time_format: '12',
  first_day_of_week: 0,
  email_notifications: true,
  push_notifications: true,
  sms_notifications: false,
  notification_sound: true,
  profile_visibility: 'organization',
  show_email: false,
  show_phone: false,
  allow_marketing_emails: false,
  allow_analytics: true,
  session_timeout_minutes: 60,
  require_password_change_days: 90,
  items_per_page: 25,
  auto_save: true,
  show_tutorials: true,
  custom_preferences: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Font family mappings (kept for UI compatibility, though API doesn't persist font yet)
const FONT_FAMILIES: Record<FontFamily, { name: string; class: string }> = {
  inter: { name: 'Inter', class: 'font-inter' },
  roboto: { name: 'Roboto', class: 'font-roboto' },
  'open-sans': { name: 'Open Sans', class: 'font-open-sans' },
  lato: { name: 'Lato', class: 'font-lato' },
  poppins: { name: 'Poppins', class: 'font-poppins' },
  montserrat: { name: 'Montserrat', class: 'font-montserrat' },
};

// Font size mappings (kept for UI compatibility)
const FONT_SIZES: Record<FontSize, { name: string; class: string }> = {
  xs: { name: 'Extra Small', class: 'text-xs' },
  sm: { name: 'Small', class: 'text-sm' },
  base: { name: 'Normal', class: 'text-base' },
  lg: { name: 'Large', class: 'text-lg' },
  xl: { name: 'Extra Large', class: 'text-xl' },
};

// Language mappings
const LANGUAGES: Record<string, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية',
};

// Currency mappings
const CURRENCIES: Record<string, { name: string; symbol: string }> = {
  USD: { name: 'US Dollar', symbol: '$' },
  EUR: { name: 'Euro', symbol: '€' },
  GBP: { name: 'British Pound', symbol: '£' },
  JPY: { name: 'Japanese Yen', symbol: '¥' },
  CAD: { name: 'Canadian Dollar', symbol: 'C$' },
  AUD: { name: 'Australian Dollar', symbol: 'A$' },
  CHF: { name: 'Swiss Franc', symbol: 'CHF' },
  CNY: { name: 'Chinese Yuan', symbol: '¥' },
  INR: { name: 'Indian Rupee', symbol: '₹' },
  BRL: { name: 'Brazilian Real', symbol: 'R$' },
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const hasFetchedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  // Fetch settings only once per user session
  useEffect(() => {
    // CRITICAL: Early exit if not authenticated - prevents login page loop
    if (!isAuthenticated || !user?.id) {
      // Reset fetch tracking when user logs out
      hasFetchedRef.current = false;
      lastUserIdRef.current = null;
      return;
    }

    const userId = String(user.id);

    // Skip if already fetched for this user
    if (hasFetchedRef.current && lastUserIdRef.current === userId) {
      return;
    }

    // Skip if already loading (prevent concurrent fetches)
    if (isLoading) {
      return;
    }

    let isMounted = true;

    const fetchSettings = async () => {
      setIsLoading(true);

      try {
        let data = await authApi.getSettings();

        // If no theme is set yet, try to apply the default theme from /auth/themes/
        if (!data.theme) {
          try {
            const themes: any = await authApi.getThemes();
            const list = Array.isArray(themes) ? themes : [];
            const defaultTheme = list.find((t: any) => t.is_default) || list[0];

            if (defaultTheme) {
              const updated = await authApi.updateAppearance({
                theme_id: defaultTheme.id,
                layout_density: data.layout_density,
                sidebar_collapsed: data.sidebar_collapsed,
              } as any);
              data = updated;
            }
          } catch (themeError) {
            console.error('[SettingsContext] Failed to apply default theme:', themeError);
          }
        }

        if (isMounted) {
          setSettings(data);
          hasFetchedRef.current = true;
          lastUserIdRef.current = userId;
        }
      } catch (error: any) {
        // Silently fail for 401 errors (not properly authenticated)
        if (error?.response?.status !== 401) {
          console.error('[SettingsContext] Failed to fetch settings:', error);

          // Fallback to localStorage if available
          if (isMounted) {
            const storedSettings = localStorage.getItem('user_settings');
            if (storedSettings) {
              try {
                setSettings(JSON.parse(storedSettings));
              } catch (e) {
                // Invalid JSON, ignore
              }
            }
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.id]); // Only minimal dependencies

  // Apply settings to document root
  useEffect(() => {
    const root = document.documentElement;

    // Decide dark vs light from theme details
    const mode = (settings as any).theme_details?.mode
      || (settings as any).theme_details?.colors?.colorScheme;
    const isDark = mode === 'dark';

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply layout density
    root.setAttribute('data-density', settings.layout_density);

    // Persist to local storage as backup
    localStorage.setItem('user_settings', JSON.stringify(settings));
  }, [settings]);

  const updateCurrency = async (currencyCode: string) => {
    try {
      const updated = await authApi.updateCurrency({ currency_code: currencyCode });
      setSettings(prev => ({ ...prev, ...updated }));
      toast.success('Currency updated');
    } catch (error) {
      console.error('Failed to update currency:', error);
      toast.error('Failed to update currency');
      throw error;
    }
  };

  const updateAppearance = async (data: { theme_id?: string; dark_mode: boolean; compact_mode: boolean }) => {
    try {
      // Map frontend params to backend params - use theme_id for the backend
      const payload: any = {
        layout_density: data.compact_mode ? 'compact' as const : 'comfortable' as const,
        sidebar_collapsed: false,
      };
      
      // Include theme_id if provided
      if (data.theme_id) {
        payload.theme_id = data.theme_id;
      }
      
      const updated = await authApi.updateAppearance(payload);
      setSettings(prev => ({ ...prev, ...updated }));
      toast.success('Appearance updated');
    } catch (error) {
      console.error('Failed to update appearance:', error);
      toast.error('Failed to update appearance');
      throw error;
    }
  };

  const updateLocalization = async (_data: { timezone: string; language: string }) => {
    try {
      // Map frontend params to backend params
      const payload = {
        date_format: 'MM/DD/YYYY',
        time_format: '12' as const,
        first_day_of_week: 0,
      };
      const updated = await authApi.updateLocalization(payload);
      setSettings(prev => ({ ...prev, ...updated }));
      toast.success('Localization updated');
    } catch (error) {
      console.error('Failed to update localization:', error);
      toast.error('Failed to update localization');
      throw error;
    }
  };

  const updateNotifications = async (data: { email_notifications_enabled: boolean; push_notifications_enabled: boolean; sms_notifications_enabled: boolean }) => {
    try {
      // Map frontend params to backend params
      const payload = {
        email_notifications: data.email_notifications_enabled,
        push_notifications: data.push_notifications_enabled,
        sms_notifications: data.sms_notifications_enabled,
        notification_sound: true,
      };
      const updated = await authApi.updateNotifications(payload);
      setSettings(prev => ({ ...prev, ...updated }));
      toast.success('Notifications updated');
    } catch (error) {
      console.error('Failed to update notifications:', error);
      toast.error('Failed to update notifications');
      throw error;
    }
  };

  const updatePrivacy = async (data: { profile_visibility: 'public' | 'organization' | 'private'; show_email_to_team: boolean }) => {
    try {
      // Map frontend params to backend params
      const payload = {
        profile_visibility: data.profile_visibility,
        show_email: data.show_email_to_team,
        show_phone: data.show_email_to_team,
      };
      const updated = await authApi.updatePrivacy(payload);
      setSettings(prev => ({ ...prev, ...updated }));
      toast.success('Privacy updated');
    } catch (error) {
      console.error('Failed to update privacy:', error);
      toast.error('Failed to update privacy');
      throw error;
    }
  };

  // Helpers (using defaults for non-API fields like font for now)
  const getFontSizeClass = () => 'text-base'; // Placeholder as API doesn't support font size yet
  const getFontFamilyClass = () => 'font-inter'; // Placeholder
  const getLanguageLabel = (lang: string) => LANGUAGES[lang] || lang;
  const getCurrencySymbol = (curr: string) => CURRENCIES[curr]?.symbol || curr;

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        updateCurrency,
        updateAppearance,
        updateLocalization,
        updateNotifications,
        updatePrivacy,
        getFontSizeClass,
        getFontFamilyClass,
        getLanguageLabel,
        getCurrencySymbol,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

export { FONT_FAMILIES, FONT_SIZES, LANGUAGES, CURRENCIES };
