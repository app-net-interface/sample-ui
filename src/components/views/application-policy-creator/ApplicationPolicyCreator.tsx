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
import styles from "./application-policy-creator.module.scss";
import YAML from "yaml";
import { SidebarWrapper } from "@/components/views/wrapper-with-sidebar";
import {
  FromTraffic,
  MainSettings,
  ToTraffic,
  YamlLivePreview
} from "@/components/views/application-policy-creator/_components";
import { DefaultInject } from "@/store/application-connection-slice/applicationConnectionSlice";
import DefaultLayout from "@/layout/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export const ApplicationPolicyCreator: FC = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Application Policy Creator" />
      <SidebarWrapper title={""} rightSidebar={<YamlLivePreview />}>
        <section>
          <MainSettings />
          <div className={styles.columnsContainer}>
            <FromTraffic />
            <ToTraffic />
          </div>
        </section>
      </SidebarWrapper>
    </DefaultLayout>
  );
};

//<AccessPolicy/> Access Policy

export const cleanAppConnection = (data: any) => {
  return {
    ...data,
    networkDomainConnection: { selector: { matchName: "" } }
  }
}

export const appConnectionInject = (appConnection: any) => {
  return {
    ...DefaultInject,
    spec: { appConnection }
  }
}

export const stringOfYAML = (data: any) => {
  function removeUndefinedFields(obj: any): any {
    if (Array.isArray(obj)) return obj
      .map((item: any) => removeUndefinedFields(item))
      .filter((item: any) => item !== undefined);
    if (typeof obj === 'object' && obj !== null) {
      const result: { [key: string]: any } = {};
      for (const key in obj) {
        const value = removeUndefinedFields(obj[key]);
        if (value !== undefined) {
          result[key] = value;
        }
      }
      return result;
    }
    return obj;
  }

  return YAML.stringify(removeUndefinedFields(data))
}