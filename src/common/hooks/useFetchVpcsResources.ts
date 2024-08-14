/**
 * Copyright (c) 2024 Cisco Systems, Inc. and its affiliates
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

import { setInfraVpcs } from "@/store/infra-resources-slice/infraResourcesSlice";
import { InfraResourceProvider } from "@/common/enum";
import { BACKEND_API_PREFIX } from "@/common/constants";

const { ListVPCRequest } = require("@/_proto/infra-sdk/output/cloud_pb");
const { CloudProviderServiceClient } = require("@/_proto/infra-sdk/output/cloud_grpc_web_pb");

const infraSdkResourcesClient = new CloudProviderServiceClient(BACKEND_API_PREFIX, null, null);
const vpcRequest = new ListVPCRequest();

/**
 * Custom hook to fetch VPC resources from the infrastructure provider.
 * @param provider - The infrastructure resource provider.
 * @param accountId - The ID of the account.
 * @param region - The region to fetch VPCs from.
 * @returns An object containing the fetched VPCs and a function to fetch VPCs.
 */
export const useFetchVpcsResources = (provider: InfraResourceProvider, accountId: string, region: string) => {
  const [vpcs, setVpcs] = useState<any[]>([]);

  const dispatch = useDispatch();

  vpcRequest.setProvider(provider);
  vpcRequest.setAccountId(accountId);
  vpcRequest.setRegion(region)

  /**
   * Fetches VPCs from the infrastructure provider.
   */
  const fetchVpcs = () => {
    try {
      infraSdkResourcesClient.listVPC(vpcRequest, {}, (err: any, response: any) => {
        const data = response?.getVpcsList();

        if (data) {
          const infraVpcs = data.map((vpc: any) => {
            const name = vpc.getName();
            const id = vpc.getId();
            const region = vpc.getRegion();
            const type = "vpc";
            const provider = vpc.getProvider();
            const accountId = vpc.getAccountId();
            const ipv4_cidr = vpc.getIpv4Cidr();
            const ipv6_cidr = vpc.getIpv6Cidr();
            const labels: any = {};

            const labelsMap = vpc.getLabelsMap();
            const selfLink = `https://${region}.console.aws.amazon.com/vpcconsole/home?region=${region}#VpcDetails:VpcId=${id}`;

            labelsMap.forEach((value: string, key: string) => {
              labels[key] = value;
            });

            return {
              name,
              id,
              region,
              type,
              provider,
              ipv4_cidr,
              ipv6_cidr,
              labels,
              selfLink,
              accountId,
            };
          });
          // console.log("infra VPCs ", infraVpcs)

          setVpcs([...infraVpcs]);
        }
      });
    } catch (e) {
      console.log("error", e);
    }
  };

  useEffect(() => {
    if (vpcs.length) {
      dispatch(setInfraVpcs(vpcs));
    }
  }, [vpcs]);

  return { vpcs, fetchVpcs };
};
