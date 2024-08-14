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
import DefaultLayout from '../../../layout/DefaultLayout';


import { serverStatus } from "@/common/constants";
import { AppDispatch, RootState } from "@/store/store";
import { fetchMonitoringPolicies } from "@/store/monitoring-policies-slice/thunk/monitoringPoliciesThunk";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export const MonitoringPolicy = () => {
  const { data } = useSelector((state: RootState) => state.monitoringPolicies);
  const { grpcData } = useSelector((state: RootState) => state.grpcSlaProfiles);


  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (serverStatus === "stub") {
      dispatch(fetchMonitoringPolicies());
    } else {
      //fetchMonitoringPolicies();
      dispatch(fetchMonitoringPolicies());
    }
  }, []);

  const liveServerColumnsDef: ColDef[] = [
    {
      field: "name",
      headerName: "Name",
      width: 100,
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.metadata.name} />;
      },

    },
    {
      field: "frequency",
      width: 200,
      headerName: "Sampling Frequency",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.policy.frequency} />;
      },

    },
    {
      field: "metrics",
      width: 270,
      headerName: "Metrics",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.policy.metrics.join(',')} />;
      },
    },
    {
      field: "detectAnomalies",
      headerName: "AnomalyDetection",
      width: 200,
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.policy.detectAnomalies.toString()} />;
      },

    },

    {
      field: "baselineProfile",
      headerName: "Baseline",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.policy.baselineProfile + " Days"} />;
      },
    },
    {
      field: "increasePercentage",
      headerName: "BWAnomalyIncrease",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.policy.anomalyThreshold.metrics.bandwidth.increasePercentage + " %"} />;
      },
    },
    {
      field: "increasePercentage",
      headerName: "LossAnomalyIncrease",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.policy.anomalyThreshold.metrics.loss.increasePercentage + " %"} />;
      },
    },
    {
      field: "increasePercentage",
      headerName: "LatencyAnomalyIncrease",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.policy.anomalyThreshold.metrics.latency.increasePercentage + " %"} />;
      },
    },
    {
      field: "increasePercentage",
      headerName: "JitterAnomalyIncrease",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.policy.anomalyThreshold.metrics.jitter.increasePercentage + " %"} />;
      },
    },
    {
      field: "alertLevel",
      headerName: "alertLevel",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.policy.alertConfig.alertLevel} />;
      },
    },
    {
      field: "alertLevel",
      headerName: "alertMechanism",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.policy.alertConfig.alertMechanisms.join()} />;
      },
    },
  ];
  const stubServerColumnsDef: ColDef[] = [
    {
      field: "name",
      headerName: "Name",
      width: 100,
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.metadata.name} />;
      },

    },
    {
      field: "frequency",
      width: 200,
      headerName: "Sampling Frequency",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.policy.frequency} />;
      },

    },
    {
      field: "metrics",
      width: 270,
      headerName: "Metrics",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.policy.metrics.join(',')} />;
      },
    },
    {
      field: "detectAnomalies",
      headerName: "AnomalyDetection",
      width: 200,
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.policy.detectAnomalies.toString()} />;
      },

    },

    {
      field: "baselineProfile",
      headerName: "Baseline",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.policy.baselineProfile + " Days"} />;
      },
    },
    {
      field: "increasePercentage",
      headerName: "BWAnomalyIncrease",
      cellRenderer: (params: any) => {
        const increasePercentage = params.data.policy.anomalyThreshold.metrics?.bandwidth?.increasePercentage;
        return <TextRowCell value={increasePercentage ? increasePercentage + " %" : "N/A"} />;
      },
    },
    {
      field: "increasePercentage",
      headerName: "LossAnomalyIncrease",
      cellRenderer: (params: any) => {
        const increasePercentage = params.data.policy.anomalyThreshold.metrics?.loss?.increasePercentage;
        return <TextRowCell value={increasePercentage ? increasePercentage + " %" : "N/A"} />;
      },
    },
    {
      field: "increasePercentage",
      headerName: "LatencyAnomalyIncrease",
      cellRenderer: (params: any) => {
        const increasePercentage = params.data.policy.anomalyThreshold.metrics?.latency?.increasePercentage;
        return <TextRowCell value={increasePercentage ? increasePercentage + " %" : "N/A"} />;
      },
    },
    {
      field: "increasePercentage",
      headerName: "JitterAnomalyIncrease",
      cellRenderer: (params: any) => {
        const increasePercentage = params.data.policy.anomalyThreshold.metrics?.jitter?.increasePercentage;
        return <TextRowCell value={increasePercentage ? increasePercentage + " %" : "N/A"} />;
      },
    },
    {
      field: "alertLevel",
      headerName: "alertLevel",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.policy.alertConfig.alertLevel} />;
      },
    },
    {
      field: "alertLevel",
      headerName: "alertMechanism",
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.data.policy.alertConfig.alertMechanisms.join()} />;
      },
    },
  ];

  if ((data) || (grpcData)) {
    return (
      <DefaultLayout>
        <Breadcrumb pageName="Connection Monitoring Policies" />
        <div className="p-3">
          <DataGrid
            rowData={serverStatus === "live" ? data : data}
            columnDefs={serverStatus === "live" ? stubServerColumnsDef : stubServerColumnsDef}
            heightAndWidth={{
              height: "1200px",
            }}
          />
        </div>
      </DefaultLayout>
    );
  }

  return <span>Loading data, please wait...</span>;
};
