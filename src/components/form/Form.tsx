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

import { FC, ReactNode } from "react";
import { Form as AntDForm, FormProps as AntDProps } from "antd";

import { FormItem } from "./form-item";

import styles from "./form.module.scss";

interface RulesProps {
  required: boolean;
  message: string;
}

interface FieldProps {
  name: string;
  label: string;
  component: ReactNode;
  rules?: RulesProps[];
  order?: number | undefined;
}

interface FormProps extends AntDProps {
  fields: FieldProps[];
  fieldsArray?: any[];
  formDataDescription?: ReactNode;
  onFinish?: () => void;
}

export const Form: FC<FormProps> = ({ fields = [], fieldsArray = [], formDataDescription }) => {
  const formFields = fields.map((field, index) => (
    <FormItem  {...field} key={index}>
      {field.component}
    </FormItem>
  ));

  const arrayFields = fieldsArray.map((item) => item);

  return (
    <AntDForm className={styles.form} onFinish={(value) => console.log(value)}>
      {formFields}
      {arrayFields}
      {formDataDescription}
    </AntDForm>
  );
};
