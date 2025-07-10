import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  NodeTypes,
  BackgroundVariant,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { InfraResourceProvider } from '@/common/enum';
import { useFetchVpcGraphResource } from '@/common/hooks/useFetchVpcGraphResource';
import IconNode from '@/components/GraphNodes/IconNode';
import '@/components/GraphNodes/IconNode.css';
import NodeDetailsPanel from '@/components/NodeDetailsPanel/NodeDetailsPanel';
import { renderVpcConnection, VpcDetail } from './renderVpcConnection';

// Custom region overlay component
const RegionOverlay = ({ 
  x, 
  y, 
  width, 
  height, 
  regionLabel, 
  vpcLabel,
  vpcId,
  color 
}: { 
  x: number; 
  y: number; 
  width: number; 
  height: number; 
  regionLabel: string;
  vpcLabel: string;
  vpcId: string;
  color: string; 
}) => {
  // Calculate VPC rectangle dimensions (smaller than region)
  const vpcPadding = 20;
  const vpcX = x + vpcPadding;
  const vpcY = y + 30; // Leave room for region label at top
  const vpcWidth = width - (vpcPadding * 2);
  const vpcHeight = height - 40 - vpcPadding;
  
  return (
    <>
      {/* Region overlay */}
      <div 
        style={{
          position: 'absolute',
          left: `${x}px`,
          top: `${y}px`,
          width: `${width}px`,
          height: `${height}px`,
          border: `2px dashed ${color}`,
          borderRadius: '8px',
          backgroundColor: `${color}10`,
          pointerEvents: 'none',
          zIndex: -1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          padding: '8px',
          boxSizing: 'border-box'
        }}
      >
        <div 
          style={{
            backgroundColor: color,
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          {regionLabel}
        </div>
      </div>
      
      {/* VPC overlay */}
      <div
        style={{
          position: 'absolute',
          left: `${vpcX}px`,
          top: `${vpcY}px`,
          width: `${vpcWidth}px`,
          height: `${vpcHeight}px`,
          border: `2px solid ${color}`,
          borderRadius: '6px',
          backgroundColor: `${color}05`,
          pointerEvents: 'none',
          zIndex: -1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            backgroundColor: `${color}80`,
            color: 'white',
            padding: '3px 10px',
            borderRadius: '0 0 4px 4px',
            fontSize: '11px',
            fontWeight: 'bold',
            maxWidth: '90%',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}
        >
          {vpcLabel}: {vpcId}
        </div>
      </div>
    </>
  );
};

export interface VpcConnectionRendererProps {
  sourceVpcDetail: VpcDetail;
  destVpcDetail: VpcDetail;
  height?: string;
  width?: string;
  showControls?: boolean;
  showMiniMap?: boolean;
  onNodeClick?: (node: Node) => void;
  className?: string;
}

const VpcConnectionRendererInternal: React.FC<VpcConnectionRendererProps> = ({
  sourceVpcDetail,
  destVpcDetail,
  height = '600px',
  width = '100%',
  showControls = true,
  showMiniMap = true,
  onNodeClick,
  className = '',
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView, getNodes } = useReactFlow();
  const [selectedNodeData, setSelectedNodeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Region overlay state
  const [regionOverlays, setRegionOverlays] = useState<{
    source: { x: number, y: number, width: number, height: number } | null,
    destination: { x: number, y: number, width: number, height: number } | null
  }>({
    source: null,
    destination: null
  });
  
  // Add refs to track if we've already fetched for specific VPC IDs
  const sourceVpcFetchedRef = useRef<string | null>(null);
  const destVpcFetchedRef = useRef<string | null>(null);
  
  // Source VPC data
  const { 
    vpcGraphData: sourceVpcGraphData, 
    fetchVpcGraph: fetchSourceVpcGraph, 
    isLoading: isSourceLoading, 
    error: sourceError 
  } = useFetchVpcGraphResource(
    sourceVpcDetail.provider,
    sourceVpcDetail.accountId,
    sourceVpcDetail.region
  );
  
  // Destination VPC data
  const { 
    vpcGraphData: destVpcGraphData, 
    fetchVpcGraph: fetchDestVpcGraph, 
    isLoading: isDestLoading, 
    error: destError 
  } = useFetchVpcGraphResource(
    destVpcDetail.provider,
    destVpcDetail.accountId,
    destVpcDetail.region
  );

  // Define node types
  const nodeTypes: NodeTypes = useMemo(() => ({
    iconNode: IconNode,
  }), []);

  // Fetch both VPC graphs with polling prevention
  useEffect(() => {
    // Only fetch if VPC IDs have changed or haven't been fetched yet
    const sourceVpcId = sourceVpcDetail.vpcId;
    const destVpcId = destVpcDetail.vpcId;
    
    if (
      sourceVpcId !== sourceVpcFetchedRef.current || 
      destVpcId !== destVpcFetchedRef.current
    ) {
      setIsLoading(true);
      
      const fetchBothGraphs = async () => {
        try {
          // Only fetch if not already fetched
          if (sourceVpcId !== sourceVpcFetchedRef.current) {
            await fetchSourceVpcGraph(sourceVpcId);
            sourceVpcFetchedRef.current = sourceVpcId;
          }
          
          if (destVpcId !== destVpcFetchedRef.current) {
            await fetchDestVpcGraph(destVpcId);
            destVpcFetchedRef.current = destVpcId;
          }
        } catch (err) {
          console.error('Error fetching VPC graphs:', err);
          setError(err instanceof Error ? err : new Error('Failed to fetch VPC graphs'));
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchBothGraphs();
    }
  }, [sourceVpcDetail.vpcId, destVpcDetail.vpcId, fetchSourceVpcGraph, fetchDestVpcGraph]);

  // Process graph data only when data changes
  const prevSourceData = useRef<string | null>(null);
  const prevDestData = useRef<string | null>(null);
  
  useEffect(() => {
    if (!sourceVpcGraphData || !destVpcGraphData) return;
    
    // Skip processing if the data hasn't changed
    const sourceDataString = JSON.stringify(sourceVpcGraphData);
    const destDataString = JSON.stringify(destVpcGraphData);
    
    if (
      sourceDataString === prevSourceData.current && 
      destDataString === prevDestData.current
    ) {
      return;
    }
    
    // Update refs with current data
    prevSourceData.current = sourceDataString;
    prevDestData.current = destDataString;
    
    // Use the shared renderVpcConnection function with layout adjustments
    // to position source on left and destination on right
    const { nodes: initialNodes, edges: processedEdges } = renderVpcConnection(
      sourceVpcDetail,
      sourceVpcGraphData,
      destVpcDetail,
      destVpcGraphData
    );
    
    // Position adjustment - ensure source nodes are on left and dest nodes on right
    const sourceNodes = initialNodes.filter(node => node.data?.isSourceVpc);
    const destNodes = initialNodes.filter(node => !node.data?.isSourceVpc);
    
    // Find current bounds
    let sourceMinX = Infinity, sourceMaxX = -Infinity;
    let destMinX = Infinity, destMaxX = -Infinity;
    
    sourceNodes.forEach(node => {
      sourceMinX = Math.min(sourceMinX, node.position.x);
      sourceMaxX = Math.max(sourceMaxX, node.position.x);
    });
    
    destNodes.forEach(node => {
      destMinX = Math.min(destMinX, node.position.x);
      destMaxX = Math.max(destMaxX, node.position.x);
    });
    
    // Reposition if needed to ensure source is left of destination
    const processedNodes = [...initialNodes];
    
    if (sourceMinX > destMinX) {
      // Need to swap positions
      const tempSourceX = sourceMinX;
      const sourceWidth = sourceMaxX - sourceMinX;
      const destWidth = destMaxX - destMinX;
      
      // Move source nodes to left
      sourceNodes.forEach(node => {
        const index = processedNodes.findIndex(n => n.id === node.id);
        if (index !== -1) {
          processedNodes[index] = {
            ...node,
            position: {
              ...node.position,
              x: node.position.x - tempSourceX + destMinX - sourceWidth - 150 // 150px gap
            }
          };
        }
      });
      
      // Ensure destination nodes are on right
      destNodes.forEach(node => {
        const index = processedNodes.findIndex(n => n.id === node.id);
        if (index !== -1) {
          processedNodes[index] = {
            ...node,
            position: {
              ...node.position,
              x: Math.max(node.position.x, sourceMinX + sourceWidth + 150) // 150px gap
            }
          };
        }
      });
    }
    
    setNodes(processedNodes);
    setEdges(processedEdges);
    
    // Fit view after graph is created
    setTimeout(() => {
      if (processedNodes.length > 0) {
        fitView({ padding: 0.2, duration: 300 });
        
        // Calculate region overlays after fitting view
        calculateRegionOverlays();
      }
    }, 300);
    
  }, [sourceVpcGraphData, destVpcGraphData, sourceVpcDetail, destVpcDetail, fitView, setNodes, setEdges]);

  // Calculate region overlays
  const calculateRegionOverlays = useCallback(() => {
    const allNodes = getNodes();
    if (!allNodes || allNodes.length === 0) return;
    
    // Separate nodes by VPC (source vs destination)
    const sourceNodes = allNodes.filter(node => node.data?.isSourceVpc);
    const destNodes = allNodes.filter(node => !node.data?.isSourceVpc);
    
    if (sourceNodes.length === 0 || destNodes.length === 0) return;
    
    // Calculate bounding box for source VPC
    let sourceMinX = Infinity, sourceMinY = Infinity, sourceMaxX = -Infinity, sourceMaxY = -Infinity;
    sourceNodes.forEach(node => {
      sourceMinX = Math.min(sourceMinX, node.position.x);
      sourceMinY = Math.min(sourceMinY, node.position.y);
      sourceMaxX = Math.max(sourceMaxX, node.position.x + 48); // Node width
      sourceMaxY = Math.max(sourceMaxY, node.position.y + 48); // Node height
    });
    
    // Calculate bounding box for destination VPC
    let destMinX = Infinity, destMinY = Infinity, destMaxX = -Infinity, destMaxY = -Infinity;
    destNodes.forEach(node => {
      destMinX = Math.min(destMinX, node.position.x);
      destMinY = Math.min(destMinY, node.position.y);
      destMaxX = Math.max(destMaxX, node.position.x + 48); // Node width
      destMaxY = Math.max(destMaxY, node.position.y + 48); // Node height
    });
    
    // Add padding to bounding boxes
    const padding = 50;
    
    setRegionOverlays({
      source: {
        x: sourceMinX - padding,
        y: sourceMinY - padding,
        width: sourceMaxX - sourceMinX + (padding * 2),
        height: sourceMaxY - sourceMinY + (padding * 2)
      },
      destination: {
        x: destMinX - padding,
        y: destMinY - padding,
        width: destMaxX - destMinX + (padding * 2),
        height: destMaxY - destMinY + (padding * 2)
      }
    });
  }, [getNodes]);

  // Update region overlays when nodes change
  useEffect(() => {
    if (nodes.length > 0 && !isLoading) {
      // Small delay to ensure nodes are properly positioned
      setTimeout(() => {
        calculateRegionOverlays();
      }, 500);
    }
  }, [nodes, isLoading, calculateRegionOverlays]);

  // Node click handler
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation();
    const displayData = node.data?.originalData || { info: "No detailed data available" };
    
    // Add VPC information to the node data
    const enhancedData = {
      ...displayData,
      _vpcInfo: {
        type: node.data?.isSourceVpc ? 'Source VPC' : 'Destination VPC',
        vpcId: node.data?.isSourceVpc ? sourceVpcDetail.vpcId : destVpcDetail.vpcId,
        provider: node.data?.isSourceVpc ? sourceVpcDetail.provider : destVpcDetail.provider,
        accountId: node.data?.isSourceVpc ? sourceVpcDetail.accountId : destVpcDetail.accountId,
        region: node.data?.isSourceVpc ? sourceVpcDetail.region : destVpcDetail.region,
      }
    };
    
    setSelectedNodeData(enhancedData);
    
    // Call external handler if provided
    if (onNodeClick) {
      onNodeClick(node);
    }
  }, [sourceVpcDetail, destVpcDetail, onNodeClick]);

  // Pane click handler to close details panel
  const handlePaneClick = useCallback(() => {
    setSelectedNodeData(null);
  }, []);

  // Close panel handler
  const handleCloseDetailsPanel = useCallback(() => {
    setSelectedNodeData(null);
  }, []);

  // Render loading state
  if (isLoading || isSourceLoading || isDestLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading VPC connection graph...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error || sourceError || destError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-red-600 text-lg font-medium mb-2">Error Loading VPC Graphs</h3>
        <p className="text-red-600">
          {(error || sourceError || destError)?.message || "An unknown error occurred"}
        </p>
      </div>
    );
  }

  // No nodes to display
  if (nodes.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-center">
        <h3 className="text-gray-600 text-lg font-medium mb-2">No VPC Connection Data</h3>
        <p className="text-gray-500">
          No graph data is available for the selected VPCs, or the VPCs do not have any resources.
        </p>
      </div>
    );
  }

  return (
    <div style={{ height, width }} className={`border border-gray-200 rounded-md ${className}`}>
      <div className="flex mb-2 justify-between items-center p-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
            <span className="text-xs">Source: {sourceVpcDetail.vpcId} ({sourceVpcDetail.region})</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
            <span className="text-xs">Destination: {destVpcDetail.vpcId} ({destVpcDetail.region})</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
            <span className="text-xs">Connections</span>
          </div>
        </div>
      </div>
      
      <div style={{ position: 'relative', width: '100%', height: 'calc(100% - 32px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          nodesDraggable={true}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          minZoom={0.1}
          maxZoom={1.5}
          fitView
        >
          {showControls && <Controls />}
          {showMiniMap && <MiniMap />}
          <Background variant={BackgroundVariant.Lines} gap={24} size={1} color='#f0f0f0' />
        </ReactFlow>
        
        {/* Region overlays */}
        {regionOverlays.source && (
          <RegionOverlay
            x={regionOverlays.source.x}
            y={regionOverlays.source.y}
            width={regionOverlays.source.width}
            height={regionOverlays.source.height}
            regionLabel={`Region: ${sourceVpcDetail.region}`}
            vpcLabel="Source VPC"
            vpcId={sourceVpcDetail.vpcId}
            color="#3585e2"
          />
        )}
        
        {regionOverlays.destination && (
          <RegionOverlay
            x={regionOverlays.destination.x}
            y={regionOverlays.destination.y}
            width={regionOverlays.destination.width}
            height={regionOverlays.destination.height}
            regionLabel={`Region: ${destVpcDetail.region}`}
            vpcLabel="Destination VPC"
            vpcId={destVpcDetail.vpcId}
            color="#e23535"
          />
        )}
      </div>
      
      {selectedNodeData && (
        <NodeDetailsPanel
          nodeData={selectedNodeData}
          onClose={handleCloseDetailsPanel}
        />
      )}
    </div>
  );
};

// Wrap with ReactFlowProvider to ensure proper context
export const VpcConnectionRenderer: React.FC<VpcConnectionRendererProps> = (props) => (
  <ReactFlowProvider>
    <VpcConnectionRendererInternal {...props} />
  </ReactFlowProvider>
);