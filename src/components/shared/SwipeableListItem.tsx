'use client';

import { useState, useRef } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/utils/haptics';

interface SwipeableListItemProps {
  children: React.ReactNode;
  onDelete?: () => void;
  deleteThreshold?: number;
  className?: string;
  disabled?: boolean;
}

/**
 * A list item component that supports swipe-to-delete gesture
 * Swipe left to reveal delete action
 */
export function SwipeableListItem({
  children,
  onDelete,
  deleteThreshold = 80,
  className,
  disabled = false,
}: SwipeableListItemProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const constraintsRef = useRef(null);
  const x = useMotionValue(0);
  const backgroundColor = useTransform(
    x,
    [-deleteThreshold, 0],
    ['rgb(239, 68, 68)', 'rgb(255, 255, 255)']
  );

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;

    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // If swiped far enough or with enough velocity, reveal delete button
    if (offset < -deleteThreshold || velocity < -500) {
      setIsRevealed(true);
      triggerHaptic('medium');
      x.set(-deleteThreshold);
    } else {
      setIsRevealed(false);
      x.set(0);
    }
  };

  const handleDelete = () => {
    if (disabled || !onDelete) return;

    triggerHaptic('warning');
    onDelete();
  };

  const handleTap = () => {
    if (isRevealed) {
      setIsRevealed(false);
      x.set(0);
    }
  };

  if (disabled || !onDelete) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn('relative overflow-hidden', className)} ref={constraintsRef}>
      {/* Delete action background */}
      <motion.div
        className="absolute inset-0 flex items-center justify-end px-6 bg-red-500"
        style={{ backgroundColor }}
      >
        <motion.button
          onClick={handleDelete}
          className="flex items-center gap-2 text-white font-medium touch-target"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: isRevealed ? 1 : 0,
            scale: isRevealed ? 1 : 0.8,
          }}
          transition={{ duration: 0.2 }}
        >
          <Trash2 className="w-5 h-5" />
          <span>Delete</span>
        </motion.button>
      </motion.div>

      {/* Swipeable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -deleteThreshold, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        onTap={handleTap}
        style={{ x }}
        className="relative bg-white cursor-pointer"
        whileTap={{ cursor: 'grabbing' }}
      >
        {children}
      </motion.div>
    </div>
  );
}
