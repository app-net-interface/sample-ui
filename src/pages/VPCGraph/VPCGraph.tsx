import React, { useState, useEffect, useCallback } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import ProviderButtons from '@/components/ProviderRegion/ProviderRegionBar';
import VPCIndexModal from '@/components/Modal/VPCIndexModal';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useFetchVpcsResources } from '@/common/hooks/useFetchVpcsResources';
import { useFetchVpcGraphResource } from '@/common/hooks/useFetchVpcGraphResource';
import { InfraResourceProvider } from '@/common/enum';

const VPCGraphInternal: React.FC = () => {
  const { selectedProvider, selectedAccountId } = useSelector((state: RootState) => state.selectedResources);

  const [selectedVpcId, setSelectedVpcId] = useState<string>('');
  const [selectedVpcDetails, setSelectedVpcDetails] = useState<any>(null);
  const [vpcList, setVpcList] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  const [selectedNodeData, setSelectedNodeData] = useState<any>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { vpcs, fetchVpcs } = useFetchVpcsResources(
    selectedProvider as InfraResourceProvider,
    selectedAccountId,
    ''
  );

  useEffect(() => {
    if (selectedAccountId && selectedProvider) {
      console.log('Fetching VPC list for account:', selectedAccountId);
      fetchVpcs();
    } else {
      setVpcList([]);
      setSelectedVpcId('');
    }
  }, [selectedAccountId, selectedProvider]);

  useEffect(() => {
    console.log('VPC list from backend:', vpcs);
    setVpcList(vpcs);
  }, [vpcs]);

  const { vpcGraphData, fetchVpcGraph, isLoading, error } = useFetchVpcGraphResource(
    selectedProvider as InfraResourceProvider,
    selectedAccountId,
    ''
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
        .then(() => {
          console.log('fetchVpcGraph promise resolved.');
        })
        .catch((fetchError) => {
          console.error('Error in fetchVpcGraph promise:', fetchError);
          setNodes([]);
          setEdges([]);
        });
    } else {
      console.log("Condition NOT met. Clearing graph data.");
      setNodes([]);
      setEdges([]);
      setSelectedVpcDetails(null);
    }
  }, [selectedVpcId, selectedProvider, selectedAccountId]);

  useEffect(() => {
    console.log("Hook vpcGraphData updated:", vpcGraphData);
    setNodes(vpcGraphData.nodes);
    setEdges(vpcGraphData.edges);
    setTimeout(() => fitView({ padding: 0.1, duration: 500 }), 100);
  }, [vpcGraphData, setNodes, setEdges, fitView]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log("Node click:", node);
    if (node.id === selectedNodeId) {
      setSelectedNodeData(null);
      setSelectedNodeId(null);
    } else {
      setSelectedNodeData(node.data?.originalData || { error: "No original data found" });
      setSelectedNodeId(node.id);
    }
  }, [selectedNodeId]);

  const handlePaneClick = useCallback(() => {
    console.log("Pane click, closing node details box.");
    setSelectedNodeData(null);
    setSelectedNodeId(null);
  }, []);

  const handleShowDetailsClick = () => {
    const details = vpcList.find(vpc => vpc.id === selectedVpcId);
    setSelectedVpcDetails(details || { vpc_id: selectedVpcId });
    setIsModalOpen(true);
  }

  return (
    <>
      <div style={{ padding: '20px', borderBottom: '1px solid #ddd' }}>
        <ProviderButtons onProviderButtonClick={() => { }} />
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={selectedVpcId}
            onChange={e => setSelectedVpcId(e.target.value)}
            className="select-field"
            disabled={!selectedAccountId || !selectedProvider || vpcList.length === 0}
          >
            <option value="">Select VPC</option>
            {vpcList
              .filter(vpc => vpc.accountId === selectedAccountId)
              .map((vpc) => (
                <option key={vpc.id} value={vpc.id}>
                  {vpc.id} {vpc.name ? `– ${vpc.name}` : ''}
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

      <div style={{ height: 'calc(100vh - 200px)', border: '1px solid #ddd', margin: '20px', position: 'relative' }}>
        {nodes.length > 0 ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodesDraggable={true}
            fitView
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
          >
            <MiniMap nodeStrokeColor="#007bff" nodeColor={(n) => (n.style?.background as string) || '#fff'} zoomable pannable />
            <Controls />
            <Background color="#ccc" gap={20} />
          </ReactFlow>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
            {!selectedVpcId ? "Please select a VPC to view its connectivity graph." : isLoading ? "" : "No graph data available or VPC is empty."}
          </div>
        )}

        {selectedNodeData && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '10px',
            maxWidth: '300px',
            maxHeight: '400px',
            overflowY: 'auto',
            fontSize: '12px',
            zIndex: 10
          }}>
            <h4>Node Details</h4>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {JSON.stringify(selectedNodeData, null, 2)}
            </pre>
          </div>
        )}
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