import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
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
} from "@/common/hooks";
import '../../css/vpc.css';
import { setSelectedAccountId } from "@/store/selectedRegionAccountId-slice/selectedRegionAccountIdSlice";
import { sortedData, determineSortConfig, SortConfig } from "@/common/utils/sortingUtil";
import { handleButtonClick, handleOpenModal } from "@/pages/MultiCloudInfra/Handlers";
import { selectAggregatedVms } from "@/store/aggregatedSelectors";

const MultiCloudInfra = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVpc, setSelectedVpc] = useState(null); // track current vpc
    const [selectedVpcId, setSelectedVpcId] = useState(''); // track current vpc id (for modal)
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedView, setSelectedView] = useState('VPC');

    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [timeSinceUpdate, setTimeSinceUpdate] = useState<string>('just now');
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    // api
    const { vpcs } = useSelector((state: RootState) => state.infraResources); // retrieve vpcs from api
    const { selectedProvider, selectedAccountId } = useSelector((state: RootState) => state.selectedResources);
    const [previousAccountId, setPreviousAccountId] = useState(selectedAccountId);
    
    //const { vpcResources } =   useFetchVpcsResources(selectedProvider, selectedAccountId, region);
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


 
    // search function
    const search = (data: any[], searchTerm: string, keys: string[]) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return data.filter(item =>
            keys.some(key => item[key]?.toLowerCase().includes(lowerCaseSearchTerm))
        );
    };

    // search keys
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

    // serach functions
    const vpcSearch = search(vpcData, searchTerm, vpcKeys);
    const sgSearch = search(vpcResourceSecurityGroups, searchTerm, sgKeys);
    const vmSearch = search(vpcResourceVms, searchTerm, vmKeys);
    const subnetSearch = search(vpcResourceSubnets, searchTerm, subnetKeys);
    const aclSearch = search(vpcResourceACLs, searchTerm, aclKeys);
    const routerSearch = search(vpcResourceRouters, searchTerm, routerKeys);
    const routeTableSearch = search(vpcResourceRouteTables, searchTerm, routeTableKeys);
    const vpcEndpointSearch = search(vpcResourceVpcEndpoints, searchTerm, vpcEndpointKeys);
    const natGatewaysSearch = search(vpcResourceNATGateways, searchTerm, natGatewaysKeys);
    const igsSearch = search(vpcResourceInternetGateways, searchTerm, igsKeys);
    const publicIPsSearch = search(vpcResourcePublicIPs, searchTerm, publicIPsKeys);

    const aggregatedVms = useSelector(selectAggregatedVms);
    // New aggregated search result over all provider VMs
    const allVmSearchResult = search(aggregatedVms, searchTerm, vmKeys);

    // timer counter
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

    // sorting funciton
    const handleSortClick = (key: string) => {
        const newConfig = determineSortConfig(sortConfig, key);
        setSortConfig(newConfig);
    };

    const buttonData = [
        { name: 'VM', fetchFunction: fetchVpcResourcesVms },
        { name: 'Subnet', fetchFunction: fetchVpcResourcesSubnets },
        { name: 'Security Group', fetchFunction: fetchVpcResourceSecurityGroups },
        { name: 'ACL', fetchFunction: fetchVpcResourceACLs },
        { name: 'Routers', fetchFunction: fetchVpcResourceRouters },
        { name: 'Route Table', fetchFunction: fetchVpcResourceRouteTables },
        { name: 'VPC Endpoint', fetchFunction: fetchVpcResourceVPCEndpoints },
        { name: 'NAT Gateway', fetchFunction: fetchVpcResourceNATGateways },
        { name: 'Internet Gateway', fetchFunction: fetchVpcResourceInternetGateways },
        { name: 'Public IP', fetchFunction: fetchVpcResourcePublicIPs },
    ];

    const handleVPCView = () => {
        setSelectedView('VPC');
        setIsModalOpen(false);
        setSelectedVpcId('');
    }

    useEffect(() => {
        if (selectedView === 'VM') {
            fetchVpcResourcesVms();
                } else if (selectedView === 'Subnet') {
            fetchVpcResourcesSubnets();
        } else if (selectedView === 'Security Group') {
            fetchVpcResourceSecurityGroups();
        }
        else if (selectedView === 'ACL') {
            fetchVpcResourceACLs();
        }
        else if (selectedView === 'Routers') {
            fetchVpcResourceRouters();
        }
        else if (selectedView === 'Route Table') {
            fetchVpcResourceRouteTables();
        }
        else if (selectedView === 'VPC Endpoint') {
            fetchVpcResourceVPCEndpoints();
        }
        else if (selectedView === 'NAT Gateway') {
            fetchVpcResourceNATGateways();
        }
        else if (selectedView === 'Internet Gateway') {
            fetchVpcResourceInternetGateways();
        }
        else if (selectedView === 'Public IP') {
            fetchVpcResourcePublicIPs();
        }
              
    }, [selectedProvider, selectedAccountId, selectedView]);

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Multi-cloud Infrastructure Resources" />
            <div className="flex justify-between">
                <div className="flex flex-col w-1/6">
                    <input
                        type="text"
                        placeholder="Search by id, name, etc."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="input-field dark:bg-black"
                    />
                </div>
                <ProviderButtons onProviderButtonClick={handleVPCView}></ProviderButtons>
            </div>
            <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="flex justify-begin">
                    {buttonData.map((button) => (
                        <button
                            className={`dark:border-white dark:text-white button-blue text-sm py-1 whitespace-nowrap ${selectedView === button.name ? 'selected' : ''}`}
                            key={button.name}
                            onClick={() =>
                                handleButtonClick(
                                    button.name,
                                    async () => {
                                        button.fetchFunction();
                                        return Promise.resolve();
                                    },
                                    selectedAccountId,
                                    setSelectedView,
                                    setLastUpdated,
                                    setIsModalOpen,
                                    setSelectedAccountId
                                )
                            }
                        >
                            {button.name}
                        </button>
                    ))}
                </div>
                <div>
                    <p>Last updated {timeSinceUpdate}</p>
                </div>
            </div>
            <div className="mt-3">
                {selectedView === 'Security Group' ? (
                    // Render table for Security Group
                    <div>
                        <div className="dark:bg-black dark:border-black border-b border-1 border-[#E5E7EB] table-header flex justify-between text-left text-sm font-medium text-gray-700 rounded-lg">
                            <span onClick={() => handleSortClick('name')} className="w-1/4 px-4 py-2 text-center">Name</span>
                            <span onClick={() => handleSortClick('id')} className="w-1/4 px-2 py-2 text-center">ID</span>
                            <span onClick={() => handleSortClick('accountId')} className="w-1/4 px-2 py-2 text-center">Account ID</span>
                            <span onClick={() => handleSortClick('vpcId')} className="w-1/4 px-2 py-2 text-center">VPC ID</span>

                        </div>
                        <div>
                            {sortedData(sgSearch, sortConfig).map((group, idx) => (
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
                        <SecurityGroupModal
                            isModalOpen={isModalOpen}
                            onRequestClose={() => setIsModalOpen(false)}
                            selectedSecurityGroup={selectedVpc}
                        />
                    </div>
                ) : selectedView === 'VM' ? (
                    <div>
                        <div className="dark:bg-black dark:border-black border-b border-1 border-[#E5E7EB] table-header flex justify-between text-left text-sm font-medium text-gray-700 rounded-lg">
                            <span onClick={() => handleSortClick('name')} className="w-1/4 px-4 py-2 text-center">Name</span>
                            <span onClick={() => handleSortClick('id')} className="w-1/4 px-4 py-2 text-center">ID</span>
                            <span onClick={() => handleSortClick('accountId')} className="w-1/4 px-2 py-2 text-center">Account ID</span>
                            <span onClick={() => handleSortClick('vpcId')} className="w-1/4 px-2 py-2 text-center">VPC ID</span>
                            <span onClick={() => handleSortClick('provider')} className="w-1/4 px-2 py-2 text-center">Provider</span>

                        </div>
                        <div>
                            {sortedData(vmSearch, sortConfig).map((group, idx) => (
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
                        <VMModal
                            isModalOpen={isModalOpen}
                            onRequestClose={() => setIsModalOpen(false)}
                            selectedVpc={selectedVpc}
                        />
                    </div>
                                ) : selectedView === 'Subnet' ? (
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
                ) : selectedView === "ACL" ? (
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
                ) : selectedView === "Route Table" ? (
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
                ) : selectedView === "VPC Endpoint" ? (
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
                ) : selectedView === 'NAT Gateway' ? (
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
                ) : selectedView === 'Internet Gateway' ? (
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
                                    }
                                    }
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
                ) : selectedView === 'Public IP' ? (
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
                ) : selectedView === 'Routers' ? (
                    <div>
                        <div className="dark:bg-black dark:border-black border-b border-1 border-[#E5E7EB] table-header flex justify-between text-left text-sm font-medium text-gray-700 rounded-lg">
                            <span onClick={() => handleSortClick('name')} className="w-1/4 px-4 py-2 text-center">Name</span>
                            <span onClick={() => handleSortClick('id')} className="w-1/4 px-2 py-2 text-center">ID</span>
                            <span onClick={() => handleSortClick('accountId')} className="w-1/4 px-1 py-2 text-center">Account ID</span>
                            <span onClick={() => handleSortClick('provider')} className="w-1/4 px-1 py-2 text-center">Provider</span>
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
                ) : (
                    // Render default vpcSearch table
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
                    </div >
                )}
            </div >
        </DefaultLayout >
    );
};

export default MultiCloudInfra;
