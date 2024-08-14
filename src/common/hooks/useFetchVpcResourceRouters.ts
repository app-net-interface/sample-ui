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

const { ListRoutersRequest } = require("@/_proto/infra-sdk/output/cloud_pb");
const { CloudProviderServiceClient } = require("@/_proto/infra-sdk/output/cloud_grpc_web_pb");

const infraSdkResourcesClient = new CloudProviderServiceClient(BACKEND_API_PREFIX, null, null);
const vpcResourceRoutersRequest = new ListRoutersRequest();

export const useFetchVpcResourceRouters = (provider: string, region: string, id: string, accountId: string) => {
  const [vpcResourceRouters, setVpcResourceRouters] = useState<any[]>([]);

  const dispatch = useDispatch();

  vpcResourceRoutersRequest.setProvider(provider);
  vpcResourceRoutersRequest.setVpcId(id);
  vpcResourceRoutersRequest.setRegion(region);
  vpcResourceRoutersRequest.setAccountId(accountId);

  const fetchVpcResourceRouters = () => {
    try {
      infraSdkResourcesClient.listRouters(vpcResourceRoutersRequest, {}, (err: any, response: any) => {
        const data = response?.getRoutersList();
        if (data) {
          const infraRouters = data.map((router: any) => {
            const name = router.getName();
            const id = router.getId();
            const accountId = router.getAccountId();
            const vpcId = router.getVpcId();
            const region = router.getRegion();
            const asn = router.getAsn()
            const advertised_group = router.getAdvertisedGroup()
            const advertised_range = router.getAdvertisedRange()
            const labels: any = {};
            const labelsMap = router.getLabelsMap();
            const provider = router.getProvider();
            const selfLink = router.getSelfLink();
            const project = router.getProject();
            const createdAt = router.getCreatedAt();
            const vpnType = router.getVpnType();
            const subnetId = router.getSubnetId();

            labelsMap.forEach((value: string, key: string) => {
              labels[key] = value;
            });

            console.log("CREATED AT: " + createdAt);

            return {
              name,
              id,
              accountId,
              region,
              provider,
              vpcId,
              asn,
              advertised_group,
              advertised_range,
              selfLink,
              labels,
              createdAt,
              project,
              vpnType,
              subnetId,
            };
          });

          setVpcResourceRouters([...infraRouters]);
        }
      });
    } catch (e) {
      console.log("error", e);
    }
  };

  useEffect(() => {
    if (vpcResourceRouters.length) {
      dispatch(setResourceFetchedEntities(vpcResourceRouters));
    }
  }, [vpcResourceRouters]);

  return { vpcResourceRouters, fetchVpcResourceRouters };
};
