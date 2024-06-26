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

import { FC, useState } from "react";
import { Drawer as AntDDrawer } from "antd";

import { Button } from "@/components";

import { ButtonVariants, RoutePaths } from "@/common/enum";
import { NavigationSubmenuProps } from "@/common/interface";

import styles from "./endpoint-submenu.module.scss";
import { ActionSubmenu, FlexColumn } from "../";

export const EndpointSubmenu: FC<NavigationSubmenuProps> = ({ linkOnClick }) => {
  const [endpointsMenu, setEndpointsMenu] = useState<boolean>(false);

  const showEndpointConnectionsMenu = () => {
    setEndpointsMenu(true);
  };

  const onEndpointConnectionsClose = () => {
    setEndpointsMenu(false);
  };

  const closeSubmenu = () => {
    setEndpointsMenu(false);
    linkOnClick();
  };

  const submenuTitle = <h1 className={styles.mainTitle}>User</h1>;

  return (
    <>
      <Button
        customClass={styles.button}
        onClick={showEndpointConnectionsMenu}
        variant={ButtonVariants.SECONDARY}
        text="Endpoint"
      />
      <AntDDrawer
        className={styles.mainBackground}
        title={submenuTitle}
        width={350}
        closable={false}
        onClose={onEndpointConnectionsClose}
        open={endpointsMenu}
        placement="left"
      >
        <FlexColumn>
          <ActionSubmenu link={"List"} title={"List"}
                         actions={[
                           { name: "List", destination: RoutePaths.ENDPOINT_LIST },
                         ]} linkOnClick={closeSubmenu}></ActionSubmenu>
          <ActionSubmenu link={"Connections"} title={"Connections"}
                         actions={[
                           { name: "List", destination: RoutePaths.ENDPOINT_CONNECTIONS_POLICIES },
                           { name: "Create", destination: RoutePaths.APPLICATION_CONNECTION_ATTACHMENT }
                         ]} linkOnClick={closeSubmenu}></ActionSubmenu>
          <ActionSubmenu link={"Connection Policies"} title={"Connection Policies"}
                         actions={[
                           { name: "List", destination: RoutePaths.ENDPOINT_CONNECTIONS_POLICIES },
                           { name: "Create", destination: RoutePaths.ENDPOINT_CONNECTIONS_POLICIES_CREATOR }
                         ]} linkOnClick={closeSubmenu}></ActionSubmenu>
        </FlexColumn>
      </AntDDrawer>
    </>
  );
};
