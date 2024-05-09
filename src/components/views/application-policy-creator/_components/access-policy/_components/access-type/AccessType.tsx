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

import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";

import { HorizontalContainer, Select } from "@/components";

import { accessTypeValues } from "@/common/constants";
//import { setAccessType } from "@/store/application-connection-slice/applicationConnectionSlice";
import { AppDispatch, RootState } from "@/store/store";

export const AccessType: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data } = useSelector((state: RootState) => state.applicationConnection);

  const setAccess = (kind: string) => {
    //dispatch(setAccessType(kind));
  };

  return (
    <section>
      <HorizontalContainer
        label="Access Type"
        render={
          <Select
            options={accessTypeValues}
            onChange={setAccess}
            //defaultValue={data.spec.appConnection.accessPolicy.accessType}
            allowClear={false}
          />
        }
        flexedItemPlacement="start"
      />
    </section>
  );
};
