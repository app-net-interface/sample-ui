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

export type QueriedNetworkDomain = {
  name: string
  provider: string
  id: string
  type: string
  region: string
  account_id: string
}

type State = {
  grpcData: QueriedNetworkDomain[]
}

const initialState: State = {
  grpcData: [],
};

export const grpcNetworkDomainsSlice = createSlice({
  name: "testNetworkDomainsSlice",
  initialState,
  reducers: {
    setTestNetworkDomains: (state: State, action: PayloadAction<QueriedNetworkDomain[]>) => {
      state.grpcData = [...action.payload];
    },
  },
});

export const { setTestNetworkDomains } = grpcNetworkDomainsSlice.actions;
export default grpcNetworkDomainsSlice.reducer;
