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

import { useDispatch } from "react-redux";
import {
  calculateTotal,
  CloudProviders,
  ResourceCounts,
  ResourceStatus,
  setCount,
  setStatus
} from "@/store/summary-slice/summarySlice";
import { AppDispatch } from "@/store/store";
import { BACKEND_API_PREFIX } from "@/common/constants";

const { SummaryRequest } = require("@/_proto/infra-sdk/output/cloud_pb");
const { CloudProviderServiceClient } = require("@/_proto/infra-sdk/output/cloud_grpc_web_pb");
const infraSdkResourcesClient = new CloudProviderServiceClient(BACKEND_API_PREFIX, null, null);

export const useFetchSummary = (accountId, vpcId) => {
  const dispatch = useDispatch<AppDispatch>();

  const fetchProvider = (provider: typeof CloudProviders[number]) => {
    const summaryRequest = new SummaryRequest()

    summaryRequest.setProvider(provider)
    // fetch based on account id
    summaryRequest.setAccountId(accountId);
    summaryRequest.setVpcId(vpcId);

    infraSdkResourcesClient.summary(summaryRequest, {}, (err: any, response: any) => {
      if (err) console.error(err)
      if (response) {
        const count = response.getCount()
        const counts: ResourceCounts = {
          'Accounts': count.getAccounts(),
          'UserGroups': 1,
          'Users': Math.floor(Math.random() * 20),
          'IdentityProviders': 1,
          'VPC': count.getVpc(),
          'RouteTables': count.getRouteTables(),
          'Subnets': count.getSubnets(),
          'ACL': count.getAcls(), //todo
          'VM': count.getInstances(),
          'SecurityGroups': count.getSecurityGroups(),
          'NATGateways': count.getNatGateways(),
          'CloudRouters': count.getRouters(),
          'InternetGateways': count.getIgws(),
          'VPCEndpoints': count.getVpcEndpoints(),
          'PublicIPAddresses': count.getPublicIps(),
          'Clusters': count.getClusters(),
          'Services': count.getServices(),
          'Pods': count.getPods(),
          'Namespaces': count.getNamespaces(),
          'SGT': 0,
          'VRF': 0,
          'VLAN': 0,
        }
        dispatch(setCount({ provider, data: counts }))

        const status = response.getStatuses()
        const vmStatusMap = status.getVmStatusMap()
        const podStatusMap = status.getPodStatusMap()
        const statuses: ResourceStatus = {
          vm: {
            running: vmStatusMap.get('running') ?? 0,
            stopped: vmStatusMap.get('stopped') ?? 0,
            terminated: vmStatusMap.get('terminated') ?? 0,
          },
          pod: {
            running: podStatusMap.get('running') ?? 0,
            pending: podStatusMap.get('pending') ?? 0,
            crash: podStatusMap.get('crashed') ?? 0
          }
        }
        dispatch(setStatus({ provider, data: statuses }))
        dispatch(calculateTotal())
      }
    })
  }

  // fetchSummary fetches all provider information at once
  // commented out for now since we only have AWS on local machine
  const fetchSummary = () => {
    fetchProvider('AWS')
    fetchProvider('GCP')
    fetchProvider('Azure')
    fetchProvider('Enterprise')
  };

  return { fetchSummary };
};