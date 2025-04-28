/**
 * Copyright (c) 2024 Cisco Systems, Inc. and its affiliates
 * All rights reserved.
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
import React, { useState, useEffect, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import ProviderButtons from '@/components/ProviderRegion/ProviderRegionBar';
import VPCIndexModal from '@/components/Modal/VPCIndexModal';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useFetchVpcsResources } from '@/common/hooks/useFetchVpcsResources';
import { useFetchVPCResourceVPCIndex } from '@/common/hooks/useFetchVPCResourceVPCIndex';
import { InfraResourceProvider } from '@/common/enum';

export interface VPCIndex {
  vpc_id: string;
  instance_ids?: string[];
  acl_ids?: string[];
  security_group_ids?: string[];
  nat_gateway_ids?: string[];
  vpc_endpoint_ids?: string[];
  lb_ids?: string[];
  router_ids?: string[];
  igw_ids?: string[];
  subnet_ids?: string[];
  route_table_ids?: string[];
  network_interface_ids?: string[];
  key_pair_ids?: string[];
  vpn_concentrator_ids?: string[];
  public_ip_ids?: string[];
  cluster_ids?: string[];
  last_sync_time?: string;
  provider?: string;
  account_id?: string;
  region?: string;
  created_at?: any;
  updated_at?: any;
}

const VPCView: React.FC = () => {
  const { selectedProvider, selectedAccountId } = useSelector((state: RootState) => state.selectedResources);

  const [selectedVpcId, setSelectedVpcId] = useState<string>('');
  const [selectedVpcIndex, setSelectedVpcIndex] = useState<VPCIndex | null>(null);
  const [vpcList, setVpcList] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch VPCs for the selected account.
  const { vpcs, fetchVpcs } = useFetchVpcsResources(
    selectedProvider as InfraResourceProvider,
    selectedAccountId,
    ''
  );

  useEffect(() => {
    if (selectedAccountId && selectedProvider) {
      console.log('Fetching VPC list for account:', selectedAccountId);
      fetchVpcs();
    }
  }, [selectedAccountId, selectedProvider]);

  useEffect(() => {
    console.log('VPC list from backend:', vpcs);
    setVpcList(vpcs);
  }, [vpcs]);

  // Fetch detailed VPCIndex data
  const { vpcIndex, fetchVpcIndex } = useFetchVPCResourceVPCIndex(
    selectedProvider as InfraResourceProvider,
    selectedAccountId,
    ''
  );

  useEffect(() => {
    if (selectedVpcId) {
      console.log('Fetching VPCIndex for VPC ID:', selectedVpcId);
      fetchVpcIndex(selectedVpcId)
        .then(() => {
          console.log('Fetch call completed.');
        })
        .catch((error) => {
          console.error('Error fetching VPCIndex:', error);
        });
    } else {
      setSelectedVpcIndex(null);
    }
  }, [selectedVpcId, selectedProvider, selectedAccountId]);

  useEffect(() => {
    console.log("Hook vpcIndex updated:", vpcIndex);
    if (vpcIndex) {
      setSelectedVpcIndex(vpcIndex);
    }
  }, [vpcIndex]);

  // Updated resourceSpriteMapping with new asset paths in "src/icons"
  const resourceSpriteMapping: { [key: string]: { label: string; icon: string } } = {
    instance_ids: { label: 'Instances', icon: '/icons/instance.svg' },
    acl_ids: { label: 'ACLs', icon: '/icons/acl.svg' },
    security_group_ids: { label: 'Security Groups', icon: '/icons/security-group.svg' },
    nat_gateway_ids: { label: 'NAT Gateways', icon: '/icons/nat-gateway.svg' },
    vpc_endpoint_ids: { label: 'VPC Endpoints', icon: '/icons/vpc-endpoint.svg' },
    lb_ids: { label: 'Load Balancers', icon: '/icons/load-balancer.svg' },
    router_ids: { label: 'Routers', icon: '/icons/router.svg' },
    igw_ids: { label: 'Internet Gateways', icon: '/icons/internet-gateway.svg' },
    subnet_ids: { label: 'Subnets', icon: '/icons/subnet.svg' },
    route_table_ids: { label: 'Route Tables', icon: '/icons/route-table.svg' },
    network_interface_ids: { label: 'Network Interfaces', icon: '/icons/network-interface.svg' },
    key_pair_ids: { label: 'Key Pairs', icon: '/icons/key-pair.svg' },
    vpn_concentrator_ids: { label: 'VPN Concentrators', icon: '/icons/vpn.svg' },
    public_ip_ids: { label: 'Public IPs', icon: '/icons/public-ip.svg' },
    cluster_ids: { label: 'Clusters', icon: '/icons/cluster.svg' },
  };

  // Build the graph elements using ReactFlow based on selectedVpcIndex.
  // – Do not create a main VPC node.
  // – Create resource nodes using only the resource id as label.
  // – Edges are omitted since no grouping is needed.
  const elements = useMemo(() => {
    if (!selectedVpcIndex) return { nodes: [], edges: [] };

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    Object.entries(resourceSpriteMapping).forEach(([key], idx) => {
      const resources = (selectedVpcIndex as any)[key] as string[] | undefined;
      if (resources && resources.length) {
        resources.forEach((res, i) => {
          // Use just the resource id as nodeId and label.
          const nodeId = res;
          nodes.push({
            id: nodeId,
            data: { label: nodeId },
            position: {
              x: 300 + 200 * Math.cos(2 * Math.PI * ((i + idx) / (resources.length + Object.keys(resourceSpriteMapping).length))),
              y: 150 + 200 * Math.sin(2 * Math.PI * ((i + idx) / (resources.length + Object.keys(resourceSpriteMapping).length))),
            },
            style: { background: '#333', color: '#fff', padding: '5px' },
          });
        });
      }
    });

    console.log('Graph elements:', { nodes, edges });
    return { nodes, edges };
  }, [selectedVpcIndex]);

  return (
    <>
      <div style={{ padding: '20px', borderBottom: '1px solid #ddd' }}>
        <ProviderButtons onProviderButtonClick={() => { }} />
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={selectedVpcId}
            onChange={e => setSelectedVpcId(e.target.value)}
            className="select-field"
          >
            <option value="">Select VPC</option>
            {vpcList
              .filter(vpc => vpc.accountId === selectedAccountId)
              .map((vpc) => (
                <option key={vpc.id} value={vpc.id}>
                  {vpc.id} – {vpc.name}
                </option>
              ))}
          </select>
          <button onClick={() => setIsModalOpen(true)} className="button-blue">
            Show VPC Details
          </button>
        </div>
      </div>

      <div style={{ height: '600px', border: '1px solid #ddd', margin: '20px' }}>
        <ReactFlowProvider>
          <ReactFlow 
            nodes={elements.nodes} 
            edges={elements.edges}
            nodesDraggable={false}
            
          >
            <MiniMap nodeStrokeColor={(n) => (n.style?.background as string) || '#eee'} nodeColor={(n) => (n.style?.background as string) || '#fff'} />
            <Controls />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      <VPCIndexModal
        isModalOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        selectedVpcIndex={selectedVpcIndex}
      />
    </>
  );
};

export default VPCView;