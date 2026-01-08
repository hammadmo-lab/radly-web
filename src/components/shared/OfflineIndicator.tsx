'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';

/**
 * Component that displays when the user is offline
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(() => {
    // Lazy initializer - set initial state from navigator
    if (typeof window !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });
  const [showOnlineNotification, setShowOnlineNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineNotification(true);
      // Hide the "back online" message after 3 seconds
      setTimeout(() => setShowOnlineNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineNotification(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 md:bottom-4 left-4 right-4 z-50"
        >
          <div className="bg-yellow-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <WifiOff className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">You&apos;re offline</p>
              <p className="text-sm opacity-90">Some features may be limited</p>
            </div>
          </div>
        </motion.div>
      )}
      {showOnlineNotification && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 md:bottom-4 left-4 right-4 z-50"
        >
          <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <Wifi className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">Back online</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
