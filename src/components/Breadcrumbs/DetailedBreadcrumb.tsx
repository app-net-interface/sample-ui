import React from 'react';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItemProps {
    label: string;
    isLast?: boolean;
    onClick?: () => void;
}

const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({ label, isLast, onClick }) => (
    <li>
        <div className="flex items-center">
            <ChevronRightIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mx-2" />
            <button
                onClick={onClick}
                className={`text-sm font-medium ${
                    isLast 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                disabled={isLast}
            >
                {label}
            </button>
        </div>
    </li>
);

interface DetailedBreadcrumbProps {
    items: {
        label: string;
        onClick?: () => void;
    }[];
}

const DetailedBreadcrumb: React.FC<DetailedBreadcrumbProps> = ({ items }) => {
    return (
        <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center">
                <li>
                    <div className="flex items-center">
                        <HomeIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </div>
                </li>
                {items.map((item, index) => (
                    <BreadcrumbItem
                        key={item.label}
                        label={item.label}
                        isLast={index === items.length - 1}
                        onClick={item.onClick}
                    />
                ))}
            </ol>
        </nav>
    );
};

export default DetailedBreadcrumb;
