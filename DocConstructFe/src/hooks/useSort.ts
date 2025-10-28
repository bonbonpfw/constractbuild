import { useState, useCallback } from 'react';
import { SortDirection } from '../components/shared/SortableTableHeader';

interface SortState {
  sortKey: string | null;
  sortDirection: SortDirection;
}

export const useSort = (initialSortKey: string | null = null) => {
  const [sortState, setSortState] = useState<SortState>({
    sortKey: initialSortKey,
    sortDirection: initialSortKey ? 'asc' : null
  });

  const handleSort = useCallback((key: string) => {
    setSortState(prevState => {
      if (prevState.sortKey === key) {
        // If clicking the same column, cycle through: asc -> desc -> null -> asc
        switch (prevState.sortDirection) {
          case 'asc':
            return { sortKey: key, sortDirection: 'desc' };
          case 'desc':
            return { sortKey: null, sortDirection: null };
          default:
            return { sortKey: key, sortDirection: 'asc' };
        }
      } else {
        // If clicking a different column, start with ascending
        return { sortKey: key, sortDirection: 'asc' };
      }
    });
  }, []);

  const sortData = useCallback(<T>(data: T[], getValue: (item: T, key: string) => any): T[] => {
    if (!sortState.sortKey || !sortState.sortDirection) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = getValue(a, sortState.sortKey!);
      const bValue = getValue(b, sortState.sortKey!);

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortState.sortDirection === 'asc' ? -1 : 1;
      if (bValue == null) return sortState.sortDirection === 'asc' ? 1 : -1;

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue, 'he', { numeric: true });
        return sortState.sortDirection === 'asc' ? comparison : -comparison;
      }

      // Handle number comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return sortState.sortDirection === 'asc' ? comparison : -comparison;
      }

      // Handle date comparison
      if (aValue instanceof Date && bValue instanceof Date) {
        const comparison = aValue.getTime() - bValue.getTime();
        return sortState.sortDirection === 'asc' ? comparison : -comparison;
      }

      // Fallback to string comparison
      const comparison = String(aValue).localeCompare(String(bValue), 'he', { numeric: true });
      return sortState.sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [sortState]);

  return {
    sortKey: sortState.sortKey,
    sortDirection: sortState.sortDirection,
    handleSort,
    sortData
  };
};

export default useSort;
