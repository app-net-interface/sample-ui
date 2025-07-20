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
  selectedVpc: {
    id: string;
    provider: string;
    region: string;
    accountId: string;
  };
}

export const VpcContextBar: React.FC<VpcContextBarProps> = ({ selectedVpc }) => {
  // Resource counts
  const [resourceCounts, setResourceCounts] = useState({
    vms: 0,
    subnets: 0,
    securityGroups: 0,
    acls: 0,
    routeTables: 0,
    internetGateways: 0,
    natGateways: 0,
    vpcEndpoints: 0
  });

  // Initialize all resource hooks
  const { vpcResourceVms, fetchVpcResourcesVms } = useFetchVpcResourceVms(
    selectedVpc.provider,
    selectedVpc.region,
    selectedVpc.id,
    selectedVpc.accountId
  );

  const { vpcResourceSubnets, fetchVpcResourcesSubnets } = useFetchVpcResourceSubnets(
    selectedVpc.provider,
    selectedVpc.region,
    selectedVpc.id,
    selectedVpc.accountId
  );

  const { vpcResourceSecurityGroups, fetchVpcResourceSecurityGroups } = useFetchVpcResourceSecurityGroups(
    selectedVpc.provider,
    selectedVpc.region,
    selectedVpc.id,
    selectedVpc.accountId
  );

  // ... similar for other resources

  // Fetch resources when VPC selection changes
  useEffect(() => {
    if (selectedVpc.id) {
      console.log('Fetching resources for VPC:', selectedVpc.id);
      fetchVpcResourcesVms();
      fetchVpcResourcesSubnets();
      fetchVpcResourceSecurityGroups();
      // ... fetch other resources
    }
  }, [selectedVpc.id, selectedVpc.provider, selectedVpc.region, selectedVpc.accountId]);

  // Update counts when resources change
  useEffect(() => {
    setResourceCounts(prev => ({
      ...prev,
      vms: vpcResourceVms.length,
      subnets: vpcResourceSubnets.length,
      securityGroups: vpcResourceSecurityGroups.length,
      // ... other resource counts
    }));
  }, [vpcResourceVms, vpcResourceSubnets, vpcResourceSecurityGroups]);

  return (
    <div className="vpc-context-bar bg-white dark:bg-navy-700 p-4 rounded-lg shadow">
      <div className="grid grid-cols-4 gap-4">
        <ResourceCountCard
          label="VMs"
          count={resourceCounts.vms}
          link={`/resources/vms/${selectedVpc.id}`}
        />
        <ResourceCountCard
          label="Subnets"
          count={resourceCounts.subnets}
          link={`/resources/subnets/${selectedVpc.id}`}
        />
        <ResourceCountCard
          label="Security Groups"
          count={resourceCounts.securityGroups}
          link={`/resources/security-groups/${selectedVpc.id}`}
        />
        {/* ... other resource cards */}
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
