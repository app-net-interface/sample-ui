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

const { ListRouteTablesRequest } = require("@/_proto/infra-sdk/output/cloud_pb");
const { CloudProviderServiceClient } = require("@/_proto/infra-sdk/output/cloud_grpc_web_pb");

const infraSdkResourcesClient = new CloudProviderServiceClient(BACKEND_API_PREFIX, null, null);
const vpcResourceRouteTablesRequest = new ListRouteTablesRequest();

export const useFetchVpcResourceRouteTables = (provider: string, region: string, id: string, accountId: string) => {
  const [vpcResourceRouteTables, setVpcResourceRouteTables] = useState<any[]>([]);

  const dispatch = useDispatch();

  vpcResourceRouteTablesRequest.setProvider(provider);
  vpcResourceRouteTablesRequest.setVpcId(id);
  vpcResourceRouteTablesRequest.setRegion(region);
  vpcResourceRouteTablesRequest.setAccountId(accountId);

  const fetchVpcResourceRouteTables = () => {
    try {
      infraSdkResourcesClient.listRouteTables(vpcResourceRouteTablesRequest, {}, (err: any, response: any) => {
        const data = response?.getRouteTablesList();
        if (data) {
          const infraRouteTables = data.map((routeTable: any) => {
            const name = routeTable.getName();
            const id = routeTable.getId();
            const provider = routeTable.getProvider();
            const accountId = routeTable.getAccountId();
            const vpcId = routeTable.getVpcId();
            const region = routeTable.getRegion();
            const labels: any = {};
            const labelsMap = routeTable.getLabelsMap();
            const project = routeTable.getProject();
            const selfLink = routeTable.getSelfLink();

            const routes: any = {};
            const routesMap = routeTable.getRoutesList();

            labelsMap.forEach((value: string, key: string) => {
              labels[key] = value;
            });

            routesMap.forEach((value: string, key: string) => {
              routes[key] = value;
            });

            console.log("ROUTES: " + routes);

            return {
              name,
              id,
              provider,
              accountId,
              region,
              vpcId,
              labels,
              routes,
              project,
              selfLink
            };
          });

          setVpcResourceRouteTables([...infraRouteTables]);
        }
      });
    } catch (e) {
      console.log("error", e);
    }
  };

  useEffect(() => {
    if (vpcResourceRouteTables.length) {
      dispatch(setResourceFetchedEntities(vpcResourceRouteTables));
    }
  }, [vpcResourceRouteTables]);

  return { vpcResourceRouteTables, fetchVpcResourceRouteTables };
};
