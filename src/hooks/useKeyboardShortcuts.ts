import { useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import {
  NAVIGATION_ITEMS,
  getNavigationShortcuts,
  DEFAULT_SHORTCUTS,
} from '@/config/navigation';
import type { Role } from '@/types/rbac';

interface KeyboardShortcutConfig {
  /** Whether shortcuts are enabled */
  enabled?: boolean;
  /** Callback when shortcuts dialog should open */
  onShowHelp?: () => void;
  /** Callback when search should be focused */
  onFocusSearch?: () => void;
}

/**
 * Hook for handling keyboard shortcuts across the application
 * 
 * Shortcuts use a "leader key" pattern:
 * - 'g' followed by another key for navigation (e.g., 'g d' = go to dashboard)
 * - '?' to show help
 * - '/' to focus search
 * - 'Escape' to close dialogs
 * 
 * @example
 * ```tsx
 * function App() {
 *   const { showHelp, setShowHelp } = useState(false);
 *   
 *   useKeyboardShortcuts({
 *     enabled: true,
 *     onShowHelp: () => setShowHelp(true),
 *     onFocusSearch: () => searchInputRef.current?.focus(),
 *   });
 *   
 *   return <div>...</div>;
 * }
 * ```
 */
export function useKeyboardShortcuts(config: KeyboardShortcutConfig = {}) {
  const { enabled = true, onShowHelp, onFocusSearch } = config;
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  
  // Track the leader key state ('g' key pressed)
  const leaderKeyPressed = useRef(false);
  const leaderKeyTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Get shortcuts for current user role
  const [shortcuts, setShortcuts] = useState<{ keys: string; label: string; href: string }[]>([]);
  
  useEffect(() => {
    if (user?.role) {
      const navShortcuts = getNavigationShortcuts(
        NAVIGATION_ITEMS,
        user.role as Role,
        hasPermission
      );
      setShortcuts(navShortcuts);
    }
  }, [user?.role, hasPermission]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Only allow Escape in inputs
        if (event.key !== 'Escape') {
          return;
        }
      }

      const key = event.key.toLowerCase();

      // Handle Escape - always works
      if (key === 'escape') {
        // Let the event bubble for dialogs to handle
        return;
      }

      // Handle '?' for help
      if (event.key === '?' || (event.shiftKey && key === '/')) {
        event.preventDefault();
        onShowHelp?.();
        return;
      }

      // Handle '/' for search focus
      if (key === '/' && !event.shiftKey) {
        event.preventDefault();
        onFocusSearch?.();
        return;
      }

      // Handle leader key 'g'
      if (key === 'g' && !leaderKeyPressed.current) {
        leaderKeyPressed.current = true;
        
        // Clear leader key after 1.5 seconds
        if (leaderKeyTimeout.current) {
          clearTimeout(leaderKeyTimeout.current);
        }
        leaderKeyTimeout.current = setTimeout(() => {
          leaderKeyPressed.current = false;
        }, 1500);
        
        return;
      }

      // Handle navigation shortcuts (g + key)
      if (leaderKeyPressed.current) {
        leaderKeyPressed.current = false;
        if (leaderKeyTimeout.current) {
          clearTimeout(leaderKeyTimeout.current);
        }

        const shortcutKey = `g ${key}`;
        const matchedShortcut = shortcuts.find((s) => s.keys === shortcutKey);
        
        if (matchedShortcut) {
          event.preventDefault();
          navigate(matchedShortcut.href);
        }
      }
    },
    [enabled, navigate, shortcuts, onShowHelp, onFocusSearch]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (leaderKeyTimeout.current) {
        clearTimeout(leaderKeyTimeout.current);
      }
    };
  }, [handleKeyDown]);

  return {
    shortcuts,
    defaultShortcuts: DEFAULT_SHORTCUTS,
  };
}

/**
 * Hook for showing keyboard shortcuts help dialog
 */
export function useShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);
  
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

export default useKeyboardShortcuts;
