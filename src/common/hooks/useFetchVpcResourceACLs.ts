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

const { ListACLsRequest } = require("@/_proto/infra-sdk/output/cloud_pb");
const { CloudProviderServiceClient } = require("@/_proto/infra-sdk/output/cloud_grpc_web_pb");
import { BACKEND_API_PREFIX } from "@/common/constants";

const infraSdkResourcesClient = new CloudProviderServiceClient(BACKEND_API_PREFIX, null, null);
const vpcResourceACLsRequest = new ListACLsRequest();

export const useFetchVpcResourceACLs = (provider: string, region: string, id: string, accountId: string) => {
  const [vpcResourceACLs, setVpcResourceACLs] = useState<any[]>([]);

  const dispatch = useDispatch();

  vpcResourceACLsRequest.setProvider(provider);
  vpcResourceACLsRequest.setVpcId(id);
  vpcResourceACLsRequest.setRegion(region);
  vpcResourceACLsRequest.setAccountId(accountId);

  const fetchVpcResourceACLs = () => {
    try {
      infraSdkResourcesClient.listACLs(vpcResourceACLsRequest, {}, (err: any, response: any) => {
        const data = response?.getAclsList();
        if (data) {
          const infraACLs = data.map((acl: any) => {
            const name = acl.getName();
            const id = acl.getId();
            const vpcId = acl.getVpcId();
            const provider = acl.getProvider().toUpperCase();
            const region = acl.getRegion();
            const accountId = acl.getAccountId();
            const labels: any = {};
            const rules: any = {};
            const labelsMap = acl.getLabelsMap();
            const rulesMap = acl.getRulesList();
            const project = acl.getProject();
            const selfLink = acl.getSelfLink();

            rulesMap.forEach((value: string, key: string) => {
              rules[key] = value;
            });

            labelsMap.forEach((value: string, key: string) => {
              labels[key] = value;
            });

            return {
              name,
              id,
              provider,
              accountId,
              region,
              project,
              rules,
              vpcId,
              labels,
              selfLink,
            };
          });

          setVpcResourceACLs([...infraACLs]);
        }
      });
    } catch (e) {
      console.log("error", e);
    }
  };

  useEffect(() => {
    if (vpcResourceACLs.length) {
      dispatch(setResourceFetchedEntities(vpcResourceACLs));
    }
  }, [vpcResourceACLs]);

  return { vpcResourceACLs, fetchVpcResourceACLs };
};
