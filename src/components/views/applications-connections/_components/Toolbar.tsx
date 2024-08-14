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

import React, { FC, useState } from "react";
import type { MenuProps } from "antd";

import { BottomDrawer, Button, Dropdown, Popconfirm } from "@/components";

import { ButtonVariants } from "@/common/enum";
import { serverStatus } from "@/common/constants";
import { useFetchAppConnections } from "@/common/hooks";

import refresh from "@/assets/icons/refresh.svg";
import { createChannel, createClient } from "nice-grpc-web";
import { AppConnectionControllerDefinition } from "@/_proto/grpc-service/ts/app_connection_controller";
import { AppConnectionInformation, AppDisconnectionRequest } from "@/_proto/grpc-service/ts/app_connection";
import {
  TableEnvironmentProvider
} from "@/components/application-connection-info/_components/dynamic-table/TableTypeContext";
import { AppConnectionData, AppConnectionResources } from "@/components/application-connection-info";
import { BACKEND_API_PREFIX } from "@/common/constants";

interface ToolbarProps {
  selectedAppConnections: AppConnectionInformation[];
}

export const Toolbar: FC<ToolbarProps> = ({ selectedAppConnections }) => {
  const appConnectionService = createClient(AppConnectionControllerDefinition, createChannel(BACKEND_API_PREFIX))
  const [connectionResources, setConnectionResources] = useState<AppConnectionData>({ config: undefined })
  const [bottomDrawerVisible, setBottomDrawerVisible] = useState(false);

  const { fetchAppConnections } = useFetchAppConnections();

  const handleConfirmDelete = (appConnections: any[]) => {
    if (serverStatus === "live") {
      const deleteRequest = AppDisconnectionRequest.create();
      const connectionIds = appConnections.map((connection: any) => connection.id);
      console.log(connectionIds);

      deleteRequest.connectionId = (connectionIds[0]);

      appConnectionService.disconnectApps(deleteRequest).then((response) => {
        // if (error) {
        //   console.log(error, "Static response");
        // }
      });

      // TODO: iterate over array of ids and fire disconnect requests per ID
      // for (const connectionId of connectionIds) {
      //   deleteRequest.setConnectionId(connectionId);
      //
      //   appConnectionService.delete(deleteRequest, {}, (response: any, error: any) => {
      //     if (error) {
      //       console.log(error, "Static response");
      //     }
      //   });
      // }
    }
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <Popconfirm
          disabled={selectedAppConnections.length <= 0}
          title={"Are you sure you want to delete selected connections?"}
          onConfirm={() => handleConfirmDelete(selectedAppConnections)}
        >
          <span>Delete Connections</span>
        </Popconfirm>
      ),
      disabled: selectedAppConnections.length <= 0,
    },
    {
      key: "2",
      label: <span>View Matched Resources</span>,
      disabled: selectedAppConnections.length != 1,
      onClick: () => {
        setBottomDrawerVisible(true)
        setConnectionResources({
          config: selectedAppConnections[0].appConnectionConfig,
          from: selectedAppConnections[0].sourceMatched,
          to: selectedAppConnections[0].destinationMatched
        })
      }
    }
  ];

  return (
    <>
      <section style={{ display: "flex", justifyContent: "flex-end", width: "70%", gap: "20px" }}>
        <Button onClick={() => fetchAppConnections()} variant={ButtonVariants.TERTIARY} text="Refresh" />
        <Dropdown menu={{ items }}>
          <span style={{
            padding: "8px 12px",
            border: "none",
            borderRadius: "5px",
            backgroundColor: "#1890ff",
            color: "white",
            cursor: "pointer",
            display: "inline-block",
            fontSize: "14px",
            fontWeight: "bold",
            margin: "5px",
            marginTop: "18px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            transition: "background-color 0.3s, box-shadow 0.3s",
            height: "35px",
            lineHeight: "19px", // Added lineHeight to center text vertically
          }}
            onMouseOver={({ currentTarget }) => {
              currentTarget.style.backgroundColor = "#0056b3";
              currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
            }}
            onMouseOut={({ currentTarget }) => {
              currentTarget.style.backgroundColor = "#007bff";
              currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
            }}
          >
            Actions
          </span>
        </Dropdown>
      </section>
      <BottomDrawer isDrawerVisible={bottomDrawerVisible} setIsDrawerVisible={setBottomDrawerVisible} destroyOnClose>
        <TableEnvironmentProvider>
          <AppConnectionResources {...connectionResources} />
        </TableEnvironmentProvider>
      </BottomDrawer>
    </>
  );
}
  ;
