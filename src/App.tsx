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

import React, { Suspense } from "react";

import { Route, Routes } from "react-router-dom";

import {
  NetworkDomains,
  NetworkDomainsConnections,
  // DefineNetworkDomain,
  SlaProfiles,
  //SlaProfileCreator,
  NetworkDomainsConnectionCreator,
  ApplicationConnections,
  // LoginPage,
  ListInfraResources,
  // ListClusterResources,
} from "@/components";
// import { Layout } from "@/layout";

import { RoutePaths } from "@/common/enum";

// import "./App.scss";
import { ApplicationConnectionPolicies } from "@/components/views/applications-connection-policies";
import { ApplicationPolicyCreator } from "@/components/views/application-policy-creator";
import { ApplicationPolicyAttachment } from "@/components/views/application-policy-attachment";
import { LoginPage } from "@/components/views/login-page/LoginPage";
// import { Dashboard } from "@/components/views/dashboard";
import Home from './pages/Dashboard/Home';
import { VPCConnectionDashboard } from "@/components/views/vpc-connection-dashboard";
import MultiCloudInfra from "./pages/MultiCloudInfra/MultiCloudInfra";
import SecurityGroups from './pages/SecurityGroups/SecurityGroups';
import ClusterResources from "./pages/Kubernetes/Kubernetes"
import ListNetworkDomain from "./pages/NetworkDomain/ListNetworkDomain";
import { DefineNetworkDomain } from "@/components/views/define-network-domain";
import { AccessControlPolicyCreator } from "@/components/views/access-control-policy-creator";
import { TrafficInspectionPolicyCreator } from "./components/views/traffic-inspection-policy-creator";
import { GeofencingPolicyCreator } from "./components/views/geofencing-policy-creator/GeofencingPolicyCreator";
import { NetworkDataPrivacyPolicyCreator } from "./components/views/network-data-privacy-policy-creator";
import { MonitoringPolicyCreator } from "./components/views/monitoring-policy-creator";
import { LoggingPolicyCreator } from "./components/views/logging-policy-creator";
import { SlaProfileCreator } from "./components/views/sla-profile-creator";
import { AccessControlPolicies } from "./components/views/access-control-policy";
import { UserPolicyAttachment } from "./components/views/user-policy-attachment";
import { MonitoringPolicy } from "./components/views/monitoring-policy/MonitoringPolicy";
// import SecurityGroups from "./pages/SecurityGroups/SecurityGroups";
import Error404 from "./pages/404";


function App() {

  return (
    // <Layout>
    <Suspense fallback={<span>Fetching data, please wait.</span>}>
      <Routes>
        <Route path={RoutePaths.LOGIN_PAGE} element={<LoginPage />} />
        <Route path={RoutePaths.INFRA_RESOURCE_DASHBOARD} element={<Home />} />
        {/* <Route path={RoutePaths.INFRA_RESOURCE_DASHBOARD} element={<Dashboard />} /> */}
        <Route path={RoutePaths.VPC_CONNECTION_DASHBOARD} element={<VPCConnectionDashboard />} />
        <Route path={RoutePaths.MULTI_CLOUD_INFRA_RESOURCE_DASHBOARD} element={<MultiCloudInfra />} />
        <Route path={RoutePaths.SECURITY_GROUPS} element={<SecurityGroups />} />

        <Route path={RoutePaths.NETWORK_DOMAINS} element={<ListNetworkDomain />} />
        <Route path={RoutePaths.DEFINE_NETWORK_DOMAIN} element={<DefineNetworkDomain />} />
        <Route path={RoutePaths.NETWORK_DOMAIN_CONNECTIONS} element={<NetworkDomainsConnections />} />

        <Route path={RoutePaths.CONNECTION_CREATOR} element={<NetworkDomainsConnectionCreator />} />
        <Route path={RoutePaths.APPLICATION_CONNECTIONS} element={<ApplicationConnections />} />
        <Route path={RoutePaths.APPLICATION_CONNECTION_POLICIES} element={<ApplicationConnectionPolicies />} />
        <Route path={RoutePaths.APPLICATION_CONNECTION_CREATOR} element={<ApplicationPolicyCreator />} />
        <Route path={RoutePaths.APPLICATION_CONNECTION_ATTACHMENT} element={<ApplicationPolicyAttachment />} />
        <Route path={RoutePaths.USER_CONNECTION_ATTACHMENT} element={<UserPolicyAttachment />} />

        <Route path={RoutePaths.SLA_PROFILE_CREATOR} element={<SlaProfileCreator />} />
        <Route path={RoutePaths.SLA_PROFILES} element={<SlaProfiles />} />
        <Route path={RoutePaths.LIST_INFRA_RESOURCES} element={<ListInfraResources />} />
        {/* <Route path={RoutePaths.LIST_CLUSTER_RESOURCES} element={<ListClusterResources />} /> */}
        <Route path={RoutePaths.LIST_CLUSTER_RESOURCES} element={<ClusterResources />} />


        <Route path={RoutePaths.ACCESS_CONTROL_POLICIES_CREATOR} element={<AccessControlPolicyCreator />} />
        <Route path={RoutePaths.TRAFFIC_INSPECTION_POLICIES_CREATOR} element={<TrafficInspectionPolicyCreator />} />
        <Route path={RoutePaths.ACCESS_CONTROL_POLICIES} element={<AccessControlPolicies />} />

        <Route path={RoutePaths.GEOFENCING_POLICIES_CREATOR} element={<GeofencingPolicyCreator />} />
        <Route path={RoutePaths.NETWORK_DATA_PRIVACY_POLICIES_CREATOR} element={<NetworkDataPrivacyPolicyCreator />} />
        <Route path={RoutePaths.MONITORING_POLICIES_CREATOR} element={<MonitoringPolicyCreator />} />
        <Route path={RoutePaths.MONITORING_POLICIES} element={<MonitoringPolicy />} />
        <Route path={RoutePaths.LOGGING_POLICIES_CREATOR} element={<LoggingPolicyCreator />} />

        {/* 404 */}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Suspense>
    // </Layout>
  );
}

export default App;
