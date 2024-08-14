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

// AccessControlPolicy.tsx
import React, { FC, useState } from 'react';
import './Styles.css';

import { fetchDataClient, openNotification } from "@/common/utils";
import { ApiEndpoints } from "@/common/enum";
import { Protocol } from "@/common/interface/accessControlPolicy.model"

import { AccessPolicyCreateRequest } from "@/_proto/grpc-service/ts/security_policy_service";
import { createChannel, createClient } from "nice-grpc-web";
import { SecurityPolicyServiceDefinition } from "@/_proto/grpc-service/ts/security_policy_service";
import { Security_AccessPolicy, Security_AccessPolicy_AccessProtocol, Security_PolicyMetadata } from "@/_proto/grpc-service/ts/security_policies";
import { QueriedNetworkDomain } from "@/store/grpc-network-domains-slice/grpcNetworkDomainsSlice";
import { BACKEND_API_PREFIX } from "@/common/constants";
import DefaultLayout from '../../../layout/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';


const securityPolicyService = createClient(SecurityPolicyServiceDefinition, createChannel(BACKEND_API_PREFIX));

const defaultPorts: { [key: string]: string } = {
  TCP: '80',
  UDP: '53',
  ICMP: '',
  HTTP: '80',
  HTTPS: '443',
  FTP: '21',
  SSH: '22',
  TELNET: '23',
  SMTP: '25',
  DNS: '53',
  SNMP: '161',
  SMB: '445',
  IMAP: '143',
  POP3: '110',
  LDAP: '389',
  RDP: '3389',
  SIP: '5060',
  IPSEC: '500',
};

export const AccessControlPolicyCreator: FC = () => {
  const [accessPolicy, setAccessPolicy] = useState<Security_AccessPolicy>({
    metadata: {
      name: '',
      description: '',
      labels: {},
      creationTimestamp: '',
      modificationTimestamp: '',
    },
    accessProtocols: [],
    accessType: 'deny',
    priority: 0,
  });

  const handleAddProtocol = () => {
    setAccessPolicy({
      ...accessPolicy,
      accessProtocols: [...accessPolicy.accessProtocols, { protocol: '', port: '' }],
    });
  };

  const handleRemoveProtocol = (index: number) => {
    const newAccessProtocols = [...accessPolicy.accessProtocols];
    newAccessProtocols.splice(index, 1);
    setAccessPolicy({
      ...accessPolicy,
      accessProtocols: newAccessProtocols,
    });
  };

  const handleProtocolChange = (index: number, field: string, value: string) => {
    const newAccessProtocols = [...accessPolicy.accessProtocols];
    if (field === 'protocol') {
      newAccessProtocols[index].protocol = value;
      newAccessProtocols[index].port = defaultPorts[value] || '';
    } else if (field === 'port') {
      newAccessProtocols[index].port = value;
    }
    setAccessPolicy({
      ...accessPolicy,
      accessProtocols: newAccessProtocols,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log(accessPolicy);
    securityPolicyService.createAccessPolicy(
      AccessPolicyCreateRequest.create({ accessPolicy: accessPolicy })).then((response) => {
        openNotification.success(`Access policy successfully created`);
      }).catch(error =>
        openNotification.error(`Failure: ${error}`))
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Access Control Policy Creator" />
      <div className="container">
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name</label>
            <input
              type="text"
              value={accessPolicy.metadata?.name || ''}
              onChange={(e) => setAccessPolicy({
                ...accessPolicy,
                metadata: {
                  ...accessPolicy.metadata,
                  name: e.target.value,
                  description: accessPolicy.metadata?.description || '',
                  labels: accessPolicy.metadata?.labels || {},
                  creationTimestamp: accessPolicy.metadata?.creationTimestamp || '',
                  modificationTimestamp: accessPolicy.metadata?.modificationTimestamp || '',
                },
              })}
            />
          </div>
          <div>
            <label>Description</label>
            <input
              type="text"
              value={accessPolicy.metadata?.description || ''}
              onChange={(e) => setAccessPolicy({
                ...accessPolicy,
                metadata: {
                  ...accessPolicy.metadata,
                  name: accessPolicy.metadata?.name || '',
                  description: e.target.value,
                  labels: accessPolicy.metadata?.labels || {}, // Ensure labels is an empty object
                  creationTimestamp: accessPolicy.metadata?.creationTimestamp || '',
                  modificationTimestamp: accessPolicy.metadata?.modificationTimestamp || '',
                },
              })}
            />
          </div>
          <div>
            <label>Access Protocols and Ports</label>
            {accessPolicy.accessProtocols.map((protocol, index) => (
              <div key={index} className="protocol-row">
                <input list="protocols" value={protocol.protocol} onChange={(e) => handleProtocolChange(index, 'protocol', e.target.value)} />
                <datalist id="protocols">
                  <option value="TCP" />
                  <option value="UDP" />
                  <option value="ICMP" />
                  <option value="HTTP" />
                  <option value="HTTPS" />
                  <option value="FTP" />
                  <option value="SSH" />
                  <option value="TELNET" />
                  <option value="SMTP" />
                  <option value="DNS" />
                  <option value="SNMP" />
                  <option value="SMB" />
                  <option value="IMAP" />
                  <option value="POP3" />
                  <option value="LDAP" />
                  <option value="RDP" />
                  <option value="SIP" />
                  <option value="IPSEC" />
                </datalist>
                <input
                  type="text"
                  value={protocol.port}
                  onChange={(e) => handleProtocolChange(index, 'port', e.target.value)}
                />
                {accessPolicy.accessProtocols.length > 1 && <button type="button" onClick={() => handleRemoveProtocol(index)}>-</button>}
              </div>
            ))}
            <button type="button" onClick={handleAddProtocol}>+</button>
          </div>
          <div>
            <label>Access Type</label>
            <select value={accessPolicy.accessType} onChange={(e) => setAccessPolicy({ ...accessPolicy, accessType: e.target.value })}>
              <option value="allow">Allow</option>
              <option value="deny">Deny</option>
              <option value="allow-with-logging">Allow with Logging</option>
              <option value="allow-with-inspection">Allow with Inspection</option>
            </select>
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    </DefaultLayout>
  );
};
