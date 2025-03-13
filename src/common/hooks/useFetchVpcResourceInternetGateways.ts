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

const { ListInternetGatewaysRequest } = require("@/_proto/infra-sdk/output/cloud_pb");
const { CloudProviderServiceClient } = require("@/_proto/infra-sdk/output/cloud_grpc_web_pb");

const infraSdkResourcesClient = new CloudProviderServiceClient(BACKEND_API_PREFIX, null, null);

export const useFetchVpcResourceInternetGateways = (provider: string, region: string, id: string, accountId: string) => {
  const [vpcResourceInternetGateways, setVpcResourceInternetGateways] = useState<any[]>([]);

  const dispatch = useDispatch();

  const fetchForProvider = (prov: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const request = new ListInternetGatewaysRequest();
      request.setProvider(prov);
      request.setVpcId(id);
      request.setRegion(region);
      request.setAccountId(accountId);
      infraSdkResourcesClient.listInternetGateways(request, {}, (err: any, response: any) => {
        if (err) return reject(err);
        const data = response?.getIgwsList();
        if (data) {
          const result = data.map((InternetGateway: any) => {
            const name = InternetGateway.getName();
            const id = InternetGateway.getId();
            const vpcId = InternetGateway.getAttachedVpcId();
            const provider = InternetGateway.getProvider().toUpperCase();
            const accountId = InternetGateway.getAccountId();
            const region = InternetGateway.getRegion();
            const state = InternetGateway.getState();
            const labels: any = {};
            const labelsMap = InternetGateway.getLabelsMap();
            const attatchedVpcId = InternetGateway.getAttachedVpcId();
            const project = InternetGateway.getProject();
            const selfLink = InternetGateway.getSelfLink();

            labelsMap.getEntryList().forEach(([key, value]: [string, any]) => {
              labels[key] = value;
            });

            return {
              name,
              id,
              provider,
              accountId,
              region,
              vpcId,
              state,
              labels,
              attatchedVpcId,
              project,
              selfLink,
            };
          });
          resolve(result);
        } else {
          resolve([]);
        }
      });
    });
  };

  const fetchVpcResourceInternetGateways = async () => {
    try {
      let results: any[] = [];
      if (provider === "ALL_PROVIDERS") {
        const providers = ["aws", "gcp", "azure"];
        const responses = await Promise.all(providers.map(p => fetchForProvider(p)));
        responses.forEach(res => results = results.concat(res));
      } else {
        results = await fetchForProvider(provider);
      }
      setVpcResourceInternetGateways(results);
    } catch (e) {
      console.log("error", e);
    }
  };

  useEffect(() => {
    if (vpcResourceInternetGateways.length) {
      dispatch(setResourceFetchedEntities(vpcResourceInternetGateways));
    }
  }, [vpcResourceInternetGateways]);

  return { vpcResourceInternetGateways, fetchVpcResourceInternetGateways };
};
