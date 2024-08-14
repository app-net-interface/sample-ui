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

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { ColDef } from "ag-grid-community";

import { Link } from "react-router-dom";

import { StatusRowCell, TextRowCell } from "@/components/data-grid";
import { Wrapper } from "@/components/views/wrapper";

import { RoutePaths } from "@/common/enum";

import { useFetchAppConnections } from "@/common/hooks";
import { serverStatus } from "@/common/constants";
import { fetchApplicationConnections } from "@/store/application-connections-slice/thunk/applicationConnectionsThunk";
import { appConnectionInject, BottomDrawer, stringOfYAML } from "@/components";
import { AppConnectionData, AppConnectionResources, } from "@/components/application-connection-info";
import {
  TableEnvironmentProvider
} from "@/components/application-connection-info/_components/dynamic-table/TableTypeContext";
import { AppConnectionInformation } from "@/_proto/grpc-service/ts/app_connection";
import { Status } from "@/_proto/grpc-service/ts/common";
import { Toolbar } from "./_components/Toolbar";
import { Button, Drawer } from "antd";
import AceEditor from "react-ace";
import { AgGridReact } from "ag-grid-react";
import gridStyles from "@/components/data-grid/data-grid.module.scss";
import download from "@/assets/icons/download.svg";
import { saveAs } from "file-saver";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from '../../../layout/DefaultLayout';


export const ApplicationConnections = () => {
  const { data } = useSelector((state: RootState) => state.applicationConnectionsList);
  const [connectionResources, setConnectionResources] = useState<AppConnectionData>({ config: undefined })
  const [bottomDrawerVisible, setBottomDrawerVisible] = useState(false);
  const [selectedRows, setSelectedRows] = useState<AppConnectionInformation[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [yamlSource, setYamlSource] = useState<any>({})

  const { fetchAppConnections } = useFetchAppConnections();

  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    if (serverStatus === "stub") {
      dispatch(fetchApplicationConnections());
    } else {
      fetchAppConnections();
    }
  }, []);

  useEffect(() => {
    if (selectedRows.length == 1) {
      setYamlSource(selectedRows[0].appConnectionConfig)
      setDrawerOpen(true)
    } else {
      setDrawerOpen(false)
    }
  }, [selectedRows])

  const handleRowSelection = (params: any) => {
    setSelectedRows(params.api.getSelectedRows());
  };

  const columnDefs: ColDef<AppConnectionInformation>[] = [
    {
      checkboxSelection: true,
      headerName: "",
      width: 50,
    },
    {
      headerName: "ID",
      valueGetter: (params) => params.data?.id,
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.value} />;
      },
      width: 200,
    },
    {
      headerName: "App Connection Name",
      valueGetter: (params) => params.data?.appConnectionConfig?.metadata?.name,
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.value} />;
      },
      width: 300,
    },
    {
      headerName: "Network Domain Connection",
      valueGetter: (params) => params.data?.NetworkDomainConnectionName,
      cellRenderer: (params: any) => {
        return (
          <Link to={RoutePaths.NETWORK_DOMAIN_CONNECTIONS}>
            <TextRowCell value={params.value} />
          </Link>
        );
      },
      width: 400,
    },
    {
      headerName: "Status",
      valueGetter: (params) => params.data?.status ?? Status.UNRECOGNIZED,
      cellRenderer: (params: any) => {
        const status: Status = params.value
        switch (status) {
          case Status.FAILED:
            return <StatusRowCell value={"inactive"} />;
          case Status.IN_PROGRESS:
            return <StatusRowCell value={"inprogress"} />;
          case Status.SUCCESS:
            return <StatusRowCell value={"active"} />;
          case Status.UNRECOGNIZED:
            return <StatusRowCell value={"inactive"} />;
        }
      },
      width: 150,
    },
    {
      valueGetter: (params) => params.data,
      cellRenderer: (params: { value: AppConnectionInformation | undefined }) => {
        const handleDownload = () => {
          setBottomDrawerVisible(true)
          setConnectionResources({
            config: params.value?.appConnectionConfig,
            from: params.value?.sourceMatched,
            to: params.value?.destinationMatched
          })
        };
        return <Button onClick={handleDownload}>View Matched Resources</Button>
      },
      width: 300,
    },
    {
      valueGetter: (params) => params.data,
      cellRenderer: (params: { value: AppConnectionInformation | undefined }) => {
        const handleDownload = () => {
          const appConnection = params.value?.appConnectionConfig
          if (appConnection) {
            const blob = new Blob([stringOfYAML(appConnectionInject(appConnection))], { type: "text/plain;charset=utf-8" });
            saveAs(blob, `${params.value?.id ?? "application-connection"}.yaml`);
          }
        };
        return <Button style={{ width: "100%", height: "100%" }}
          icon={<img alt={"download"} style={{ maxWidth: "100%", maxHeight: "100%", padding: "1px", }}
            src={download}></img>} onClick={handleDownload}></Button>;
      },
      width: 100,
    },
  ];

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Application Connections" />
      {/* align right */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Toolbar selectedAppConnections={selectedRows} />
      </div>
      <div className="ag-theme-material" style={{
        height: "500px",
        width: "100%",
      }}>
        <AgGridReact
          className={gridStyles.dataGrid}
          rowData={data}
          columnDefs={columnDefs}
          rowSelection={"multiple"}
          suppressRowClickSelection
          onRowSelected={handleRowSelection}
        />
      </div>
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        mask={false}
        placement="right"
        destroyOnClose
        title={"YAML Preview"}
        width="30%"
      >
        <AceEditor
          mode="yaml"
          theme="eclipse"
          name="YAML_PREVIEW"
          wrapEnabled
          setOptions={{ useWorker: false }}
          value={stringOfYAML(appConnectionInject(yamlSource))}
          className="border shadow-sm"
          style={{ width: "100%", height: "100%" }}
          showPrintMargin={false}
          readOnly
        />
      </Drawer>
      <BottomDrawer isDrawerVisible={bottomDrawerVisible} setIsDrawerVisible={setBottomDrawerVisible} destroyOnClose>
        <TableEnvironmentProvider>
          <AppConnectionResources {...connectionResources} />
        </TableEnvironmentProvider>
      </BottomDrawer>
    </DefaultLayout>
  );
};
