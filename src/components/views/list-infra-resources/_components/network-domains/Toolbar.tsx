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

import { FC } from "react";
import type { MenuProps } from "antd";

import { Dropdown, Popconfirm } from "@/components";

import { VPC } from "@/_proto/grpc-service/ts/cloud_request";



interface ToolbarProps {
    selectedVpc: VPC;
}

export const Toolbar: FC<ToolbarProps> = ({ selectedVpc }) => {
    
    const handleIsolation = (_vpc: any) => {
        console.log("Isolation of selected VPCs = ",_vpc)
    };

    const items: MenuProps["items"] = [
      {
        key: "1",
        label: (
          <Popconfirm
            disabled={!selectedVpc}
            title={[<span key="1">Confirm Create Flow Log for VPC </span>, <span key="2">{selectedVpc.ID}</span>]}
            onConfirm={() => handleIsolation(selectedVpc)}
          >
            <span>Create Flow Log</span>

          </Popconfirm>
        ),
        disabled: !selectedVpc,
      },
      {
        key: "2",
        label: (
          <Popconfirm
            disabled={!selectedVpc}
            title={[<span key="1">Confirm Quarantine VPC - </span>, <span key="2">{selectedVpc.ID}</span>]}
            onConfirm={() => handleIsolation(selectedVpc)}
          >
            <span>Isolate / Quarantine VPC</span>

          </Popconfirm>
        ),
        disabled: !selectedVpc,
      },
      {
        key: "3",
        label: (
          <Popconfirm
            disabled={!selectedVpc}
            title={[<span key="1">Confirm disabling of east-west traffic - </span>, <span key="2">{selectedVpc.ID}</span>]}
            onConfirm={() => handleIsolation(selectedVpc)}
          >
            <span>Disable east-west communication ? </span>

          </Popconfirm>
        ),
        disabled: !selectedVpc,
      },
      {
        key: "4",
        label: (
          <Popconfirm
            disabled={!selectedVpc}
            title={[<span key="1">Confirm disabling internet reachability - </span>, <span key="2">{selectedVpc.ID}</span>]}
            onConfirm={() => handleIsolation(selectedVpc)}
          >
            <span>Disable access from and to internet (north-south) ? </span>

          </Popconfirm>
        ),
        disabled: !selectedVpc,
      }
    ];

    return (
      <>
        <section style={{ display: "flex", justifyContent: "flex-end", width:"100%", gap: "20px" }}>
          <Dropdown menu={{ items }}>
            <span style={{ padding: "2px 10px", border: "2px solid grey", background:"" }}>Actions</span>
          </Dropdown>
        </section>
      </>
    );
  };

  //        /* {  <Button onClick={() => fetchNetworkDomainConnection()} variant={ButtonVariants.TERTIARY} iconSrc={refresh}/> } */



