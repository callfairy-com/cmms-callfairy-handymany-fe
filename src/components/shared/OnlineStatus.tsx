import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface OnlineStatusProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function OnlineStatus({ className = '', showText = true, size = 'md' }: OnlineStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg ${
      isOnline 
        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    } ${className}`}>
      {isOnline ? (
        <Wifi className={sizeClasses[size]} />
      ) : (
        <WifiOff className={sizeClasses[size]} />
      )}
      {showText && (
        <span className={`font-medium ${textSizeClasses[size]}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  );
}
