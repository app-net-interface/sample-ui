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
import { ListVpcConnectionsRequest } from "@/_proto/infra-sdk/output/cloud_pb";
const { CloudProviderServiceClient } = require("@/_proto/infra-sdk/output/cloud_grpc_web_pb");

const infraSdkResourcesClient = new CloudProviderServiceClient(BACKEND_API_PREFIX, null, null);

export const useFetchVpcConnections = (provider: string, accountId: string) => {
  const [vpcConnections, setVpcConnections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  const fetchForProvider = async (prov: string, ): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      // Create request using the imported constructor
      const request = new ListVpcConnectionsRequest();
      request.setProvider(prov);
      request.setAccountId(accountId);

      // Use the client with proper method name
      infraSdkResourcesClient.listVpcConnections(request, {}, (err: any, response: any) => {
        if (err) {
          console.error('Error fetching VPC connections:', err);
          return reject(err);
        }

        const connections = response?.getConnectionsList() || [];
        if (connections.length) {
          const result = connections.map((connection) => {
            const labelsMap = connection.getLabelsMap();
            const labels: Record<string, string> = {};
            
            labelsMap.forEach((value: string, key: string) => {
              labels[key] = value;
            });

            return {
              labels,
              id: connection.getId(),
              name: connection.getName(),
              provider: connection.getProvider(),
              account_id: connection.getAccountId(),
              region: connection.getRegion(),
              vpc_id_1: connection.getVpcId1(),
              vpc_1_account_id: connection.getVpc1AccountId(),
              vpc_1_region: connection.getVpc1Region(),
              vpc_id_2: connection.getVpcId2(),
              vpc_2_account_id: connection.getVpc2AccountId(),
              vpc_2_region: connection.getVpc2Region(),
              connection_type: connection.getConnectionType(),
              status: connection.getStatus(),
              created_at: connection.getCreatedAt(),
              self_link: connection.getSelfLink(),
              last_sync_time: connection.getLastSyncTime()
            };
          });
          resolve(result);
        } else {
          resolve([]);
        }
      });
    });
  };
  const fetchVPCConnections = async () => {
    try {
      let results: any[] = [];
      if (provider === "ALL_PROVIDERS") {
        const providers = ["aws", "gcp", "azure"];
        const responses = await Promise.all(providers.map(p => fetchForProvider(p)));
        responses.forEach(res => results = results.concat(res));
      } else {
        results = await fetchForProvider(provider);
      }
      setVpcConnections(results);
    } catch (e) {
      console.error("[VPCConnections] Error:", e);
    }
  };

  useEffect(() => {
    if (vpcConnections.length) {
      dispatch(setResourceFetchedEntities(vpcConnections));
    }
  }, [vpcConnections]);

  return { vpcConnections, fetchVPCConnections };
};
