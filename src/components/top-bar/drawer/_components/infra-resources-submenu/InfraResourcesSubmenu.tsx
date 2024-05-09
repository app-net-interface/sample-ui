/**
 * Copyright (c) 2023 Cisco Systems, Inc. and its affiliates
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
import { Link } from "react-router-dom";
import { Drawer as AntDDrawer } from "antd";

import { Button } from "@/components";
import { FlexColumn } from "../flex-column";

import { RoutePaths, ButtonVariants } from "@/common/enum";
import { NavigationSubmenuProps } from "@/common/interface";

import styles from "./infra-resources-submenu.module.scss";

export const InfraResourcesSubmenu: FC<NavigationSubmenuProps> = ({ linkOnClick }) => {
  const [infraResources, setInfraResources] = useState<boolean>(false);

  const showInfraResources = () => {
    setInfraResources(true);
  };

  const onInfraResourcesClose = () => {
    setInfraResources(false);
  };

  const closeSubmenu = () => {
    setInfraResources(false);
    linkOnClick();
  };

  const submenuTitle = <h1 className={styles.mainTitle}>Resources</h1>;

  return (
    <>
      <Button
        customClass={styles.button}
        onClick={showInfraResources}
        variant={ButtonVariants.SECONDARY}
        text="Infrastructure Resources"
      />
      <AntDDrawer
        title={submenuTitle}
        className={styles.mainBackground}
        width={320}
        closable={false}
        onClose={onInfraResourcesClose}
        open={infraResources}
        placement="left"
      >
        <FlexColumn>
          <Link className={styles.link} onClick={closeSubmenu} to={RoutePaths.LIST_INFRA_RESOURCES}>
            List Infrastructure Resources
          </Link>
        </FlexColumn>
      </AntDDrawer>
    </>
  );
};
