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

const { ListNATGatewaysRequest } = require("@/_proto/infra-sdk/output/cloud_pb");
const { CloudProviderServiceClient } = require("@/_proto/infra-sdk/output/cloud_grpc_web_pb");

const infraSdkResourcesClient = new CloudProviderServiceClient(BACKEND_API_PREFIX, null, null);
const vpcResourceNATGatewaysRequest = new ListNATGatewaysRequest();

export const useFetchVpcResourceNATGateways = (provider: string, region: string, id: string, accountId: string) => {
  const [vpcResourceNATGateways, setVpcResourceNATGateways] = useState<any[]>([]);

  const dispatch = useDispatch();

  vpcResourceNATGatewaysRequest.setProvider(provider);
  vpcResourceNATGatewaysRequest.setVpcId(id);
  vpcResourceNATGatewaysRequest.setRegion(region);
  vpcResourceNATGatewaysRequest.setAccountId(accountId);

  const fetchVpcResourceNATGateways = () => {
    try {
      infraSdkResourcesClient.listNATGateways(vpcResourceNATGatewaysRequest, {}, (err: any, response: any) => {
        const data = response?.getNatGatewaysList();
        if (data) {
          const infraNATGateways = data.map((NATGateway: any) => {
            const name = NATGateway.getName();
            const id = NATGateway.getId();
            const accountId = NATGateway.getAccountId();
            const vpcId = NATGateway.getVpcId();
            const region = NATGateway.getRegion();
            const state = NATGateway.getState();
            const publicIp = NATGateway.getPublicIp();
            const privateIp = NATGateway.getPrivateIp();
            const subnetId = NATGateway.getSubnetId();
            const labels: any = {};
            const labelsMap = NATGateway.getLabelsMap();
            const selfLink = NATGateway.getSelfLink();
            const project = NATGateway.getProject();
            // const additional_properties = NATGateway.getAdditionalPropertiesMap();

            labelsMap.forEach((value: string, key: string) => {
              labels[key] = value;
            });

            return {
              name,
              id,
              accountId,
              region,
              vpcId,
              state,
              publicIp,
              privateIp,
              subnetId,
              labels,
              selfLink,
              project,
              // additional_properties,
            };
          });

          setVpcResourceNATGateways([...infraNATGateways]);
        }
      });
    } catch (e) {
      console.log("error", e);
    }
  };

  useEffect(() => {
    if (vpcResourceNATGateways.length) {
      dispatch(setResourceFetchedEntities(vpcResourceNATGateways));
    }
  }, [vpcResourceNATGateways]);

  return { vpcResourceNATGateways, fetchVpcResourceNATGateways };
};
