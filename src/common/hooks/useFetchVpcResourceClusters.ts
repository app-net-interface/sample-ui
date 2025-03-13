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

const { ListCloudClustersRequest } = require("@/_proto/infra-sdk/output/cloud_pb");
const { CloudProviderServiceClient } = require("@/_proto/infra-sdk/output/cloud_grpc_web_pb");

const infraSdkResourcesClient = new CloudProviderServiceClient(BACKEND_API_PREFIX, null, null);

export const useFetchVpcResourceClusters = (provider: string, region: string, id: string, accountId: string) => {
  const [vpcResourceClusters, setVpcResourceClusters] = useState<any[]>([]);

  const dispatch = useDispatch();

  const fetchForProvider = (prov: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const request = new ListCloudClustersRequest();
      request.setProvider(prov);
      request.setVpcId(id);
      request.setRegion(region);
      request.setAccountId(accountId);
      infraSdkResourcesClient.listCloudClusters(request, {}, (err: any, response: any) => {
        if (err) return reject(err);
        const data = response?.getClustersList();
        if (data) {
          const result = data.map((cluster: any) => {
            const name = cluster.getName();
            const fullname = cluster.getFullName();
            const arn = cluster.getArn();
            const region = cluster.getRegion();
            const project = cluster.getProject();
            const vpcId = cluster.getVpcId()
            const provider = cluster.getProvider();
            const accountId = cluster.getAccountId();
            const labels: any = {};
            const labelsMap = cluster.getLabelsMap();

            labelsMap.forEach((value: string, key: string) => {
              labels[key] = value;
            });

            return {
              name,
              fullname,
              arn,
              region,
              // project,
              vpcId,
              provider,
              accountId,
              labels,
            };
          });
          resolve(result);
        } else {
          resolve([]);
        }
      });
    });
  };

  const fetchVpcResourcesClusters = async () => {
    try {
      let results: any[] = [];
      if (provider === "ALL_PROVIDERS") {
        const providers = ["aws", "gcp", "azure"];
        const responses = await Promise.all(providers.map(p => fetchForProvider(p)));
        responses.forEach(res => results = results.concat(res));
      } else {
        results = await fetchForProvider(provider);
      }
      setVpcResourceClusters(results);
    } catch(e) {
      console.log("error", e);
    }
  };

  useEffect(() => {
    if (vpcResourceClusters.length) {
      dispatch(setResourceFetchedEntities(vpcResourceClusters));
    }
  }, [vpcResourceClusters]);

  return { vpcResourceClusters, fetchVpcResourcesClusters };
};
