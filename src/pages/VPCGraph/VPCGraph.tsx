/**
 * Copyright (c) 2025 Cisco Systems, Inc. and its affiliates
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

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Position,
  NodeTypes,
  BackgroundVariant,
  Panel,
  ControlButton,
} from 'reactflow';
import 'reactflow/dist/style.css';
import ProviderButtons from '@/components/ProviderRegion/ProviderRegionBar';
import VPCIndexModal from '@/components/Modal/VPCIndexModal';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useFetchVpcsResources } from '@/common/hooks/useFetchVpcsResources';
import { useFetchVpcGraphResource } from '@/common/hooks/useFetchVpcGraphResource';
import { InfraResourceProvider } from '@/common/enum';
import IconNode from '@/components/GraphNodes/IconNode';
import '@/components/GraphNodes/IconNode.css';
import NodeDetailsPanel from '@/components/NodeDetailsPanel/NodeDetailsPanel'; // Import the new component
import '@/components/NodeDetailsPanel/NodeDetailsPanel.css'; // Import its CSS
import '@/css/flow-controls.css'; // Import modern controls styles
import '@/css/flow-fullscreen.css'; // Import fullscreen styles
import '@/css/vpc.css'; // Import VPC graph styles
// *** Import DefaultLayout and Breadcrumb ***
import DefaultLayout from '@/layout/DefaultLayout';

// --- Utility Functions ---
import { 
  getLayoutedElements, 
  getSubgraph,
  getSubgraphForSubnet,
  getResourceType,
  getNodeDisplayName,
} from './components/GraphUtils';


// --- ADJUST NODE DIMENSIONS for layout ---
const nodeWidth = 48;
const nodeHeight = 48;

// After the imports, add edge style constants
const EDGE_STYLES = {
  subnet_routetable: { 
    stroke: '#2196F3', 
    strokeWidth: 2,
    animated: true       // Animate subnet to route table connections
  },
  routetable_gateway: { 
    stroke: '#00E5FF', 
    strokeWidth: 2,
    animated: true       // Animate route table to gateway connections
  },
  instance_subnet: { 
    stroke: '#4CAF50', 
    strokeWidth: 2,
    animated: false      // Static instance-subnet connections
  },
  security_group: { 
    stroke: '#FF5722', 
    strokeWidth: 2,
    animated: false      // Static security group connections
  },
  acl: { 
    stroke: '#9C27B0', 
    strokeWidth: 2,
    animated: false      // Static ACL connections
  },
  default: { 
    stroke: '#90A4AE', 
    strokeWidth: 1.5,
    animated: false      // Static default connections
  }
};

// Helper function to determine edge type
const getEdgeStyle = (sourceType: string, targetType: string) => {
  sourceType = sourceType.toLowerCase();
  targetType = targetType.toLowerCase();
  
  // Check if either end is a route table
  const hasRouteTable = sourceType.includes('routetable') || targetType.includes('routetable');
  
  // Sort the types to handle both directions
  const types = [sourceType, targetType].sort().join('_');
  
  // Handle specific edge types
  if (types.includes('subnet') && types.includes('routetable')) {
    return EDGE_STYLES.subnet_routetable;
  }
  if (hasRouteTable && (types.includes('igw') || types.includes('vgw') || types.includes('natgateway'))) {
    return EDGE_STYLES.routetable_gateway;
  }
  if (types.includes('instance') && types.includes('subnet')) {
    return EDGE_STYLES.instance_subnet;
  }
  if (types.includes('securitygroup')) {
    return EDGE_STYLES.security_group;
  }
  if (types.includes('acl')) {
    return EDGE_STYLES.acl;
  }
  
  // If the connection involves a route table but isn't handled above, use route table style
  if (hasRouteTable) {
    return EDGE_STYLES.subnet_routetable; // Use the same style as subnet-routetable for consistency
  }
  
  return EDGE_STYLES.default;
};


const VPCGraphInternal: React.FC = () => {
  const { selectedProvider, selectedAccountId, selectedRegion } = useSelector((state: RootState) => state.selectedResources);

  const [selectedVpcId, setSelectedVpcId] = useState<string>('');
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>(''); // <-- ADD THIS STATE
  const [selectedSubnetId, setSelectedSubnetId] = useState<string>(''); // Add subnet state
  const [selectedVpcDetails, setSelectedVpcDetails] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  const [selectedNodeData, setSelectedNodeData] = useState<any>(null);
  const [showIsolatedNodes, setShowIsolatedNodes] = useState<boolean>(false); // <-- ADD THIS STATE

  // --- vpcs comes directly from the hook ---
  const { vpcs, fetchVpcs } = useFetchVpcsResources(
    selectedProvider as InfraResourceProvider,
    selectedAccountId,
    selectedRegion
  );


  

  const nodeTypes: NodeTypes = useMemo(() => ({
    iconNode: IconNode,
  }), []);

  // --- useEffect for fetching VPCs ---
  useEffect(() => {
    // This effect should run when account, provider, or region changes
    if (selectedAccountId && selectedProvider) {
      console.log('Fetching VPC list for account:', selectedAccountId, 'Region:', selectedRegion);
      // Call the fetchVpcs function obtained from the hook
      fetchVpcs();
    } else {
      console.log('Account or Provider not selected, clearing VPC list.');
      setSelectedVpcId(''); // Reset selected VPC when account/provider clears
    }
    // --- FIX: Remove fetchVpcs from the dependency array ---
  }, [selectedAccountId, selectedProvider, selectedRegion]); // Only depend on the values that trigger the fetch

  // --- Use vpcs directly in useFetchVpcGraphResource if needed, or ensure it uses selectedVpcId ---
  const { vpcGraphData, fetchVpcGraph, isLoading, error } = useFetchVpcGraphResource(
    selectedProvider as InfraResourceProvider,
    selectedAccountId,
    selectedRegion,
    //selectedVpcId // Pass selectedVpcId if the hook needs it directly
    // Or ensure fetchVpcGraph(selectedVpcId) uses the ID passed to it
  );

  useEffect(() => {
    console.log(
      "Effect for fetching graph triggered. VPC ID:", selectedVpcId,
      "Provider:", selectedProvider,
      "Account:", selectedAccountId
    );

    if (selectedVpcId && selectedProvider && selectedAccountId) {
      console.log('Condition met. Calling fetchVpcGraph for VPC ID:', selectedVpcId);
      fetchVpcGraph(selectedVpcId)
        .catch((fetchError) => {
          console.error('Error in fetchVpcGraph promise:', fetchError);
        });
    } else {
      console.log("Condition NOT met. Clearing graph data.");
      setSelectedVpcDetails(null);
    }
  }, [selectedVpcId, selectedProvider, selectedAccountId]);

  useEffect(() => {
    console.log("Processing vpcGraphData:", vpcGraphData);
    if (vpcGraphData && vpcGraphData.nodes && vpcGraphData.edges && vpcGraphData.nodes.length > 0) {

        const providerName = String(selectedProvider || 'unknown').toLowerCase();

        // 1. Prepare all nodes
        const allPreparedNodes = vpcGraphData.nodes.map((node: Node) => {
            const originalNodeId = String(node.id);
            const nodeResourceType = String(node.data?.originalData?.resourceType || node.data?.resourceType || 'unknown').toLowerCase();
            
            let displayLabel = ""; // Initialize displayLabel

            const azureProviderString = InfraResourceProvider.AZURE?.toString().toLowerCase();
            const specificNameFromOriginalData = node.data?.originalData?.name || node.data?.originalData?.Name;

            if (specificNameFromOriginalData && String(specificNameFromOriginalData).trim() !== "") {
                // Priority 1: Use specific name from originalData if available (for any provider)
                displayLabel = String(specificNameFromOriginalData).trim();
            } else if (providerName === azureProviderString) {
                // Priority 2 (Azure only): If no specific name, use last ID segment
                const idParts = originalNodeId.split('/');
                const lastIdSegment = idParts.pop() || originalNodeId; 
                displayLabel = lastIdSegment;
            } else {
                // Priority 2 (Non-Azure, and no specific name from originalData):
                // Directly use the originalNodeId.
                // We are explicitly AVOIDING node.data.label from the hook here for this case,
                // as it might contain the "resourceType: id" format we want to prevent.
                displayLabel = originalNodeId; 
            }
            
            // Final safety net: if displayLabel is somehow still empty after all attempts
            // (e.g., originalNodeId was empty, which is unlikely but possible),
            // use the raw originalNodeId (if it's not empty) or a placeholder.
            if (!displayLabel.trim()) {
                if (originalNodeId.trim()) {
                    displayLabel = originalNodeId;
                } else {
                    displayLabel = "unknown"; // Fallback if originalNodeId is also empty
                }
            }

            return {
                ...node, 
                id: originalNodeId, 
                type: 'iconNode',
                data: {
                    ...node.data, 
                    label: displayLabel, // Use the final, directly constructed label
                    provider: providerName, 
                    resourceType: nodeResourceType, 
                    originalData: node.data?.originalData, 
                },
                position: { x: 0, y: 0 }, 
                targetPosition: Position.Bottom,
                sourcePosition: Position.Bottom,
            };
        });
        // console.log("All Prepared Nodes IDs:", allPreparedNodes.map(n => n.id));

        // Create a map for quick node type lookup
        const nodeTypeMap = new Map<string, string>();
        allPreparedNodes.forEach(node => {
            nodeTypeMap.set(node.id, String(node.data.resourceType).toLowerCase());
        });

        // 2. Prepare initial edges
        const initialEdges: Edge[] = vpcGraphData.edges.map(edge => {
            const sourceType = nodeTypeMap.get(edge.source);
            const targetType = nodeTypeMap.get(edge.target);
            const style = getEdgeStyle(sourceType || '', targetType || '');
            
            return {
                ...edge,
                id: String(edge.id || `${String(edge.source)}-${String(edge.target)}`),
                source: String(edge.source),
                target: String(edge.target),
                style: style,
                animated: style.animated // Use the animated property from the style
            };
        });
        // console.log("Initial Edges (source/target):", initialEdges.map(e => ({ s: e.source, t: e.target })));


        // --- FILTER EDGES (Your existing logic) ---
        const filteredEdges = initialEdges.filter(edge => {
            const sourceType = nodeTypeMap.get(edge.source);
            const targetType = nodeTypeMap.get(edge.target);

            if ((sourceType === 'networkinterface' && targetType === 'securitygroup') ||
                (sourceType === 'securitygroup' && targetType === 'networkinterface')) {
                return false;
            }
            if ((sourceType === 'networkinterface' && targetType === 'subnet') ||
                (sourceType === 'subnet' && targetType === 'networkinterface')) {
                return false;
            }
            return true;
        });
        console.log(`Edges before filtering: ${initialEdges.length}, After filtering: ${filteredEdges.length}`);


        // --- SUBGRAPH or FULL GRAPH LOGIC ---
        let finalNodes: Node[];
        let layoutedEdges: Edge[];

        if (selectedInstanceId) {
            console.log(`Instance selected: ${selectedInstanceId}. Generating subgraph.`);
            const subgraph = getSubgraph(selectedInstanceId, allPreparedNodes, filteredEdges);
            
            // In subgraph view, all returned nodes are considered essential.
            // We lay them all out. The concept of "isolated" is not relevant here.
            const layoutResult = getLayoutedElements(subgraph.nodes, subgraph.edges, 'LR');
            finalNodes = layoutResult.nodes;
            layoutedEdges = layoutResult.edges;
            console.log(`Subgraph generated. Node count: ${finalNodes.length}, Edge count: ${layoutedEdges.length}`);

        } else if (selectedSubnetId) {
            console.log(`Subnet selected: ${selectedSubnetId}. Generating subnet subgraph.`);
            const subgraph = getSubgraphForSubnet(selectedSubnetId, allPreparedNodes, filteredEdges);
            const layoutResult = getLayoutedElements(subgraph.nodes, subgraph.edges, 'LR');
            finalNodes = layoutResult.nodes;
            layoutedEdges = layoutResult.edges;
            console.log(`Subnet subgraph generated. Node count: ${finalNodes.length}, Edge count: ${layoutedEdges.length}`);
        } else {
            console.log("No instance or subnet selected. Using full graph (or filtered by unused).");
            const nodesForLayout = allPreparedNodes;
            const edgesForLayout = filteredEdges;
      
            const connectedNodeIds = new Set<string>();
            edgesForLayout.forEach((edge) => {
                if (edge.source) connectedNodeIds.add(edge.source);
                if (edge.target) connectedNodeIds.add(edge.target);
            });
        
            const connectedNodes: Node[] = [];
            const isolatedNodes: Node[] = [];
            nodesForLayout.forEach(node => {
                if (connectedNodeIds.has(node.id)) {
                    connectedNodes.push(node);
                } else {
                    isolatedNodes.push(node);
                }
            });
            console.log(`Separated Nodes: Connected=${connectedNodes.length}, Isolated=${isolatedNodes.length}`);
        
            let layoutedConnectedNodes: Node[] = [];
            if (connectedNodes.length > 0) {
                console.log("Applying layout to connected nodes...");
                const finalEdgesForLayout = edgesForLayout.filter(edge => 
                    connectedNodes.some(n => n.id === edge.source) &&
                    connectedNodes.some(n => n.id === edge.target)
                );
        
                const layoutResult = getLayoutedElements(
                    connectedNodes, 
                    finalEdgesForLayout, 
                    'LR'
                );
                layoutedConnectedNodes = layoutResult.nodes;
                layoutedEdges = layoutResult.edges; 
            } else {
                console.log("No connected nodes to layout.");
                layoutedEdges = [];
            }
        
            const isolatedStartX = layoutedConnectedNodes.length > 0 ? (Math.max(...layoutedConnectedNodes.map(n => n.position.x + (n.width || nodeWidth))) + 100) : 50;
            const isolatedStartY = 50;
            const isolatedSpacingY = (nodeHeight || 50) + 30;
        
            isolatedNodes.forEach((node, index) => {
                node.position = { x: isolatedStartX, y: isolatedStartY + index * isolatedSpacingY };
                node.targetPosition = Position.Left; 
                node.sourcePosition = Position.Right; 
            });
        
            finalNodes = layoutedConnectedNodes;
            if (showIsolatedNodes) {
              finalNodes = [...layoutedConnectedNodes, ...isolatedNodes];
            }
        }
      
        console.log("Setting final nodes state (count: " + finalNodes.length + ")");
        setNodes(finalNodes);
        console.log("Setting final edges state (count: " + layoutedEdges.length + ")");
        setEdges(layoutedEdges); 
        


        // --- Fit View ---
        const timerId = setTimeout(() => {
            console.log("Fitting view...");
            const nodesToFit = showIsolatedNodes ? allPreparedNodes : allPreparedNodes.filter(n => new Set(filteredEdges.flatMap(e => [e.source, e.target])).has(n.id));
            if (nodesToFit.length > 0) {
                fitView({ nodes: nodesToFit.map(n => ({ id: n.id })), padding: 0.2, duration: 300 });
            } else {
                fitView({ padding: 0.2, duration: 300 });
            }
        }, 100);

        return () => clearTimeout(timerId);

    } else {
        console.log("Clearing nodes and edges because vpcGraphData is insufficient.");
        setNodes([]);
        setEdges([]);
    }
}, [vpcGraphData, selectedProvider, fitView, setNodes, setEdges, showIsolatedNodes, selectedInstanceId, selectedSubnetId]); // Dependencies

  // --- Node Click Handler ---
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log("Node click:", node);
    const displayData = node.data?.originalData || { info: "No detailed data available" };

    // Toggle behavior: If clicking the same node's data, close it. Otherwise, show new data.
    if (selectedNodeData === displayData) { // Compare data objects directly (might need adjustment if objects change identity)
      setSelectedNodeData(null);
    } else {
      setSelectedNodeData(displayData);
    }
  }, [selectedNodeData]); // Depend on selectedNodeData

  // --- Pane Click Handler ---
  const handlePaneClick = useCallback(() => {
    console.log("Pane click, closing node details box.");
    setSelectedNodeData(null); // Just clear the data to hide the panel
  }, []);

  // --- Close Panel Handler ---
  const handleCloseDetailsPanel = useCallback(() => {
    setSelectedNodeData(null);
  }, []);

  return (
    <DefaultLayout>
      {/* *** Add Breadcrumb *** */}
      <div style={{  borderBottom: '1px solid #ddd' }}>
        <ProviderButtons onProviderButtonClick={
          () => { 
            setSelectedVpcId('');
            setSelectedInstanceId(''); // <-- RESET INSTANCE
            setSelectedSubnetId(''); // Clear subnet when instance is selected
          }}
          hideAllProviders={true}
          hideEnterprise={true}
          />
        <div style={{display: 'flex', alignItems: 'center' }}>
          <select
            value={selectedVpcId}
            onChange={e => {
              const newVpcId = e.target.value;
              // Reset all states
              setSelectedVpcId(newVpcId);
              setSelectedInstanceId('');
              setSelectedSubnetId('');
              setNodes([]);
              setEdges([]);
              if (newVpcId) {
                fetchVpcGraph(newVpcId);
              }
            }}
            className="select-field"
            disabled={!selectedAccountId || !selectedProvider || !vpcs || vpcs.length === 0}
          >
            <option value="">Select VPC</option>
            {vpcs
              .filter(vpc => vpc.accountId === selectedAccountId || vpc.account_id === selectedAccountId)
              .map((vpc) => {
                const vpcName = vpc.name || vpc.tags?.Name;
                const vpcId = vpc.id || vpc.vpc_id;
                const displayText = vpcName ? `${vpcName} (${vpcId})` : vpcId;
                return (
                  <option key={vpcId} value={vpcId}>
                    {displayText}
                  </option>
                );
              })}
          </select>
          
          {/* Only show these dropdowns if a VPC is selected */}
          {selectedVpcId && (
            <>
              {/* Instance Dropdown */}
              <select
                value={selectedInstanceId}
                onChange={e => {
                  const newInstanceId = e.target.value;
                  // Reset graph before updating selection
                  setNodes([]);
                  setEdges([]);
                  setSelectedInstanceId(newInstanceId);
                  setSelectedSubnetId('');
                }}
                className="select-field"
                style={{ 
                  marginLeft: '10px',
                  opacity: selectedSubnetId ? '0.5' : '1'
                }}
                disabled={!selectedVpcId || nodes.length === 0 || !!selectedSubnetId}
              >
                <option value="">Focus on Instance</option>
                {nodes
                  .filter(node => getResourceType(node) === 'instance')
                  .map(instanceNode => (
                    <option key={instanceNode.id} value={instanceNode.id}>
                      {getNodeDisplayName(instanceNode)}
                    </option>
                  ))}
              </select>

              {/* Subnet Dropdown */}
              <select
                value={selectedSubnetId}
                onChange={e => {
                  const newSubnetId = e.target.value;
                  // Reset graph before updating selection
                  setNodes([]);
                  setEdges([]);
                  setSelectedSubnetId(newSubnetId);
                  setSelectedInstanceId('');
                }}
                className="select-field"
                style={{ 
                  marginLeft: '10px',
                  opacity: selectedInstanceId ? '0.5' : '1'
                }}
                disabled={!selectedVpcId || nodes.length === 0 || !!selectedInstanceId}
              >
                <option value="">Focus on Subnet</option>
                {nodes
                  .filter(node => getResourceType(node) === 'subnet')
                  .map(subnetNode => (
                    <option key={subnetNode.id} value={subnetNode.id}>
                      {getNodeDisplayName(subnetNode)}
                    </option>
                  ))}
              </select>
            </>
          )}

          {/* --- Checkbox to show isolated nodes --- */}
          <label style={{ 
            marginLeft: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            cursor: selectedInstanceId || selectedSubnetId ? 'not-allowed' : 'pointer',
            opacity: selectedInstanceId || selectedSubnetId ? '0.5' : '1'
          }}>
            <input
              type="checkbox"
              checked={showIsolatedNodes}
              onChange={e => setShowIsolatedNodes(e.target.checked)}
              style={{ marginRight: '5px' }}
              disabled={!!selectedInstanceId || !!selectedSubnetId}
            />
            Show unused resources
          </label>
          {isLoading && <span style={{ marginLeft: '10px' }}>Loading Graph...</span>}
          {error && <span style={{ marginLeft: '10px', color: 'red' }}>Error loading graph!</span>}
        </div>
      </div>

      <div style={{
        height: 'calc(100vh - 120px)',
        width: '100%',
        border: '1px solid #ddd',
        margin: '10px 0',
        position: 'relative',
        overflow: 'auto',
        borderRadius: '8px'
      }} className="vpc-graph-container">
        {nodes.length > 0 ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            nodesDraggable={true}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            key={selectedVpcId}
            fitView
            className="react-flow-full"
          >
            <Controls className="modern-controls">
              <ControlButton
                onClick={() => {
                  const elem = document.querySelector('.react-flow-full')?.parentElement;
                  if (elem) {
                    if (!document.fullscreenElement) {
                      elem.requestFullscreen();
                    } else {
                      document.exitFullscreen();
                    }
                  }
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path
                    fill="currentColor"
                    d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
                  />
                </svg>
              </ControlButton>
            </Controls>
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={1} 
              color="rgba(0, 0, 0, 0.05)" 
              style={{ backgroundColor: 'transparent' }} 
            />
          </ReactFlow>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
            {!selectedVpcId ? "Please select a VPC to view its network graph." : isLoading ? "Loading..." : "No graph data available or VPC is empty."}
          </div>
        )}

        {/* --- Use the new NodeDetailsPanel component --- */}
        <NodeDetailsPanel
          nodeData={selectedNodeData}
          onClose={handleCloseDetailsPanel}
        />
        {/* --- Remove the old details div --- */}
        {/* {selectedNodeData && ( <div style={{...}}> ... </div> )} */}

      </div>

      <VPCIndexModal
        isModalOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        selectedVpcIndex={selectedVpcDetails}
      />
    </DefaultLayout>
  );
};

const VPCGraph: React.FC = () => (
  <ReactFlowProvider>
    <VPCGraphInternal />
  </ReactFlowProvider>
);

export default VPCGraph;
export { VPCGraphInternal, VPCGraph }; // Export both for testing or other uses