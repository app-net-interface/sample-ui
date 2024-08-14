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

const { ListSubnetsRequest } = require("@/_proto/infra-sdk/output/cloud_pb");
const { CloudProviderServiceClient } = require("@/_proto/infra-sdk/output/cloud_grpc_web_pb");

const infraSdkResourcesClient = new CloudProviderServiceClient(BACKEND_API_PREFIX, null, null);
const vpcResourceSubnetsRequest = new ListSubnetsRequest();

export const useFetchVpcResourceSubnets = (provider: string, region: string, id: string, accountId: string) => {
  const [vpcResourceSubnets, setVpcResourceSubnets] = useState<any[]>([]);

  const dispatch = useDispatch();

  vpcResourceSubnetsRequest.setProvider(provider);
  vpcResourceSubnetsRequest.setVpcId(id);
  vpcResourceSubnetsRequest.setRegion(region);
  vpcResourceSubnetsRequest.setAccountId(accountId);

  const fetchVpcResourcesSubnets = () => {
    try {
      infraSdkResourcesClient.listSubnets(vpcResourceSubnetsRequest, {}, (err: any, response: any) => {
        const data = response?.getSubnetsList();
        if (data) {
          const infraSubnets = data.map((subnet: any) => {
            const name = subnet.getName();
            const id = subnet.getId();
            const cidrblock = subnet.getCidrBlock();
            const accountId = subnet.getAccountId();
            const zone = subnet.getZone();
            const region = subnet.getRegion();
            const provider = subnet.getProvider().toUpperCase();
            const vpcId = subnet.getVpcId();
            const project = subnet.getProject();
            const selfLink = subnet.getSelfLink();
            const labels: any = {};
            const labelsMap = subnet.getLabelsMap();
            labelsMap.forEach((value: string, key: string) => {
              labels[key] = value;
            });

            return {
              id,
              name,
              cidrblock,
              provider,
              accountId,
              region,
              vpcId,
              project,
              selfLink,
              zone,
              labels,
            };
          });

          setVpcResourceSubnets([...infraSubnets]);
        }
      });
    } catch (e) {
      console.log("error", e);
    }
  };

  useEffect(() => {
    if (vpcResourceSubnets.length) {
      dispatch(setResourceFetchedEntities(vpcResourceSubnets));
    }
  }, [vpcResourceSubnets]);

  return { vpcResourceSubnets, fetchVpcResourcesSubnets };
};
