/**
 * Hook for managing report selection state
 * Supports single and multi-select operations with localStorage persistence
 */

import { useCallback, useState, useEffect } from 'react';

interface SelectionState {
  selectedIds: Set<string>;
  selectAll: boolean;
}

const SELECTION_KEY_PREFIX = 'radly_report_selection_';

export function useReportSelection(userId?: string | null) {
  const selectionKey = userId ? `${SELECTION_KEY_PREFIX}${userId}` : null;

  // Initialize selection from localStorage
  const [selection, setSelection] = useState<SelectionState>(() => {
    if (!selectionKey || typeof window === 'undefined') {
      return { selectedIds: new Set(), selectAll: false };
    }

    try {
      const saved = localStorage.getItem(selectionKey);
      if (saved) {
        const { selectedIds } = JSON.parse(saved);
        return {
          selectedIds: new Set(selectedIds),
          selectAll: false,
        };
      }
    } catch (error) {
      console.error('Failed to load selection state:', error);
    }

    return { selectedIds: new Set(), selectAll: false };
  });

  // Save selection to localStorage whenever it changes
  const saveSelection = useCallback(
    (newSelection: SelectionState) => {
      if (!selectionKey) return;

      try {
        localStorage.setItem(
          selectionKey,
          JSON.stringify({
            selectedIds: Array.from(newSelection.selectedIds),
          })
        );
      } catch (error) {
        console.error('Failed to save selection state:', error);
      }
    },
    [selectionKey]
  );

  const toggleSelection = useCallback((id: string) => {
    setSelection((prev) => {
      const newSelectedIds = new Set(prev.selectedIds);
      if (newSelectedIds.has(id)) {
        newSelectedIds.delete(id);
      } else {
        newSelectedIds.add(id);
      }

      const newSelection = {
        selectedIds: newSelectedIds,
        selectAll: false,
      };

      saveSelection(newSelection);
      return newSelection;
    });
  }, [saveSelection]);

  const toggleSelectAll = useCallback((ids: string[]) => {
    setSelection((prev) => {
      const newSelectAll = !prev.selectAll;
      const newSelectedIds = newSelectAll
        ? new Set(ids)
        : new Set<string>();

      const newSelection = {
        selectedIds: newSelectedIds,
        selectAll: newSelectAll,
      };

      saveSelection(newSelection);
      return newSelection;
    });
  }, [saveSelection]);

  const clearSelection = useCallback(() => {
    const newSelection: SelectionState = {
      selectedIds: new Set(),
      selectAll: false,
    };

    saveSelection(newSelection);
    setSelection(newSelection);
  }, [saveSelection]);

  const isSelected = useCallback(
    (id: string) => selection.selectedIds.has(id),
    [selection.selectedIds]
  );

  const getSelectedIds = useCallback(
    () => Array.from(selection.selectedIds),
    [selection.selectedIds]
  );

  const getSelectedCount = useCallback(
    () => selection.selectedIds.size,
    [selection.selectedIds]
  );

  return {
    // State
    selectedIds: selection.selectedIds,
    selectAll: selection.selectAll,

    // Methods
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    isSelected,
    getSelectedIds,
    getSelectedCount,
  };
}
