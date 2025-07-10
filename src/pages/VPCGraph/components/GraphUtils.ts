import { Node as RFNode, Edge, Position } from 'reactflow'; // Use an alias
import dagre from 'dagre';

// Node dimensions for layout calculations
export const NODE_WIDTH = 48;
export const NODE_HEIGHT = 48;

// Ensure getResourceIcon is defined or imported if it's in another utility file
export const getResourceIcon = (resourceType: string | undefined): string => {
  const type = String(resourceType).toLowerCase();
  switch (type) {
    case 'instance':
    case 'ec2instance': // Common AWS term
    case 'virtualmachine': // Common Azure/GCP term
      return '/icons/ec2.svg'; // Assuming a generic compute icon
    case 'subnet':
      return '/icons/subnet.svg';
    // Add other resource types as needed
    default:
      return '/icons/generic.svg';
  }
};

/**
 * Get the rank of a node based on its resource type for hierarchical layout
 * @param resourceType The type of AWS/cloud resource
 * @returns A number representing the rank (vertical position) or undefined
 */
export const getNodeRank = (resourceType: string | undefined): number | undefined => {
  if (!resourceType) return undefined;
  
  const type = String(resourceType).toLowerCase();
  switch (type) {
    case 'networkinterface':
      return 0; // Network interfaces are often foundational
    case 'instance':
      return 1;
    case 'subnet':
    case 'securitygroup':
      return 2;
    case 'acl':
    case 'vpcendpoint':
      return 3;
    case 'routetable':
    case 'natgateway':
    case 'lb':
      return 4;
    case 'router':
    case 'igw':
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
 * Determine resource type from node data
 * @param node ReactFlow node object
 * @returns The resource type as a string
 */
export const getResourceType = (node: RFNode | undefined): string => {
  if (!node || !node.data) return 'unknown';
  return String(node.data.resourceType || node.data.originalData?.resourceType || 'unknown').toLowerCase();
};

/**
 * Get a readable display name for a node
 * @param node ReactFlow node object
 * @returns A human-readable name for the node
 */
export const getNodeDisplayName = (node: RFNode, defaultId?: string): string => {
  if (!node || !node.data) return defaultId || node.id || 'unknown';

  const originalData = node.data.originalData;
  const providerName = String(node.data.provider || 'unknown').toLowerCase();
  const azureProviderString = 'azure'; // Assuming InfraResourceProvider.AZURE.toLowerCase()

  let displayLabel = "";
  const specificNameFromOriginalData = originalData?.name || originalData?.Name;

  if (specificNameFromOriginalData && String(specificNameFromOriginalData).trim() !== "") {
    displayLabel = String(specificNameFromOriginalData).trim();
  } else if (providerName === azureProviderString) {
    const idParts = (defaultId || node.id).split('/');
    displayLabel = idParts.pop() || (defaultId || node.id);
  } else {
    displayLabel = defaultId || node.id;
  }

  if (!displayLabel.trim()) {
    displayLabel = (defaultId || node.id).trim() || "unknown";
  }
  return displayLabel;
};

export const getSubgraph = (startNodeId: string, allNodes: RFNode[], allEdges: Edge[]): { nodes: RFNode[], edges: Edge[] } => {
  if (!startNodeId) {
    return { nodes: allNodes, edges: allEdges };
  }

  const nodeMap = new Map(allNodes.map(n => [n.id, n]));
  const forwardAdj = new Map<string, string[]>();
  const backwardAdj = new Map<string, string[]>();
  
  // Build both forward and backward adjacency lists
  allEdges.forEach(edge => {
    if (!forwardAdj.has(edge.source)) forwardAdj.set(edge.source, []);
    if (!backwardAdj.has(edge.target)) backwardAdj.set(edge.target, []);
    forwardAdj.get(edge.source)!.push(edge.target);
    backwardAdj.get(edge.target)!.push(edge.source);
  });

  const getConnectedNodes = (id: string, forward: boolean = true): RFNode[] => {
    const adj = forward ? forwardAdj : backwardAdj;
    return (adj.get(id) || [])
      .map(connectedId => nodeMap.get(connectedId))
      .filter((node): node is RFNode => !!node);
  };

  const getConnectedNodesOfType = (id: string, type: string, forward: boolean = true): RFNode[] => {
    const nodes = getConnectedNodes(id, forward);
    const results = nodes.filter(node => {
      const nodeType = getResourceType(node).toLowerCase();
      return nodeType === type.toLowerCase() || 
             (type === 'loadbalancer' && (nodeType === 'lb' || nodeType === 'elasticloadbalancer'));
    });
    console.log(`Found ${results.length} nodes of type ${type} connected to ${id}`);
    return results;
  };

  const startInstance = nodeMap.get(startNodeId);
  if (!startInstance || getResourceType(startInstance) !== 'instance') {
    return { nodes: allNodes, edges: allEdges };
  }

  const finalNodeIds = new Set<string>();
  const subnetInstanceEdges = new Set<string>();  // Track subnet-instance connections
  finalNodeIds.add(startNodeId);

  // Find network interfaces
  const networkInterfaces = getConnectedNodesOfType(startNodeId, 'networkinterface');
  networkInterfaces.forEach(ni => finalNodeIds.add(ni.id));
  
  // Find security groups
  getConnectedNodesOfType(startNodeId, 'securitygroup').forEach(sg => finalNodeIds.add(sg.id));
  
  // Find load balancers
  ['lb', 'loadbalancer', 'elasticloadbalancer'].forEach(lbType => {
    getConnectedNodesOfType(startNodeId, lbType).forEach(lb => finalNodeIds.add(lb.id));
  });

  // Find subnets directly from the instance
  const subnets = [
    ...getConnectedNodesOfType(startNodeId, 'subnet', true),
    ...getConnectedNodesOfType(startNodeId, 'subnet', false)
  ];
  
  console.log(`Found ${subnets.length} subnets for instance ${startNodeId}`);
  
  subnets.forEach(subnet => {
    finalNodeIds.add(subnet.id);
    
    // Find instances in this subnet
    const subnetInstances = [
      ...getConnectedNodesOfType(subnet.id, 'instance', true),
      ...getConnectedNodesOfType(subnet.id, 'instance', false)
    ];
    subnetInstances.forEach(inst => {
      if (inst.id !== startNodeId) {
        finalNodeIds.add(inst.id);
        // Track subnet-instance connection
        subnetInstanceEdges.add(`${subnet.id}-${inst.id}`);
        subnetInstanceEdges.add(`${inst.id}-${subnet.id}`);
      }
    });
    
    // Find ACLs for this subnet
    const acls = [
      ...getConnectedNodesOfType(subnet.id, 'acl', true),
      ...getConnectedNodesOfType(subnet.id, 'acl', false)
    ];
    acls.forEach(acl => finalNodeIds.add(acl.id));
    
    // Find route tables for this subnet
    const routeTables = [
      ...getConnectedNodesOfType(subnet.id, 'routetable', true),
      ...getConnectedNodesOfType(subnet.id, 'routetable', false)
    ];
    
    console.log(`Found ${routeTables.length} route tables for subnet ${subnet.id}`);
    
    routeTables.forEach(rt => {
      finalNodeIds.add(rt.id);
      
      // Find gateways
      ['igw', 'vgw', 'router'].forEach(gwType => {
        const gateways = [
          ...getConnectedNodesOfType(rt.id, gwType, true),
          ...getConnectedNodesOfType(rt.id, gwType, false)
        ];
        gateways.forEach(gw => finalNodeIds.add(gw.id));
      });
      
      // Find other subnets connected to this route table
      const connectedSubnets = [
        ...getConnectedNodesOfType(rt.id, 'subnet', true),
        ...getConnectedNodesOfType(rt.id, 'subnet', false)
      ].filter(s => s.id !== subnet.id);
      
      console.log(`Found ${connectedSubnets.length} other subnets for route table ${rt.id}`);
      
      connectedSubnets.forEach(subnet2 => {
        finalNodeIds.add(subnet2.id);
        
        // Find instances in the other subnet
        const subnet2Instances = [
          ...getConnectedNodesOfType(subnet2.id, 'instance', true),
          ...getConnectedNodesOfType(subnet2.id, 'instance', false)
        ];
        subnet2Instances.forEach(inst => {
          if (inst.id !== startNodeId) {
            finalNodeIds.add(inst.id);
            // Track subnet-instance connection
            subnetInstanceEdges.add(`${subnet2.id}-${inst.id}`);
            subnetInstanceEdges.add(`${inst.id}-${subnet2.id}`);
          }
        });
      });
    });
  });

  const subgraphNodes = allNodes.filter(node => finalNodeIds.has(node.id)).map(node => ({
    ...node,
    data: {
      ...node.data,
      isSelected: node.id === startNodeId
    }
  }));
  const finalEdges = allEdges.filter(edge => {
    // Always include edges where neither end is an instance
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    if (!sourceNode || !targetNode) return false;

    const sourceType = getResourceType(sourceNode);
    const targetType = getResourceType(targetNode);
    
    // If it's not an instance-related edge, include it if both nodes are in our set
    if (sourceType !== 'instance' && targetType !== 'instance') {
      return finalNodeIds.has(edge.source) && finalNodeIds.has(edge.target);
    }

    // If it involves the selected instance, include the edge
    if (edge.source === startNodeId || edge.target === startNodeId) {
      return finalNodeIds.has(edge.source) && finalNodeIds.has(edge.target);
    }

    // For other instances, only include their subnet connections
    return subnetInstanceEdges.has(`${edge.source}-${edge.target}`);
  });

  console.log(`Final subgraph has ${subgraphNodes.length} nodes and ${finalEdges.length} edges`);
  return { nodes: subgraphNodes, edges: finalEdges };
};

export const getSubgraphForSubnet = (startNodeId: string, allNodes: RFNode[], allEdges: Edge[]): { nodes: RFNode[], edges: Edge[] } => {
  if (!startNodeId) {
    return { nodes: allNodes, edges: allEdges };
  }

  const nodeMap = new Map(allNodes.map(n => [n.id, n]));
  const forwardAdj = new Map<string, string[]>();
  const backwardAdj = new Map<string, string[]>();
  
  // Build both forward and backward adjacency lists
  allEdges.forEach(edge => {
    if (!forwardAdj.has(edge.source)) forwardAdj.set(edge.source, []);
    if (!backwardAdj.has(edge.target)) backwardAdj.set(edge.target, []);
    forwardAdj.get(edge.source)!.push(edge.target);
    backwardAdj.get(edge.target)!.push(edge.source);
  });

  const getConnectedNodes = (id: string, forward: boolean = true): RFNode[] => {
    const adj = forward ? forwardAdj : backwardAdj;
    return (adj.get(id) || [])
      .map(connectedId => nodeMap.get(connectedId))
      .filter((node): node is RFNode => !!node);
  };

  const getConnectedNodesOfType = (id: string, type: string, forward: boolean = true): RFNode[] => {
    const nodes = getConnectedNodes(id, forward);
    return nodes.filter(node => getResourceType(node) === type.toLowerCase());
  };

  const startSubnet = nodeMap.get(startNodeId);
  if (!startSubnet || getResourceType(startSubnet) !== 'subnet') {
    return { nodes: allNodes, edges: allEdges };
  }

  const finalNodeIds = new Set<string>();
  finalNodeIds.add(startNodeId);

  // Add ACLs for this subnet
  getConnectedNodesOfType(startNodeId, 'acl', true)
    .concat(getConnectedNodesOfType(startNodeId, 'acl', false))
    .forEach(acl => finalNodeIds.add(acl.id));

  // Find route tables
  const routeTables = getConnectedNodesOfType(startNodeId, 'routetable', true)
    .concat(getConnectedNodesOfType(startNodeId, 'routetable', false));
  
  routeTables.forEach(rt => {
    finalNodeIds.add(rt.id);
    
    // Add gateways connected to route tables
    ['igw', 'vgw', 'router', 'natgateway'].forEach(gwType => {
      getConnectedNodesOfType(rt.id, gwType, true)
        .concat(getConnectedNodesOfType(rt.id, gwType, false))
        .forEach(gw => finalNodeIds.add(gw.id));
    });
    
    // Add other subnets connected to this route table
    getConnectedNodesOfType(rt.id, 'subnet', true)
      .concat(getConnectedNodesOfType(rt.id, 'subnet', false))
      .filter(subnet => subnet.id !== startNodeId)
      .forEach(subnet => {
        finalNodeIds.add(subnet.id);
        // Add ACLs for connected subnets
        getConnectedNodesOfType(subnet.id, 'acl', true)
          .concat(getConnectedNodesOfType(subnet.id, 'acl', false))
          .forEach(acl => finalNodeIds.add(acl.id));
      });
  });

  const subgraphNodes = allNodes
    .filter(node => {
      // Exclude instance nodes
      if (getResourceType(node) === 'instance') return false;
      return finalNodeIds.has(node.id);
    })
    .map(node => ({
      ...node,
      data: {
        ...node.data,
        isSelected: node.id === startNodeId
      }
    }));

  const finalEdges = allEdges.filter(edge => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    if (!sourceNode || !targetNode) return false;

    // Skip edges connected to instances
    if (getResourceType(sourceNode) === 'instance' || getResourceType(targetNode) === 'instance') {
      return false;
    }

    return finalNodeIds.has(edge.source) && finalNodeIds.has(edge.target);
  });

  return { nodes: subgraphNodes, edges: finalEdges };
};

export const getLayoutedElements = (nodes: RFNode[], edges: Edge[], direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  // Explicitly set rankdir for a directional layout
  dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // We are shifting the dagre node position (anchor=center) to the top left
    // so it matches React Flow's anchor point (top left).
    node.targetPosition = Position.Left;
    node.sourcePosition = Position.Right;
    
    node.position = {
      x: nodeWithPosition.x - NODE_WIDTH / 2,
      y: nodeWithPosition.y - NODE_HEIGHT / 2,
    };
    return node;
  });

  return { nodes: layoutedNodes, edges: edges };
};