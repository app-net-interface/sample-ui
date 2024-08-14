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

const { ListInstancesRequest } = require("@/_proto/infra-sdk/output/cloud_pb");
const { CloudProviderServiceClient } = require("@/_proto/infra-sdk/output/cloud_grpc_web_pb");

const infraSdkResourcesClient = new CloudProviderServiceClient(BACKEND_API_PREFIX, null, null);
const vpcSubResourceVmsRequest = new ListInstancesRequest();

export const useFetchVpcResourceVms = (provider: string, region: string, id: string, accountId: string) => {
  const [vpcResourceVms, setVpcResourceVms] = useState<any[]>([]);

  const dispatch = useDispatch();

  vpcSubResourceVmsRequest.setProvider(provider);
  vpcSubResourceVmsRequest.setVpcId(id);
  vpcSubResourceVmsRequest.setRegion(region);
  vpcSubResourceVmsRequest.setAccountId(accountId);

  const fetchVpcResourcesVms = () => {
    try {
      infraSdkResourcesClient.listInstances(vpcSubResourceVmsRequest, {}, (err: any, response: any) => {
        const data = response?.getInstancesList();
        if (data) {
          const infraVms = data.map((instance: any) => {
            const name = instance.getName();
            const id = instance.getId();
            const accountId = instance.getAccountId();
            const provider = instance.getProvider().toUpperCase();
            const region = instance.getRegion();
            const type = instance.getType();
            const subnetId = instance.getSubnetid();
            const publicIp = instance.getPublicip();
            const privateIp = instance.getPrivateip();
            const state = instance.getState();
            const labels: any = {};
            const labelsMap = instance.getLabelsMap();
            const vpcId = instance.getVpcid();
            const zone = instance.getZone();
            const securityGroups = instance.getSecuritygroupidsList();
            const interfaceIds = instance.getInterfaceidsList();
            let project = ""
            let owner = ""
            let compliant = "No"

            const selfLink = instance.getSelfLink();

            labelsMap.forEach((value: string, key: string) => {
              labels[key] = value;
            });
            if (labels && (("project" in labels) || ("Project" in labels))) {
              project = labels["project"];
            }
            if (labels && (("owner" in labels) || ("Owner" in labels))) {
              owner = labels["owner"];
            }
            if (owner && project) {
              compliant = "Yes"
            }

            return {
              name,
              vpcId,
              region,
              id,
              accountId,
              provider,
              owner,
              project,
              type,
              subnetId,
              publicIp,
              privateIp,
              state,
              labels,
              compliant,
              selfLink,
              securityGroups,
              interfaceIds,
              zone,
            };
          });

          setVpcResourceVms([...infraVms]);
        }
      });
    } catch (e) {
      console.log("error", e);
    }
  };

  useEffect(() => {
    if (vpcResourceVms.length) {
      dispatch(setResourceFetchedEntities(vpcResourceVms));
    }
  }, [vpcResourceVms]);

  return { vpcResourceVms, fetchVpcResourcesVms };
};
