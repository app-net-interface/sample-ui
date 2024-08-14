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

import React, { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useFetchAppConnections, useFetchNetworkDomainsConnections } from "@/common/hooks";
import { fetchSLAProfiles } from "@/store/sla-profiles-slice/thunk/slaProfilesThunk";
import { Button, Collapse, Steps, StepsProps } from "antd";
import {
  ApplicationPolicy,
  ObservabilityPolicy,
  SecurityPolicy
} from "@/components/views/application-policy-attachment/_components";
import {
  NetworkConfiguration
} from "@/components/views/application-policy-attachment/_components/network-configuration/NetworkConfiguration";
import { useNavigate } from "react-router-dom";
import { RoutePaths } from "@/common/enum";
import {
  ReviewApplicationConnectionDeployment
} from "@/components/views/application-policy-attachment/_components/review";
import {
  ApplicationConnectionBackground
} from "@/components/views/application-policy-attachment/_components/background";
import { createChannel, createClient } from "nice-grpc-web";
import { AppConnectionControllerDefinition } from "@/_proto/grpc-service/ts/app_connection_controller";
import {
  toApplicationConnection
} from "@/store/application-connection-deployer-slice/applicationConnectionDeployerSlice";
import { BACKEND_API_PREFIX } from "@/common/constants";
import DefaultLayout from '../../../layout/DefaultLayout';
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

// temporary error solution
import './error.css'

export const ApplicationPolicyAttachment: FC = () => {
  const {
    policy,
    networkDomainConnectionNames
  } = useSelector((state: RootState) => state.applicationConnectionDeployer);
  const navigate = useNavigate()
  const state = useSelector((state: RootState) => state.applicationConnectionDeployer);
  const appConnections = toApplicationConnection(state)
  const appConnectionClient = createClient((AppConnectionControllerDefinition), createChannel(BACKEND_API_PREFIX))
  const { fetchAppConnections } = useFetchAppConnections();
  const { fetchConnections } = useFetchNetworkDomainsConnections();

  const [current, setCurrent] = useState(0);
  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const submit = () => {
    Promise.all(appConnections.map(appConnection => appConnectionClient.connectApps(appConnection)))
      .then(() => {
        fetchAppConnections()
        navigate(RoutePaths.APPLICATION_CONNECTIONS)
      }
      ).catch(error => {
        console.error("Error connecting apps:", error);
      })
  }

  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(fetchSLAProfiles());
    fetchConnections()
  }, [])

  const steps: { title: string; description?: string, content?: JSX.Element; status?: StepsProps["status"] }[] = [
    {
      title: 'Workload Selection Policy',
      content: <ApplicationPolicy />,
      description: "Required",
      status: policy === undefined ? "error" : undefined
    },
    {
      title: 'Attach a Security Policy',
      content: <SecurityPolicy />,
      description: "Optional",
    },
    {
      title: 'Attach an Observability Policy',
      content: <ObservabilityPolicy />,
      description: "Optional",
    },
    {
      title: 'Attach a Transport',
      content: <NetworkConfiguration visible={current === 4} />,
      description: "Required",
      status: !networkDomainConnectionNames.length ? "error" : undefined
    },
    {
      title: 'Review and Submit',
      content: <ReviewApplicationConnectionDeployment />,
      description: "Required",
    },
  ]
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Securely Connect Your Application(s) Resources" />
      <div style={{ marginBottom: "10px" }}>
        <Collapse
          defaultActiveKey={1}
          items={[{
            key: 1,
            label: 'Overview',
            children: <ApplicationConnectionBackground />
          }]}
        />
      </div>
      <Steps current={current} status={steps[current].status}
        items={steps.map((item) => ({ key: item.title, title: item.title, description: item.description }))}
        direction={"horizontal"} />
      <div>{steps[current].content}</div>
      <div style={{ marginTop: 24 }}>
        {current < steps.length - 1 && (
          <Button type="primary" onClick={() => next()} disabled={steps[current]?.status === "error"}>
            Next
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button type="primary" onClick={submit}
            disabled={steps[current]?.status === "error"}>
            Submit
          </Button>
        )}
        {current > 0 && (
          <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
            Previous
          </Button>
        )}
      </div>
    </DefaultLayout>
  );
};
