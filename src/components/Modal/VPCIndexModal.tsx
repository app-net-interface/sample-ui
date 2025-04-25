import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { motion } from 'framer-motion';
import '../../css/vpc.css';

interface VPCIndex {
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

interface VPCIndexModalProps {
  isModalOpen: boolean;
  onRequestClose: () => void;
  selectedVpcIndex: VPCIndex | null;
}

const resourceSpriteMapping: { [key: string]: { label: string; icon: string } } = {
  instance_ids: { label: 'Instances', icon: '/assets/icons/instance.svg' },
  acl_ids: { label: 'ACLs', icon: '/assets/icons/acl.svg' },
  security_group_ids: { label: 'Security Groups', icon: '/assets/icons/security-group.svg' },
  nat_gateway_ids: { label: 'NAT Gateways', icon: '/assets/icons/nat-gateway.svg' },
  vpc_endpoint_ids: { label: 'VPC Endpoints', icon: '/assets/icons/vpc-endpoint.svg' },
  lb_ids: { label: 'Load Balancers', icon: '/assets/icons/load-balancer.svg' },
  router_ids: { label: 'Routers', icon: '/assets/icons/router.svg' },
  igw_ids: { label: 'Internet Gateways', icon: '/assets/icons/internet-gateway.svg' },
  subnet_ids: { label: 'Subnets', icon: '/assets/icons/subnet.svg' },
  route_table_ids: { label: 'Route Tables', icon: '/assets/icons/route-table.svg' },
  network_interface_ids: { label: 'Network Interfaces', icon: '/assets/icons/network-interface.svg' },
  key_pair_ids: { label: 'Key Pairs', icon: '/assets/icons/key-pair.svg' },
  vpn_concentrator_ids: { label: 'VPN Concentrators', icon: '/assets/icons/vpn.svg' },
  public_ip_ids: { label: 'Public IPs', icon: '/assets/icons/public-ip.svg' },
  cluster_ids: { label: 'Clusters', icon: '/assets/icons/cluster.svg' },
};

const VPCIndexModal: React.FC<VPCIndexModalProps> = ({
  isModalOpen,
  onRequestClose,
  selectedVpcIndex,
}) => {
  const [selectedTab, setSelectedTab] = useState(1);

  // Render resource sprites based on non-empty resource arrays in the VPCIndex object.
  const renderResourceSprites = () => {
    if (!selectedVpcIndex) return null;
    return (
      <div className="vpc-resource-canvas" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '15px' }}>
        {Object.entries(resourceSpriteMapping).map(([key, { label, icon }]) => {
          const resourceList: string[] | undefined = (selectedVpcIndex as any)[key];
          // Only show sprite if resource list exists and has any elements.
          if (resourceList && resourceList.length) {
            return (
              <div key={key} style={{ textAlign: 'center' }}>
                <img src={icon} alt={label} style={{ width: '40px', height: '40px' }} />
                <div style={{ marginTop: '5px', fontSize: '0.9em' }}>{label}</div>
                <div style={{ color: '#666', fontSize: '0.8em' }}>({resourceList.length})</div>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onRequestClose={onRequestClose}
      shouldCloseOnOverlayClick={false}
      shouldFocusAfterRender={false}
      shouldReturnFocusAfterClose={false}
      style={{
        overlay: { backgroundColor: 'rgba(0,0,0,0.5)' },
        content: {
          position: 'absolute',
          top: '10%',
          left: '20%',
          right: '20%',
          bottom: '10%',
          overflow: 'auto',
          borderRadius: '4px',
          padding: '20px',
          zIndex: 1000,
        },
      }}
    >
      <button className="modal-close-button" onClick={onRequestClose}>
        Close
      </button>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {selectedVpcIndex ? (
          <>
            <div style={{
              backgroundColor: '#F5F5F5',
              padding: '10px',
              boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.2)',
              border: '1px solid #F5F5F5'
            }}>
              <h1 style={{ fontWeight: 'bold', color: 'black', fontSize: '1em' }}>
                Resource summary for VPC ID: {selectedVpcIndex.vpc_id}
              </h1>
              <p style={{ fontSize: '0.9em', color: '#555' }}>
                {selectedVpcIndex.provider} - {selectedVpcIndex.region}
              </p>
            </div>

            {/* Resource Canvas */}
            {renderResourceSprites()}

            {/* Optional Tabs (for extra resource details / relationships) */}
            <div style={{ marginTop: '20px' }}>
              <div
                className="flex text-black-900 font-semibold text-sm"
                style={{
                  backgroundColor: '#F5F5F5',
                  padding: '10px',
                  boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.2)',
                  border: '1px solid #F5F5F5',
                }}
              >
                <div
                  className={`flex-1 text-center border-r border-gray-400 cursor-pointer px-2 ${selectedTab === 1 ? 'pb-2 border-b-2 border-black' : ''}`}
                  onClick={() => setSelectedTab(1)}
                >
                  Details
                </div>
                <div
                  className={`flex-1 text-center cursor-pointer px-2 ${selectedTab === 2 ? 'pb-2 border-b-2 border-black' : ''}`}
                  onClick={() => setSelectedTab(2)}
                >
                  Relationships
                </div>
              </div>
              <div style={{
                backgroundColor: '#FFFFFF',
                padding: '10px',
                boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.2)',
                border: '1px solid #F5F5F5',
                marginTop: '10px',
              }}>
                {selectedTab === 1 && (
                  <div>
                    <h2 style={{ fontWeight: 'bold' }}>VPC Index Details</h2>
                    <div style={{ fontSize: '0.9em' }}>
                      <p><strong>Last Sync:</strong> {selectedVpcIndex.last_sync_time}</p>
                      <p><strong>Account:</strong> {selectedVpcIndex.account_id}</p>
                      {/* Add additional details if needed */}
                    </div>
                  </div>
                )}
                {selectedTab === 2 && (
                  <div>
                    <h2 style={{ fontWeight: 'bold' }}>Resource Relationships</h2>
                    <p style={{ fontSize: '0.9em' }}>Relationship visualization coming soon...</p>
                    {/* Here you can integrate lines or graph visualizations between sprites */}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <p style={{ color: 'red' }}>No VPC Index data available.</p>
        )}
      </motion.div>
    </Modal>
  );
};

export default VPCIndexModal;