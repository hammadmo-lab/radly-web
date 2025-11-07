'use client';

import { motion } from 'framer-motion';
import { X, Copy, Download, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { triggerHaptic } from '@/utils/haptics';

interface BulkActionToolbarProps {
  selectedCount: number;
  totalCount: number;
  selectedIds: string[];
  onClearSelection: () => void;
  onSelectAll: () => void;
  onCopyJobIds: () => void;
  onBulkDelete?: () => void;
  isDeleting?: boolean;
}

export function BulkActionToolbar({
  selectedCount,
  totalCount,
  selectedIds,
  onClearSelection,
  onSelectAll,
  onCopyJobIds,
  onBulkDelete,
  isDeleting = false,
}: BulkActionToolbarProps) {
  const { copy, isCopied } = useCopyToClipboard();
  const isAllSelected = selectedCount === totalCount && totalCount > 0;

  const handleCopy = () => {
    const idsText = selectedIds.join('\n');
    copy(idsText);
    triggerHaptic('light');
    onCopyJobIds();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="aurora-card border border-[rgba(75,142,255,0.35)] bg-[rgba(12,16,28,0.8)] p-4 sm:p-5 sticky top-0 z-40"
    >
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Info Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-[#4B8EFF] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">
                {selectedCount} {selectedCount === 1 ? 'report' : 'reports'} selected
              </p>
              {selectedCount > 0 && selectedCount < totalCount && (
                <p className="text-xs text-[rgba(207,207,207,0.55)]">
                  {totalCount - selectedCount} more available
                </p>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-8 w-8 p-0"
            aria-label="Clear selection"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Actions Row */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {/* Select All Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onSelectAll();
              triggerHaptic('light');
            }}
            className="text-xs sm:text-sm h-8 sm:h-9"
          >
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </Button>

          {/* Copy Job IDs */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="text-xs sm:text-sm h-8 sm:h-9 gap-1.5"
          >
            {isCopied ? (
              <>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy IDs</span>
                <span className="sm:hidden">Copy</span>
              </>
            )}
          </Button>

          {/* Spacer */}
          <div className="flex-1 hidden sm:block" />

          {/* Bulk Delete - Commented out until backend support */}
          {onBulkDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onBulkDelete();
                triggerHaptic('light');
              }}
              disabled={isDeleting}
              className="text-xs sm:text-sm h-8 sm:h-9"
            >
              {isDeleting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span className="hidden sm:inline ml-1">Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Delete Selected</span>
                </>
              )}
            </Button>
          )}
        </div>

        {/* Hint */}
        <div className="text-xs text-[rgba(207,207,207,0.5)]">
          💡 Selected reports are marked with a checkbox. Bulk actions coming soon!
        </div>
      </div>
    </motion.div>
  );
}
