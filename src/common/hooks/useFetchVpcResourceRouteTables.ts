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

export const useFetchVpcResourceRouteTables = (provider: string, region: string, id: string, accountId: string) => {
  const [vpcResourceRouteTables, setVpcResourceRouteTables] = useState<any[]>([]);

  const dispatch = useDispatch();

  const fetchForProvider = (prov: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const request = new ListRouteTablesRequest();
      request.setProvider(prov);
      request.setVpcId(id);
      request.setRegion(region);
      request.setAccountId(accountId);
      infraSdkResourcesClient.listRouteTables(request, {}, (err: any, response: any) => {
        if (err) return reject(err);
        const data = response?.getRouteTablesList();
        if (data) {
          const result = data.map((routeTable: any) => {
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
          resolve(result);
        } else {
          resolve([]);
        }
      });
    });
  };

  const fetchVpcResourceRouteTables = async () => {
    try {
      let results: any[] = [];
      if (provider === "ALL_PROVIDERS") {
        const providers = ["aws", "gcp", "azure"];
        const responses = await Promise.all(providers.map(p => fetchForProvider(p)));
        responses.forEach(res => results = results.concat(res));
      } else {
        results = await fetchForProvider(provider);
      }
      setVpcResourceRouteTables(results);
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
