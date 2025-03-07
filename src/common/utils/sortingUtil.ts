export interface SortConfig {
    key: string;
    direction: 'ascending' | 'descending';
}

export const sortedData = (data: any[], sortConfig: SortConfig | null): any[] => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });
};

export const determineSortConfig = (currentConfig: SortConfig | null, key: string): SortConfig => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (currentConfig && currentConfig.key === key && currentConfig.direction === 'ascending') {
        direction = 'descending';
    }
    return { key, direction };
};