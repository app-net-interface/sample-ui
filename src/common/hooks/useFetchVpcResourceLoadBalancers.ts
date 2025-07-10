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

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { BACKEND_API_PREFIX } from '@/common/constants';
import { setResourceFetchedEntities } from "@/store/infra-resources-slice/infraResourcesSlice";

const { ListLBsRequest } = require('@/_proto/infra-sdk/output/cloud_pb');
const { CloudProviderServiceClient } = require('@/_proto/infra-sdk/output/cloud_grpc_web_pb');
const infraSdkResourcesClient = new CloudProviderServiceClient(BACKEND_API_PREFIX, null, null);

export const useFetchVpcResourceLoadBalancers = (provider: string, region: string, vpcId: string, accountId: string) => {
  const [vpcResourceLoadBalancers, setVpcResourceLoadBalancers] = useState<any[]>([]);
  const dispatch = useDispatch<AppDispatch>();

  const fetchForProvider = (prov: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      console.log(`[useFetchVpcResourceLoadBalancers] Attempting to fetch for provider: "${prov}", accountId: "${accountId}"`);

      if (!prov) {
        console.warn("[useFetchVpcResourceLoadBalancers] Aborting fetch: Provider or Account ID is missing.");
        return resolve([]);
      }

      const request = new ListLBsRequest();
      request.setProvider(prov);
      request.setAccountId(accountId);
      if (region) {
        request.setRegion(region);
      }
      if (vpcId) {
        request.setVpcId(vpcId);
      }

      console.log("[useFetchVpcResourceLoadBalancers] Sending gRPC Request:", request.toObject());

      infraSdkResourcesClient.listLBs(request, {}, (err: any, response: any) => {
        if (err) {
          console.error(`[useFetchVpcResourceLoadBalancers] gRPC call failed for provider ${prov}:`, err);
          return reject(err);
        }
        
        console.log(`[useFetchVpcResourceLoadBalancers] gRPC response received for provider ${prov}.`);
        const data = response?.getLbsList();
        if (data) {
          const result = data.map((lb: any) => {
            const tags: { [key: string]: string } = {};
            const labelsMap = lb.getLabelsMap();
            if (labelsMap) {
              labelsMap.forEach((value: string, key: string) => {
                tags[key] = value;
              });
            }

            const listeners = lb.getListenersList().map((listener: any) => listener.toObject());
            
            // CORRECTED: getPublicIpAddressesList returns a list of strings, not message objects.
            const publicIpAddresses = lb.getPublicIpAddressesList();
            const privateIpAddresses = lb.getPrivateIpAddressesList();

            let publicIp = '';
            let privateIp = '';

            if (publicIpAddresses && publicIpAddresses.length > 0) {
              // CORRECTED: The list contains strings directly, so we join them.
              publicIp = publicIpAddresses.join(', ');
            }

            if (privateIpAddresses && privateIpAddresses.length > 0) {
              // CORRECTED: The list contains strings directly, so we join them.
              privateIp = privateIpAddresses.join(', ');
            }
           
            return {
              id: lb.getId(),
              name: lb.getName(),
              provider: lb.getProvider(),
              accountId: lb.getAccountId(),
              region: lb.getRegion(),
              vpcId: lb.getVpcId(),
              ipAddress: publicIp || privateIp,
              publicIpAddress: publicIp,
              privateIpAddress: privateIp,
              type: lb.getLoadBalancerType(),
              state: lb.getState(),
              selfLink: lb.getSelfLink(),
              project: lb.getProject(),
              listeners: listeners,
              tags: tags,
              labels: tags,
            };
          });
          console.log(`[useFetchVpcResourceLoadBalancers] Parsed ${result.length} load balancers.`);
          resolve(result);
        } else {
          console.log(`[useFetchVpcResourceLoadBalancers] Response for ${prov} was successful but contained no data.`);
          resolve([]);
        }
      });
    });
  };

  const fetchVpcResourceLoadBalancers = async () => {
    console.log(`[useFetchVpcResourceLoadBalancers] fetchVpcResourceLoadBalancers called with main provider: "${provider}"`);
    try {
      let results: any[] = [];
      if (provider === "ALL_PROVIDERS") {
        const providers = ["aws", "gcp", "azure"];
        const responses = await Promise.all(providers.map(p => fetchForProvider(p)));
        responses.forEach(res => results = results.concat(res));
      } else {
        results = await fetchForProvider(provider);
      }
      setVpcResourceLoadBalancers(results);
    } catch (e) {
      console.error("[useFetchVpcResourceLoadBalancers] An error occurred during the fetch process:", e);
      setVpcResourceLoadBalancers([]); // Clear data on error
    }
  };

  useEffect(() => {
    if (vpcResourceLoadBalancers.length) {
      dispatch(setResourceFetchedEntities(vpcResourceLoadBalancers));
    }
  }, [vpcResourceLoadBalancers, dispatch]);

  return { vpcResourceLoadBalancers, fetchVpcResourceLoadBalancers };
};
