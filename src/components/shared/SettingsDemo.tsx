
import { useSettings } from '../../contexts/SettingsContext';

export const SettingsDemo: React.FC = () => {
  const { settings, getFontSizeClass, getFontFamilyClass, getCurrencySymbol } = useSettings();

  return (
    <div className={`${getFontFamilyClass()} p-6 bg-white rounded-lg border shadow-sm`}>
      <h2 className={`${getFontSizeClass()} font-bold text-gray-900 mb-4`}>
        Settings Demo Component
      </h2>

      <div className="space-y-3">
        <div className={`${getFontSizeClass()} text-gray-700`}>
          <strong>Current Font:</strong> {settings.fontFamily}
        </div>

        <div className={`${getFontSizeClass()} text-gray-700`}>
          <strong>Font Size:</strong> {settings.fontSize}
        </div>

        <div className={`${getFontSizeClass()} text-gray-700`}>
          <strong>Currency:</strong> {getCurrencySymbol(settings.currency)} ({settings.currency})
        </div>

        <div className={`${getFontSizeClass()} text-gray-700`}>
          <strong>Theme:</strong> {settings.theme}
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded border">
        <h3 className={`${getFontSizeClass()} font-semibold text-gray-800 mb-2`}>
          Sample Content
        </h3>
        <p className={`${getFontSizeClass()} text-gray-600 leading-relaxed`}>
          This text demonstrates how the font family and size settings affect the appearance
          of content throughout the application. The settings are applied globally using CSS
          variables and React context.
        </p>

        <div className={`${getFontSizeClass()} mt-3 text-gray-700`}>
          Price example: {getCurrencySymbol(settings.currency)}99.99
        </div>
      </div>
    </div>
  );
};
