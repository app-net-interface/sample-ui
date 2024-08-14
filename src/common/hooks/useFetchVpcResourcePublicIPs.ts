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

const { ListPublicIPsRequest } = require("@/_proto/infra-sdk/output/cloud_pb");
const { CloudProviderServiceClient } = require("@/_proto/infra-sdk/output/cloud_grpc_web_pb");

const infraSdkResourcesClient = new CloudProviderServiceClient(BACKEND_API_PREFIX, null, null);
const vpcResourcePublicIPsRequest = new ListPublicIPsRequest();

export const useFetchVpcResourcePublicIPs = (provider: string, region: string, id: string, accountId: string) => {
  const [vpcResourcePublicIPs, setVpcResourcePublicIPs] = useState<any[]>([]);

  const dispatch = useDispatch();

  vpcResourcePublicIPsRequest.setProvider(provider);
  //vpcResourcePublicIPsRequest.setVpcId(id);
  vpcResourcePublicIPsRequest.setRegion(region);
  vpcResourcePublicIPsRequest.setAccountId(accountId);

  const fetchVpcResourcePublicIPs = () => {
    try {
      infraSdkResourcesClient.listPublicIPs(vpcResourcePublicIPsRequest, {}, (err: any, response: any) => {
        const data = response?.getPublicIpsList();
        if (data) {
          const infraPublicIPs = data.map((PublicIP: any) => {
            const id = PublicIP.getId();
            const publicIP = PublicIP.getPublicIp()
            const privateIP = PublicIP.getPrivateIp()
            const type = PublicIP.getType()
            const vpcId = PublicIP.getVpcId();
            const instanceId = PublicIP.getInstanceId();
            const provider = PublicIP.getProvider().toUpperCase();
            const accountId = PublicIP.getAccountId();
            const region = PublicIP.getRegion();
            const byoip = PublicIP.getByoip();
            const project = PublicIP.getProject();

            const labelsMap = PublicIP.getLabelsMap();
            const labels: any = {};

            labelsMap.forEach((value: any, key: any) => {
              labels[key] = value;
            });

            const selfLink = PublicIP.getSelfLink();

            return {
              id,
              provider,
              accountId,
              region,
              vpcId,
              instanceId,
              publicIP,
              privateIP,
              type,
              labels,
              project,
              byoip,
              selfLink,
            };
          });

          setVpcResourcePublicIPs([...infraPublicIPs]);
        }
      });
    } catch (e) {
      console.log("error", e);
    }
  };

  useEffect(() => {
    if (vpcResourcePublicIPs.length) {
      dispatch(setResourceFetchedEntities(vpcResourcePublicIPs));
    }
  }, [vpcResourcePublicIPs]);

  return { vpcResourcePublicIPs, fetchVpcResourcePublicIPs };
};
