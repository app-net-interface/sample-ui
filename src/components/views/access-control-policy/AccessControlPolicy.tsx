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

import { ColDef } from "ag-grid-community";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import { DataGrid, TextRowCell } from "@/components/data-grid";
import { Wrapper } from "@/components/views/wrapper";

import { AppDispatch, RootState } from "@/store/store";
import { fetchAccessControlPolicies } from "@/store/access-control-policies-slice/thunk/accessControlPoliciesThunk";
import { setAccessControlPolicies } from "@/store/access-control-policies-slice/accessControlPoliciesSlice"; // Import the action to update Redux store

import { AccessPolicyListRequest } from "@/_proto/grpc-service/ts/security_policy_service";
import { createChannel, createClient } from "nice-grpc-web";
import { SecurityPolicyServiceDefinition } from "@/_proto/grpc-service/ts/security_policy_service";
import { openNotification } from "@/common/utils";
import { BACKEND_API_PREFIX } from "@/common/constants";

import DefaultLayout from "@/layout/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export const AccessControlPolicies = () => {
  const { data } = useSelector((state: RootState) => state.accessControlPolicies);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const securityPolicyService = createClient(SecurityPolicyServiceDefinition, createChannel(BACKEND_API_PREFIX));

    // Fetch access policies
    securityPolicyService
      .listAccessPolicies(AccessPolicyListRequest.create({}))
      .then((response) => {
        // Extract access policies from response
        const accessPolicies = response.accessPolicies;
        // Dispatch the action to update Redux store with access policies
        dispatch(setAccessControlPolicies(accessPolicies)); // Dispatch the action here
      })
      .catch((error) => openNotification.error(`Failure: ${error}`));
  }, [dispatch]);

  const ColumnsDef: ColDef[] = [
    {
      field: "name",
      headerName: "Name",
      width: 300,
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.metadata.name} />;
      },

    },
    {
      field: "description",
      width: 200,
      headerName: "Description",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.metadata.description} />;
      },

    },
    {
      field: "priority",
      width: 300,
      headerName: "Priority",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.metadata.priority} />;
      },
    },
    {
      field: "accessType",
      headerName: "Access Type",
      width: 100,
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.accessType} />;
      },
    },

  ];

  if ((data)) {
    return (
      <DefaultLayout>
        <Breadcrumb pageName="Access Control Policies" />
        <DataGrid
          rowData={data}
          columnDefs={ColumnsDef}
          heightAndWidth={{
            height: "1200px",
            width: "1600px",
          }}
        />
      </DefaultLayout>
    );
  }

  return <span>Loading data, please wait...</span>;
};
