import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface VpcContextBarProps {
    vpc: {
        id: string;
        name: string;
        ipv4?: string;
        region?: string;
    } | null;
    onClear: () => void;
}

const VpcContextBar: React.FC<VpcContextBarProps> = ({ vpc, onClear }) => {
    if (!vpc) return null;

    return (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-[#1E3A8A] rounded-lg shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <div className="flex flex-col">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Current VPC Context</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                        {vpc.name || vpc.id}
                    </span>
                </div>
                {(vpc.ipv4 || vpc.region) && (
                    <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        {vpc.ipv4 && <span>CIDR: {vpc.ipv4}</span>}
                        {vpc.region && <span>Region: {vpc.region}</span>}
                    </div>
                )}
            </div>
            <button
                onClick={onClear}
                className="p-1 hover:bg-blue-100 dark:hover:bg-[#2E4A9A] rounded-full"
                title="Clear VPC context"
            >
                <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
        </div>
    );
};

export default VpcContextBar;
