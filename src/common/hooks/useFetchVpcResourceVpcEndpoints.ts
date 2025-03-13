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

const { ListVPCEndpointsRequest } = require("@/_proto/infra-sdk/output/cloud_pb");
const { CloudProviderServiceClient } = require("@/_proto/infra-sdk/output/cloud_grpc_web_pb");

const infraSdkResourcesClient = new CloudProviderServiceClient(BACKEND_API_PREFIX, null, null);

export const useFetchVpcResourceVpcEndpoints = (provider: string, region: string, id: string, accountId: string) => {
  const [vpcResourceVpcEndpoints, setVpcResourceVpcEndpoints] = useState<any[]>([]);

  const dispatch = useDispatch();

  const fetchForProvider = (prov: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const request = new ListVPCEndpointsRequest();
      request.setProvider(prov);
      request.setVpcId(id);
      request.setRegion(region);
      request.setAccountId(accountId);
      infraSdkResourcesClient.listVPCEndpoints(request, {}, (err: any, response: any) => {
        if (err) return reject(err);
        const data = response?.getVepsList();
        if (data) {
          const result = data.map((vpcEndpoint: any) => {
            const name = vpcEndpoint.getName();
            const id = vpcEndpoint.getId();
            const provider = vpcEndpoint.getProvider();
            const accountId = vpcEndpoint.getAccountId();
            const vpcId = vpcEndpoint.getVpcId();
            const region = vpcEndpoint.getRegion();
            const service = vpcEndpoint.getServiceName();
            const routeTableIds = vpcEndpoint.getRouteTableIds();
            const subnetIds = vpcEndpoint.getSubnetIds();
            const labels: any = {};
            const labelsMap = vpcEndpoint.getLabelsMap();
            const state = vpcEndpoint.getState();
            const type = vpcEndpoint.getType();
            const project = vpcEndpoint.getProject();
            const selfLink = vpcEndpoint.getSelfLink();

            labelsMap.forEach((value: string, key: string) => {
              labels[key] = value;
            });

            return {
              name,
              id,
              provider,
              accountId,
              region,
              vpcId,
              routeTableIds,
              subnetIds,
              service,
              labels,
              state,
              type,
              project,
              selfLink
            };
          });
          resolve(result);
        } else {
          resolve([]);
        }
      });
    });
  };

  const fetchVpcResourceVPCEndpoints = async () => {
    try {
      let results: any[] = [];
      if (provider === "ALL_PROVIDERS") {
        const providers = ["aws", "gcp", "azure"];
        const responses = await Promise.all(providers.map(p => fetchForProvider(p)));
        responses.forEach(res => results = results.concat(res));
      } else {
        results = await fetchForProvider(provider);
      }
      setVpcResourceVpcEndpoints(results);
    } catch (e) {
      console.log("error", e);
    }
  };

  useEffect(() => {
    if (vpcResourceVpcEndpoints.length) {
      dispatch(setResourceFetchedEntities(vpcResourceVpcEndpoints));
    }
  }, [vpcResourceVpcEndpoints]);

  return { vpcResourceVpcEndpoints, fetchVpcResourceVPCEndpoints };
};
