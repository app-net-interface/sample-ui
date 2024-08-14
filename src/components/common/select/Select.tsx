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
import { Select as AntDSelect, SelectProps as AntDSelectProps } from "antd";

import styles from "./select.module.scss";

type SelectProps = Pick<
  AntDSelectProps,
  "options" | "placeholder" | "defaultValue" | "allowClear" | "value" | "disabled"
> & {
  onChange: any;
  expand?: boolean
};

export const Select: FC<SelectProps> = ({
  options,
  value,
  placeholder,
  onChange,
  defaultValue,
  allowClear = true,
  disabled,
  expand,
}) => {
  return (
    <AntDSelect
      className={styles.antSelect}
      options={options}
      placeholder={placeholder}
      onChange={onChange}
      filterOption={(input, option) => (option?.label as string).toLowerCase().includes(input.toLowerCase())}
      allowClear={allowClear}
      defaultValue={defaultValue}
      value={value}
      disabled={disabled}
      showSearch
      popupMatchSelectWidth={false}
    />
  );
};
