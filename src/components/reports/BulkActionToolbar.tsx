'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Download, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { triggerHaptic } from '@/utils/haptics';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { bulkDeleteReports, bulkExportReports } from '@/lib/bulk-operations';

interface BulkActionToolbarProps {
  selectedCount: number;
  totalCount: number;
  selectedIds: string[];
  onClearSelection: () => void;
  onSelectAll: () => void;
  onCopyJobIds: () => void;
  onBulkDelete?: (deletedIds: string[]) => void;
  onBulkExport?: () => void;
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
  onBulkExport,
  isDeleting = false,
}: BulkActionToolbarProps) {
  const { copy, isCopied } = useCopyToClipboard();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isAllSelected = selectedCount === totalCount && totalCount > 0;

  const handleCopy = () => {
    const idsText = selectedIds.join('\n');
    copy(idsText);
    triggerHaptic('light');
    onCopyJobIds();
  };

  const handleBulkDelete = async () => {
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsProcessing(true);
    try {
      const result = await bulkDeleteReports(selectedIds);

      triggerHaptic('success');

      if (result.failed_count > 0) {
        toast.warning(
          `Deleted ${result.deleted_count} reports (${result.failed_count} failed)`
        );
      } else {
        toast.success(`Successfully deleted ${result.deleted_count} reports`);
      }

      // Notify parent that deletion succeeded
      if (onBulkDelete) {
        onBulkDelete(result.failed_ids);
      }

      onClearSelection();
    } catch (error) {
      triggerHaptic('error');
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete reports';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleBulkExport = async () => {
    setIsProcessing(true);
    try {
      const result = await bulkExportReports(selectedIds);

      triggerHaptic('success');

      if (result.failed_count > 0) {
        toast.warning(
          `Exported ${result.exported_count} reports (${result.failed_count} skipped)`
        );
      } else {
        toast.success(`Exported ${result.exported_count} reports`);
      }

      // Trigger download
      const link = document.createElement('a');
      link.href = result.download_url;
      link.download = `reports-export-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onBulkExport?.();
      onClearSelection();
    } catch (error) {
      triggerHaptic('error');
      const errorMessage = error instanceof Error ? error.message : 'Failed to export reports';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
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

            {/* Bulk Export */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleBulkExport();
              triggerHaptic('light');
            }}
            disabled={isProcessing}
            className="text-xs sm:text-sm h-8 sm:h-9"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin sm:mr-1.5" />
                <span className="hidden sm:inline">Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Export ZIP</span>
                <span className="sm:hidden">Export</span>
              </>
            )}
          </Button>

          {/* Bulk Delete */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              handleBulkDelete();
              triggerHaptic('light');
            }}
            disabled={isProcessing}
            className="text-xs sm:text-sm h-8 sm:h-9"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin sm:mr-1.5" />
                <span className="hidden sm:inline">Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Delete Selected</span>
              </>
            )}
          </Button>
        </div>

        {/* Hint */}
        <div className="text-xs text-[rgba(207,207,207,0.5)]">
          💡 Bulk operations: Export as ZIP or permanently delete selected reports.
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Reports?"
        description={`This will permanently delete ${selectedCount} ${selectedCount === 1 ? 'report' : 'reports'}. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isProcessing}
        onConfirm={handleConfirmDelete}
      />
    </motion.div>
  );
}
