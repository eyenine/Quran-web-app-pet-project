import React, { useState, useEffect } from 'react';
import { trackError } from '../../analytics/events';

interface OfflineIndicatorProps {
  className?: string;
  showWhenOnline?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className = '',
  showWhenOnline = false,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      
      // Hide indicator after 3 seconds
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
      
      // Track offline event
      trackError('network_offline', 'User went offline', undefined, {
        url: window.location.href,
        timestamp: new Date().toISOString(),
      });
    };

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    if (navigator.onLine !== isOnline) {
      setIsOnline(navigator.onLine);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  // Don't show indicator if not needed
  if (!showIndicator && !showWhenOnline) return null;

  // Don't show online indicator if showWhenOnline is false
  if (isOnline && !showWhenOnline) return null;

  const baseClasses = 'fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 transform';
  
  if (isOnline) {
    return (
      <div className={`${baseClasses} bg-green-500 text-white ${className}`}>
        <div className="flex items-center space-x-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-sm font-medium">Back Online</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${baseClasses} bg-red-500 text-white ${className}`}>
      <div className="flex items-center space-x-2">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"
          />
        </svg>
        <span className="text-sm font-medium">You're Offline</span>
      </div>
    </div>
  );
};

// Hook for checking online status
export function useOnlineStatus() {
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

  return isOnline;
}

// Hook for network quality
export function useNetworkQuality() {
  const [quality, setQuality] = useState<'good' | 'slow' | 'offline'>('good');

  useEffect(() => {
    if (!navigator.onLine) {
      setQuality('offline');
      return;
    }

    // Check connection speed using navigator.connection if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        setQuality('slow');
      } else {
        setQuality('good');
      }

      const handleChange = () => {
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          setQuality('slow');
        } else {
          setQuality('good');
        }
      };

      connection.addEventListener('change', handleChange);
      return () => connection.removeEventListener('change', handleChange);
    }

    // Fallback: assume good connection
    setQuality('good');
  }, []);

  return quality;
}

export default OfflineIndicator;

