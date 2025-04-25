import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Position,
  NodeTypes,
  BackgroundVariant, // <-- Import BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
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

// --- ADJUST NODE DIMENSIONS for layout ---
const nodeWidth = 48;
const nodeHeight = 48;

// --- Function to determine rank based on resource type ---
const getNodeRank = (resourceType: string | undefined): number | undefined => {
  const type = String(resourceType).toLowerCase();
  switch (type) {
    
  
    case 'instance':
      return 0;
    case 'securitygroup':
    case 'networkinterface':
      return 1;
    case 'acl':
    case 'subnet':
    case 'vpcendpoint': 
      return 2;
    // --- Corrected cases (removed underscores) ---
    case 'routetable': 
      return 3;
    case 'router': 
    case 'igw': 
    case 'natgateway': 
    case 'transitgatewayattachment': 
    case 'vpngateway': 
    case 'vpcpeeringconnection': 
      return 5;
    // --- End Corrected cases ---
    default:
      console.log(`Unknown resource type for ranking: ${type}`); // Log unknown types
      return undefined; // Let dagre decide if rank is unknown
  }
};
// --- End Rank Function ---

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 50, ranksep: 70 }); // nodesep increased from 30 to 50 (or try higher)

  nodes.forEach((node) => {
    const nodeOptions: { width: number; height: number; rank?: number } = {
      width: nodeWidth,
      height: nodeHeight,
    };
    const resourceType = node.data?.resourceType;
    const rank = getNodeRank(resourceType);
    if (rank !== undefined) {
      nodeOptions.rank = rank;
      console.log(`Assigning rank ${rank} to node ${node.id} (type: ${resourceType})`);
    } else {
      console.log(`No specific rank for node ${node.id} (type: ${resourceType})`);
    }
    g.setNode(node.id, nodeOptions);
  });

  edges.forEach((edge) => {
    if (g.hasNode(edge.source) && g.hasNode(edge.target)) {
      g.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(g);

  nodes.forEach((node) => {
    const nodeWithPosition = g.node(node.id);
    if (nodeWithPosition) {
      node.targetPosition = Position.Bottom;
      node.sourcePosition = Position.Bottom;
      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      };
    } else {
      console.warn(`Node ${node.id} not found in layout graph.`);
      node.position = { x: 0, y: 0 };
    }
  });

  return { nodes, edges };
};
// --- End Dagre Layouting Function ---

// --- Resource Type Helper ---
const getResourceType = (node: Node): string => {
  console.log('Checking node data for resource type:', node.data);
  const type = node.data?.resourceType || 'unknown';
  const resultType = String(type).toLowerCase();
  console.log('Determined resource type:', resultType);
  return resultType;
};
// --- End Resource Type Helper ---

const VPCGraphInternal: React.FC = () => {
  const { selectedProvider, selectedAccountId, selectedRegion } = useSelector((state: RootState) => state.selectedResources);

  const [selectedVpcId, setSelectedVpcId] = useState<string>('');
  const [selectedVpcDetails, setSelectedVpcDetails] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  const [selectedNodeData, setSelectedNodeData] = useState<any>(null);

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
    selectedVpcId // Pass selectedVpcId if the hook needs it directly
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

      // 1. Prepare all nodes (including resourceType for filtering)
      const allPreparedNodes = vpcGraphData.nodes.map((node: Node) => {
        const resourceType = node.data?.originalData?.resourceType || 'unknown';
        return {
          ...node,
          id: String(node.id),
          type: 'iconNode',
          data: {
            provider: providerName,
            resourceType: resourceType, // Keep original case type here
            originalData: node.data.originalData,
          },
          position: { x: 0, y: 0 },
          targetPosition: Position.Bottom,
          sourcePosition: Position.Bottom,
        };
      });

      // Create a map for quick node type lookup
      const nodeTypeMap = new Map<string, string>();
      allPreparedNodes.forEach(node => {
        nodeTypeMap.set(node.id, String(node.data.resourceType).toLowerCase());
      });

      // 2. Prepare initial edges
      const initialEdges: Edge[] = vpcGraphData.edges.map(edge => ({
        ...edge,
        id: String(edge.id || `${edge.source}-${edge.target}`),
        source: String(edge.source),
        target: String(edge.target),
      }));

      // --- FILTER EDGES ---
      const filteredEdges = initialEdges.filter(edge => {
        const sourceType = nodeTypeMap.get(edge.source);
        const targetType = nodeTypeMap.get(edge.target);

        // Check for ENI <-> Security Group
        if ((sourceType === 'networkinterface' && targetType === 'securitygroup') ||
            (sourceType === 'securitygroup' && targetType === 'networkinterface')) {
          return false; // Filter out
        }

        // Check for ENI <-> Subnet
        if ((sourceType === 'networkinterface' && targetType === 'subnet') ||
            (sourceType === 'subnet' && targetType === 'networkinterface')) {
          return false; // Filter out
        }

        return true; // Keep other edges
      });
      console.log(`Edges before filtering: ${initialEdges.length}, After filtering: ${filteredEdges.length}`);
      // --- END FILTER EDGES ---


      // 3. Identify connected nodes using FILTERED edges
      const connectedNodeIds = new Set<string>();
      filteredEdges.forEach(edge => { // Use filteredEdges here
        connectedNodeIds.add(edge.source);
        connectedNodeIds.add(edge.target);
      });


      // 4. Separate connected and isolated nodes
      const connectedNodes: Node[] = [];
      const isolatedNodes: Node[] = [];
      allPreparedNodes.forEach(node => {
        if (connectedNodeIds.has(node.id)) {
             connectedNodes.push(node);
        } else {
             // Check if it's an ENI/SG/Subnet that became isolated due to filtering
             const nodeType = nodeTypeMap.get(node.id);
             if (nodeType === 'networkinterface' || nodeType === 'securitygroup' || nodeType === 'subnet') {
                 console.log(`Node ${node.id} (${nodeType}) became isolated due to edge filtering, moving to isolated area.`);
                 isolatedNodes.push(node);
             } else {
                 // Other node types go to isolated if not in connectedNodeIds set
                 console.log(`Node ${node.id} (${nodeType}) is not in connected set, moving to isolated area.`);
                 isolatedNodes.push(node);
             }
        }
      });
      console.log(`Separated Nodes: Connected=${connectedNodes.length}, Isolated=${isolatedNodes.length}`);
      console.log("Isolated Node IDs:", isolatedNodes.map(n => n.id));


      // 5. Layout connected nodes using FILTERED edges
      let layoutedConnectedNodes: Node[] = [];
      let layoutedEdges: Edge[] = filteredEdges; // Start with filtered edges

      if (connectedNodes.length > 0) {
          console.log("Applying layout to connected nodes...");
          const layoutResult = getLayoutedElements(
            connectedNodes,
            filteredEdges, // Pass filtered edges to layout
            'LR'
          );
          layoutedConnectedNodes = layoutResult.nodes;
          layoutedEdges = layoutResult.edges; // Use edges returned by layout
      } else {
          console.log("No connected nodes to layout.");
      }

      // 6. Position isolated nodes manually
      const isolatedStartX = 600;
      const isolatedStartY = 50;
      const isolatedSpacingY = nodeHeight + 30;

      isolatedNodes.forEach((node, index) => {
        const newPos = { x: isolatedStartX, y: isolatedStartY + index * isolatedSpacingY };
        node.position = newPos;
        node.targetPosition = Position.Bottom;
        node.sourcePosition = Position.Bottom;
      });

      // 7. Combine and set state
      const finalNodes = [...layoutedConnectedNodes, ...isolatedNodes];

      console.log("Setting final nodes/edges state.");
      setNodes(finalNodes);
      setEdges(layoutedEdges); // Set the filtered and layouted edges

      // --- Fit View ---
      const timerId = setTimeout(() => {
          console.log("Fitting view...");
          if (layoutedConnectedNodes.length > 0) {
            fitView({ nodes: layoutedConnectedNodes.map(n => ({ id: n.id })), padding: 0.2, duration: 300 });
          } else {
            fitView({ padding: 0.2, duration: 300 }); // Fallback if only isolated nodes exist
          }
      }, 100);

      return () => clearTimeout(timerId);
      // --- End Fit View ---

    } else {
      console.log("Clearing nodes and edges.");
      setNodes([]);
      setEdges([]);
    }
  }, [vpcGraphData, selectedProvider, fitView, setNodes, setEdges]); // Dependencies

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


  const handleShowDetailsClick = () => {
    // --- Use vpcs directly ---
    const details = vpcs.find(vpc => vpc.id === selectedVpcId);
    setSelectedVpcDetails(details || { vpc_id: selectedVpcId });
    setIsModalOpen(true);
  }

  return (
    <>
      <div style={{ padding: '20px', borderBottom: '1px solid #ddd' }}>
        <ProviderButtons onProviderButtonClick={() => { setSelectedVpcId(''); }} />
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={selectedVpcId}
            onChange={e => setSelectedVpcId(e.target.value)}
            className="select-field"
            disabled={!selectedAccountId || !selectedProvider || !vpcs || vpcs.length === 0}
          >
            <option value="">Select VPC</option>
            {vpcs
              .filter(vpc => vpc.accountId === selectedAccountId || vpc.account_id === selectedAccountId)
              .map((vpc) => (
                <option key={vpc.id || vpc.vpc_id} value={vpc.id || vpc.vpc_id}>
                  {vpc.id || vpc.vpc_id} {vpc.name ? `– ${vpc.name}` : (vpc.tags?.Name ? `– ${vpc.tags.Name}` : '')}
                </option>
              ))}
          </select>
          <button
            onClick={handleShowDetailsClick}
            className="button-blue"
            disabled={!selectedVpcId}
          >
            Show VPC Details
          </button>
          {isLoading && <span style={{ marginLeft: '10px' }}>Loading Graph...</span>}
          {error && <span style={{ marginLeft: '10px', color: 'red' }}>Error loading graph!</span>}
        </div>
      </div>

      <div style={{
          height: 'calc(100vh - 200px)',
          width: '100%',
          border: '1px solid #ddd',
          margin: '20px 0',
          position: 'relative',
          overflow: 'auto'
        }}>
        {nodes.length > 0 ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            nodesDraggable={true}
            onNodeClick={handleNodeClick} // Ensure this is passed
            onPaneClick={handlePaneClick} // Ensure this is passed
            key={selectedVpcId}
          >
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
          </ReactFlow>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
            {!selectedVpcId ? "Please select a VPC to view its connectivity graph." : isLoading ? "Loading..." : "No graph data available or VPC is empty."}
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
    </>
  );
};

const VPCGraph: React.FC = () => (
  <ReactFlowProvider>
    <VPCGraphInternal />
  </ReactFlowProvider>
);

export default VPCGraph;