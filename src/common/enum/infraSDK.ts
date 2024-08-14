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

export enum InfraResourceType {
  VMS = "VM",
  SUBNETS = "Subnet",
  ROUTE_TABLES = "Route Table",
  ACLS = "Network ACL",
  SECURITY_GROUPS = "Security Group",
  NAT_GATEWAYS = "NAT Gateway",
  CLOUD_ROUTERS = "Cloud Router",
  INTERNET_GATEWAYS = "Internet Gateway",
  VPC_ENDPOINTS = "VPC Endpoint",
  PUBLIC_IPS = "Public IP",
  CLUSTERS = "Cluster",
  ACTIVE_CONNECTIONS = "Active Connections"
}

export enum InfraClusterSubResources {
  PODS = "pods",
  SERVICES = "services",
  NAMESPACES = "namespaces",
  NODES = "nodes"
}

export enum InfraResourceProvider {
  GCP = "GCP",
  AWS = "AWS",
  AZURE = "AZURE",
  CISCO_ISE = "CISCO_ISE",
  ALL_PROVIDERS = "ALL_PROVIDERS",
}
