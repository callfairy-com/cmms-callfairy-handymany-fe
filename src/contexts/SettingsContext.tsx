import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Font families available in the application
export type FontFamily = 'inter' | 'roboto' | 'open-sans' | 'lato' | 'poppins' | 'montserrat';

// Font sizes
export type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';

// Supported languages (kept for backward compatibility)
export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja' | 'ko' | 'ar';

// Supported currencies
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'INR' | 'BRL';

export interface UserSettings {
  fontFamily: FontFamily;
  fontSize: FontSize;
  currency: Currency;
  language: Language;
  theme: 'light' | 'dark' | 'auto';
}

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetSettings: () => void;
  getFontSizeClass: () => string;
  getFontFamilyClass: () => string;
  getLanguageLabel: (lang: Language) => string;
  getCurrencySymbol: (curr: Currency) => string;
}

const defaultSettings: UserSettings = {
  fontFamily: 'inter',
  fontSize: 'base',
  currency: 'USD',
  language: 'en',
  theme: 'light',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Font family mappings
const FONT_FAMILIES: Record<FontFamily, { name: string; class: string }> = {
  inter: { name: 'Inter', class: 'font-inter' },
  roboto: { name: 'Roboto', class: 'font-roboto' },
  'open-sans': { name: 'Open Sans', class: 'font-open-sans' },
  lato: { name: 'Lato', class: 'font-lato' },
  poppins: { name: 'Poppins', class: 'font-poppins' },
  montserrat: { name: 'Montserrat', class: 'font-montserrat' },
};

// Font size mappings
const FONT_SIZES: Record<FontSize, { name: string; class: string }> = {
  xs: { name: 'Extra Small', class: 'text-xs' },
  sm: { name: 'Small', class: 'text-sm' },
  base: { name: 'Normal', class: 'text-base' },
  lg: { name: 'Large', class: 'text-lg' },
  xl: { name: 'Extra Large', class: 'text-xl' },
};

// Language mappings
const LANGUAGES: Record<Language, string> = {
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
const CURRENCIES: Record<Currency, { name: string; symbol: string }> = {
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
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const storedSettings = localStorage.getItem('user_settings');
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      } catch (error) {
        console.error('Failed to parse stored settings:', error);
      }
    }
  }, []);

  // Apply settings to document root for CSS variables
  useEffect(() => {
    const root = document.documentElement;

    // Apply font family - use the actual font name, not the class
    const fontName = FONT_FAMILIES[settings.fontFamily].name;
    root.style.setProperty('--font-family', `'${fontName}'`);

    // Apply font size scale
    const sizeMultiplier = {
      xs: '0.875',
      sm: '0.9375',
      base: '1',
      lg: '1.125',
      xl: '1.25',
    }[settings.fontSize];

    root.style.setProperty('--font-size-multiplier', sizeMultiplier);

    // Apply theme
    root.setAttribute('data-theme', settings.theme);

    // Set default language attributes
    const htmlElement = document.documentElement;
    const bodyElement = document.body;

    htmlElement.setAttribute('lang', 'en');
    htmlElement.setAttribute('dir', 'ltr');

    if (bodyElement) {
      bodyElement.setAttribute('lang', 'en');
      bodyElement.setAttribute('dir', 'ltr');
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('user_settings', JSON.stringify(updatedSettings));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem('user_settings', JSON.stringify(defaultSettings));
  };

  const getFontSizeClass = () => FONT_SIZES[settings.fontSize].class;
  const getFontFamilyClass = () => FONT_FAMILIES[settings.fontFamily].class;
  const getLanguageLabel = (lang: Language) => LANGUAGES[lang];
  const getCurrencySymbol = (curr: Currency) => CURRENCIES[curr].symbol;

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
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

// Export constants for use in components
export { FONT_FAMILIES, FONT_SIZES, LANGUAGES, CURRENCIES };
