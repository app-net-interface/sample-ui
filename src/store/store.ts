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

import { configureStore } from "@reduxjs/toolkit";

import networkDomainsSlice from "@/store/network-domains-slice/networkDomainSlice";
import grpcNetworkDomainsSlice from "@/store/grpc-network-domains-slice/grpcNetworkDomainsSlice";
import networkDomainsConnectionsSlice from "@/store/network-domains-connections-slice/networkDomainsConnectionsSlice";
import applicationConnectionSlice from "@/store/application-connection-slice/applicationConnectionSlice";
import applicationConnectionsSlice from "@/store/application-connections-slice/applicationConnectionsSlice";
import slaProfilesSlice from "@/store/sla-profiles-slice/slaProfilesSlice";
import accessControlPoliciesSlice from "@/store/access-control-policies-slice/accessControlPoliciesSlice";
import monitoringPoliciesSlice from "@/store/monitoring-policies-slice/monitoringPoliciesSlice";
import selectedResource from "./selectedRegionAccountId-slice/selectedRegionAccountIdSlice";

import grpcSlaProfilesSlice from "@/store/grpc-sla-profiles-slice/grpcSlaProfilesSlice";
import infraResourcesSlice from "@/store/infra-resources-slice/infraResourcesSlice";
import applicationConnectionPoliciesSlice
  from "@/store/application-connection-policies-slice/applicationConnectionPoliciesSlice";
import applicationConnectionDeployerSlice
  from "@/store/application-connection-deployer-slice/applicationConnectionDeployerSlice";
import summarySlice from "@/store/summary-slice/summarySlice";

export const store = configureStore({
  reducer: {
    networkDomains: networkDomainsSlice,
    grpcNetworkDomains: grpcNetworkDomainsSlice,
    networkDomainsConnections: networkDomainsConnectionsSlice,
    applicationConnection: applicationConnectionSlice,
    applicationConnectionsList: applicationConnectionsSlice,
    slaProfiles: slaProfilesSlice,
    monitoringPolicies: monitoringPoliciesSlice,
    grpcSlaProfiles: grpcSlaProfilesSlice,
    infraResources: infraResourcesSlice,
    applicationConnectionPolicies: applicationConnectionPoliciesSlice,
    applicationConnectionDeployer: applicationConnectionDeployerSlice,
    accessControlPolicies: accessControlPoliciesSlice,
    summary: summarySlice,
    selectedResources: selectedResource,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
