/**
 * Copyright (c) 2023 Cisco Systems, Inc. and its affiliates
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
const vpcSubResourceClustersRequest = new ListCloudClustersRequest();

export const useFetchVpcResourceClusters = (provider: string, region: string, id: string, accountId: string) => {
  const [vpcResourceClusters, setVpcResourceClusters] = useState<any[]>([]);

  const dispatch = useDispatch();

  vpcSubResourceClustersRequest.setProvider(provider);
  vpcSubResourceClustersRequest.setVpcId(id);
  vpcSubResourceClustersRequest.setRegion(region);
  vpcSubResourceClustersRequest.setAccountId(accountId);

  const fetchVpcResourcesClusters = () => {
    try {
      infraSdkResourcesClient.listCloudClusters(vpcSubResourceClustersRequest, {}, (err: any, response: any) => {
        const data = response?.getClustersList();
        if (data) {
          console.log("clusters:", data);
          const infraClusters = data.map((cluster: any) => {
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

          setVpcResourceClusters([...infraClusters]);
        }
      });
    } catch (e) {
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
