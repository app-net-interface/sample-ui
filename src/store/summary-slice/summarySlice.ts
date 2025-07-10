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

import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

export const CloudProviders = ['AWS', 'GCP', 'Azure','Enterprise'] as const

export type Source = typeof CloudProviders[number] | 'All Providers';

export type ResourceCount =
  'Accounts'
  | 'UserGroups'
  | 'Users'
  | 'IdentityProviders'
  | 'VPC'
  | 'RouteTables'
  | 'Subnets'
  | 'ACL'
  | 'VM'
  | 'SecurityGroups'
  | 'NATGateways'
  | 'CloudRouters'
  | 'InternetGateways'
  | 'VPCEndpoints'
  | 'PublicIPAddresses'
  | 'Clusters'
  | 'Services'
  | 'Pods'
  | 'Namespaces'
  | 'SGT'
  | 'VRF'
  | 'VLAN';

export type ResourceCounts = {
  [K in ResourceCount]: number
}

export type Statuses = {
  running: number
  stopped: number
}

export type ResourceStatus = {
  vm: { running: number, stopped: number, terminated: number, unknown: number },
  pod: { running: number, pending: number, crash: number }
}

interface State {
  count: Record<Source, ResourceCounts>
  status: Record<Source, ResourceStatus>
}

const initialState: State = {
  count: {
    'AWS': {
      Accounts: 0,
      UserGroups:2,
      Users: 8,
      IdentityProviders: 1,
      VPC: 0,
      Subnets: 0,
      RouteTables: 0,
      ACL: 0,
      VM: 0,
      SecurityGroups: 0,
      NATGateways:0,
      CloudRouters:0,
      InternetGateways:0,
      VPCEndpoints:0,
      PublicIPAddresses:0,
      Clusters: 0,
      Services: 0,
      Pods: 0,
      Namespaces: 0,
      SGT: 0,
      VRF: 0,
      VLAN: 0,
    },
    'GCP': {
      Accounts: 0,
      UserGroups:3,
      Users: 12,
      IdentityProviders: 1,
      VPC: 0,
      Subnets: 0,
      RouteTables: 0,
      ACL: 0,
      VM: 0,
      SecurityGroups: 0,
      NATGateways:0,
      CloudRouters:0,
      InternetGateways:0,
      VPCEndpoints:0,
      PublicIPAddresses:0,
      Clusters: 0,
      Services: 0,
      Pods: 0,
      Namespaces: 0,
      SGT: 0,
      VRF: 0,
      VLAN: 0,
    },
    'Azure': {
      Accounts: 2, // Subscriptions
      UserGroups:Math.floor(Math.random() * 5),
      Users: Math.floor(Math.random() * 20),
      IdentityProviders: 1,
      VPC: 12, // Vnet 
      Subnets: 25, // Subnet
      RouteTables: 4, // Route Table
      ACL: 0, // NSG - Network Security Group
      VM: 0, // 
      SecurityGroups: 0, // No equivalence
      NATGateways:0,
      CloudRouters:0,
      InternetGateways:0,
      VPCEndpoints:0,
      PublicIPAddresses:0,
      Clusters: 0,
      Services: 0,
      Pods: 0,
      Namespaces: 0,
      SGT: 0,
      VRF: 0,
      VLAN: 0,
    },
    'Enterprise': {
      Accounts: 0, // Subscriptions
      UserGroups:0,
      Users: 0,
      IdentityProviders: 0,
      VPC: 0, // Vnet 
      Subnets: 0, // Subnet
      RouteTables: 0, // Route Table
      ACL: 0, // NSG - Network Security Group
      VM: 0, // 
      SecurityGroups: 0, // No equivalence
      NATGateways:0,
      CloudRouters:0,
      InternetGateways:0,
      VPCEndpoints:0,
      PublicIPAddresses:0,
      Clusters: 0,
      Services: 0,
      Pods: 0,
      Namespaces: 0,
      SGT: 20,
      VRF: 5,
      VLAN: 32,
    },
    'All Providers': {
      'Accounts': 0,
      UserGroups:0,
      Users: 0,
      IdentityProviders: 0,
      'VPC': 0,
      'RouteTables': 0,
      'Subnets': 0,
      'ACL': 0,
      'VM': 0,
      'SecurityGroups': 0,
      'NATGateways':0,
      'CloudRouters':0,
      'InternetGateways':0,
      'VPCEndpoints':0,
      'PublicIPAddresses':0,
      'Clusters': 0,
      'Services': 0,
      'Pods': 0,
      'Namespaces': 0,
      'SGT': 0, //Math.floor(Math.random() * 10)
      'VRF': 0,
      'VLAN': 0,
    },
  },
  status: {
    'AWS': {
      vm: {
        running: 0,
        stopped: 0,
        terminated: 0,
        unknown: 0,
      },
      pod: {
        running: 0,
        pending: 0,
        crash: 0,
      }
    },
    'GCP': {
      vm: {
        running: 0,
        stopped: 0,
        terminated: 0,
        unknown: 0,
      },
      pod: {
        running: 0,
        pending: 0,
        crash: 0,
      }
    },
    'Azure': {
      vm: {
        running: 0,
        stopped: 0,
        terminated: 0,
        unknown: 0,
      },
      pod: {
        running: 0,
        pending: 0,
        crash: 0,
      }
    },
    'Enterprise': {
      vm: {
        running: 0,
        stopped: 0,
        terminated: 0,
        unknown: 0,
      },
      pod: {
        running: 0,
        pending: 0,
        crash: 0,
      }
    },
    'All Providers': {
      vm: {
        running: 0,
        stopped: 0,
        terminated: 0,
        unknown: 0
      },
      pod: {
        running: 0,
        pending: 0,
        crash: 0
      }
    },
  }
};

export const summarySlice = createSlice({
  name: "summary",
  initialState,
  reducers: {
    setCount: (state: State, action: PayloadAction<{ provider: Source, data: ResourceCounts }>) => {
      const { provider, data } = action.payload
      state.count[provider] = data
    },
    setStatus: (state: State, action: PayloadAction<{ provider: Source, data: ResourceStatus }>) => {
      const { provider, data } = action.payload
      state.status[provider] = data
    },
    calculateTotal: (state: State) => {
      state.count["All Providers"] = structuredClone(initialState.count["All Providers"])
      state.status["All Providers"] = structuredClone(initialState.status["All Providers"])
      CloudProviders.forEach(provider => {
        Object.entries(state.count[provider]).forEach(([resource, count]) => {
          state.count['All Providers'][resource as ResourceCount] += count;
        });
        Object.entries(state.status[provider]).forEach(([resource, data]) => {
          Object.entries(data).forEach(([status, value]) => {
            const resourceStatus = state.status['All Providers'][resource as keyof ResourceStatus]
            resourceStatus[status as keyof typeof resourceStatus] += value
          })
        });
      });
    }
  }
})

export const {
  setCount,
  setStatus,
  calculateTotal
} = summarySlice.actions;

export default summarySlice.reducer;