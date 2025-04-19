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

interface VpcGraphData {
  nodes: Node[];
  edges: Edge[];
}

const getNodePosition = (index: number, totalNodes: number): { x: number; y: number } => {
  const radius = 300 + Math.floor(index / 10) * 100;
  const angle = (index / Math.min(totalNodes, 10)) * 2 * Math.PI;
  return {
    x: radius * Math.cos(angle) + 400,
    y: radius * Math.sin(angle) + 200,
  };
};

export const useFetchVpcGraphResource = (
  provider: InfraResourceProvider,
  accountId: string,
  region: string
) => {
  const [vpcGraphData, setVpcGraphData] = useState<VpcGraphData>({ nodes: [], edges: [] });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const fetchVpcGraph = async (vpcId: string) => {
    console.log(`[Hook] fetchVpcGraph called with vpcId: ${vpcId}, provider: ${provider}, account: ${accountId}, region: ${region}`);
    setIsLoading(true);
    setError(null);
    setVpcGraphData({ nodes: [], edges: [] });

    // Use the directly imported constructor
    // @ts-ignore - Ignore TS error for constructor if it persists
    const req = new GetVpcConnectivityGraphRequest();
    req.setProvider(provider);
    req.setAccountId(accountId);
    req.setRegion(region);
    req.setVpcId(vpcId);
    console.log("[Hook] Sending GetVpcConnectivityGraphRequest:", req.toObject());

    return new Promise<void>((resolve, reject) => {
      console.log("[Hook] Attempting to call client.getVpcConnectivityGraph...");
      // Use the directly imported types in the callback signature
      // @ts-ignore - Ignore TS error for types if they persist
      client.getVpcConnectivityGraph(req, {}, (err: any, response: GetVpcConnectivityGraphResponse | null) => {
        console.log("[Hook] client.getVpcConnectivityGraph callback executed.");
        setIsLoading(false);
        if (err) {
          console.error("[Hook] Error in getVpcConnectivityGraph:", err);
          setError(err);
          reject(err);
        } else if (response) {
          console.log("[Hook] Received GetVpcConnectivityGraphResponse:", response.toObject());

          const protoNodes = response.getNodesList() || [];
          const protoEdges = response.getEdgesList() || [];

          // @ts-ignore
          const nodes: Node[] = protoNodes.map((node: VpcGraphNode, index: number) => {
            if (index === 0) {
              console.log("[Hook] Inspecting first node object (raw JS):", node.toObject());
            }

            // *** Use getResourceType() based on types_pb.js ***
            const nodeType = node.getResourceType ? node.getResourceType() : 'UnknownType';
            const nodeLabel = node.getNodeLabel ? node.getNodeLabel() : ''; // Keep assuming node_label for now
            const nodeId = node.getId ? node.getId() : `fallback-id-${index}`;

            // Log warnings if functions still don't exist (for debugging)
            if (typeof node.getResourceType !== 'function' && index === 0) {
              console.warn("[Hook] node.getResourceType() is not a function on node:", node);
            }
            if (typeof node.getNodeLabel !== 'function' && index === 0) {
              console.warn("[Hook] node.getNodeLabel() is not a function on node:", node);
            }
            if (typeof node.getId !== 'function' && index === 0) {
              console.warn("[Hook] node.getId() is not a function on node:", node);
            }

            return {
              id: nodeId,
              data: {
                label: `${nodeType}: ${nodeLabel || nodeId}`,
                // *** Store the original node data here ***
                originalData: node.toObject ? node.toObject() : { error: "Could not get raw data" },
              },
              position: getNodePosition(index, protoNodes.length),
              style: { background: '#5bc0de', color: 'white', border: '1px solid #2e6da4', padding: '10px', borderRadius: '3px' },
            };
          });

          // @ts-ignore - Ignore TS error for types if they persist
          const edges: Edge[] = protoEdges.map((edge: VpcGraphEdge, index: number) => {
            // *** Use getRelationshipType() for the edge label ***
            const sourceId = edge.getSourceNodeId ? edge.getSourceNodeId() : '';
            const targetId = edge.getTargetNodeId ? edge.getTargetNodeId() : '';
            const edgeLabel = edge.getRelationshipType ? edge.getRelationshipType() : ''; // Changed from getLabel/getEdgeLabel

            // Log warnings if functions still don't exist (for debugging)
            if (typeof edge.getSourceNodeId !== 'function' && index === 0) {
              console.warn("[Hook] edge.getSourceNodeId() is not a function on edge:", edge);
            }
            if (typeof edge.getTargetNodeId !== 'function' && index === 0) {
              console.warn("[Hook] edge.getTargetNodeId() is not a function on edge:", edge);
            }
            // Updated warning check
            if (typeof edge.getRelationshipType !== 'function' && index === 0) {
              console.warn("[Hook] edge.getRelationshipType() is not a function on edge:", edge);
            }

            return {
              id: `e-${sourceId}-${targetId}-${edgeLabel || index}`, // Use edgeLabel in ID
              source: sourceId,
              target: targetId,
              label: edgeLabel, // Use the retrieved edgeLabel
              animated: true,
              style: { stroke: '#6c757d' },
            };
          });

          console.log("Parsed VPC Graph data:", { nodes, edges });
          setVpcGraphData({ nodes, edges });
          resolve();
        } else {
          const unknownError = new Error("[Hook] Received null response from getVpcConnectivityGraph");
          console.error(unknownError);
          setError(unknownError);
          reject(unknownError);
        }
      });
    });
  };

  return { vpcGraphData, fetchVpcGraph, isLoading, error };
};

