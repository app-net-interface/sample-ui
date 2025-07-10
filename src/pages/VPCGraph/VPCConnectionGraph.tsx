import React from 'react';
import DefaultLayout from '@/layout/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { InfraResourceProvider } from '@/common/enum';
import { VpcConnectionRenderer } from './components/VpcConnectionRenderer';

interface VPCConnectionGraphProps {
  vpc1Identity: { provider: InfraResourceProvider; accountId: string; region: string; vpcId: string };
  vpc2Identity: { provider: InfraResourceProvider; accountId: string; region: string; vpcId: string };
}

// A simplified component that just uses VpcConnectionRenderer
const VPCConnectionGraph: React.FC<VPCConnectionGraphProps> = ({ vpc1Identity, vpc2Identity }) => {
  return (
    <VpcConnectionRenderer
      sourceVpcDetail={{
        provider: vpc1Identity.provider,
        accountId: vpc1Identity.accountId,
        region: vpc1Identity.region,
        vpcId: vpc1Identity.vpcId
      }}
      destVpcDetail={{
        provider: vpc2Identity.provider,
        accountId: vpc2Identity.accountId,
        region: vpc2Identity.region,
        vpcId: vpc2Identity.vpcId
      }}
      height="calc(100vh - 200px)"
      width="100%"
      showControls={true}
      showMiniMap={true}
      className="border border-gray-200 rounded-md"
    />
  );
};

// Export with DefaultLayout wrapper
export default ({ vpc1Identity, vpc2Identity }: VPCConnectionGraphProps) => (
  <DefaultLayout>
    <Breadcrumb pageName="VPC Connection Graph" />
    <div className="p-4">
      <VPCConnectionGraph 
        vpc1Identity={vpc1Identity}
        vpc2Identity={vpc2Identity}
      />
    </div>
  </DefaultLayout>
);
