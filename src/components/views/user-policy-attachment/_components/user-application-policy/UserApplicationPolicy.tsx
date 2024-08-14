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

import React, { FC, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "@/store/store";
import { useFetchAppConnectionPolicies } from "@/common/hooks";
import { setPolicy } from "@/store/application-connection-deployer-slice/applicationConnectionDeployerSlice";
import { Select, Wrapper } from "@/components";
import { Checkbox } from "antd";

export const UserApplicationPolicy: FC = () => {
  const { data: policies } = useSelector((state: RootState) => state.applicationConnectionPolicies);
  const { policy } = useSelector((state: RootState) => state.applicationConnectionDeployer);

  const { fetchAppConnectionPolicies } = useFetchAppConnectionPolicies()

  useEffect(() => {
    fetchAppConnectionPolicies();
  }, []);

  const dispatch = useDispatch<AppDispatch>();

  const options = policies.map(policy => ({
    value: policy.id,
    label: `${policy.appConnection?.metadata?.name} (${policy.id})`
  })
  )

  const handleChange = (value: string) => {
    dispatch(setPolicy(value))
  };

  return (
    <Wrapper title={"Select 'User->Application' Connection Policy"} expand>
      <p>A user application connection provides connectivity or denies access , for a set of users to a set of applications or to its components, distributed across networking domains like VPCs, VRFs, or VLANs. It ensures seamless communication, adhering to specific access policy and security measures..</p>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Select
          options={options}
          onChange={handleChange}
          defaultValue={policy}
          allowClear
        />
        <div className="flex items-center">
          <Checkbox defaultChecked className="mr-2"></Checkbox>
          <span>Allow dynamic resource selection</span>
        </div>
      </div>
    </Wrapper>
  );
};
