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

import { ApplicationConnection, } from "@/common/interface";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface State {
  networkPolicyData: Pick<ApplicationConnection, "networkPolicy">
  accessPolicyData: Pick<ApplicationConnection, "accessPolicy">
  networkDomainConnectionNames: string[]
  policy?: string
  accessControl?: string
  inspection?: string
  geofencing?: string,
  privacy?: string,
  dlp?: string,
  logging?: string,
  monitoring?: string
}

export function toApplicationConnection(state: State): ApplicationConnection[] {
  const { data: policies } = useSelector((state: RootState) => state.applicationConnectionPolicies);
  const policy = policies.find(p => p.id === state.policy)?.appConnection
  // const appConnections = []
  const appConnections: ApplicationConnection[] = [];
  for (let i = 0; i < state.networkDomainConnectionNames.length; i++) {
    if (policy) {
      const cleanPolicy = structuredClone(policy) as ApplicationConnection
      cleanPolicy.accessPolicy = structuredClone(state.accessPolicyData.accessPolicy)
      cleanPolicy.networkPolicy = structuredClone(state.networkPolicyData.networkPolicy)
      cleanPolicy.networkDomainConnection = { selector: { matchName: state.networkDomainConnectionNames[i], }, }
      cleanPolicy.metadata.name = `${cleanPolicy.metadata.name}-${i + 1}`
      appConnections.push(cleanPolicy)
    }
  }
  return appConnections
}

/** converts state to ApplicationConnection without NetworkDomainConnection */
export function toApplicationConnectionShell(state: State): ApplicationConnection | undefined {
  const { data: policies } = useSelector((state: RootState) => state.applicationConnectionPolicies);
  const policy = policies.find(p => p.id === state.policy)?.appConnection
  if (policy) {
    const cleanPolicy = structuredClone(policy) as ApplicationConnection
    cleanPolicy.networkPolicy = structuredClone(state.networkPolicyData.networkPolicy)
    cleanPolicy.accessPolicy = structuredClone(state.accessPolicyData.accessPolicy)
    return cleanPolicy
  }
}

const initialState: State = {
  networkPolicyData: {
    networkPolicy: {
      selector: {
        matchName: "",
      },
    },
  },
  accessPolicyData: {
    accessPolicy: {
      selector: {
        matchName: {
          name: ""
        },
        matchId: {
          id: ""
        },
        matchLabels: {},
      },
    },
  },

  networkDomainConnectionNames: [],
  policy: undefined,
  //security: {},
  //observability: {}
};

export const applicationConnectionDeployerSlice = createSlice({
  name: "applicationConnectionDeployer",
  initialState,
  reducers: {
    reset: () => initialState,
    setNetworkDomainConnectionNames: (state: State, action: PayloadAction<string[]>) => {
      state.networkDomainConnectionNames = action.payload;
    },
    setNetworkPolicy: (state: State, action: PayloadAction<string>) => {
      console.log("Setting network policy name ", action.payload)
      state.networkPolicyData.networkPolicy.selector.matchName = action.payload;
    },
    setPolicy: (state: State, action: PayloadAction<string | undefined>) => {
      state.policy = action.payload
    },
    setAccessControlPolicy: (state: State, action: PayloadAction<string | undefined>) => {

      console.log("Setting access control policy name ", action.payload)
      if (action.payload !== undefined) {
        state.accessPolicyData.accessPolicy.selector.matchName.name = action.payload;
      }
    },
    setInspectionPolicy: (state: State, action: PayloadAction<string | undefined>) => {
      state.inspection = action.payload
    },
    setGeofencingPolicy: (state: State, action: PayloadAction<string | undefined>) => {
      state.geofencing = action.payload
    },
    setPrivacyPolicy: (state: State, action: PayloadAction<string | undefined>) => {
      state.privacy = action.payload
    },
    setDLPPolicy: (state: State, action: PayloadAction<string | undefined>) => {
      state.dlp = action.payload
    },
    setLoggingPolicy: (state: State, action: PayloadAction<string | undefined>) => {
      state.logging = action.payload
    },
    setMonitoringPolicy: (state: State, action: PayloadAction<string | undefined>) => {
      state.monitoring = action.payload
    },
  },
})

export const {
  setNetworkDomainConnectionNames,
  setNetworkPolicy,
  setPolicy,
  setGeofencingPolicy,
  setInspectionPolicy,
  setPrivacyPolicy,
  setAccessControlPolicy,
  setDLPPolicy,
  setLoggingPolicy,
  setMonitoringPolicy,
  reset
} = applicationConnectionDeployerSlice.actions;

export default applicationConnectionDeployerSlice.reducer;