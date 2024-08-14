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

export enum RoutePaths {
  LOGIN_PAGE = "/",
  DASHBOARD = "/dashboard",

  INFRA_RESOURCE_DASHBOARD = "/infra-resource-dashboard",
  MULTI_CLOUD_INFRA_RESOURCE_DASHBOARD = "/multi-cloud-infra-resources",
  VPC_CONNECTION_DASHBOARD = "/vpc-connection-dashboard",
  VM_CONNECTION_DASHBOARD = "/vm-connection-dashboard",
  SECURITY_GROUPS = "/security-groups-dashboard",
  LIST_INFRA_RESOURCES = "/list-infra-resources",
  LIST_CLUSTER_RESOURCES = "/list-cluster-resources",

  NETWORK_DOMAINS = "/network-domains",
  DEFINE_NETWORK_DOMAIN = "/define-network-domain",
  NETWORK_DOMAIN_CONNECTIONS = "/network-domain-connections",
  CONNECTION_CREATOR = "/connection-creator",

  APPLICATION_CONNECTION_CREATOR = "/application-connection-creator",
  APPLICATION_CONNECTION_ATTACHMENT = "/application-connection-attachment",
  USER_CONNECTION_ATTACHMENT = "/user-connection-attachment",
  APPLICATION_CONNECTIONS = "/application-connections",
  APPLICATION_CONNECTION_POLICIES = "/application-connection-policies",

  USER_LIST = "/user-list",
  USER_CONNECTIONS = "/user-connections",
  USER_CONNECTIONS_CREATOR = "/user-connections-creator",
  USER_CONNECTIONS_POLICIES = "/user-connections-policies",
  USER_CONNECTIONS_POLICIES_CREATOR = "/user-connections-policies-creator",

  ENDPOINT_LIST = "/endpoint-list",
  ENDPOINT_CONNECTIONS = "/endpoint-connections",
  ENDPOINT_CONNECTIONS_CREATOR = "/endpoint-connections-creator",
  ENDPOINT_CONNECTIONS_POLICIES = "/endpoint-connections-policies",
  ENDPOINT_CONNECTIONS_POLICIES_CREATOR = "/endpoint-connections-policies-creator",

  SLA_PROFILE_CREATOR = "/sla-profile-creator",
  SLA_PROFILES = "/sla-profiles",

  ACCESS_CONTROL_POLICIES_CREATOR = "/access-control-policies-creator",
  ACCESS_CONTROL_POLICIES = "/access-control-policies",

  TRAFFIC_INSPECTION_POLICIES_CREATOR = "/traffic-inspection-policies-creator",
  TRAFFIC_INSPECTION_POLICIES = "/traffic-inspection-policies",

  GEOFENCING_POLICIES_CREATOR = "/geofencing-policies-creator",
  GEOFENCING_POLICIES = "/geofencing-policies",

  NETWORK_DATA_PRIVACY_POLICIES_CREATOR = "/network-data-privacy-policies-creator",
  NETWORK_DATA_PRIVACY_POLICIES = "/network-data-privacy-policies",

  MONITORING_POLICIES_CREATOR = "/monitoring-policies-creator",
  MONITORING_POLICIES = "/monitoring-policies",

  LOGGING_POLICIES_CREATOR = "/logging-policies-creator",
  LOGGING_POLICIES = "/logging-policies",
}
