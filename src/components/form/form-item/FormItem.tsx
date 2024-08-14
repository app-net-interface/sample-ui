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

import { Form as AntDForm, FormItemProps as AntDFormItemProps } from "antd";

import styles from "./form-item.module.scss";

interface FormItemProps extends AntDFormItemProps {
  order?: number;
}

export const FormItem: FC<FormItemProps> = ({ children, label, name, rules, order }) => {
  return (
    <AntDForm.Item
      label={label}
      name={name}
      rules={rules}
      className="w-full rounded-xl"
      style={{ order: order }}>
      {children}
    </AntDForm.Item>
  );
};
