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

import { createChannel, createClient } from "nice-grpc-web";
import { NetworkDomainConnectionConfig, ConnectionInformation } from "@/_proto/grpc-service/ts/network_domain_connection";
import { ConnectionControllerDefinition } from "@/_proto/grpc-service/ts/service_controller";


import { DisconnectRequest } from "@/_proto/grpc-service/ts/network_domain_connection";
import {
  TableEnvironmentProvider
} from "@/components/application-connection-info/_components/dynamic-table/TableTypeContext";
import { AppConnectionResources } from "@/components/application-connection-info";
import { BACKEND_API_PREFIX } from "@/common/constants";

interface ToolbarProps {
  selectedConnections: ConnectionInformation[];
}

export const Toolbar: FC<ToolbarProps> = ({ selectedConnections }) => {
  console.log("Number of rows selected = ", selectedConnections.length)
  const connectionService = createClient(ConnectionControllerDefinition, createChannel(BACKEND_API_PREFIX))
  //const [connectionResources, setConnectionResources] = useState<ConnectionData>({ config: undefined })
  //const [bottomDrawerVisible, setBottomDrawerVisible] = useState(false);

  //const { fetchNetworkDomainConnection } = useFetchNetworkDomainsConnections();

  const handleConfirmDelete = (connections: any[]) => {
    const deleteRequest = DisconnectRequest.create();
    const connectionIds = connections.map((connection: any) => connection.id);
    console.log(connectionIds);

    deleteRequest.connectionId = (connectionIds[0]);

    connectionService.disconnect(deleteRequest).then((response) => {

      console.log("Response Status =", response.status)
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
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <Popconfirm
          disabled={selectedConnections.length <= 0}
          title={"Are you sure you want to delete selected connections?"}
          onConfirm={() => handleConfirmDelete(selectedConnections)}
        >
          <span>Delete Connections</span>
        </Popconfirm>
      ),
      disabled: selectedConnections.length <= 0,
    }
  ];

  return (
    <>
      <section style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <Dropdown menu={{ items }}>
          <span style={{ padding: "3px 5px", border: "2px solid grey", marginBottom: "10px" }}>Actions</span>
        </Dropdown>
      </section>
    </>
  );
};

//        /* {  <Button onClick={() => fetchNetworkDomainConnection()} variant={ButtonVariants.TERTIARY} iconSrc={refresh}/> } */



