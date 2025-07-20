import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useFetchVpcResourceVms,
  useFetchVpcResourceSubnets,
  useFetchVpcResourceSecurityGroups,
  useFetchVpcResourceACLs,
  useFetchVpcResourceRouteTables,
  useFetchVpcResourceInternetGateways,
  useFetchVpcResourceNATGateways,
  useFetchVpcResourceVpcEndpoints
} from '@/common/hooks';

interface VpcContextBarProps {
  vpc: {
    id: string;
    accountId: string;
    name?: string;
    region: string;
    ipv4?: string;
    ipv6?: string;
    labels?: Record<string, string>;
    compliant?: boolean;
    selfLink?: string;
    project?: string;
  } | null;
  onClear: () => void;
  onResourceClick: (resourceType: string) => void;
}

export const VpcContextBar: React.FC<VpcContextBarProps> = ({ vpc, onClear, onResourceClick }) => {
  console.log('VpcContextBar: Component rendered with vpc:', vpc);

  // Early return if no vpc
  if (!vpc) {
    console.log('VpcContextBar: No VPC provided, returning null');
    return null;
  }

  // Resource counts
  const [resourceCounts, setResourceCounts] = useState({
    vms: 0,
    subnets: 0,
    securityGroups: 0,
    acls: 0,
    routeTables: 0,
    internetGateways: 0,
    natGateways: 0,
    vpcEndpoints: 0,
    loadBalancers: 0,
    publicIPs: 0,
    routers: 0
  });

  // Get provider from labels or fallback
  const provider = vpc.labels?.["cloud.service.type"] || "unknown";
  console.log('VpcContextBar: Using provider:', provider);

  // Initialize all resource hooks
  const { vpcResourceVms, fetchVpcResourcesVms } = useFetchVpcResourceVms(
    provider,
    vpc.region,
    vpc.id,
    vpc.accountId
  );

  const { vpcResourceSubnets, fetchVpcResourcesSubnets } = useFetchVpcResourceSubnets(
    provider,
    vpc.region,
    vpc.id,
    vpc.accountId
  );

  const { vpcResourceSecurityGroups, fetchVpcResourceSecurityGroups } = useFetchVpcResourceSecurityGroups(
    provider,
    vpc.region,
    vpc.id,
    vpc.accountId
  );

  const { vpcResourceACLs, fetchVpcResourceACLs } = useFetchVpcResourceACLs(
    provider,
    vpc.region,
    vpc.id,
    vpc.accountId
  );

  const { vpcResourceRouteTables, fetchVpcResourceRouteTables } = useFetchVpcResourceRouteTables(
    provider,
    vpc.region,
    vpc.id,
    vpc.accountId
  );

  const { vpcResourceInternetGateways, fetchVpcResourceInternetGateways } = useFetchVpcResourceInternetGateways(
    provider,
    vpc.region,
    vpc.id,
    vpc.accountId
  );

  const { vpcResourceNATGateways, fetchVpcResourceNATGateways } = useFetchVpcResourceNATGateways(
    provider,
    vpc.region,
    vpc.id,
    vpc.accountId
  );

  // VPC Endpoints will be handled separately until we fix their filtering
  const { vpcResourceVpcEndpoints } = useFetchVpcResourceVpcEndpoints(
    provider,
    vpc.region,
    vpc.id,
    vpc.accountId
  );

  // Debug log for hook data
  useEffect(() => {
    console.log('VpcContextBar: Hook data updated:', {
      vms: vpcResourceVms,
      subnets: vpcResourceSubnets,
      securityGroups: vpcResourceSecurityGroups
    });
  }, [vpcResourceVms, vpcResourceSubnets, vpcResourceSecurityGroups]);

  // Fetch all resources when VPC changes
  useEffect(() => {
    if (vpc?.id) {
      fetchVpcResourcesVms();
      fetchVpcResourcesSubnets();
      fetchVpcResourceSecurityGroups();
      fetchVpcResourceACLs();
      fetchVpcResourceRouteTables();
      fetchVpcResourceInternetGateways();
      fetchVpcResourceNATGateways();
    }
  }, [vpc?.id, provider, vpc?.region, vpc?.accountId]);

  // Update resource counts when data changes
  useEffect(() => {
    const newCounts = {
      vms: vpcResourceVms?.length || 0,
      subnets: vpcResourceSubnets?.length || 0,
      securityGroups: vpcResourceSecurityGroups?.length || 0,
      acls: vpcResourceACLs?.length || 0,
      routeTables: vpcResourceRouteTables?.length || 0,
      internetGateways: vpcResourceInternetGateways?.length || 0,
      natGateways: vpcResourceNATGateways?.length || 0,
      vpcEndpoints: 0, // We'll handle VPC endpoints separately
      loadBalancers: 0,
      publicIPs: 0,
      routers: 0
    };
    
    console.log('VpcContextBar: Calculating new counts:', newCounts);
    setResourceCounts(newCounts);
  }, [
    vpcResourceVms,
    vpcResourceSubnets,
    vpcResourceSecurityGroups,
    vpcResourceACLs,
    vpcResourceRouteTables,
    vpcResourceInternetGateways,
    vpcResourceNATGateways
  ]);

  console.log('VpcContextBar: Rendering with counts:', resourceCounts);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 mb-4 rounded-lg shadow-sm">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
              VPC: {vpc.name || vpc.id}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Region: {vpc.region}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              CIDR: {vpc.ipv4 || 'N/A'}
            </div>
          </div>
          <button
            onClick={onClear}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Clear VPC context
          </button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <button
            onClick={() => onResourceClick('VM')}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer bg-white dark:bg-gray-700 p-2 rounded flex items-center justify-between"
          >
            <span>VMs</span>
            <span className="font-medium">{resourceCounts.vms}</span>
          </button>
          <button
            onClick={() => onResourceClick('Subnet')}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer bg-white dark:bg-gray-700 p-2 rounded flex items-center justify-between"
          >
            <span>Subnets</span>
            <span className="font-medium">{resourceCounts.subnets}</span>
          </button>
          <button
            onClick={() => onResourceClick('Security Group')}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer bg-white dark:bg-gray-700 p-2 rounded flex items-center justify-between"
          >
            <span>Security Groups</span>
            <span className="font-medium">{resourceCounts.securityGroups}</span>
          </button>
          <button
            onClick={() => onResourceClick('ACL')}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer bg-white dark:bg-gray-700 p-2 rounded flex items-center justify-between"
          >
            <span>ACLs</span>
            <span className="font-medium">{resourceCounts.acls}</span>
          </button>
          <button
            onClick={() => onResourceClick('Route Table')}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer bg-white dark:bg-gray-700 p-2 rounded flex items-center justify-between"
          >
            <span>Route Tables</span>
            <span className="font-medium">{resourceCounts.routeTables}</span>
          </button>
          <button
            onClick={() => onResourceClick('Internet Gateway')}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer bg-white dark:bg-gray-700 p-2 rounded flex items-center justify-between"
          >
            <span>Internet Gateways</span>
            <span className="font-medium">{resourceCounts.internetGateways}</span>
          </button>
          <button
            onClick={() => onResourceClick('NAT Gateway')}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer bg-white dark:bg-gray-700 p-2 rounded flex items-center justify-between"
          >
            <span>NAT Gateways</span>
            <span className="font-medium">{resourceCounts.natGateways}</span>
          </button>
          <button
            onClick={() => onResourceClick('VPC Endpoint')}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer bg-white dark:bg-gray-700 p-2 rounded flex items-center justify-between"
          >
            <span>VPC Endpoints</span>
            <span className="font-medium">{resourceCounts.vpcEndpoints}</span>
          </button>
          <button
            onClick={() => onResourceClick('Load Balancer')}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer bg-white dark:bg-gray-700 p-2 rounded flex items-center justify-between"
          >
            <span>Load Balancers</span>
            <span className="font-medium">{resourceCounts.loadBalancers}</span>
          </button>
          <button
            onClick={() => onResourceClick('Public IP')}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer bg-white dark:bg-gray-700 p-2 rounded flex items-center justify-between"
          >
            <span>Public IPs</span>
            <span className="font-medium">{resourceCounts.publicIPs}</span>
          </button>
          <button
            onClick={() => onResourceClick('Routers')}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer bg-white dark:bg-gray-700 p-2 rounded flex items-center justify-between"
          >
            <span>Routers</span>
            <span className="font-medium">{resourceCounts.routers}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface ResourceCountCardProps {
  label: string;
  count: number;
  link: string;
}

const ResourceCountCard: React.FC<ResourceCountCardProps> = ({ label, count, link }) => (
  <Link
    to={link}
    className="p-3 bg-gray-50 dark:bg-navy-800 rounded-md hover:bg-gray-100 dark:hover:bg-navy-900 transition-colors"
  >
    <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
    <div className="text-xl font-semibold text-gray-900 dark:text-white">{count}</div>
  </Link>
);
