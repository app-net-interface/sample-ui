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

import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
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
import VpcContextBar from '@/components/common/VpcContextBar';
import { setInfraSelectedRow } from '@/store/infra-resources-slice/infraResourcesSlice';

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

const MultiCloudInfra = () => {
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
    const { selectedProvider, selectedAccountId, selectedRegion } = useSelector((state: RootState) => state.selectedResources);
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

    const vpcData = vpcs.map(vpc => ({
        id: vpc.id,
        accountId: vpc.accountId,
        name: vpc.name || '',
        region: vpc.region,
        ipv4: vpc.ipv4_cidr,
        ipv6: vpc.ipv6_cidr,
        labels: vpc["labels"],
        compliant: vpc.compliant,
        selfLink: vpc.selfLink,
        project: vpc.project,
    }));

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
        console.log('Overlapped CIDRs:', overlappedCIDRs);
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
            <div className="flex justify-between">
                <div className="flex flex-col w-1/3">
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="input-field dark:bg-black"
                        disabled={selectedView === 'Overlapping IPs'}
                    />
                </div>
                <ProviderButtons onProviderButtonClick={handleVPCView}></ProviderButtons>
            </div>
            
            <VpcContextBar vpc={selectedVpcData} onClear={handleClearVpcContext} />

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
                                    <VpcModal
                                        isModalOpen={isModalOpen}
                                        onRequestClose={() => setIsModalOpen(false)}
                                        selectedVpc={selectedVpc}
                                    />
                                </div>
                            );
                        case 'Security Group':
                            return (
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
                                                <span className="w-1/6 px-4 py-2 flex text-center justify-center">{lb.vpcId || 'N/A'}</span>
                                            </div>
                                        ))}
                                        {lbSearch.length === 0 && searchTerm && (
                                            <div className="text-center p-4 text-gray-500 dark:text-gray-400">No load balancers found matching your search criteria.</div>
                                        )}
                                        {vpcResourceLoadBalancers.length === 0 && !searchTerm && (
                                            <div className="text-center p-4 text-gray-500 dark:text-gray-400">No load balancers loaded. Check provider/account selection or wait for data.</div>
                                        )}
                                    </div>
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
                                    <div className="dark:bg-black dark:border-black border-b border-1 border-[#E5E7EB] table-header flex justify-between text-left text-sm font-medium text-gray-700 rounded-lg">
                                        <span onClick={() => handleSortClick('name')} className="w-1/4 px-2 py-2 text-center">Name</span>
                                        <span onClick={() => handleSortClick('id')} className="w-1/4 px-4 py-2 text-center">ID</span>
                                        <span onClick={() => handleSortClick('accountId')} className="w-1/4 px-1 py-2 text-center">Account ID</span>
                                        <span onClick={() => handleSortClick('vpcId')} className="w-1/4 px-1 py-2 text-center">VPC ID</span>
                                        <span onClick={() => handleSortClick('provider')} className="w-1/4 px-1 py-2 text-center">Provider</span>
                                    </div>
                                    <div>
                                        {sortedData(subnetSearch, sortConfig).map((group, idx) => (
                                            <div
                                                key={idx}
                                                className={`unselectable cursor-pointer dark:bg-black dark:text-white flex items-center justify-between text-left text-sm font-medium text-gray-700 rounded-lg my-2 p-4 shadow ${selectedRow === group.id ? 'bg-blue-100 dark:bg-[#00437b]' : 'bg-white dark:bg-black'}`}
                                                onClick={() => {
                                                    setSelectedRow(group.id);
                                                }}
                                                onDoubleClick={() => {
                                                    handleOpenModal(group, setSelectedVpc, setIsModalOpen);
                                                }}
                                            >
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.name}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.id}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.accountId}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.vpcId}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.provider}</span>
                                            </div>
                                        ))}
                                    </div>
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
                                    <div className="dark:bg-black dark:border-black border-b border-1 border-[#E5E7EB] table-header flex justify-between text-left text-sm font-medium text-gray-700 rounded-lg">
                                        <span onClick={() => handleSortClick('id')} className="w-1/4 px-2 py-2 text-center">ID</span>
                                        <span onClick={() => handleSortClick('accountId')} className="w-1/4 px-1 py-2 text-center">Account ID</span>
                                        <span onClick={() => handleSortClick('vpcId')} className="w-1/4 px-2 py-2 text-center">VPC ID</span>
                                        <span onClick={() => handleSortClick('provider')} className="w-1/4 px-1 py-2 text-center">Provider</span>
                                    </div>
                                    <div>
                                        {sortedData(aclSearch, sortConfig).map((group, idx) => (
                                            <div
                                                key={idx}
                                                className={`unselectable cursor-pointer dark:bg-black dark:text-white flex items-center justify-between text-left text-sm font-medium text-gray-700 rounded-lg my-2 p-4 shadow ${selectedRow === group.id ? 'bg-blue-100 dark:bg-[#00437b]' : 'bg-white dark:bg-black'}`}
                                                onClick={() => {
                                                    setSelectedRow(group.id);
                                                }}
                                                onDoubleClick={() => {
                                                    handleOpenModal(group, setSelectedVpc, setIsModalOpen);
                                                }}
                                            >
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.id}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.accountId}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.vpcId}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.provider}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <ACLModal
                                        isModalOpen={isModalOpen}
                                        onRequestClose={() => setIsModalOpen(false)}
                                        selectedACL={selectedVpc}
                                    />
                                </div>
                            );
                        case "Route Table":
                            return (
                                <div>
                                    <div className="dark:bg-black dark:border-black border-b border-1 border-[#E5E7EB] table-header flex justify-between text-left text-sm font-medium text-gray-700 rounded-lg">
                                        <span onClick={() => handleSortClick('name')} className="w-1/4 px-4 py-2 text-center">Name</span>
                                        <span onClick={() => handleSortClick('id')} className="w-1/4 px-2 py-2 text-center">ID</span>
                                        <span onClick={() => handleSortClick('accountId')} className="w-1/4 px-1 py-2 text-center">Account ID</span>
                                        <span onClick={() => handleSortClick('vpcId')} className="w-1/4 px-2 py-2 text-center">VPC ID</span>
                                        <span onClick={() => handleSortClick('provider')} className="w-1/4 px-1 py-2 text-center">Provider</span>
                                    </div>
                                    <div>
                                        {sortedData(routeTableSearch, sortConfig).map((group, idx) => (
                                            <div
                                                key={idx}
                                                className={`unselectable cursor-pointer dark:bg-black dark:text-white flex items-center justify-between text-left text-sm font-medium text-gray-700 rounded-lg my-2 p-4 shadow ${selectedRow === group.id ? 'bg-blue-100 dark:bg-[#00437b]' : 'bg-white dark:bg-black'}`}
                                                onClick={() => {
                                                    setSelectedRow(group.id);
                                                }}
                                                onDoubleClick={() => {
                                                    handleOpenModal(group, setSelectedVpc, setIsModalOpen);
                                                }}
                                            >
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.name}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.id}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.accountId}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.vpcId}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.provider}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <RouteTableModal
                                        isModalOpen={isModalOpen}
                                        onRequestClose={() => setIsModalOpen(false)}
                                        selectedRouteTable={selectedVpc}
                                    />
                                </div>
                            );
                        case "VPC Endpoint":
                            return (
                                <div>
                                    <div className="dark:bg-black dark:border-black border-b border-1 border-[#E5E7EB] table-header flex justify-between text-left text-sm font-medium text-gray-700 rounded-lg">
                                        <span onClick={() => handleSortClick('name')} className="w-1/4 px-4 py-2 text-center">Name</span>
                                        <span onClick={() => handleSortClick('id')} className="w-1/4 px-2 py-2 text-center">ID</span>
                                        <span onClick={() => handleSortClick('accountId')} className="w-1/4 px-1 py-2 text-center">Account ID</span>
                                        <span onClick={() => handleSortClick('vpcId')} className="w-1/4 px-2 py-2 text-center">VPC ID</span>
                                        <span onClick={() => handleSortClick('provider')} className="w-1/4 px-1 py-2 text-center">Provider</span>
                                    </div>
                                    <div>
                                        {sortedData(vpcEndpointSearch, sortConfig).map((group, idx) => (
                                            <div
                                                key={idx}
                                                className={`unselectable cursor-pointer dark:bg-black dark:text-white flex items-center justify-between text-left text-sm font-medium text-gray-700 rounded-lg my-2 p-4 shadow ${selectedRow === group.id ? 'bg-blue-100 dark:bg-[#00437b]' : 'bg-white dark:bg-black'}`}
                                                onClick={() => {
                                                    setSelectedRow(group.id);
                                                }}
                                                onDoubleClick={() => {
                                                    handleOpenModal(group, setSelectedVpc, setIsModalOpen);
                                                }}
                                            >
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.name}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.id}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.accountId}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.vpcId}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.provider}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <VpcEndpointModal
                                        isModalOpen={isModalOpen}
                                        onRequestClose={() => setIsModalOpen(false)}
                                        selectedVpcEndpoint={selectedVpc}
                                    />
                                </div>
                            );
                        case 'NAT Gateway':
                            return (
                                <div>
                                    <div className="dark:bg-black dark:border-black border-b border-1 border-[#E5E7EB] table-header flex justify-between text-left text-sm font-medium text-gray-700 rounded-lg">
                                        <span onClick={() => handleSortClick('name')} className="w-1/4 px-4 py-2 text-center">Name</span>
                                        <span onClick={() => handleSortClick('id')} className="w-1/4 px-2 py-2 text-center">ID</span>
                                        <span onClick={() => handleSortClick('accountId')} className="w-1/4 px-1 py-2 text-center">Account ID</span>
                                        <span onClick={() => handleSortClick('vpcId')} className="w-1/4 px-2 py-2 text-center">VPC ID</span>
                                    </div>
                                    <div>
                                        {sortedData(natGatewaysSearch, sortConfig).map((group, idx) => (
                                            <div
                                                key={idx}
                                                className={`unselectable cursor-pointer dark:bg-black dark:text-white flex items-center justify-between text-left text-sm font-medium text-gray-700 rounded-lg my-2 p-4 shadow ${selectedRow === group.id ? 'bg-blue-100 dark:bg-[#00437b]' : 'bg-white dark:bg-black'}`}
                                                onClick={() => {
                                                    setSelectedRow(group.id);
                                                }}
                                                onDoubleClick={() => {
                                                    handleOpenModal(group, setSelectedVpc, setIsModalOpen);
                                                }}
                                            >
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.name}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.id}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.accountId}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.vpcId}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <NatGatewayModal
                                        isModalOpen={isModalOpen}
                                        onRequestClose={() => setIsModalOpen(false)}
                                        selectedNATGateway={selectedVpc}
                                    />
                                </div>
                            );
                        case 'Internet Gateway':
                            return (
                                <div>
                                    <div className="dark:bg-black dark:border-black border-b border-1 border-[#E5E7EB] table-header flex justify-between text-left text-sm font-medium text-gray-700 rounded-lg">
                                        <span onClick={() => handleSortClick('name')} className="w-1/4 px-4 py-2 text-center">Name</span>
                                        <span onClick={() => handleSortClick('id')} className="w-1/4 px-2 py-2 text-center">ID</span>
                                        <span onClick={() => handleSortClick('accountId')} className="w-1/4 px-1 py-2 text-center">Account ID</span>
                                        <span onClick={() => handleSortClick('vpcId')} className="w-1/4 px-2 py-2 text-center">VPC ID</span>
                                        <span onClick={() => handleSortClick('provider')} className="w-1/4 px-1 py-2 text-center">Provider</span>
                                    </div>
                                    <div>
                                        {sortedData(igsSearch, sortConfig).map((group, idx) => (
                                            <div
                                                key={idx}
                                                className={`unselectable cursor-pointer dark:bg-black dark:text-white flex items-center justify-between text-left text-sm font-medium text-gray-700 rounded-lg my-2 p-4 shadow ${selectedRow === group.id ? 'bg-blue-100 dark:bg-[#00437b]' : 'bg-white dark:bg-black'}`}
                                                onClick={() => {
                                                    setSelectedRow(group.id);
                                                }}
                                                onDoubleClick={() => {
                                                    handleOpenModal(group, setSelectedVpc, setIsModalOpen);
                                                }}
                                            >
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.name}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.id}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.accountId}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.vpcId}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.provider}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <InternetGatewayModal
                                        isModalOpen={isModalOpen}
                                        onRequestClose={() => setIsModalOpen(false)}
                                        selectedIGW={selectedVpc}
                                    />
                                </div>
                            );
                        case 'Public IP':
                            return (
                                <div>
                                    <div className="dark:bg-black dark:border-black border-b border-1 border-[#E5E7EB] table-header flex justify-between text-left text-sm font-medium text-gray-700 rounded-lg">
                                        <span className="w-1/4 px-1 py-2 text-center">ID</span>
                                        <span className="w-1/4 px-1 py-2 text-center">Account ID</span>
                                        <span className="w-1/4 px-1 py-2 text-center">VPC ID</span>
                                        <span className="w-1/4 px-1 py-2 text-center">Provider</span>
                                    </div>
                                    <div>
                                        {sortedData(publicIPsSearch, sortConfig).map((group, idx) => (
                                            <div
                                                key={idx}
                                                className={`unselectable cursor-pointer dark:bg-black dark:text-white flex items-center justify-between text-left text-sm font-medium text-gray-700 rounded-lg my-2 p-4 shadow ${selectedRow === group.id ? 'bg-blue-100 dark:bg-gray-600' : 'bg-white dark:bg-gray-700'}`}
                                                onClick={() => {
                                                    setSelectedRow(group.id);
                                                }}
                                                onDoubleClick={() => {
                                                    handleOpenModal(group, setSelectedVpc, setIsModalOpen);
                                                }}>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.id}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.accountId}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.vpcId || "N/A"}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.provider}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <PublicIPModal
                                        isModalOpen={isModalOpen}
                                        onRequestClose={() => setIsModalOpen(false)}
                                        selectedPublicIp={selectedVpc}
                                    />
                                </div>
                            );
                        case 'Routers':
                            return (
                                <div>
                                    <div className="dark:bg-black dark:border-black border-b border-1 border-[#E5E7EB] table-header flex justify-between text-left text-sm font-medium text-gray-700 rounded-lg">
                                        <span onClick={() => handleSortClick('name')} className="w-1/4 px-4 py-2 text-center">Name</span>
                                        <span onClick={() => handleSortClick('id')} className="w-1/4 px-2 py-2 text-center cursor-pointer">ID</span>
                                        <span onClick={() => handleSortClick('accountId')} className="w-1/4 px-1 py-2 text-center cursor-pointer">Account ID</span>
                                        <span onClick={() => handleSortClick('provider')} className="w-1/4 px-1 py-2 text-center cursor-pointer">Provider</span>
                                    </div>
                                    <div>
                                        {sortedData(routerSearch, sortConfig).map((group, idx) => (
                                            <div
                                                key={idx}
                                                className={`unselectable cursor-pointer dark:bg-black dark:text-white flex items-center justify-between text-left text-sm font-medium text-gray-700 rounded-lg my-2 p-4 shadow ${selectedRow === group.id ? 'bg-blue-100 dark:bg-gray-600' : 'bg-white dark:bg-gray-700'}`}
                                                onClick={() => {
                                                    setSelectedRow(group.id);
                                                }}
                                                onDoubleClick={() => {
                                                    handleOpenModal(group, setSelectedVpc, setIsModalOpen);
                                                }}>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.name}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.id}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.accountId}</span>
                                                <span className="w-1/4 px-4 py-2 flex text-center justify-center">{group.provider}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <RouterModal
                                        isModalOpen={isModalOpen}
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
