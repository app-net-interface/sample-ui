import { Node, Edge, Position } from 'reactflow';
import dagre from 'dagre';
import { InfraResourceProvider } from '@/common/enum';

export interface VpcDetail {
  provider: InfraResourceProvider;
  accountId: string;
  region: string;
  vpcId: string;
}

export interface VpcGraphData {
  nodes: Node[];
  edges: Edge[];
}

// Node dimensions for layout
const NODE_WIDTH = 48;
const NODE_HEIGHT = 48;

/**
 * Get the rank of a node based on its resource type for hierarchical layout
 * @param resourceType The type of AWS/cloud resource
 * @returns A number representing the rank (vertical position) or undefined
 */
export const getNodeRank = (resourceType: string | undefined): number | undefined => {
  if (!resourceType) return undefined;
  
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
    case 'routetable':
      return 3;
    case 'router':
    case 'igw':
    case 'natgateway':
    case 'transitgatewayattachment':
    case 'vpngateway':
    case 'vpcpeeringconnection':
      return 5;
    default:
      console.log(`Unknown resource type for ranking: ${type}`);
      return undefined;
  }
};

/**
 * Get a readable display name for a node
 * @param node ReactFlow node object
 * @returns A human-readable name for the node
 */
export const getNodeDisplayName = (node: Node, defaultId?: string): string => {
  const originalNodeId = defaultId || String(node.id);
  return node.data?.originalData?.name || 
         node.data?.originalData?.Name || 
         node.data?.label ||
         originalNodeId;
};

/**
 * Layout nodes and edges using the dagre library
 * @param nodes Array of ReactFlow nodes
 * @param edges Array of ReactFlow edges
 * @param direction Layout direction ('TB' for top-bottom, 'LR' for left-right)
 * @param offsetX Horizontal offset for the entire graph
 * @param offsetY Vertical offset for the entire graph
 * @returns Object containing positioned nodes and edges
 */
export const getLayoutedElements = (
  nodes: Node[], 
  edges: Edge[], 
  direction = 'TB', 
  offsetX = 0,
  offsetY = 0
) => {
  // Create a new directed graph
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  
  // Set graph properties
  g.setGraph({ 
    rankdir: direction, 
    nodesep: 50,  // Minimum distance between nodes in the same rank
    ranksep: 100, // Distance between ranks
    ranker: 'network-simplex', // Use network simplex algorithm for layout
  });

  // Add nodes to the graph with their dimensions and rank
  nodes.forEach((node) => {
    const nodeOptions: { width: number; height: number; rank?: number } = {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    };
    
    // Get node rank for hierarchical positioning
    const resourceType = node.data?.resourceType;
    const rank = getNodeRank(resourceType);
    if (rank !== undefined) {
      nodeOptions.rank = rank;
    }
    
    g.setNode(node.id, nodeOptions);
  });

  // Add edges to the graph
  edges.forEach((edge) => {
    if (g.hasNode(edge.source) && g.hasNode(edge.target)) {
      g.setEdge(edge.source, edge.target);
    }
  });

  // Run the layout algorithm
  dagre.layout(g);

  // Apply the calculated positions to the nodes
  nodes.forEach((node) => {
    const nodeWithPosition = g.node(node.id);
    if (nodeWithPosition) {
      // Set connection points based on layout direction
      if (direction === 'TB') {
        node.targetPosition = Position.Top;
        node.sourcePosition = Position.Bottom;
      } else {
        node.targetPosition = Position.Left;
        node.sourcePosition = Position.Right;
      }
      
      // Apply position with offset
      node.position = {
        x: nodeWithPosition.x - NODE_WIDTH / 2 + offsetX,
        y: nodeWithPosition.y - NODE_HEIGHT / 2 + offsetY,
      };
    } else {
      console.warn(`Node ${node.id} not found in layout graph.`);
      node.position = { x: offsetX, y: offsetY };
    }
  });

  return { nodes, edges };
};

/**
 * Style nodes based on whether they belong to source or destination VPC
 * @param nodes Array of ReactFlow nodes
 * @param isSource Whether these nodes belong to the source VPC
 * @returns Styled nodes
 */
export const styleVpcNodes = (nodes: Node[], isSource: boolean = true): Node[] => {
  const borderColor = isSource ? '#3585e2' : '#e23535'; // Blue for source, red for destination
  const prefix = isSource ? 'source-' : 'dest-';
  
  return nodes.map(node => ({
    ...node,
    id: `${prefix}${node.id}`,
    style: {
      ...node.style,
      borderColor
    },
    data: {
      ...node.data,
      isSourceVpc: isSource
    }
  }));
};

/**
 * Style edges based on whether they belong to source or destination VPC
 * @param edges Array of ReactFlow edges
 * @param isSource Whether these edges belong to the source VPC
 * @param prefix Node ID prefix to use for source/target
 * @returns Styled edges
 */
export const styleVpcEdges = (edges: Edge[], isSource: boolean = true): Edge[] => {
  const strokeColor = isSource ? '#3585e2' : '#e23535'; // Blue for source, red for destination
  const prefix = isSource ? 'source-' : 'dest-';
  
  return edges.map(edge => ({
    ...edge,
    id: `${prefix}${edge.id || `${edge.source}-${edge.target}`}`,
    source: `${prefix}${edge.source}`,
    target: `${prefix}${edge.target}`,
    style: {
      ...edge.style,
      stroke: strokeColor
    }
  }));
};

/**
 * Create connection edges between compatible nodes in source and destination VPCs
 * @param sourceNodes Nodes from the source VPC
 * @param destNodes Nodes from the destination VPC
 * @returns Array of connection edges
 */
export const createConnectionEdges = (sourceNodes: Node[], destNodes: Node[]): Edge[] => {
  const connectionEdges: Edge[] = [];
  
  // Connection-capable resource types
  const connectionTypes = [
    'transitgatewayattachment',
    'vpcpeeringconnection',
    'vpngateway',
    'internetgateway',
    'natgateway'
  ];
  
  // Find potential connecting nodes
  sourceNodes.forEach(sourceNode => {
    const sourceType = String(sourceNode.data?.resourceType || '').toLowerCase();
    
    if (connectionTypes.includes(sourceType)) {
      destNodes.forEach(destNode => {
        const destType = String(destNode.data?.resourceType || '').toLowerCase();
        
        if (connectionTypes.includes(destType)) {
          // Create a connection edge
          connectionEdges.push({
            id: `connection-${sourceNode.id}-${destNode.id}`,
            source: sourceNode.id,
            target: destNode.id,
            type: 'straight',
            animated: true,
            style: { 
              stroke: '#009900', // Green for connections
              strokeWidth: 2,
              strokeDasharray: '5,5' 
            },
            label: 'Potential Connection',
          });
        }
      });
    }
  });
  
  return connectionEdges;
};

/**
 * Process VPC graph data to create a unified connection graph
 * 
 * @param sourceVpcDetail Source VPC details (provider, account, region, vpc ID)
 * @param sourceGraphData Source VPC graph data (nodes and edges)
 * @param destVpcDetail Destination VPC details
 * @param destGraphData Destination VPC graph data
 * @returns Processed nodes and edges ready for rendering in ReactFlow
 */
export const renderVpcConnection = (
  sourceVpcDetail: VpcDetail,
  sourceGraphData: VpcGraphData,
  destVpcDetail: VpcDetail,
  destGraphData: VpcGraphData
): { nodes: Node[]; edges: Edge[] } => {
  
  if (
    !sourceGraphData?.nodes || 
    !sourceGraphData?.edges || 
    !destGraphData?.nodes || 
    !destGraphData?.edges
  ) {
    console.warn("Incomplete graph data provided");
    return { nodes: [], edges: [] };
  }

  try {
    // Process source VPC nodes
    const sourceNodes = sourceGraphData.nodes.map((node: any) => {
      const originalNodeId = String(node.id);
      const nodeResourceType = String(node.data?.originalData?.resourceType || node.data?.resourceType || 'unknown').toLowerCase();
      const displayLabel = getNodeDisplayName(node, originalNodeId);
      
      return {
        ...node, 
        id: originalNodeId,
        type: 'iconNode', 
        data: {
          ...node.data, 
          label: displayLabel,
          provider: String(sourceVpcDetail.provider).toLowerCase(), 
          resourceType: nodeResourceType, 
          originalData: node.data?.originalData,
          vpcId: sourceVpcDetail.vpcId
        },
        position: { x: 0, y: 0 },
      };
    });
    
    // Process destination VPC nodes
    const destNodes = destGraphData.nodes.map((node: any) => {
      const originalNodeId = String(node.id);
      const nodeResourceType = String(node.data?.originalData?.resourceType || node.data?.resourceType || 'unknown').toLowerCase();
      const displayLabel = getNodeDisplayName(node, originalNodeId);
      
      return {
        ...node, 
        id: originalNodeId,
        type: 'iconNode', 
        data: {
          ...node.data, 
          label: displayLabel,
          provider: String(destVpcDetail.provider).toLowerCase(), 
          resourceType: nodeResourceType, 
          originalData: node.data?.originalData,
          vpcId: destVpcDetail.vpcId
        },
        position: { x: 0, y: 0 },
      };
    });
    
    // Style nodes for source and destination VPCs
    const styledSourceNodes = styleVpcNodes(sourceNodes, true);
    const styledDestNodes = styleVpcNodes(destNodes, false);
    
    // Style edges for source and destination VPCs
    const styledSourceEdges = styleVpcEdges(sourceGraphData.edges, true);
    const styledDestEdges = styleVpcEdges(destGraphData.edges, false);
    
    // Position source VPC on the left
    const { nodes: layoutedSourceNodes, edges: layoutedSourceEdges } = 
      getLayoutedElements(styledSourceNodes, styledSourceEdges, 'LR', 0, 0);
    
    // Position destination VPC on the right with offset
    const { nodes: layoutedDestNodes, edges: layoutedDestEdges } = 
      getLayoutedElements(styledDestNodes, styledDestEdges, 'LR', 800, 0);
    
    // Create connection edges between VPCs
    const connectionEdges = createConnectionEdges(layoutedSourceNodes, layoutedDestNodes);

    // Combine all nodes and edges
    const allNodes = [...layoutedSourceNodes, ...layoutedDestNodes];
    const allEdges = [...layoutedSourceEdges, ...layoutedDestEdges, ...connectionEdges];
    
    return { nodes: allNodes, edges: allEdges };
    
  } catch (err) {
    console.error("Error processing VPC graph data:", err);
    return { nodes: [], edges: [] };
  }
};