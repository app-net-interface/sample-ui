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
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Wrapper } from "@/components/views/wrapper";

import { ConnectionDetails, ConnectionSettings, DestinationObject, SlaObject, SourceObject } from "./_components";
import { Checkbox, ComboBox, HorizontalContainer, Tooltip } from "@/components";
import { ComboBoxVariants, Tooltips } from "@/common/enum";

import {
  ObservabilityPolicy,
  SecurityPolicy
} from "@/components/views/network-domains-connection-creator/_components";

import { AppDispatch, RootState } from "@/store/store";
import { fetchNetworkDomains } from "@/store/network-domains-slice/thunk/networkDomainsThunk";
import { ApiEndpoints, RoutePaths } from "@/common/enum";
import { serverStatus } from "@/common/constants";
import { fetchDataClient } from "@/common/utils";
import { useFetchNetworkDomains, useFetchNetworkDomainsConnections } from "@/common/hooks";
import { createChannel, createClient } from "nice-grpc-web";
import { ConnectionControllerDefinition } from "@/_proto/grpc-service/ts/service_controller";
import {
  ConnectionRequest, ConnectionMetadata, NetworkDomainConnectionConfig,
  NetworkDomainConnectionConfig_Destination, NetworkDomainConnectionConfig_Source,
  NetworkDomainConnectionConfig_Metadata, NetworkDomainConnectionConfig_Selector,
  NetworkDomainConnectionConfig_NetworkDomain, NetworkDomainConnectionConfig_MatchId
} from "@/_proto/grpc-service/ts/network_domain_connection";
import { Button as AButton, Collapse, Steps, StepsProps } from "antd";
import {
  NetworkDomainConnectionBackground
} from "@/components/views/network-domains-connection-creator/_components/background";
import { useNavigate } from "react-router-dom";
import { BACKEND_API_PREFIX } from "@/common/constants";
import DefaultLayout from '../../../layout/DefaultLayout';
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export const NetworkDomainsConnectionCreator: FC = () => {
  const { data } = useSelector((state: RootState) => state.networkDomains);
  const { grpcData } = useSelector((state: RootState) => state.grpcNetworkDomains);
  const methods = useForm();
  const { getValues, watch } = methods
  const { fetchAllNetworkDomains } = useFetchNetworkDomains();
  const { fetchConnections } = useFetchNetworkDomainsConnections()
  const connectionService = createClient(ConnectionControllerDefinition, createChannel(BACKEND_API_PREFIX))

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate()

  const source = watch("source")
  const destination = watch("destination")
  const name = watch("name")

  useEffect(() => {
    dispatch(fetchNetworkDomains());
    fetchAllNetworkDomains()
  }, []);

  const [current, setCurrent] = useState(0)

  const next = () => {
    setCurrent(current + 1);
  }
  const prev = () => {
    setCurrent(current - 1);
  }

  const onSubmit = async (data: any) => {
    if (serverStatus === "live") {
      const request = ConnectionRequest.create()
      const source = NetworkDomainConnectionConfig_Source.create()
      const destination = NetworkDomainConnectionConfig_Destination.create()
      const sourceMetadata = NetworkDomainConnectionConfig_Metadata.create()
      const destinationMetadata = NetworkDomainConnectionConfig_Metadata.create()
      const sourceDomain = NetworkDomainConnectionConfig_NetworkDomain.create()
      const sourceSelector = NetworkDomainConnectionConfig_Selector.create()
      const sourceMatchID = NetworkDomainConnectionConfig_MatchId.create()
      const destinationDomain = NetworkDomainConnectionConfig_NetworkDomain.create()
      const destinationSelector = NetworkDomainConnectionConfig_Selector.create()
      const destinationMatchID = NetworkDomainConnectionConfig_MatchId.create()
      const requestMetadata = ConnectionMetadata.create()
      const requestSpec = NetworkDomainConnectionConfig.create()

      requestMetadata.name = (data.name);
      request.metadata = requestMetadata

      sourceMetadata.name = (data.source.name);
      source.metadata = (sourceMetadata);
      sourceMatchID.id = (data.source.id);
      sourceSelector.matchId = (sourceMatchID);
      sourceDomain.selector = (sourceSelector);
      source.networkDomain = (sourceDomain);

      destinationMetadata.name = (data.destination.name);
      destination.metadata = (destinationMetadata);
      destinationMatchID.id = (data.destination.id);
      destinationSelector.matchId = (destinationMatchID);
      destinationDomain.selector = (destinationSelector);
      destination.networkDomain = (destinationDomain);
      //destination.defaultAccessControl = (data.destination.defaultAccessControl === true ? "allow" : "deny");

      requestSpec.destination = (destination);
      requestSpec.source = (source);
      request.spec = requestSpec

      const response = await connectionService.connect(request)
      console.log(response)
      fetchConnections()
      navigate(RoutePaths.NETWORK_DOMAIN_CONNECTIONS)
    } else if (serverStatus === "stub") {
      await fetchDataClient(ApiEndpoints.STUB_NETWORK_DOMAIN_CONNECTIONS, {
        method: "POST",
        data: data,
      });
    }
  }

  const steps: { title: string; description?: string, content?: JSX.Element; status?: StepsProps["status"] }[] = [
    {
      title: 'Select Source & Destination',
      content: (<>
        <SourceObject networkDomains={serverStatus === "live" ? grpcData : data} />
        <DestinationObject networkDomains={serverStatus === "live" ? grpcData : data} />
        <HorizontalContainer
          label="Allow All Traffic:"
          render={
            <>
              <div className="mb-1">
                <Tooltip title={Tooltips.ALLOW_ALL} />
              </div>
              <Checkbox name="destination.defaultAccessControl" />
            </>
          }
        />
      </>),
      description: "Required",
      status: source?.id === undefined || destination?.id === undefined ? "error" : undefined
    },
    //<ComboBox label="Connection Name" formName="name" variant={ComboBoxVariants.INPUT}/>
    //!name ||
    {
      title: 'Secure the connection',
      content: <SecurityPolicy />,
      description: "Optional",
    },
    {
      title: 'Observe the connection',
      content: <ObservabilityPolicy />,
      description: "Optional",
    },
    {
      title: 'Attach Network Transport',
      content: <SlaObject />,
      description: "Optional",
    },
    {
      title: 'Review and Submit',
      content:
        (<>
          <ConnectionDetails />

        </>),
      description: "Required", // <ConnectionSettings/> <ConnectionDetails/>
      //status: !name ? "error" : undefined
    },
  ];

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Network Domains Connection Creator" />
      <FormProvider {...methods}>
        <div style={{ marginBottom: "10px" }}>
          <Collapse
            defaultActiveKey={1}
            items={[{
              key: 1,
              label: 'Overview',
              children: <NetworkDomainConnectionBackground />
            }]}
          />
        </div>
        <Steps current={current} status={steps[current].status}
          items={steps.map((item) => ({ key: item.title, title: item.title, description: item.description }))}
          direction={"horizontal"} />
        <div>{steps[current].content}</div>
        <div style={{ marginTop: 24 }}>
          {current < steps.length - 1 && (
            <AButton type="primary" onClick={() => next()} disabled={steps[current]?.status === "error"}>
              Next
            </AButton>
          )}
          {current === steps.length - 1 && (
            <AButton type="primary" onClick={methods.handleSubmit(onSubmit)}
              disabled={steps[current]?.status === "error"}>
              Submit
            </AButton>
          )}
          {current > 0 && (
            <AButton style={{ margin: '0 8px' }} onClick={() => prev()}>
              Previous
            </AButton>
          )}
        </div>
      </FormProvider>
    </DefaultLayout>
  );
};
