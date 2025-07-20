import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setResourceFetchedEntities } from '@/store/infra-resources-slice/infraResourcesSlice';

interface ResourceCount {
    label: string;
    count: number;
    onClick: () => void;
}

interface VpcContextBarProps {
    vpc: {
        id: string;
        name: string;
        ipv4?: string;
        region?: string;
        compliant?: string;
        labels?: Record<string, string>;
    } | null;
    onClear: () => void;
    onResourceClick?: (resourceType: string) => void;
}

const ResourceBadge: React.FC<ResourceCount> = ({ label, count, onClick }) => (
    <button
        onClick={onClick}
        className="px-3 py-1 bg-blue-100 dark:bg-[#2E4A9A] rounded-full text-sm 
                   text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-[#3E5AAA] 
                   transition-colors duration-200 flex items-center space-x-2"
        disabled={count === 0}
        style={{ opacity: count === 0 ? 0.5 : 1 }}
    >
        <span>{label}</span>
        <span className="font-semibold">{count}</span>
    </button>
);

const VpcContextBar: React.FC<VpcContextBarProps> = ({ vpc, onClear, onResourceClick }) => {
    const dispatch = useDispatch();
    
    // Get all resources from Redux store
    const resources = useSelector((state: RootState) => state.infraResources.resources);
    const selectedRow = useSelector((state: RootState) => state.infraResources.selectedRow);
    
    const [resourceCounts, setResourceCounts] = useState<ResourceCount[]>([
        { label: 'VMs', count: 0, onClick: () => onResourceClick?.('VM') },
        { label: 'Subnets', count: 0, onClick: () => onResourceClick?.('Subnet') },
        { label: 'Security Groups', count: 0, onClick: () => onResourceClick?.('Security Group') },
        { label: 'Route Tables', count: 0, onClick: () => onResourceClick?.('Route Table') },
        { label: 'ACLs', count: 0, onClick: () => onResourceClick?.('ACL') },
    ]);

    // Debug log the current state
    useEffect(() => {
        console.log('VPC Context Debug:', {
            vpc: vpc,
            selectedRow: selectedRow,
            resourceType: resources.type,
            resourceDetails: {
                total: {
                    vms: resources.vpcVms?.length || 0,
                    subnets: resources.vpcSubnets?.length || 0,
                    securityGroups: resources.vpcSecurityGroups?.length || 0,
                    routeTables: resources.vpcRouteTables?.length || 0,
                    acls: resources.vpcACLS?.length || 0
                },
                filtered: {
                    vms: resources.vpcVms?.filter(vm => vm.vpcId === vpc?.id)?.length || 0,
                    subnets: resources.vpcSubnets?.filter(subnet => subnet.vpcId === vpc?.id)?.length || 0,
                    securityGroups: resources.vpcSecurityGroups?.filter(sg => sg.vpcId === vpc?.id)?.length || 0,
                    routeTables: resources.vpcRouteTables?.filter(rt => rt.vpcId === vpc?.id)?.length || 0,
                    acls: resources.vpcACLS?.filter(acl => acl.vpcId === vpc?.id)?.length || 0
                }
            },
            fetchedEntities: resources.fetchedEntities
        });
    }, [vpc, selectedRow, resources]);

    // Update counts based on the specific resource arrays
    useEffect(() => {
        if (vpc && vpc.id) {
            const filterByVpc = (items?: any[]) => 
                items?.filter(item => item.vpcId === vpc.id) || [];

            setResourceCounts([
                { 
                    label: 'VMs', 
                    count: filterByVpc(resources.vpcVms).length,
                    onClick: () => onResourceClick?.('VM') 
                },
                { 
                    label: 'Subnets', 
                    count: filterByVpc(resources.vpcSubnets).length,
                    onClick: () => onResourceClick?.('Subnet') 
                },
                { 
                    label: 'Security Groups', 
                    count: filterByVpc(resources.vpcSecurityGroups).length,
                    onClick: () => onResourceClick?.('Security Group') 
                },
                { 
                    label: 'Route Tables', 
                    count: filterByVpc(resources.vpcRouteTables).length,
                    onClick: () => onResourceClick?.('Route Table') 
                },
                { 
                    label: 'ACLs', 
                    count: filterByVpc(resources.vpcACLS).length,
                    onClick: () => onResourceClick?.('ACL') 
                },
            ]);
        }
    }, [vpc, resources, onResourceClick]);

    if (!vpc) return null;

    return (
        <div className="mb-4 bg-blue-50 dark:bg-[#1E3A8A] rounded-lg shadow-sm">
            {/* Main VPC Info Section */}
            <div className="p-4 border-b border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Current VPC Context</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {vpc.name || vpc.id}
                            </span>
                        </div>
                        {(vpc.ipv4 || vpc.region || vpc.compliant) && (
                            <div className="hidden md:flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                {vpc.ipv4 && <span>CIDR: {vpc.ipv4}</span>}
                                {vpc.region && <span>Region: {vpc.region}</span>}
                                {vpc.compliant && (
                                    <span className={`px-2 py-0.5 rounded ${
                                        vpc.compliant === 'Yes' 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    }`}>
                                        {vpc.compliant === 'Yes' ? 'Compliant' : 'Non-Compliant'}
                                    </span>
                                )}
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
            </div>

            {/* Resource Counts Section */}
            <div className="p-4">
                <div className="flex flex-wrap gap-2">
                    {resourceCounts.map(resource => (
                        <ResourceBadge key={resource.label} {...resource} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VpcContextBar;
