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

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { ColDef } from "ag-grid-community";

import { useNavigate } from "react-router-dom";

import { TextRowCell } from "@/components/data-grid";
import { Wrapper } from "@/components/views/wrapper";
import { serverStatus } from "@/common/constants";
import { AppConnectionPolicy, DeleteAppConnectionPolicyRequest } from "@/_proto/grpc-service/ts/app_connection";
import { useFetchAppConnectionPolicies } from "@/common/hooks";
import { reset, setApplicationConnection, } from "@/store/application-connection-slice/applicationConnectionSlice";
import { RoutePaths } from "@/common/enum";
import { ApplicationConnection } from "@/common/interface";
import { Button } from "antd";
import { appConnectionInject, stringOfYAML } from "@/components";
import { Toolbar } from "@/components/views/applications-connection-policies/_components/toolbar";
import trash from "@/assets/icons/trash.svg";
import edit from "@/assets/icons/edit.svg";
import upload from "@/assets/icons/upload.svg";
import download from "@/assets/icons/download.svg";
import styles from "./application-connection-policies.module.scss"
import { saveAs } from "file-saver";
import { createChannel, createClient } from "nice-grpc-web";
import { AppConnectionControllerDefinition } from "@/_proto/grpc-service/ts/app_connection_controller";
import { AgGridReact } from "ag-grid-react";
import gridStyles from "@/components/data-grid/data-grid.module.scss";
import { setPolicy } from "@/store/application-connection-deployer-slice/applicationConnectionDeployerSlice";
import { YAMLSideDrawer } from "@/components/common/yaml-side-drawer";
import { BACKEND_API_PREFIX } from "@/common/constants";

import DefaultLayout from '../../../layout/DefaultLayout';
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";


export const ApplicationConnectionPolicies = () => {
  const { data } = useSelector((state: RootState) => state.applicationConnectionPolicies);
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [selectedRows, setSelectedRows] = useState<AppConnectionPolicy[]>([]);
  const [yamlSource, setYamlSource] = useState<any>({})
  const { fetchAppConnectionPolicies } = useFetchAppConnectionPolicies()
  const appConnectionService = createClient(AppConnectionControllerDefinition, createChannel(BACKEND_API_PREFIX))
  const navigate = useNavigate();

  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    if (serverStatus === "stub") {
      console.log("fetch stub")
    } else {
      fetchAppConnectionPolicies();
    }
  }, []);

  const buttonStyle = {
    width: "100%",
    height: "60%"
  }

  const columnDefs: ColDef<AppConnectionPolicy>[] = [
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
      headerName: "App Connection Policy Name",
      valueGetter: (params) => params.data?.appConnection?.metadata?.name,
      cellRenderer: (params: any) => {
        return <TextRowCell value={params.value} />;
      },
      width: 300,
    },
    {
      headerName: "",
      valueGetter: (params) => params.data,
      cellRenderer: (params: { value: AppConnectionPolicy | undefined }) => {
        const handleEdit = () => {
          const appConnection = params.value?.appConnection
          if (appConnection) {
            dispatch(reset())
            dispatch(setApplicationConnection(appConnection as ApplicationConnection))
            navigate(RoutePaths.APPLICATION_CONNECTION_CREATOR)
          }
        };
        return <Button style={buttonStyle} icon={<img alt={"edit"} className={styles.imgbutton} src={edit}></img>}
          onClick={handleEdit} title="Edit"></Button>;
      },
      width: 80,
    }, {
      headerName: "",
      valueGetter: (params) => params.data,
      cellRenderer: (params: { value: AppConnectionPolicy | undefined }) => {
        const handleDeploy = () => {
          dispatch(setPolicy(params.value?.id))
          navigate(RoutePaths.APPLICATION_CONNECTION_ATTACHMENT)
        };
        return <Button style={buttonStyle} icon={<img alt={"deploy"} className={styles.imgbutton} src={upload}></img>}
          onClick={handleDeploy} title="Deploy"></Button>;
      },
      width: 80,
    },
    {
      headerName: "",
      valueGetter: (params) => params.data,
      cellRenderer: (params: { value: AppConnectionPolicy | undefined }) => {
        const handleDownload = () => {
          const appConnection = params.value?.appConnection
          if (appConnection) {
            const blob = new Blob([stringOfYAML(appConnectionInject(appConnection))], { type: "text/plain;charset=utf-8" });
            saveAs(blob, `${params.value?.id ?? "application-policy"}.yaml`);
          }
        };
        return <Button style={buttonStyle}
          icon={<img alt={"download"} className={styles.imgbutton} src={download}></img>}
          onClick={handleDownload} title="Download"></Button>;
      },
      width: 80,
    },
    {
      headerName: "",
      valueGetter: (params) => params.data,
      cellRenderer: (params: { value: AppConnectionPolicy | undefined }) => {
        const deletePolicy = () => {
          const id = params.value?.id
          if (id) {
            appConnectionService.deleteAppConnectionPolicy(DeleteAppConnectionPolicyRequest.create({ id })).then(
              fetchAppConnectionPolicies
            )
          } else {
            console.log(`couldn't delete ${id}`)
          }
        };
        return <Button style={buttonStyle} icon={<img alt={"delete"} className={styles.imgbutton} src={trash}></img>}
          onClick={deletePolicy} title="Delete"></Button>;
      },
      width: 80,
    },
  ];

  useEffect(() => {
    if (selectedRows.length == 1) {
      setYamlSource(selectedRows[0].appConnection)
      setDrawerOpen(true)
    } else {
      setDrawerOpen(false)
    }
  }, [selectedRows])

  const handleRowSelection = (params: any) => {
    setSelectedRows(params.api.getSelectedRows());
  };


  return (
    <DefaultLayout>
      <Breadcrumb pageName="Application Connection Policies" />
      <Toolbar selectedAppConnections={selectedRows} />
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
      <YAMLSideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}
        yamlSource={appConnectionInject(yamlSource)} width={"40%"} />
    </DefaultLayout>
  );
};
