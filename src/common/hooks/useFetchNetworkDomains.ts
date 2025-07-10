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

import {
  QueriedNetworkDomain,
  setTestNetworkDomains
} from "@/store/grpc-network-domains-slice/grpcNetworkDomainsSlice";
import { CloudDefinition, ListVPNRequest } from "@/_proto/grpc-service/ts/cloud_request";
import { createChannel, createClient } from "nice-grpc-web";
const { ListVPCRequest } = require("@/_proto/infra-sdk/output/cloud_pb");
const { CloudProviderServiceClient } = require("@/_proto/infra-sdk/output/cloud_grpc_web_pb");
import { BACKEND_API_PREFIX } from "@/common/constants";

const networkDomainsClient = createClient(CloudDefinition, createChannel(BACKEND_API_PREFIX))
const vpnRequest = ListVPNRequest.create();
const vpcRequest = new ListVPCRequest();

const infraSdkResourcesClient = new CloudProviderServiceClient(BACKEND_API_PREFIX, null, null);

export const useFetchNetworkDomains = () => {
  const [array, setArray] = useState<QueriedNetworkDomain[]>([]);
  const dispatch = useDispatch();

  const infraSDKFetchVPCDomains = (provider: string) => {
    try {
      vpcRequest.setProvider(provider);
      infraSdkResourcesClient.listVPC(vpcRequest, {}, (err: any, response: any) => {
        const data = response?.getVpcsList();
        if (data) {
          const networkDomains = data.map((vpc: any): QueriedNetworkDomain => {
            const name = vpc.getName();
            const id = vpc.getId();
            const region = vpc.getRegion();
            const account_id = vpc.getAccountId();
            const type = "vpc";
            return { id, name, provider:provider.toUpperCase(), type, region,account_id };
          });

          setArray((prev) => {
            return [...prev, ...networkDomains];
          });
        }
      });
    } catch (e) {
      console.log("error", e);
    }
  };

  const fetchVPCDomains = () => {
    networkDomainsClient.listVPCs(vpcRequest).then((response) => {
      const data = response.VPCs
      if (data) {
        const networkDomains = data.map((vpcNetwork): QueriedNetworkDomain => ({
          name: vpcNetwork.Name,
          type: "VPC",
          provider: vpcNetwork.Provider,
          id: vpcNetwork.ID,
          region: vpcNetwork.Region,
          account_id: vpcNetwork.AccountName
        }));
        setArray((prev) => {
          return [...prev, ...networkDomains];
        });
      }
    }).catch(error => console.log(error, "Static response"))
  };

  const fetchVPNDomains = () => {
    networkDomainsClient.listVPNs(vpnRequest).then((response) => {
      const data = response.VPNs;
      if (data) {
        const networkDomains = data.map((vpnNetwork): QueriedNetworkDomain => ({
          name: vpnNetwork.SegmentName,
          provider: "Cisco-SDWAN-vManage",
          id: vpnNetwork.ID,
          type: "VRF",
          region: vpnNetwork.SegmentName,
          account_id: ""
        }));
        setArray((prev) => {
          return [...prev, ...networkDomains];
        });
      }
    }).catch(error => console.log(error, "Static response"))
  };

  const fetchAllNetworkDomains = () => {
    setArray([])
    fetchVPNDomains()
    infraSDKFetchVPCDomains("aws")
    infraSDKFetchVPCDomains("gcp")
    infraSDKFetchVPCDomains("azure")
  }

  useEffect(() => {
    if (array.length) {
      dispatch(setTestNetworkDomains(array));
    }
  }, [array]);

  return { array, fetchAllNetworkDomains };
};
