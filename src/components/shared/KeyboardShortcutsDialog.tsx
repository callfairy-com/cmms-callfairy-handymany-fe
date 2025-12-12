import { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { DEFAULT_SHORTCUTS } from '@/config/navigation';

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Dialog showing available keyboard shortcuts
 */
export function KeyboardShortcutsDialog({ isOpen, onClose }: KeyboardShortcutsDialogProps) {
  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigationShortcuts = DEFAULT_SHORTCUTS.filter((s) => s.category === 'navigation');
  const globalShortcuts = DEFAULT_SHORTCUTS.filter((s) => s.category === 'global');

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Keyboard Shortcuts
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            {/* Navigation Shortcuts */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Navigation
              </h3>
              <div className="space-y-2">
                {navigationShortcuts.map((shortcut) => (
                  <ShortcutRow key={shortcut.keys} keys={shortcut.keys} label={shortcut.label} />
                ))}
              </div>
            </div>

            {/* Global Shortcuts */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Global
              </h3>
              <div className="space-y-2">
                {globalShortcuts.map((shortcut) => (
                  <ShortcutRow key={shortcut.keys} keys={shortcut.keys} label={shortcut.label} />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono">?</kbd> anytime to show this help
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function ShortcutRow({ keys, label }: { keys: string; label: string }) {
  const keyParts = keys.split(' ');

  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
      <div className="flex items-center gap-1">
        {keyParts.map((key, idx) => (
          <span key={idx}>
            <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs font-mono text-slate-700 dark:text-slate-300 shadow-sm">
              {key === '/' ? '/' : key === '?' ? '?' : key.toUpperCase()}
            </kbd>
            {idx < keyParts.length - 1 && (
              <span className="mx-1 text-slate-400 text-xs">then</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export default KeyboardShortcutsDialog;
