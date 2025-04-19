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
import { InfraResourceProvider } from "@/common/enum";
import { BACKEND_API_PREFIX } from "@/common/constants";
import { CloudProviderServiceClient } from "@/_proto/infra-sdk/output/cloud_grpc_web_pb";

const GetVPCIndexRequest = require("@/_proto/infra-sdk/output/cloud_pb");
const client = new CloudProviderServiceClient(BACKEND_API_PREFIX, null, null);

export const useFetchVPCResourceVPCIndex = (
  provider: InfraResourceProvider,
  accountId: string,
  region: string
) => {
  const [vpcIndex, setVpcIndex] = useState<any>(null);

  const fetchVpcIndex = async (vpcId: string) => {
    const req = new GetVPCIndexRequest();
    req.setProvider(provider);
    req.setAccountId(accountId);
    req.setRegion(region);
    req.setVpcId(vpcId);
    console.log("Sending GetVPCIndexRequest:", req.toObject());

    return new Promise<void>((resolve, reject) => {
      client.getVPCIndex(req, {}, (err: any, r: any) => {
        if (err) {
          console.error("Error in getVPCIndex:", err);
          return reject(err);
        } else {
          // Use getter functions directly from the response
         console.log("Received GetVPCIndexResponse:", r.toObject());
         var response = r?.getVpcIndex();

          const parsedData = {
            vpc_id: response?.getVpcId(),
            instance_ids: response?.getInstanceIdsList(),
            acl_ids: response.getAclIdsList(),
            security_group_ids: response.getSecurityGroupIdsList(),
            nat_gateway_ids: response.getNatGatewayIdsList(),
            vpc_endpoint_ids: response.getVpcEndpointIdsList(),
            lb_ids: response.getLbIdsList(),
            router_ids: response.getRouterIdsList(),
            igw_ids: response.getIgwIdsList(),
            subnet_ids: response.getSubnetIdsList(),
            route_table_ids: response.getRouteTableIdsList(),
            network_interface_ids: response.getNetworkInterfaceIdsList(),
            key_pair_ids: response.getKeyPairIdsList(),
            vpn_concentrator_ids: response.getVpnConcentratorIdsList(),
            public_ip_ids: response.getPublicIpIdsList(),
            cluster_ids: response.getClusterIdsList(),
            last_sync_time: response.getLastSyncTime(),
            provider: response.getProvider(),
            account_id: response.getAccountId(),
            region: response.getRegion(),
            created_at: response.getCreatedAt() ? response.getCreatedAt().toString() : null,
            updated_at: response.getUpdatedAt() ? response.getUpdatedAt().toString() : null,
          };
          console.log("Parsed VPCIndex data:", parsedData);
          setVpcIndex(parsedData);
          resolve();
        }
      });
    });
  };

  return { vpcIndex, fetchVpcIndex };
};

