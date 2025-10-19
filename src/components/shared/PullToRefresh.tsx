'use client';

import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  enabled?: boolean;
  threshold?: number;
}

/**
 * Wrapper component that adds pull-to-refresh functionality
 */
export function PullToRefresh({
  onRefresh,
  children,
  enabled = true,
  threshold = 80,
}: PullToRefreshProps) {
  const { containerRef, isPulling, isRefreshing, pullDistance, progress } =
    usePullToRefresh({
      onRefresh,
      enabled,
      threshold,
    });

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {/* Pull indicator */}
      {(isPulling || isRefreshing) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-0 left-0 right-0 flex justify-center items-center"
          style={{
            transform: `translateY(${Math.min(pullDistance - 40, 40)}px)`,
          }}
        >
          <div className="bg-background/90 backdrop-blur-sm rounded-full p-3 shadow-lg border">
            {isRefreshing ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : (
              <motion.div
                animate={{
                  rotate: progress * 180,
                }}
              >
                <RefreshCw className="w-6 h-6 text-primary" />
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div
        style={{
          transform: isRefreshing
            ? 'translateY(60px)'
            : `translateY(${Math.min(pullDistance * 0.4, 60)}px)`,
          transition: isRefreshing || !isPulling ? 'transform 0.3s ease' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}
