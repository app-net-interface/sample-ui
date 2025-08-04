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

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setResourceFetchedEntities } from "@/store/infra-resources-slice/infraResourcesSlice";

import { BACKEND_API_PREFIX } from "@/common/constants";

// Use import function from GRPC generated code for compatibility
import { GetVpcConnectionGraphRequest } from "@/_proto/infra-sdk/output/cloud_pb";
const { CloudProviderServiceClient } = require("@/_proto/infra-sdk/output/cloud_grpc_web_pb");
const { VpcConnectionType } = require("@/_proto/infra-sdk/output/types_pb");

// Interface for internal VPC graph structure
export interface VpcInternalGraphData {
  nodes: Array<{
    id: string;
    resourceType: string;
    labels: Record<string, string>;
    provider: string;
    accountId: string;
    region: string;
    vpcId: string;
    name: string;
    status: string;
  }>;
  edges: Array<{
    id: string;
    sourceId: string;
    targetId: string;
    relationshipType: string;
    labels: Record<string, string>;
  }>;
  accountId: string;
  region: string;
  provider: string;
  labels: Record<string, string>;
  lastSyncTime: string;
}

// Interface for the complete VPC connection graph
export interface VpcConnectionGraphData {
  nodes: Array<{
    id: string;
    type: string;
    labels: Record<string, string>;
    provider: string;
    accountId: string;
    region: string;
    vpcId: string;
    name: string;
    status: string;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    labels: Record<string, string>;
    connectionType: string;
    provider: string;
    accountId: string;
    region: string;
    status: string;
  }>;
  sourceVpcGraph: VpcInternalGraphData | null;
  destVpcGraph: VpcInternalGraphData | null;
  accountId: string;
  region: string;
  provider: string;
  labels: Record<string, string>;
  lastSyncTime: string;
}

const infraSdkResourcesClient = new CloudProviderServiceClient(BACKEND_API_PREFIX, null, null);

const parseLabelsMap = (labelsMap: any): Record<string, string> => {
  const labels: Record<string, string> = {};
  labelsMap?.forEach((value: string, key: string) => {
    labels[key] = value;
  });
  return labels;
};

const parseVpcInternalGraph = (internalGraph: any): VpcInternalGraphData | null => {
  if (!internalGraph) return null;

  const nodes = internalGraph.getNodesList() || [];
  const edges = internalGraph.getEdgesList() || [];
  const labelsMap = internalGraph.getLabelsMap();

  return {
    nodes: nodes.map((node: any) => ({
      id: node.getId(),
      resourceType: node.getResourceType(),
      labels: parseLabelsMap(node.getLabelsMap()),
      provider: node.getProvider(),
      accountId: node.getAccountId(),
      region: node.getRegion(),
      vpcId: node.getVpcId(),
      name: node.getName(),
      status: node.getStatus()
    })),
    edges: edges.map((edge: any) => ({
      id: edge.getId(),
      sourceId: edge.getSourceId(),
      targetId: edge.getTargetId(),
      relationshipType: edge.getRelationshipType(),
      labels: parseLabelsMap(edge.getLabelsMap())
    })),
    accountId: internalGraph.getAccountId(),
    region: internalGraph.getRegion(),
    provider: internalGraph.getProvider(),
    labels: parseLabelsMap(labelsMap),
    lastSyncTime: internalGraph.getLastSyncTime()
  };
};

export const useFetchVpcConnectionGraph = (provider: string, accountId: string) => {
  const initialState: VpcConnectionGraphData = {
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

  const [vpcConnectionGraph, setVpcConnectionGraph] = useState<VpcConnectionGraphData>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  const fetchForProvider = async (prov: string): Promise<VpcConnectionGraphData> => {
    return new Promise((resolve, reject) => {
      const request = new GetVpcConnectionGraphRequest();
      request.setProvider(prov);
      request.setAccountId(accountId);

      infraSdkResourcesClient.getVpcConnectionGraph(request, {}, (err: any, response: any) => {
        if (err) {
          console.error('Error fetching VPC connection graph:', err);
          return reject(err);
        }

        if (!response) {
          return resolve(initialState);
        }

        try {
          // Parse main connection graph
          const nodes = response.getNodesList() || [];
          const edges = response.getEdgesList() || [];
          const labelsMap = response.getLabelsMap();

          // Parse source and destination VPC graphs
          const sourceVpcGraph = parseVpcInternalGraph(response.getSrcVpcGraph());
          const destVpcGraph = parseVpcInternalGraph(response.getDestVpcGraph());

          const graphData: VpcConnectionGraphData = {
            nodes: nodes.map((node: any) => ({
              id: node.getId(),
              type: node.getNodeType(),
              labels: parseLabelsMap(node.getLabelsMap()),
              provider: node.getProvider(),
              accountId: node.getAccountId(),
              region: node.getRegion(),
              vpcId: node.getVpcId(),
              name: node.getName(),
              status: node.getStatus()
            })),
            edges: edges.map((edge: any) => ({
              id: edge.getId(),
              source: edge.getSourceId(),
              target: edge.getTargetId(),
              labels: parseLabelsMap(edge.getLabelsMap()),
              connectionType: (() => {
                const connType = edge.getConnectionType();
                switch (connType) {
                  case VpcConnectionType.VPC_CONNECTION_TYPE_PEERING:
                    return 'peering';
                  case VpcConnectionType.VPC_CONNECTION_TYPE_TRANSIT_GATEWAY:
                    return 'transit_gateway';
                  case VpcConnectionType.VPC_ENDPOINT:
                    return 'private_link';
                  case VpcConnectionType.TRANSIT_VPC:
                    return 'transit_vpc';
                  case VpcConnectionType.VPC_CONNECTION_TYPE_UNSPECIFIED:
                  default:
                    return 'unknown';
                }
              })(),
              provider: edge.getProvider(),
              accountId: edge.getAccountId(),
              region: edge.getRegion(),
              status: edge.getStatus()
            })),
            sourceVpcGraph,
            destVpcGraph,
            accountId: response.getAccountId(),
            region: response.getRegion(),
            provider: response.getProvider(),
            labels: parseLabelsMap(labelsMap),
            lastSyncTime: response.getLastSyncTime()
          };

          resolve(graphData);
        } catch (parseError) {
          console.error('Error parsing VPC connection graph:', parseError);
          reject(parseError);
        }
      });
    });
  };

  const fetchVpcConnectionGraph = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (provider === "ALL_PROVIDERS") {
        const providers = ["aws", "gcp", "azure"];
        const responses = await Promise.all(providers.map(p => fetchForProvider(p)));
        
        // Merge all provider graphs into one
        const mergedGraph: VpcConnectionGraphData = {
          ...initialState,
          nodes: responses.flatMap(graph => graph.nodes),
          edges: responses.flatMap(graph => graph.edges),
          sourceVpcGraph: responses[0]?.sourceVpcGraph || null,
          destVpcGraph: responses[0]?.destVpcGraph || null,
          provider: "ALL_PROVIDERS"
        };
        
        setVpcConnectionGraph(mergedGraph);
      } else {
        const result = await fetchForProvider(provider);
        setVpcConnectionGraph(result);
      }
    } catch (error: any) {
      console.error("[VpcConnectionGraph] Error:", error);
      setError(error?.message || "Failed to fetch VPC connection graph");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (vpcConnectionGraph.nodes.length > 0) {
      // Convert to array format for redux store
      const graphDataArray = [{
        nodes: vpcConnectionGraph.nodes,
        edges: vpcConnectionGraph.edges,
        sourceVpcGraph: vpcConnectionGraph.sourceVpcGraph,
        destVpcGraph: vpcConnectionGraph.destVpcGraph,
        provider: vpcConnectionGraph.provider,
        accountId: vpcConnectionGraph.accountId,
        region: vpcConnectionGraph.region,
        labels: vpcConnectionGraph.labels,
        lastSyncTime: vpcConnectionGraph.lastSyncTime
      }];
      
      dispatch(setResourceFetchedEntities(graphDataArray));
    }
  }, [vpcConnectionGraph, dispatch]);

  return { 
    vpcConnectionGraph,
    fetchVpcConnectionGraph,
    isLoading,
    error 
  };
};
