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
import { useEffect } from "react";

import { DataGrid, TextRowCell } from "@/components/data-grid";
import { Wrapper } from "@/components/views/wrapper";

import { serverStatus } from "@/common/constants";
import { AppDispatch, RootState } from "@/store/store";
import { fetchSLAProfiles } from "@/store/sla-profiles-slice/thunk/slaProfilesThunk";

import DefaultLayout from "@/layout/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export const SlaProfiles = () => {
  const { data } = useSelector((state: RootState) => state.slaProfiles);
  const { grpcData } = useSelector((state: RootState) => state.grpcSlaProfiles);


  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (serverStatus === "stub") {
      dispatch(fetchSLAProfiles());
    } else {
      //fetchSLAProfiles();
      dispatch(fetchSLAProfiles());
    }
  }, []);

  const liveServerColumnsDef: ColDef[] = [
    {
      field: "name",
      headerName: "Name",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.metadata.name} />;
      },

    },
    {
      field: "category",
      headerName: "Category",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.metadata.category} />;
      },

    },
    {
      field: "trafficType",
      headerName: "TrafficType",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.metadata.trafficType} />;
      },
    },
    {
      field: "priority",
      headerName: "Priority",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.trafficSLO.priority} />;
      },

    },

    {
      field: "bandwidth",
      headerName: "Bandwidth (Mbps)",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.trafficSLO.QoSParams.bandwidth} />;
      },
    },
    {
      field: "latency",
      headerName: "Latency (ms)",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.trafficSLO.QoSParams.latency} />;
      },
    },
    {
      field: "loss",
      headerName: "Loss (%)",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.trafficSLO.QoSParams.loss} />;
      },
    },
    {
      field: "jitter",
      headerName: "Jitter",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.trafficSLO.QoSParams.jitter} />;
      },
    },
  ];
  const stubServerColumnsDef: ColDef[] = [
    {
      field: "name",
      headerName: "Name",
      width: 300,
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.metadata.name} />;
      },

    },
    {
      field: "category",
      width: 200,
      headerName: "Category",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.metadata.category} />;
      },

    },
    {
      field: "trafficType",
      width: 300,
      headerName: "TrafficType",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.metadata.trafficType} />;
      },
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 100,
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.trafficSLO.priority} />;
      },

    },

    {
      field: "bandwidth",
      headerName: "Bandwidth (Mbps)",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.trafficSLO.QoSParams.bandwidth} />;
      },
    },
    {
      field: "latency",
      headerName: "Latency (ms)",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.trafficSLO.QoSParams.latency} />;
      },
    },
    {
      field: "loss",
      headerName: "Loss (%)",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.trafficSLO.QoSParams.loss} />;
      },
    },
    {
      field: "jitter",
      headerName: "Jitter",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.trafficSLO.QoSParams.jitter} />;
      },
    },
    {
      field: "enforcementRequest",
      headerName: "Enforcement",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.trafficSLO.enforcementRequest} />;
      },
    },
  ];

  if ((data) || (grpcData)) {
    return (
      <DefaultLayout>
        <Breadcrumb pageName="SLA Profiles" />
        <DataGrid
          rowData={serverStatus === "live" ? data : data}
          columnDefs={serverStatus === "live" ? stubServerColumnsDef : stubServerColumnsDef}
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
