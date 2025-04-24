export interface SortState<T> {
  field: keyof T | null;
  order: 'asc' | 'desc';
}

function sortItems<T>(items: T[], sort: SortState<T>): T[] {
  return [...items].sort((a, b) => {
    if (!sort.field) return 0;

    const aValue = a[sort.field];
    const bValue = b[sort.field];

    // Handle null values
    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return sort.order === 'asc' ? -1 : 1;
    if (bValue === null) return sort.order === 'asc' ? 1 : -1;

    if (typeof aValue === 'undefined' || typeof bValue === 'undefined') return 0;

    // Normal comparison if not null
    if (aValue < bValue) return sort.order === 'asc' ? -1 : 1;
    if (aValue > bValue) return sort.order === 'asc' ? 1 : -1;
    return 0;
  });
}

export default sortItems;
