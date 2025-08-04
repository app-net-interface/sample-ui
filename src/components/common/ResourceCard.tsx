import React from 'react';
import { combineStyles } from '@/styles/theme';

interface ResourceField {
    label: string;
    value: string | number;
    isHeader?: boolean;
    isMono?: boolean;
    isStatus?: boolean;
    statusMapping?: {
        [key: string]: {
            bg: string;
            text: string;
        };
    };
}

interface ResourceCardProps {
    fields: ResourceField[];
    isSelected: boolean;
    onClick?: () => void;
    onDoubleClick?: () => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
    fields,
    isSelected,
    onClick,
    onDoubleClick
}) => {
    return (
        <div
            className={combineStyles(
                'group relative bg-white dark:bg-boxdark rounded-xl shadow-sm hover:shadow-md transition-all duration-200',
                'border border-gray-100 dark:border-gray-700',
                isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : '',
                'cursor-pointer'
            )}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
        >
            <div className="p-6">
                {fields.map((field, index) => {
                    if (field.isHeader) {
                        return (
                            <div key={index} className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                        {field.value || 'N/A'}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {field.label}
                                    </p>
                                </div>
                            </div>
                        );
                    }
                    
                    if (field.isStatus) {
                        const status = String(field.value).toLowerCase();
                        const statusStyle = field.statusMapping?.[status] || {
                            bg: 'bg-gray-100 dark:bg-gray-800',
                            text: 'text-gray-800 dark:text-gray-200'
                        };
                        
                        return (
                            <div key={index} className="mb-3">
                                <span className={combineStyles(
                                    'px-3 py-1 rounded-full text-xs font-medium',
                                    statusStyle.bg,
                                    statusStyle.text
                                )}>
                                    {field.value || 'N/A'}
                                </span>
                            </div>
                        );
                    }

                    return (
                        <div key={index} className="mb-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                {field.label}
                            </p>
                            <p className={combineStyles(
                                'text-sm',
                                field.isMono ? 'font-mono' : 'font-medium',
                                'text-gray-900 dark:text-white'
                            )}>
                                {field.value || 'N/A'}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
