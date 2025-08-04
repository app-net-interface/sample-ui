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

import { useState } from "react";
import { Node, Edge } from 'reactflow';
import { InfraResourceProvider } from "@/common/enum";
import { BACKEND_API_PREFIX } from "@/common/constants";

// Use direct named imports - expect TS errors here, use @ts-ignore below
// @ts-ignore
import { GetVpcConnectivityGraphRequest, GetVpcConnectivityGraphResponse, VpcGraphNode, VpcGraphEdge } from "@/_proto/infra-sdk/output/cloud_pb";
import { CloudProviderServiceClient } from "@/_proto/infra-sdk/output/cloud_grpc_web_pb";

const client = new CloudProviderServiceClient(BACKEND_API_PREFIX, null, null);

export interface VpcInternalGraphData {
  nodes: Node[];
  edges: Edge[];
  accountId: string;
  region: string;
  provider: string;
  labels: Record<string, string>;
  lastSyncTime: string;
}

export interface VpcGraphData {
  nodes: Node[];
  edges: Edge[];
  sourceVpcGraph: VpcInternalGraphData | null;
  destVpcGraph: VpcInternalGraphData | null;
  accountId: string;
  region: string;
  provider: string;
  labels: Record<string, string>;
  lastSyncTime: string;
}

const getNodePosition = (index: number, totalNodes: number, isInternalGraph: boolean = false): { x: number; y: number } => {
  // For internal graphs, use a smaller radius and offset
  const baseRadius = isInternalGraph ? 150 : 300;
  const xOffset = isInternalGraph ? 200 : 400;
  const yOffset = isInternalGraph ? 100 : 200;
  
  const radius = baseRadius + Math.floor(index / 10) * 100;
  const angle = (index / Math.min(totalNodes, 10)) * 2 * Math.PI;
  
  return {
    x: radius * Math.cos(angle) + xOffset,
    y: radius * Math.sin(angle) + yOffset,
  };
};

const parseVpcInternalGraph = (internalGraph: any, prefix: string = ''): VpcInternalGraphData => {
  const protoNodes = internalGraph.getNodesList() || [];
  const protoEdges = internalGraph.getEdgesList() || [];
  const labelsMap = internalGraph.getLabelsMap();
  const labels: Record<string, string> = {};
  
  labelsMap?.forEach((value: string, key: string) => {
    labels[key] = value;
  });

  const nodes: Node[] = protoNodes.map((node: any, index: number) => ({
    id: prefix + node.getId(),
    data: {
      label: `${node.getResourceType()}: ${node.getNodeLabel() || node.getId()}`,
      type: node.getResourceType(),
      originalData: node.toObject(),
    },
    position: getNodePosition(index, protoNodes.length, true),
    style: {
      background: '#4a90e2',
      color: 'white',
      border: '1px solid #357abd',
      padding: '10px',
      borderRadius: '3px'
    },
  }));

  const edges: Edge[] = protoEdges.map((edge: any) => ({
    id: prefix + `e-${edge.getSourceNodeId()}-${edge.getTargetNodeId()}`,
    source: prefix + edge.getSourceNodeId(),
    target: prefix + edge.getTargetNodeId(),
    label: edge.getRelationshipType(),
    animated: true,
    style: { stroke: '#6c757d' },
  }));

  return {
    nodes,
    edges,
    accountId: internalGraph.getAccountId(),
    region: internalGraph.getRegion(),
    provider: internalGraph.getProvider(),
    labels,
    lastSyncTime: internalGraph.getLastSyncTime(),
  };
};

export const useFetchVpcGraphResource = (
  provider: InfraResourceProvider,
  accountId: string,
  region: string
) => {
  const initialGraphState: VpcGraphData = {
    nodes: [],
    edges: [],
    sourceVpcGraph: null,
    destVpcGraph: null,
    accountId: '',
    region: '',
    provider: '',
    labels: {},
    lastSyncTime: ''
  };

  const [vpcGraphData, setVpcGraphData] = useState<VpcGraphData>(initialGraphState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const fetchVpcGraph = async (vpcId: string) => {
    console.log(`[Hook] fetchVpcGraph called with vpcId: ${vpcId}, provider: ${provider}, account: ${accountId}, region: ${region}`);
    setIsLoading(true);
    setError(null);
    setVpcGraphData(initialGraphState);

    const req = new GetVpcConnectivityGraphRequest();
    req.setProvider(provider);
    req.setAccountId(accountId);
    req.setRegion(region);
    req.setVpcId(vpcId);

    return new Promise<void>((resolve, reject) => {
      client.getVpcConnectivityGraph(req, {}, (err: any, response: any) => {
        setIsLoading(false);
        if (err) {
          console.error("[Hook] Error in getVpcConnectivityGraph:", err);
          setError(err);
          reject(err);
          return;
        }

        if (!response) {
          const error = new Error("[Hook] Received null response from getVpcConnectivityGraph");
          setError(error);
          reject(error);
          return;
        }

        try {
          // Parse main graph nodes and edges
          const mainNodes = response.getNodesList() || [];
          const mainEdges = response.getEdgesList() || [];
          
          // Parse source and destination VPC internal graphs
          const srcVpcGraphProto = response.getSrcVpcGraph();
          const destVpcGraphProto = response.getDestVpcGraph();

          // Parse labels
          const labelsMap = response.getLabelsMap();
          const labels: Record<string, string> = {};
          labelsMap?.forEach((value: string, key: string) => {
            labels[key] = value;
          });

          // Process main graph nodes
          const nodes: Node[] = mainNodes.map((node: any, index: number) => ({
            id: node.getId(),
            data: {
              label: `${node.getNodeType()}: ${node.getName() || node.getId()}`,
              type: node.getNodeType(),
              originalData: node.toObject(),
            },
            position: getNodePosition(index, mainNodes.length),
            style: {
              background: '#5bc0de',
              color: 'white',
              border: '1px solid #2e6da4',
              padding: '10px',
              borderRadius: '3px'
            },
          }));

          // Process main graph edges
          const edges: Edge[] = mainEdges.map((edge: any) => ({
            id: `e-${edge.getSourceId()}-${edge.getTargetId()}`,
            source: edge.getSourceId(),
            target: edge.getTargetId(),
            label: edge.getConnectionType(),
            animated: true,
            style: { stroke: '#6c757d' },
          }));

          // Parse internal graphs if they exist
          const sourceVpcGraph = srcVpcGraphProto ? parseVpcInternalGraph(srcVpcGraphProto, 'src-') : null;
          const destinationVpcGraph = destVpcGraphProto ? parseVpcInternalGraph(destVpcGraphProto, 'dst-') : null;

          const graphData: VpcGraphData = {
            nodes,
            edges,
            sourceVpcGraph,
            destVpcGraph: destinationVpcGraph,
            accountId: response.getAccountId(),
            region: response.getRegion(),
            provider: response.getProvider(),
            labels,
            lastSyncTime: response.getLastSyncTime()
          };

          console.log("Parsed VPC Graph data:", graphData);
          setVpcGraphData(graphData);
          resolve();
        } catch (parseError) {
          console.error("[Hook] Error parsing VPC graph response:", parseError);
          setError(parseError);
          reject(parseError);
        }
      });
    });
  };

  return { vpcGraphData, fetchVpcGraph, isLoading, error };
};

