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
import { useFormContext } from "react-hook-form";

import { Form, Select, Wrapper, Tooltip, FlexItems } from "@/components";

import { Tooltips } from "@/common/enum";
import { NetworkDomain } from "@/common/interface";

interface SourceObjectProps {
  networkDomains: NetworkDomain[];
}

export const SourceObject: FC<SourceObjectProps> = ({ networkDomains }) => {
  const { setValue, watch, getValues } = useFormContext();

  const destinationId = watch("destination.id");

  const sourceOptions = networkDomains?.map(({ id, name, provider, region }, index) => {
    return {
      label: `${name} ( ${provider} | ${region} | ${id} ) `,
      value: id,
      key: index + id,
      disabled: id === destinationId,
    };
  });

  const changeSelectedValue = (sourceId: string) => {
    const data = networkDomains?.find((networkDomain) => networkDomain.id === sourceId);
    const sourceObj = getValues("source");
    setValue("source", { ...sourceObj, ...data });
  };

  const sourceFields = [
    {
      name: "sourceName",
      label: "Source Network Domain",
      component: (
        <FlexItems>
          <Tooltip title={Tooltips.NETWORK_DOMAIN} />
          <Select onChange={changeSelectedValue} options={sourceOptions} />
        </FlexItems>
      )
    },
  ];

  return (
    <Form fields={sourceFields} />
  );
};
