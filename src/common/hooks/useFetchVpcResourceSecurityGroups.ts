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
import { setResourceFetchedEntities } from "@/store/infra-resources-slice/infraResourcesSlice";
import { BACKEND_API_PREFIX } from "@/common/constants";

const { ListSecurityGroupsRequest } = require("@/_proto/infra-sdk/output/cloud_pb");
const { CloudProviderServiceClient } = require("@/_proto/infra-sdk/output/cloud_grpc_web_pb");

const infraSdkResourcesClient = new CloudProviderServiceClient(BACKEND_API_PREFIX, null, null);
const vpcResourceSecurityGroupsRequest = new ListSecurityGroupsRequest();

export const useFetchVpcResourceSecurityGroups = (provider: string, region: string, id: string, accountId: string) => {
  const [vpcResourceSecurityGroups, setVpcResourceSecurityGroups] = useState<any[]>([]);

  const dispatch = useDispatch();

  vpcResourceSecurityGroupsRequest.setProvider(provider);
  vpcResourceSecurityGroupsRequest.setVpcId(id);
  vpcResourceSecurityGroupsRequest.setRegion(region);
  vpcResourceSecurityGroupsRequest.setAccountId(accountId);

  const fetchVpcResourceSecurityGroups = () => {
    try {
      infraSdkResourcesClient.listSecurityGroups(vpcResourceSecurityGroupsRequest, {}, (err: any, response: any) => {
        const data = response?.getSecurityGroupsList();
        if (data) {
          const infraSecurityGroups = data.map((securityGroup: any) => {
            const name = securityGroup.getName();
            const id = securityGroup.getId();
            const provider = securityGroup.getProvider();
            const accountId = securityGroup.getAccountId();
            const vpcId = securityGroup.getVpcId();
            const region = securityGroup.getRegion();
            const project = securityGroup.getProject();
            const attatchedInstances = securityGroup.getAttachedRunningInstancesList();
            const selfLink = securityGroup.getSelfLink();

            const labels: any = {};
            const labelsMap = securityGroup.getLabelsMap();
            const rules: any = {};
            const rulesMap = securityGroup.getRulesList();

            labelsMap.forEach((value: string, key: string) => {
              labels[key] = value;
            });
            rulesMap.forEach((value: string, key: string) => {
              rules[key] = value;
            });
            return {
              name,
              id,
              provider,
              accountId,
              attatchedInstances,
              region,
              vpcId,
              rules,
              labels,
              project,
              selfLink,
            };
          });

          setVpcResourceSecurityGroups([...infraSecurityGroups]);
          console.log("Security group info ", infraSecurityGroups)
        }
      });
    } catch (e) {
      console.log("error", e);
    }
  };

  useEffect(() => {
    if (vpcResourceSecurityGroups.length) {
      dispatch(setResourceFetchedEntities(vpcResourceSecurityGroups));
    }
  }, [vpcResourceSecurityGroups]);

  return { vpcResourceSecurityGroups, fetchVpcResourceSecurityGroups };
};
