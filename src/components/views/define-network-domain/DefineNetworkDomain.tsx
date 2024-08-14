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

import React, { FC } from "react";
import { useForm } from "react-hook-form";

import { Button, Form, Input, Select, AutoComplete } from "@/components";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { fetchDataClient, openNotification } from "@/common/utils";
import { networkDomainTypes, providers, staticNetworkDomainIds } from "@/common/constants";
import { ButtonVariants } from "@/common/enum";
import { Card } from 'antd';
import DefaultLayout from "@/layout/DefaultLayout";

export const DefineNetworkDomain: FC = () => {
  const methods = useForm();

  const setDomainType = (domainType: string) => {
    methods.setValue("type", domainType);
  };

  const setNetworkDomainId = (networkId: string) => {
    methods.setValue("networkId", networkId);
  };

  const setProvider = (provider: string) => {
    methods.setValue("provider", provider);
  };

  const onSubmit = async (data: any) => {
    try {
      const responseData = await fetchDataClient("network_domains", {
        method: "POST",
        data: data,
      });
      openNotification.success(`${responseData.metadata.name} domain created.`);
      return responseData;
    } catch (error: any) {
      const errorMessage = `${error.message}, ${error.request.response.split("\n")[0]}`;
      openNotification.error(errorMessage);
    }
  };

  const domainType = methods.watch("type");

  const defineNetworkDomainFields = [
    {
      name: "name",
      label: "Name",
      component: <Input name="metadata.name" register={methods.register} />,
      rules: [
        {
          required: true,
          message: "Please provide domain name",
        },
      ],
    },
    {
      name: "type",
      label: "Type",
      component: <Select options={networkDomainTypes} onChange={setDomainType} />,
      rules: [
        {
          required: true,
          message: "Please select domain type.",
        },
      ],
    },
    {
      name: "provider",
      label: "Provider",
      component: <Select options={providers} onChange={setProvider} />,
      rules: [
        {
          required: true,
          message: "Please select provider.",
        },
      ],
    },
    {
      name: "networkDomainId",
      label: "Network Domain ID",
      component: <AutoComplete options={staticNetworkDomainIds} onChange={setNetworkDomainId} />,
      rules: [
        {
          required: true,
          message: "Please provide input.",
        },
      ],
    },
    {
      name: "site_id",
      label: "Site ID",
      component: <Input disabled={domainType !== "vrf"} name="site_id" register={methods.register} />,
      rules: [
        {
          required: false,
          message: "Please provide site id.",
        },
      ],
    },
  ];

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Define Network Domain" />
      <Card
        bordered={false}
        style={{ width: '100%' }}
      >
        <Form fields={defineNetworkDomainFields} />
        <Button onClick={methods.handleSubmit(onSubmit)} text="Submit" variant={ButtonVariants.PRIMARY} />
      </Card>
    </DefaultLayout>
  );
};
