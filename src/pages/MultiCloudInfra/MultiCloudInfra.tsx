/**
 * Copyright (c) 2024 Cisco Systems, Inc. and its affiliates
 * All ri    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVpc, setSelectedVpc] = useState<VPC | null>(null);
    const [selectedVpcId, setSelectedVpcId] = useState('');
    const [selectedRow, setSelectedRow] = useState<string | null>(null);reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http:www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Squares2X2Icon, TableCellsIcon } from '@heroicons/react/24/outline';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import ProviderButtons from '@/components/ProviderRegion/ProviderRegionBar';
import DefaultLayout from '../../layout/DefaultLayout';
import VpcModal from '../../components/Modal/VpcModal';
import InternetGatewayModal from '../../components/Modal/InternetGatewayModal';
import NatGatewayModal from '../../components/Modal/NatGatewayModal';
import VpcEndpointModal from '../../components/Modal/VpcEndpointModal';
import RouteTableModal from '../../components/Modal/RouteTableModal';
import RouterModal from '../../components/Modal/RouterModal';
import SubnetModal from '../../components/Modal/SubnetModal';
import SecurityGroupModal from '../../components/Modal/SecurityGroupModal';
import PublicIPModal from '../../components/Modal/PublicIPModal';
import ACLModal from '../../components/Modal/ACLModal';
import VMModal from '../../components/Modal/VMModal';
import CIDROverlapModal from '@/components/Modal/CIDROverlapModal';
import LoadBalancerModal from '../../components/Modal/LoadBalancerModal'; // ADD THIS
import { VpcContextBar } from '@/components/VpcContextBar/VpcContextBar';
import { ResourceCard } from '@/components/common/ResourceCard';

import {
    useFetchVpcResourceSubnets,
    useFetchVpcResourceVms,
    useFetchVpcResourceSecurityGroups,
    useFetchVpcResourceRouters,
    useFetchVpcResourceRouteTables,
    useFetchVpcResourceACLs,
    useFetchVpcResourceVpcEndpoints,
    useFetchVpcResourceNATGateways,
    useFetchVpcResourceInternetGateways,
    useFetchVpcResourcePublicIPs,
    useFetchVpcResourceLoadBalancers, // Corrected import name
} from "@/common/hooks";
import '../../css/vpc.css';
import { setSelectedAccountId } from "@/store/selectedRegionAccountId-slice/selectedRegionAccountIdSlice";
import { sortedData, determineSortConfig, SortConfig } from "@/common/utils/sortingUtil";
import { handleButtonClick, handleOpenModal } from "@/pages/MultiCloudInfra/Handlers";
import { useFetchOverlapIPs } from "@/common/hooks/useFetchOverlapIPs";
import { searchSecurityGroups } from "./securityGroupSearchHelper";


interface VM {
    id: string;
    name: string;
    accountId: string;
    provider: string;
    owner?: string;
    project?: string;
    type?: string;
    subnetId?: string;
    publicIp?: string;
    state: string;
    compliant?: boolean;
    creationTimestamp?: string;
    createTime?: string;
    instanceType?: string;
    machineType?: string;
    vpcId?: string;
}

interface VPC {
    id: string;
    accountId: string;
    name: string;
    region: string;
    ipv4: string;
    ipv6: string;
    labels: Record<string, string>;
    selfLink: string;
    project?: string;
    compliant?: boolean;
}

type ViewMode = 'table' | 'card';

const MultiCloudInfra = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('card');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVpc, setSelectedVpc] = useState<VPC | null>(null);
    const [selectedVpcId, setSelectedVpcId] = useState('');
    const [selectedRow, setSelectedRow] = useState<string | null>(null);
    const [selectedView, setSelectedView] = useState('VPC');
    const [selectedOverlapCIDR, setSelectedOverlapCIDR] = useState(null);

    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [timeSinceUpdate, setTimeSinceUpdate] = useState<string>('just now');
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

    const dispatch = useDispatch();

    const { vpcs } = useSelector((state: RootState) => state.infraResources);
    const { selectedProvider, selectedAccountId, selectedRegion = '' } = useSelector((state: RootState) => state.selectedResources);
    const [previousAccountId, setPreviousAccountId] = useState(selectedAccountId);

    const { vpcResourceVms, fetchVpcResourcesVms } = useFetchVpcResourceVms(selectedProvider, '', selectedVpcId, selectedAccountId);
    const { vpcResourceSubnets, fetchVpcResourcesSubnets } = useFetchVpcResourceSubnets(selectedProvider, '', selectedVpcId, selectedAccountId);
    const { vpcResourceSecurityGroups, fetchVpcResourceSecurityGroups } = useFetchVpcResourceSecurityGroups(selectedProvider, '', selectedVpcId, selectedAccountId);
    const { vpcResourceACLs, fetchVpcResourceACLs } = useFetchVpcResourceACLs(selectedProvider, '', selectedVpcId, selectedAccountId);
    const { vpcResourceRouters, fetchVpcResourceRouters } = useFetchVpcResourceRouters(selectedProvider, '', '', selectedAccountId);
    const { vpcResourceRouteTables, fetchVpcResourceRouteTables } = useFetchVpcResourceRouteTables(selectedProvider, '', selectedVpcId, selectedAccountId);
    const { vpcResourceVpcEndpoints, fetchVpcResourceVPCEndpoints } = useFetchVpcResourceVpcEndpoints(selectedProvider, '', selectedVpcId, selectedAccountId);
    const { vpcResourceNATGateways, fetchVpcResourceNATGateways } = useFetchVpcResourceNATGateways(selectedProvider, '', selectedVpcId, selectedAccountId);
    const { vpcResourceInternetGateways, fetchVpcResourceInternetGateways } = useFetchVpcResourceInternetGateways(selectedProvider, '', '', selectedAccountId);
    const { vpcResourcePublicIPs, fetchVpcResourcePublicIPs } = useFetchVpcResourcePublicIPs(selectedProvider, '', selectedVpcId, selectedAccountId);
    const { overlappedCIDRs, fetchVpcResourcesOverlappedIP } = useFetchOverlapIPs(selectedProvider, '', selectedVpcId, selectedAccountId);
    const { vpcResourceLoadBalancers, fetchVpcResourceLoadBalancers } = useFetchVpcResourceLoadBalancers(selectedProvider, '', selectedVpcId, selectedAccountId);

    const vpcData = vpcs.map(vpc => {
        // Ensure provider is included in labels
        const labels = {
            ...vpc["labels"],
            "cloud.service.type": selectedProvider // Add the provider to labels
        };

        return {
            id: vpc.id,
            accountId: vpc.accountId,
            name: vpc.name || '',
            region: vpc.region,
            ipv4: vpc.ipv4_cidr,
            ipv6: vpc.ipv6_cidr,
            labels,
            compliant: vpc.compliant,
            selfLink: vpc.selfLink,
            project: vpc.project,
        };
    });

    const search = (data: any[], searchTerm: string, keys: string[]) => {
        if (!searchTerm || !data) return data || [];
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return data.filter(item =>
            item && keys.some(key =>
                item.hasOwnProperty(key) && item[key] != null && String(item[key]).toLowerCase().includes(lowerCaseSearchTerm)
            )
        );
    };

    const vpcKeys = ['id', 'name', 'accountId', 'region'];
    const sgKeys = ['id', 'name', 'accountId', 'region', 'vpcId'];
    const vmKeys = ['id', 'name', 'accountId', 'provider', 'owner', 'project', 'type', 'subnetId', 'publicIp', 'state', 'compliant'];
    const subnetKeys = ['id', 'name', 'cidrblock', 'provider', 'accountId', 'region', 'vpcId', 'zone'];
    const aclKeys = ['id', 'name', 'provider', 'accountId', 'region', 'vpcId'];
    const routerKeys = ['id', 'name', 'provider', 'accountId', 'region', 'vpcId'];
    const routeTableKeys = ['id', 'name', 'provider', 'accountId', 'region', 'vpcId'];
    const vpcEndpointKeys = ['id', 'name', 'provider', 'accountId', 'region', 'vpcId', 'routeTableIds', 'subnetIds', 'service'];
    const natGatewaysKeys = ['id', 'name', 'accountId', 'vpcId', 'region', 'state', 'publicIp', 'privateIp', 'subnetId'];
    const igsKeys = ['id', 'name', 'provider', 'accountId', 'region', 'vpcId', 'state'];
    const publicIPsKeys = ['id', 'name', 'provider', 'accountId', 'region', 'vpcId', 'state'];
    const lbKeys = ['id', 'name', 'type', 'ipAddress', 'vpcId', 'region', 'accountId', 'state'];

    const vpcSearch = search(vpcData, searchTerm, vpcKeys);
    const sgSearch = searchSecurityGroups(vpcResourceSecurityGroups, searchTerm);
    const vmSearch = search(vpcResourceVms, searchTerm, vmKeys);
    const subnetSearch = search(vpcResourceSubnets, searchTerm, subnetKeys);
    const aclSearch = search(vpcResourceACLs, searchTerm, aclKeys);
    const routerSearch = search(vpcResourceRouters, searchTerm, routerKeys);
    const routeTableSearch = search(vpcResourceRouteTables, searchTerm, routeTableKeys);
    const vpcEndpointSearch = search(vpcResourceVpcEndpoints, searchTerm, vpcEndpointKeys);
    const natGatewaysSearch = search(vpcResourceNATGateways, searchTerm, natGatewaysKeys);
    const igsSearch = search(vpcResourceInternetGateways, searchTerm, igsKeys);
    const publicIPsSearch = search(vpcResourcePublicIPs, searchTerm, publicIPsKeys);
    const lbSearch = search(vpcResourceLoadBalancers, searchTerm, lbKeys);

    const vmData = useMemo(() => vpcResourceVms.map(vm => {
        const mappedVm = {
            ...vm,
            creationTimestamp: vm.creationTimestamp || vm.createTime,
            instanceType: vm.instanceType || vm.machineType,
            state: vm.state?.toLowerCase() || 'unknown'
        };
        console.debug('Mapped VM data:', mappedVm);
        return mappedVm;
    }), [vpcResourceVms]);

    const sortedVms = useMemo(() => sortedData(search(vmData, searchTerm, vmKeys), sortConfig), [vmData, searchTerm, sortConfig]);

    useEffect(() => {
        if (lastUpdated) {
            const interval = setInterval(() => {
                const now = new Date();
                const minutes = Math.floor((now.getTime() - lastUpdated.getTime()) / 60000);
                setTimeSinceUpdate(`${minutes} minute${minutes === 1 ? '' : 's'} ago`);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [lastUpdated]);

    useEffect(() => {
        if (selectedAccountId !== previousAccountId) {
            setPreviousAccountId(selectedAccountId);
            setSelectedView('VPC');
        }
    }, [selectedAccountId]);

    const handleSortClick = (key: string) => {
        const newConfig = determineSortConfig(sortConfig, key);
        setSortConfig(newConfig);
    };

    const handleVPCView = () => {
        setSelectedView('VPC');
        setIsModalOpen(false);
        setSelectedVpcId('');
    }

    const handleClearVpcContext = () => {
        setSelectedVpcId('');
        setSelectedView('VPC');
    };

    const handleVPCSelection = (vpc: VPC) => {
        if (!vpc) return;
        
        setSelectedVpcId(vpc.id);
        setSelectedVpc(vpc);
        setSelectedRow(vpc.id);
        
        dispatch({
            type: 'infraResources/setSelectedVPC',
            payload: vpc
        });
        
        fetchVpcResourcesVms();
        fetchVpcResourcesSubnets();
        fetchVpcResourceSecurityGroups();
    };

    const selectedVpcData = useMemo(() => {
        if (!selectedVpcId) return null;
        return vpcData.find(vpc => vpc.id === selectedVpcId) || null;
    }, [selectedVpcId, vpcData]);

    const buttonData = [
        { name: 'VPC', fetchFunction: handleVPCView },
        { name: 'VM', fetchFunction: fetchVpcResourcesVms },
        { name: 'Subnet', fetchFunction: fetchVpcResourcesSubnets },
        { name: 'Security Group', fetchFunction: fetchVpcResourceSecurityGroups },
        { name: 'Load Balancer', fetchFunction: fetchVpcResourceLoadBalancers },
        { name: 'ACL', fetchFunction: fetchVpcResourceACLs },
        { name: 'Routers', fetchFunction: fetchVpcResourceRouters },
        { name: 'Route Table', fetchFunction: fetchVpcResourceRouteTables },
        { name: 'VPC Endpoint', fetchFunction: fetchVpcResourceVPCEndpoints },
        { name: 'NAT Gateway', fetchFunction: fetchVpcResourceNATGateways },
        { name: 'Internet Gateway', fetchFunction: fetchVpcResourceInternetGateways },
        { name: 'Public IP', fetchFunction: fetchVpcResourcePublicIPs },
        { name: 'Overlapping IPs', fetchFunction: fetchVpcResourcesOverlappedIP },
    ];

    useEffect(() => {
        if (selectedView === 'VM') {
            fetchVpcResourcesVms();
        } else if (selectedView === 'Subnet') {
            fetchVpcResourcesSubnets();
        } else if (selectedView === 'Security Group') {
            fetchVpcResourceSecurityGroups();
        } else if (selectedView === 'Load Balancer') {
            fetchVpcResourceLoadBalancers();
        } else if (selectedView === 'ACL') {
            fetchVpcResourceACLs();
        } else if (selectedView === 'Routers') {
            fetchVpcResourceRouters();
        } else if (selectedView === 'Route Table') {
            fetchVpcResourceRouteTables();
        } else if (selectedView === 'VPC Endpoint') {
            fetchVpcResourceVPCEndpoints();
        } else if (selectedView === 'NAT Gateway') {
            fetchVpcResourceNATGateways();
        } else if (selectedView === 'Internet Gateway') {
            fetchVpcResourceInternetGateways();
        } else if (selectedView === 'Public IP') {
            fetchVpcResourcePublicIPs();
        } else if (selectedView === 'Overlapping IPs') {
            fetchVpcResourcesOverlappedIP();
        }
    }, [selectedProvider, selectedAccountId, selectedView]);

    useEffect(() => {
        if (selectedView === 'Overlapping IPs') {
            console.log('DEBUG: Overlapping IPs view selected, overlappedCIDRs:', overlappedCIDRs);
        }
    }, [selectedView, overlappedCIDRs]);

    useEffect(() => {
        //console.log('Overlapped CIDRs:', overlappedCIDRs);
    }, [overlappedCIDRs]);

    useEffect(() => {
        if (selectedView === 'Overlapping IPs') {
            setIsModalOpen(true);
        }
    }, [selectedView]);

    const searchPlaceholder = useMemo(() => {
        switch (selectedView) {
            case 'VPC':
                return "Search VPCs by id, name, region...";
            case 'VM':
                return "Search VMs by id, name, type, state...";
            case 'Subnet':
                return "Search Subnets by id, name, cidrblock...";
            case 'Security Group':
                return "Search SGs by id, name, or rule (e.g., source=0.0.0.0/0 and direction=ingress)";
            case 'Load Balancer':
                return "Search Load Balancers by id, name, type, ip...";
            case 'ACL':
                return "Search ACLs by id, name, vpcId...";
            case 'Routers':
                return "Search Routers by id, name, vpcId...";
            case 'Route Table':
                return "Search Route Tables by id, name, vpcId...";
            case 'VPC Endpoint':
                return "Search Endpoints by id, name, service...";
            case 'NAT Gateway':
                return "Search NAT GWs by id, name, state...";
            case 'Internet Gateway':
                return "Search IGWs by id, name, state...";
            case 'Public IP':
                return "Search Public IPs by id, name, state...";
            case 'Overlapping IPs':
                return "Search not applicable for Overlapping IPs";
            default:
                return "Search resources...";
        }
    }, [selectedView]);

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Multi-cloud Infrastructure Resources" />
            <div className="flex flex-col space-y-4 mb-6">
                <div className="flex flex-wrap items-start gap-4">
                    <div className="flex-1 min-w-[300px] max-w-2xl">
                        <div className="flex items-center gap-4">
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="input-field w-full dark:bg-black"
                                disabled={selectedView === 'Overlapping IPs'}
                            />
                            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex-shrink-0">
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`p-2 rounded-md transition-all duration-200 ${
                                        viewMode === 'table'
                                            ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
                                    }`}
                                >
                                    <TableCellsIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('card')}
                                    className={`p-2 rounded-md transition-all duration-200 ${
                                        viewMode === 'card'
                                            ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
                                    }`}
                                >
                                    <Squares2X2Icon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end">
                    <ProviderButtons onProviderButtonClick={handleVPCView} />
                </div>
            </div>
            
            <VpcContextBar 
              vpc={selectedVpcData} 
              onClear={handleClearVpcContext}
              onResourceClick={(resourceType) => {
                setSelectedView(resourceType);
                // Call the appropriate fetch function based on the resource type
                const button = buttonData.find(b => b.name === resourceType);
                if (button) {
                  button.fetchFunction();
                  setLastUpdated(new Date());
                }
              }}
            />

            <div className="flex flex-wrap gap-2 mb-4">
                {buttonData.map((button) => (
                    <button
                        className={`dark:border-white dark:text-white button-blue text-sm py-2 px-4 rounded-lg transition-colors duration-200 ${
                            selectedView === button.name 
                                ? 'bg-blue-600 text-white dark:bg-[#00437b]' 
                                : 'hover:bg-blue-50 dark:hover:bg-[#1E3A8A]'
                        }`}
                        key={button.name}
                        onClick={() => {
                            button.fetchFunction();
                            setSelectedView(button.name);
                            setLastUpdated(new Date());
                        }}
                    >
                        {button.name}
                    </button>
                ))}
            </div>
            
            <div className="flex justify-end mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Last updated {timeSinceUpdate}
                </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
                {selectedVpcId && selectedView !== 'VPC' && (
                    <div className="mb-4 flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Viewing resources in VPC: {selectedVpcData?.name || selectedVpcId}
                        </span>
                        <button
                            onClick={handleClearVpcContext}
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            (Clear VPC context)
                        </button>
                    </div>
                )}
                
                {(() => {
                    switch(selectedView) {
                        case 'VPC':
                            return (
                                <div>
                                    {viewMode === 'table' ? (
                                        <>
                                            <div className="dark:bg-black dark:border-black border-b border-1 border-[#E5E7EB] table-header flex justify-between text-left text-sm font-medium text-gray-700 rounded-lg">
                                                <span onClick={() => handleSortClick('name')} className="w-1/4 px-1 py-2 text-center">Name</span>
                                                <span onClick={() => handleSortClick('id')} className="w-1/4 px-4 py-2 text-center">VPC ID</span>
                                                <span onClick={() => handleSortClick('accountId')} className="w-1/4 px-2 py-2 text-center">Account ID</span>
                                                <span onClick={() => handleSortClick('region')} className="w-1/4 px-1 py-2 text-center">Region</span>
                                            </div>
                                            <div>
                                                {sortedData(vpcSearch, sortConfig).map((vpc, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`unselectable cursor-pointer dark:bg-black dark:text-white flex items-center justify-between text-left text-sm font-medium text-gray-700 rounded-lg my-2 p-4 shadow ${selectedRow === vpc.id ? 'bg-blue-100 dark:bg-[#00437b]' : 'bg-white dark:bg-black'}`}
                                                        onClick={() => {
                                                            setSelectedRow(vpc.id);
                                                            setSelectedVpcId(vpc.id);
                                                        }}
                                                        onDoubleClick={() => {
                                                            handleOpenModal(vpc, setSelectedVpc, setIsModalOpen);
                                                        }}>
                                                        <span className="w-1/4 px-4 py-2 flex text-center justify-center">{vpc.name}</span>
                                                        <span className="w-1/4 px-4 py-2 flex text-center justify-center">{vpc.id}</span>
                                                        <span className="w-1/4 px-4 py-2 flex text-center justify-center">{vpc.accountId}</span>
                                                        <span className="w-1/4 px-4 py-2 flex text-center justify-center">{vpc.region}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                            {sortedData(vpcSearch, sortConfig).map((vpc, idx) => (
                                                <ResourceCard
                                                    key={idx}
                                                    fields={[
                                                        { label: '', value: vpc.name || vpc.id, isHeader: true },
                                                        { label: 'ID', value: vpc.id, isMono: false },
                                                        { label: 'Account', value: vpc.accountId, isMono: false },
                                                        { label: 'Region', value: vpc.region },
                                                        { label: 'IPv4 CIDR', value: vpc.ipv4 || 'N/A', isMono: false },
                                                        vpc.ipv6 ? { label: 'IPv6 CIDR', value: vpc.ipv6, isMono: false } : null,
                                                    ].filter(Boolean) as any[]}
                                                    isSelected={selectedRow === vpc.id}
                                                    onClick={() => {
                                                        setSelectedRow(vpc.id);
                                                        setSelectedVpcId(vpc.id);
                                                    }}
                                                    onDoubleClick={() => {
                                                        handleOpenModal(vpc, setSelectedVpc, setIsModalOpen);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <VpcModal
                                        isModalOpen={isModalOpen && selectedView === 'VPC'}
                                        onRequestClose={() => setIsModalOpen(false)}
                                        selectedVpc={selectedVpc}
                                    />
                                </div>
                            );
                        case 'Security Group':
                            return (
                                <div>
                                    {viewMode === 'table' ? (
                                        <div className="space-y-4">
                                            <div className="dark:bg-black dark:border-black border-b border-1 border-[#E5E7EB] table-header flex justify-between text-left text-sm font-medium text-gray-700 rounded-lg">
                                        <span onClick={() => handleSortClick('name')} className="w-1/4 px-4 py-2 text-center cursor-pointer">Name</span>
                                        <span onClick={() => handleSortClick('id')} className="w-1/4 px-2 py-2 text-center cursor-pointer">ID</span>
                                        <span onClick={() => handleSortClick('accountId')} className="w-1/4 px-2 py-2 text-center cursor-pointer">Account ID</span>
                                        <span onClick={() => handleSortClick('vpcId')} className="w-1/4 px-2 py-2 text-center cursor-pointer">VPC ID</span>
                                    </div>
                                    <div className={`space-y-2 ${selectedVpcId ? 'ring-1 ring-blue-200 dark:ring-blue-800 rounded-lg p-4' : ''}`}>
                                        {sortedData(sgSearch, sortConfig).map((group, idx) => (
                                            <div
                                                key={group.id || idx}
                                                className={`unselectable cursor-pointer dark:bg-black dark:text-white flex items-center justify-between text-left text-sm font-medium text-gray-700 rounded-lg my-2 p-4 shadow ${selectedRow === group.id ? 'bg-blue-100 dark:bg-[#00437b]' : 'bg-white dark:bg-black'}`}
                                                onClick={() => {
                                                    setSelectedRow(group.id);
                                                }}
                                                onDoubleClick={() => {
                                                    handleOpenModal(group, setSelectedVpc, setIsModalOpen);
                                                }}
                                            >
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.name || 'N/A'}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.id}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.accountId}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.vpcId || 'N/A'}</span>
                                            </div>
                                        ))}
                                        {sgSearch.length === 0 && searchTerm && (
                                            <div className="text-center p-4 text-gray-500 dark:text-gray-400">No security groups found matching your search criteria.</div>
                                        )}
                                        {vpcResourceSecurityGroups.length === 0 && !searchTerm && (
                                            <div className="text-center p-4 text-gray-500 dark:text-gray-400">No security groups loaded. Check provider/account selection or wait for data.</div>
                                        )}
                                    </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                            {sortedData(sgSearch, sortConfig).map((group, idx) => (
                                                <ResourceCard
                                                    key={idx}
                                                    fields={[
                                                        { label: '', value: group.name || group.id, isHeader: true },
                                                        { label: 'ID', value: group.id, isMono: false },
                                                        { label: 'Account', value: group.accountId, isMono: false },
                                                        { label: 'VPC', value: group.vpcId || 'N/A', isMono: false },
                                                        { label: 'Rules Count', value: (group.inboundRules?.length || 0) + (group.outboundRules?.length || 0), isMono: false }
                                                    ]}
                                                    isSelected={selectedRow === group.id}
                                                    onClick={() => {
                                                        setSelectedRow(group.id);
                                                    }}
                                                    onDoubleClick={() => {
                                                        handleOpenModal(group, setSelectedVpc, setIsModalOpen);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <SecurityGroupModal
                                        isModalOpen={isModalOpen && selectedView === 'Security Group'}
                                        onRequestClose={() => setIsModalOpen(false)}
                                        selectedSecurityGroup={selectedVpc}
                                    />
                                </div>
                            );
                        case 'Load Balancer':
                            return (
                                <div>
                                    {viewMode === 'table' ? (
                                        <div>
                                            <div className="dark:bg-black dark:border-black border-b border-1 border-[#E5E7EB] table-header flex justify-between text-left text-sm font-medium text-gray-700 rounded-lg">
                                        <span onClick={() => handleSortClick('name')} className="w-1/6 px-4 py-2 text-center cursor-pointer">Name</span>
                                        <span onClick={() => handleSortClick('id')} className="w-1/6 px-2 py-2 text-center cursor-pointer">ID</span>
                                        <span onClick={() => handleSortClick('ipAddress')} className="w-1/6 px-2 py-2 text-center cursor-pointer">IP Address</span>
                                        <span onClick={() => handleSortClick('type')} className="w-1/6 px-2 py-2 text-center cursor-pointer">Type</span>
                                        <span onClick={() => handleSortClick('state')} className="w-1/6 px-2 py-2 text-center cursor-pointer">State</span>
                                        <span onClick={() => handleSortClick('vpcId')} className="w-1/6 px-2 py-2 text-center cursor-pointer">VPC ID</span>
                                    </div>
                                    <div>
                                        {sortedData(lbSearch, sortConfig).map((lb, idx) => (
                                            <div
                                                key={lb.id || idx}
                                                className={`unselectable cursor-pointer dark:bg-black dark:text-white flex items-center justify-between text-left text-sm font-medium text-gray-700 rounded-lg my-2 p-4 shadow ${selectedRow === lb.id ? 'bg-blue-100 dark:bg-[#00437b]' : 'bg-white dark:bg-black'}`}
                                                onClick={() => {
                                                    setSelectedRow(lb.id);
                                                }}
                                                onDoubleClick={() => {
                                                    handleOpenModal(lb, setSelectedVpc, setIsModalOpen);
                                                }}
                                            >
                                                <span className="w-1/6 px-4 py-2 flex text-center justify-center">{lb.name || 'N/A'}</span>
                                                <span className="w-1/6 px-4 py-2 flex text-center justify-center">{lb.id}</span>
                                                <span className="w-1/6 px-4 py-2 flex text-center justify-center">{lb.ipAddress || 'N/A'}</span>
                                                <span className="w-1/6 px-4 py-2 flex text-center justify-center">{lb.type || 'N/A'}</span>
                                                <span className="w-1/6 px-4 py-2 flex text-center justify-center">{lb.state || 'N/A'}</span>
                                                <span className="w-1/6 px-2 py-2 flex text-center justify-center">{lb.vpcId || 'N/A'}</span>
                                            </div>
                                        ))}
                                        {lbSearch.length === 0 && searchTerm && (
                                            <div className="text-center p-4 text-gray-500 dark:text-gray-400">No load balancers found matching your search criteria.</div>
                                        )}
                                        {vpcResourceLoadBalancers.length === 0 && !searchTerm && (
                                            <div className="text-center p-4 text-gray-500 dark:text-gray-400">No load balancers loaded. Check provider/account selection or wait for data.</div>
                                        )}
                                    </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                            {sortedData(lbSearch, sortConfig).map((lb, idx) => (
                                                <ResourceCard
                                                    key={idx}
                                                    fields={[
                                                        { label: '', value: lb.name || lb.id, isHeader: true },
                                                        { label: 'ID', value: lb.id, isMono: false },
                                                        { label: 'IP Address', value: lb.ipAddress || 'N/A', isMono: false },
                                                        { label: 'Type', value: lb.type || 'N/A', isMono: false },
                                                        { label: 'State', value: lb.state || 'N/A', isMono: false },
                                                        { label: 'VPC', value: lb.vpcId || 'N/A', isMono: false }
                                                    ]}
                                                    isSelected={selectedRow === lb.id}
                                                    onClick={() => {
                                                        setSelectedRow(lb.id);
                                                    }}
                                                    onDoubleClick={() => {
                                                        handleOpenModal(lb, setSelectedVpc, setIsModalOpen);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <LoadBalancerModal
                                        isModalOpen={isModalOpen && selectedView === 'Load Balancer'}
                                        onRequestClose={() => setIsModalOpen(false)}
                                        selectedLoadBalancer={selectedVpc}
                                    />
                                </div>
                            );
                        case 'VM':
                            return (
                                <div>
                                    {viewMode === 'table' ? (
                                        <div>
                                            <div className="dark:bg-black dark:border-black border-b border-1 border-[#E5E7EB] table-header flex justify-between text-left text-sm font-medium text-gray-700 rounded-lg">
                                                <span onClick={() => handleSortClick('name')} className="w-1/6 px-4 py-2 text-center cursor-pointer">Name</span>
                                                <span onClick={() => handleSortClick('id')} className="w-1/6 px-4 py-2 text-center cursor-pointer">ID</span>
                                                <span onClick={() => handleSortClick('state')} className="w-1/6 px-4 py-2 text-center cursor-pointer">Status</span>
                                                <span onClick={() => handleSortClick('accountId')} className="w-1/6 px-4 py-2 text-center cursor-pointer">Account ID</span>
                                                <span onClick={() => handleSortClick('vpcId')} className="w-1/6 px-4 py-2 text-center cursor-pointer">VPC ID</span>
                                                <span onClick={() => handleSortClick('provider')} className="w-1/6 px-4 py-2 text-center cursor-pointer">Provider</span>
                                            </div>
                                            <div>
                                                {sortedVms.map((row, key) => (
                                                    <div
                                                        key={key}
                                                        className={`unselectable cursor-pointer dark:bg-black dark:text-white flex items-center justify-between text-left text-sm font-medium text-gray-700 rounded-lg my-2 p-4 shadow ${selectedRow === row.id ? 'bg-blue-100 dark:bg-[#00437b]' : 'bg-white dark:bg-black'}`}
                                                        onClick={() => setSelectedRow(row.id)}
                                                        onDoubleClick={() => handleOpenModal(row, setSelectedVpc, setIsModalOpen)}
                                                    >
                                                        <span className="w-1/6 px-4 py-2 flex text-center justify-center">{row.name || 'N/A'}</span>
                                                        <span className="w-1/6 px-4 py-2 flex text-center justify-center">{row.id || 'N/A'}</span>
                                                        <span className="w-1/6 px-4 py-2 flex text-center justify-center">{row.state || 'N/A'}</span>
                                                        <span className="w-1/6 px-4 py-2 flex text-center justify-center">{row.accountId || 'N/A'}</span>
                                                        <span className="w-1/6 px-4 py-2 flex text-center justify-center">{row.vpcId || 'N/A'}</span>
                                                        <span className="w-1/6 px-4 py-2 flex text-center justify-center">{row.provider || 'N/A'}</span>
                                                    </div>
                                                ))}
                                                {sortedVms.length === 0 && searchTerm && (
                                                    <div className="text-center p-4 text-gray-500 dark:text-gray-400">No VMs found matching your search criteria.</div>
                                                )}
                                                {sortedVms.length === 0 && !searchTerm && (
                                                    <div className="text-center p-4 text-gray-500 dark:text-gray-400">No VMs loaded. Check provider/account selection or wait for data.</div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                            {sortedVms.map((vm, idx) => (
                                                <ResourceCard
                                                    key={idx}
                                                    fields={[
                                                        { label: '', value: vm.name || vm.id, isHeader: true },
                                                        { label: 'ID', value: vm.id || 'N/A', isMono: false },
                                                        { label: 'Status', value: vm.state || 'N/A', isMono: false },
                                                        { label: 'Account', value: vm.accountId || 'N/A', isMono: false },
                                                        { label: 'VPC', value: vm.vpcId || 'N/A', isMono: false },
                                                        { label: 'Provider', value: vm.provider || 'N/A', isMono: false }
                                                    ]}
                                                    isSelected={selectedRow === vm.id}
                                                    onClick={() => setSelectedRow(vm.id)}
                                                    onDoubleClick={() => handleOpenModal(vm, setSelectedVpc, setIsModalOpen)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <VMModal
                                        isModalOpen={isModalOpen && selectedView === 'VM'}
                                        onRequestClose={() => setIsModalOpen(false)}
                                        selectedVpc={selectedVpc}
                                    />
                                </div>
                            );
                        case 'Subnet':
                            return (
                                <div>
                                    {viewMode === 'table' ? (
                                        <div>
                                            <div className="dark:bg-black dark:border-black border-b border-1 border-[#E5E7EB] table-header flex justify-between text-left text-sm font-medium text-gray-700 rounded-lg">
                                                <span onClick={() => handleSortClick('name')} className="w-1/5 px-2 py-2 text-center cursor-pointer">Name</span>
                                                <span onClick={() => handleSortClick('id')} className="w-1/5 px-4 py-2 text-center cursor-pointer">ID</span>
                                                <span onClick={() => handleSortClick('accountId')} className="w-1/5 px-1 py-2 text-center cursor-pointer">Account ID</span>
                                                <span onClick={() => handleSortClick('vpcId')} className="w-1/5 px-1 py-2 text-center cursor-pointer">VPC ID</span>
                                                <span onClick={() => handleSortClick('provider')} className="w-1/5 px-1 py-2 text-center cursor-pointer">Provider</span>
                                            </div>
                                            <div>
                                                {sortedData(subnetSearch, sortConfig).map((subnet, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`unselectable cursor-pointer dark:bg-black dark:text-white flex items-center justify-between text-left text-sm font-medium text-gray-700 rounded-lg my-2 p-4 shadow ${selectedRow === subnet.id ? 'bg-blue-100 dark:bg-[#00437b]' : 'bg-white dark:bg-black'}`}
                                                        onClick={() => {
                                                            setSelectedRow(subnet.id);
                                                        }}
                                                        onDoubleClick={() => {
                                                            handleOpenModal(subnet, setSelectedVpc, setIsModalOpen);
                                                        }}
                                                    >
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{subnet.name || 'N/A'}</span>
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{subnet.id}</span>
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{subnet.accountId}</span>
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{subnet.vpcId}</span>
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{subnet.provider}</span>
                                                    </div>
                                                ))}
                                                {subnetSearch.length === 0 && searchTerm && (
                                                    <div className="text-center p-4 text-gray-500 dark:text-gray-400">No subnets found matching your search criteria.</div>
                                                )}
                                                {subnetSearch.length === 0 && !searchTerm && (
                                                    <div className="text-center p-4 text-gray-500 dark:text-gray-400">No subnets loaded. Check provider/account selection or wait for data.</div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                            {sortedData(subnetSearch, sortConfig).map((subnet, idx) => (
                                                <ResourceCard
                                                    key={idx}
                                                    fields={[
                                                        { label: '', value: subnet.name || subnet.id, isHeader: true },
                                                        { label: 'ID', value: subnet.id, isMono: false },
                                                        { label: 'Account', value: subnet.accountId, isMono: false },
                                                        { label: 'VPC', value: subnet.vpcId, isMono: false },
                                                        { label: 'Provider', value: subnet.provider, isMono: false }
                                                    ]}
                                                    isSelected={selectedRow === subnet.id}
                                                    onClick={() => {
                                                        setSelectedRow(subnet.id);
                                                    }}
                                                    onDoubleClick={() => {
                                                        handleOpenModal(subnet, setSelectedVpc, setIsModalOpen);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <SubnetModal
                                        isModalOpen={isModalOpen}
                                        onRequestClose={() => setIsModalOpen(false)}
                                        selectedSubnet={selectedVpc}
                                    />
                                </div>
                            );
                        case "ACL":
                            return (
                                <div>
                                    {viewMode === 'table' ? (
                                        <div>
                                            <div className="dark:bg-black dark:border-black border-b border-1 border-[#E5E7EB] table-header flex justify-between text-left text-sm font-medium text-gray-700 rounded-lg">
                                                <span onClick={() => handleSortClick('id')} className="w-1/4 px-2 py-2 text-center cursor-pointer">ID</span>
                                                <span onClick={() => handleSortClick('accountId')} className="w-1/4 px-1 py-2 text-center cursor-pointer">Account ID</span>
                                                <span onClick={() => handleSortClick('vpcId')} className="w-1/4 px-2 py-2 text-center cursor-pointer">VPC ID</span>
                                                <span onClick={() => handleSortClick('provider')} className="w-1/4 px-1 py-2 text-center cursor-pointer">Provider</span>
                                            </div>
                                            <div>
                                                {sortedData(aclSearch, sortConfig).map((acl, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`unselectable cursor-pointer dark:bg-black dark:text-white flex items-center justify-between text-left text-sm font-medium text-gray-700 rounded-lg my-2 p-4 shadow ${selectedRow === acl.id ? 'bg-blue-100 dark:bg-[#00437b]' : 'bg-white dark:bg-black'}`}
                                                        onClick={() => {
                                                            setSelectedRow(acl.id);
                                                        }}
                                                        onDoubleClick={() => {
                                                            handleOpenModal(acl, setSelectedVpc, setIsModalOpen);
                                                        }}
                                                    >
                                                        <span className="w-1/4 px-4 py-2 flex text-center justify-center">{acl.id}</span>
                                                        <span className="w-1/4 px-4 py-2 flex text-center justify-center">{acl.accountId}</span>
                                                        <span className="w-1/4 px-4 py-2 flex text-center justify-center">{acl.vpcId}</span>
                                                        <span className="w-1/4 px-4 py-2 flex text-center justify-center">{acl.provider}</span>
                                                    </div>
                                                ))}
                                                {aclSearch.length === 0 && searchTerm && (
                                                    <div className="text-center p-4 text-gray-500 dark:text-gray-400">No ACLs found matching your search criteria.</div>
                                                )}
                                                {aclSearch.length === 0 && !searchTerm && (
                                                    <div className="text-center p-4 text-gray-500 dark:text-gray-400">No ACLs loaded. Check provider/account selection or wait for data.</div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                            {sortedData(aclSearch, sortConfig).map((acl, idx) => (
                                                <ResourceCard
                                                    key={idx}
                                                    fields={[
                                                        { label: '', value: acl.id, isHeader: true },
                                                        { label: 'Account', value: acl.accountId, isMono: false },
                                                        { label: 'VPC', value: acl.vpcId, isMono: false },
                                                        { label: 'Provider', value: acl.provider, isMono: false },
                                                        { label: 'Rules Count', value: (acl.inboundRules?.length || 0) + (acl.outboundRules?.length || 0), isMono: false }
                                                    ]}
                                                    isSelected={selectedRow === acl.id}
                                                    onClick={() => {
                                                        setSelectedRow(acl.id);
                                                    }}
                                                    onDoubleClick={() => {
                                                        handleOpenModal(acl, setSelectedVpc, setIsModalOpen);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <ACLModal
                                        isModalOpen={isModalOpen && selectedView === 'ACL'}
                                        onRequestClose={() => setIsModalOpen(false)}
                                        selectedACL={selectedVpc}
                                    />
                                </div>
                            );
                        case "Route Table":
                            return (
                                <div>
                                    {viewMode === 'table' ? (
                                        <div>
                                            <div className="dark:bg-black dark:border-black border-b border-1 border-[#E5E7EB] table-header flex justify-between text-left text-sm font-medium text-gray-700 rounded-lg">
                                                <span onClick={() => handleSortClick('name')} className="w-1/5 px-4 py-2 text-center cursor-pointer">Name</span>
                                                <span onClick={() => handleSortClick('id')} className="w-1/5 px-2 py-2 text-center cursor-pointer">ID</span>
                                                <span onClick={() => handleSortClick('accountId')} className="w-1/5 px-1 py-2 text-center cursor-pointer">Account ID</span>
                                                <span onClick={() => handleSortClick('vpcId')} className="w-1/5 px-2 py-2 text-center cursor-pointer">VPC ID</span>
                                                <span onClick={() => handleSortClick('provider')} className="w-1/5 px-1 py-2 text-center cursor-pointer">Provider</span>
                                            </div>
                                            <div>
                                                {sortedData(routeTableSearch, sortConfig).map((route, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`unselectable cursor-pointer dark:bg-black dark:text-white flex items-center justify-between text-left text-sm font-medium text-gray-700 rounded-lg my-2 p-4 shadow ${selectedRow === route.id ? 'bg-blue-100 dark:bg-[#00437b]' : 'bg-white dark:bg-black'}`}
                                                        onClick={() => {
                                                            setSelectedRow(route.id);
                                                        }}
                                                        onDoubleClick={() => {
                                                            handleOpenModal(route, setSelectedVpc, setIsModalOpen);
                                                        }}
                                                    >
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{route.name || 'N/A'}</span>
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{route.id}</span>
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{route.accountId}</span>
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{route.vpcId}</span>
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{route.provider}</span>
                                                    </div>
                                                ))}
                                                {routeTableSearch.length === 0 && searchTerm && (
                                                    <div className="text-center p-4 text-gray-500 dark:text-gray-400">No route tables found matching your search criteria.</div>
                                                )}
                                                {routeTableSearch.length === 0 && !searchTerm && (
                                                    <div className="text-center p-4 text-gray-500 dark:text-gray-400">No route tables loaded. Check provider/account selection or wait for data.</div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                            {sortedData(routeTableSearch, sortConfig).map((route, idx) => (
                                                <ResourceCard
                                                    key={idx}
                                                    fields={[
                                                        { label: '', value: route.name || route.id, isHeader: true },
                                                        { label: 'ID', value: route.id, isMono: false },
                                                        { label: 'Account', value: route.accountId, isMono: false },
                                                        { label: 'VPC', value: route.vpcId, isMono: false },
                                                        { label: 'Provider', value: route.provider, isMono: false },
                                                        { label: 'Routes Count', value: route.routes?.length || 0, isMono: false }
                                                    ]}
                                                    isSelected={selectedRow === route.id}
                                                    onClick={() => {
                                                        setSelectedRow(route.id);
                                                    }}
                                                    onDoubleClick={() => {
                                                        handleOpenModal(route, setSelectedVpc, setIsModalOpen);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <RouteTableModal
                                        isModalOpen={isModalOpen && selectedView === 'Route Table'}
                                        onRequestClose={() => setIsModalOpen(false)}
                                        selectedRouteTable={selectedVpc}
                                    />
                                </div>
                            );
                        case "VPC Endpoint":
                            return (
                                <div>
                                    {viewMode === 'table' ? (
                                        <div>
                                            <div className="dark:bg-black dark:border-black border-b border-1 border-[#E5E7EB] table-header flex justify-between text-left text-sm font-medium text-gray-700 rounded-lg">
                                                <span onClick={() => handleSortClick('name')} className="w-1/5 px-4 py-2 text-center cursor-pointer">Name</span>
                                                <span onClick={() => handleSortClick('id')} className="w-1/5 px-2 py-2 text-center cursor-pointer">ID</span>
                                                <span onClick={() => handleSortClick('service')} className="w-1/5 px-2 py-2 text-center cursor-pointer">Service</span>
                                                <span onClick={() => handleSortClick('vpcId')} className="w-1/5 px-2 py-2 text-center cursor-pointer">VPC ID</span>
                                                <span onClick={() => handleSortClick('provider')} className="w-1/5 px-1 py-2 text-center cursor-pointer">Provider</span>
                                            </div>
                                            <div>
                                                {sortedData(vpcResourceVpcEndpoints, sortConfig).map((endpoint, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`unselectable cursor-pointer dark:bg-black dark:text-white flex items-center justify-between text-left text-sm font-medium text-gray-700 rounded-lg my-2 p-4 shadow ${selectedRow === endpoint.id ? 'bg-blue-100 dark:bg-[#00437b]' : 'bg-white dark:bg-black'}`}
                                                        onClick={() => {
                                                            setSelectedRow(endpoint.id);
                                                        }}
                                                        onDoubleClick={() => {
                                                            handleOpenModal(endpoint, setSelectedVpc, setIsModalOpen);
                                                        }}
                                                    >
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{endpoint.name || 'N/A'}</span>
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{endpoint.id}</span>
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{endpoint.service || 'N/A'}</span>
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{endpoint.vpcId || 'N/A'}</span>
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{endpoint.provider || 'N/A'}</span>
                                                    </div>
                                                ))}
                                                {vpcResourceVpcEndpoints.length === 0 && searchTerm && (
                                                    <div className="text-center p-4 text-gray-500 dark:text-gray-400">No VPC endpoints found matching your search criteria.</div>
                                                )}
                                                {vpcResourceVpcEndpoints.length === 0 && !searchTerm && (
                                                    <div className="text-center p-4 text-gray-500 dark:text-gray-400">No VPC endpoints loaded. Check provider/account selection or wait for data.</div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                            {sortedData(vpcResourceVpcEndpoints, sortConfig).map((endpoint, idx) => (
                                                <ResourceCard
                                                    key={idx}
                                                    fields={[
                                                        { label: '', value: endpoint.name || endpoint.id, isHeader: true },
                                                        { label: 'ID', value: endpoint.id, isMono: false },
                                                        { label: 'Service', value: endpoint.service || 'N/A', isMono: false },
                                                        { label: 'VPC', value: endpoint.vpcId || 'N/A', isMono: false },
                                                        { label: 'Provider', value: endpoint.provider || 'N/A', isMono: false },
                                                        { label: 'State', value: endpoint.state || 'N/A', isMono: false }
                                                    ]}
                                                    isSelected={selectedRow === endpoint.id}
                                                    onClick={() => {
                                                        setSelectedRow(endpoint.id);
                                                    }}
                                                    onDoubleClick={() => {
                                                        handleOpenModal(endpoint, setSelectedVpc, setIsModalOpen);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <VpcEndpointModal
                                        isModalOpen={isModalOpen && selectedView === 'VPC Endpoint'}
                                        onRequestClose={() => setIsModalOpen(false)}
                                        selectedVpcEndpoint={selectedVpc}
                                    />
                                </div>
                            );
                        case 'NAT Gateway':
                            return (
                                <div>
                                    {viewMode === 'table' ? (
                                        <div>
                                            <div className="dark:bg-black dark:border-black border-b border-1 border-[#E5E7EB] table-header flex justify-between text-left text-sm font-medium text-gray-700 rounded-lg">
                                                <span onClick={() => handleSortClick('name')} className="w-1/6 px-4 py-2 text-center cursor-pointer">Name</span>
                                                <span onClick={() => handleSortClick('id')} className="w-1/6 px-2 py-2 text-center cursor-pointer">ID</span>
                                                <span onClick={() => handleSortClick('state')} className="w-1/6 px-2 py-2 text-center cursor-pointer">State</span>
                                                <span onClick={() => handleSortClick('publicIp')} className="w-1/6 px-2 py-2 text-center cursor-pointer">Public IP</span>
                                                <span onClick={() => handleSortClick('privateIp')} className="w-1/6 px-2 py-2 text-center cursor-pointer">Private IP</span>
                                                <span onClick={() => handleSortClick('vpcId')} className="w-1/6 px-2 py-2 text-center cursor-pointer">VPC ID</span>
                                            </div>
                                            <div>
                                                {sortedData(natGatewaysSearch, sortConfig).map((natGw, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`unselectable cursor-pointer dark:bg-black dark:text-white flex items-center justify-between text-left text-sm font-medium text-gray-700 rounded-lg my-2 p-4 shadow ${selectedRow === natGw.id ? 'bg-blue-100 dark:bg-[#00437b]' : 'bg-white dark:bg-black'}`}
                                                        onClick={() => {
                                                            setSelectedRow(natGw.id);
                                                        }}
                                                        onDoubleClick={() => {
                                                            handleOpenModal(natGw, setSelectedVpc, setIsModalOpen);
                                                        }}
                                                    >
                                                        <span className="w-1/6 px-4 py-2 flex text-center justify-center">{natGw.name || 'N/A'}</span>
                                                        <span className="w-1/6 px-4 py-2 flex text-center justify-center">{natGw.id}</span>
                                                        <span className="w-1/6 px-4 py-2 flex text-center justify-center">{natGw.state || 'N/A'}</span>
                                                        <span className="w-1/6 px-4 py-2 flex text-center justify-center">{natGw.publicIp || 'N/A'}</span>
                                                        <span className="w-1/6 px-4 py-2 flex text-center justify-center">{natGw.privateIp || 'N/A'}</span>
                                                        <span className="w-1/6 px-4 py-2 flex text-center justify-center">{natGw.vpcId || 'N/A'}</span>
                                                    </div>
                                                ))}
                                                {natGatewaysSearch.length === 0 && searchTerm && (
                                                    <div className="text-center p-4 text-gray-500 dark:text-gray-400">No NAT gateways found matching your search criteria.</div>
                                                )}
                                                {natGatewaysSearch.length === 0 && !searchTerm && (
                                                    <div className="text-center p-4 text-gray-500 dark:text-gray-400">No NAT gateways loaded. Check provider/account selection or wait for data.</div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                            {sortedData(natGatewaysSearch, sortConfig).map((natGw, idx) => (
                                                <ResourceCard
                                                    key={idx}
                                                    fields={[
                                                        { label: '', value: natGw.name || natGw.id, isHeader: true },
                                                        { label: 'ID', value: natGw.id, isMono: false },
                                                        { label: 'State', value: natGw.state || 'N/A', isMono: false },
                                                        { label: 'Public IP', value: natGw.publicIp || 'N/A', isMono: false },
                                                        { label: 'Private IP', value: natGw.privateIp || 'N/A', isMono: false },
                                                        { label: 'VPC', value: natGw.vpcId || 'N/A', isMono: false }
                                                    ]}
                                                    isSelected={selectedRow === natGw.id}
                                                    onClick={() => {
                                                        setSelectedRow(natGw.id);
                                                    }}
                                                    onDoubleClick={() => {
                                                        handleOpenModal(natGw, setSelectedVpc, setIsModalOpen);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <NatGatewayModal
                                        isModalOpen={isModalOpen && selectedView === 'NAT Gateway'}
                                        onRequestClose={() => setIsModalOpen(false)}
                                        selectedNATGateway={selectedVpc}
                                    />
                                </div>
                            );
                        case 'Internet Gateway':
                            return (
                                <div>
                                    {viewMode === 'table' ? (
                                        <div>
                                            <div className="dark:bg-black dark:border-black border-b border-1 border-[#E5E7EB] table-header flex justify-between text-left text-sm font-medium text-gray-700 rounded-lg">
                                                <span onClick={() => handleSortClick('name')} className="w-1/5 px-4 py-2 text-center cursor-pointer">Name</span>
                                                <span onClick={() => handleSortClick('id')} className="w-1/5 px-2 py-2 text-center cursor-pointer">ID</span>
                                                <span onClick={() => handleSortClick('state')} className="w-1/5 px-2 py-2 text-center cursor-pointer">State</span>
                                                <span onClick={() => handleSortClick('vpcId')} className="w-1/5 px-2 py-2 text-center cursor-pointer">VPC ID</span>
                                                <span onClick={() => handleSortClick('provider')} className="w-1/5 px-1 py-2 text-center cursor-pointer">Provider</span>
                                            </div>
                                            <div>
                                                {sortedData(vpcResourceInternetGateways, sortConfig).map((igw, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`unselectable cursor-pointer dark:bg-black dark:text-white flex items-center justify-between text-left text-sm font-medium text-gray-700 rounded-lg my-2 p-4 shadow ${selectedRow === igw.id ? 'bg-blue-100 dark:bg-[#00437b]' : 'bg-white dark:bg-black'}`}
                                                        onClick={() => {
                                                            setSelectedRow(igw.id);
                                                        }}
                                                        onDoubleClick={() => {
                                                            handleOpenModal(igw, setSelectedVpc, setIsModalOpen);
                                                        }}
                                                    >
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{igw.name || 'N/A'}</span>
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{igw.id}</span>
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{igw.state || 'N/A'}</span>
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{igw.vpcId || 'N/A'}</span>
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{igw.provider || 'N/A'}</span>
                                                    </div>
                                                ))}
                                                {vpcResourceInternetGateways.length === 0 && searchTerm && (
                                                    <div className="text-center p-4 text-gray-500 dark:text-gray-400">No internet gateways found matching your search criteria.</div>
                                                )}
                                                {vpcResourceInternetGateways.length === 0 && !searchTerm && (
                                                    <div className="text-center p-4 text-gray-500 dark:text-gray-400">No internet gateways loaded. Check provider/account selection or wait for data.</div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                            {sortedData(vpcResourceInternetGateways, sortConfig).map((igw, idx) => (
                                                <ResourceCard
                                                    key={idx}
                                                    fields={[
                                                        { label: '', value: igw.name || igw.id, isHeader: true },
                                                        { label: 'ID', value: igw.id, isMono: false },
                                                        { label: 'State', value: igw.state || 'N/A', isMono: false },
                                                        { label: 'VPC', value: igw.vpcId || 'N/A', isMono: false },
                                                        { label: 'Provider', value: igw.provider || 'N/A', isMono: false }
                                                    ]}
                                                    isSelected={selectedRow === igw.id}
                                                    onClick={() => {
                                                        setSelectedRow(igw.id);
                                                    }}
                                                    onDoubleClick={() => {
                                                        handleOpenModal(igw, setSelectedVpc, setIsModalOpen);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <InternetGatewayModal
                                        isModalOpen={isModalOpen && selectedView === 'Internet Gateway'}
                                        onRequestClose={() => setIsModalOpen(false)}
                                        selectedIGW={selectedVpc}
                                    />
                                </div>
                            );
                        case 'Public IP':
                            return (
                                <div>
                                    {viewMode === 'table' ? (
                                        <div>
                                            <div className="dark:bg-black dark:border-black border-b border-1 border-[#E5E7EB] table-header flex justify-between text-left text-sm font-medium text-gray-700 rounded-lg">
                                                <span onClick={() => handleSortClick('name')} className="w-1/5 px-4 py-2 text-center cursor-pointer">Name</span>
                                                <span onClick={() => handleSortClick('id')} className="w-1/5 px-2 py-2 text-center cursor-pointer">ID</span>
                                                <span onClick={() => handleSortClick('ip')} className="w-1/5 px-2 py-2 text-center cursor-pointer">IP Address</span>
                                                <span onClick={() => handleSortClick('vpcId')} className="w-1/5 px-2 py-2 text-center cursor-pointer">VPC ID</span>
                                                <span onClick={() => handleSortClick('provider')} className="w-1/5 px-1 py-2 text-center cursor-pointer">Provider</span>
                                            </div>
                                            <div>
                                                {sortedData(vpcResourcePublicIPs, sortConfig).map((publicIP, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`unselectable cursor-pointer dark:bg-black dark:text-white flex items-center justify-between text-left text-sm font-medium text-gray-700 rounded-lg my-2 p-4 shadow ${selectedRow === publicIP.id ? 'bg-blue-100 dark:bg-[#00437b]' : 'bg-white dark:bg-black'}`}
                                                        onClick={() => {
                                                            setSelectedRow(publicIP.id);
                                                        }}
                                                        onDoubleClick={() => {
                                                            handleOpenModal(publicIP, setSelectedVpc, setIsModalOpen);
                                                        }}
                                                    >
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{publicIP.name || 'N/A'}</span>
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{publicIP.id}</span>
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{publicIP.ip || 'N/A'}</span>
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{publicIP.vpcId || 'N/A'}</span>
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{publicIP.provider || 'N/A'}</span>
                                                    </div>
                                                ))}
                                                {vpcResourcePublicIPs.length === 0 && searchTerm && (
                                                    <div className="text-center p-4 text-gray-500 dark:text-gray-400">No public IPs found matching your search criteria.</div>
                                                )}
                                                {vpcResourcePublicIPs.length === 0 && !searchTerm && (
                                                    <div className="text-center p-4 text-gray-500 dark:text-gray-400">No public IPs loaded. Check provider/account selection or wait for data.</div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                            {sortedData(vpcResourcePublicIPs, sortConfig).map((publicIP, idx) => (
                                                <ResourceCard
                                                    key={idx}
                                                    fields={[
                                                        { label: '', value: publicIP.name || publicIP.id, isHeader: true },
                                                        { label: 'ID', value: publicIP.id, isMono: false },
                                                        { label: 'IP Address', value: publicIP.ip || 'N/A', isMono: true },
                                                        { label: 'VPC', value: publicIP.vpcId || 'N/A', isMono: false },
                                                        { label: 'Provider', value: publicIP.provider || 'N/A', isMono: false },
                                                        { label: 'Status', value: publicIP.state || 'N/A', isMono: false }
                                                    ]}
                                                    isSelected={selectedRow === publicIP.id}
                                                    onClick={() => {
                                                        setSelectedRow(publicIP.id);
                                                    }}
                                                    onDoubleClick={() => {
                                                        handleOpenModal(publicIP, setSelectedVpc, setIsModalOpen);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <PublicIPModal
                                        isModalOpen={isModalOpen && selectedView === 'Public IP'}
                                        onRequestClose={() => setIsModalOpen(false)}
                                        selectedPublicIp={selectedVpc}
                                    />
                                </div>
                            );
                        case 'Routers':
                            return (
                                <div>
                                    {viewMode === 'table' ? (
                                        <div>
                                            <div className="dark:bg-black dark:border-black border-b border-1 border-[#E5E7EB] table-header flex justify-between text-left text-sm font-medium text-gray-700 rounded-lg">
                                                <span onClick={() => handleSortClick('name')} className="w-1/5 px-4 py-2 text-center cursor-pointer">Name</span>
                                                <span onClick={() => handleSortClick('id')} className="w-1/5 px-2 py-2 text-center cursor-pointer">ID</span>
                                                <span onClick={() => handleSortClick('type')} className="w-1/5 px-2 py-2 text-center cursor-pointer">Type</span>
                                                <span onClick={() => handleSortClick('vpcId')} className="w-1/5 px-2 py-2 text-center cursor-pointer">VPC ID</span>
                                                <span onClick={() => handleSortClick('provider')} className="w-1/5 px-1 py-2 text-center cursor-pointer">Provider</span>
                                            </div>
                                            <div>
                                                {sortedData(vpcResourceRouters, sortConfig).map((router, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`unselectable cursor-pointer dark:bg-black dark:text-white flex items-center justify-between text-left text-sm font-medium text-gray-700 rounded-lg my-2 p-4 shadow ${selectedRow === router.id ? 'bg-blue-100 dark:bg-[#00437b]' : 'bg-white dark:bg-black'}`}
                                                        onClick={() => {
                                                            setSelectedRow(router.id);
                                                        }}
                                                        onDoubleClick={() => {
                                                            handleOpenModal(router, setSelectedVpc, setIsModalOpen);
                                                        }}
                                                    >
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{router.name || 'N/A'}</span>
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{router.id}</span>
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{router.type || 'N/A'}</span>
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{router.vpcId || 'N/A'}</span>
                                                        <span className="w-1/5 px-4 py-2 flex text-center justify-center">{router.provider || 'N/A'}</span>
                                                    </div>
                                                ))}
                                                {vpcResourceRouters.length === 0 && searchTerm && (
                                                    <div className="text-center p-4 text-gray-500 dark:text-gray-400">No routers found matching your search criteria.</div>
                                                )}
                                                {vpcResourceRouters.length === 0 && !searchTerm && (
                                                    <div className="text-center p-4 text-gray-500 dark:text-gray-400">No routers loaded. Check provider/account selection or wait for data.</div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                            {sortedData(vpcResourceRouters, sortConfig).map((router, idx) => (
                                                <ResourceCard
                                                    key={idx}
                                                    fields={[
                                                        { label: '', value: router.name || router.id, isHeader: true },
                                                        { label: 'ID', value: router.id, isMono: false },
                                                        { label: 'Type', value: router.type || 'N/A', isMono: false },
                                                        { label: 'VPC', value: router.vpcId || 'N/A', isMono: false },
                                                        { label: 'Provider', value: router.provider || 'N/A', isMono: false },
                                                        { label: 'Routes Count', value: router.routes?.length || 0, isMono: false }
                                                    ]}
                                                    isSelected={selectedRow === router.id}
                                                    onClick={() => {
                                                        setSelectedRow(router.id);
                                                    }}
                                                    onDoubleClick={() => {
                                                        handleOpenModal(router, setSelectedVpc, setIsModalOpen);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <RouterModal
                                        isModalOpen={isModalOpen && selectedView === 'Routers'}
                                        onRequestClose={() => setIsModalOpen(false)}
                                        selectedRouter={selectedVpc}
                                    />
                                </div>
                            );
                        case 'Overlapping IPs':
                            return (
                                <div>
                                    <CIDROverlapModal
                                        isModalOpen={isModalOpen}
                                        onRequestClose={() => setIsModalOpen(false)}
                                        overlappingCIDRs={overlappedCIDRs}
                                    />
                                </div>
                            );
                        default:
                            return null;
                    }
                })()}
            </div >
        </DefaultLayout >
    );
};

export default MultiCloudInfra;
