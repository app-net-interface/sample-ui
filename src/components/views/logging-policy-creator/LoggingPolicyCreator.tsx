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

// NetworkLoggingPolicyForm.tsx
import React, { useState } from 'react';
import "./Styles.css"
import DefaultLayout from '@/layout/DefaultLayout';

export const LoggingPolicyCreator: React.FC = () => {
  const [protocol, setProtocol] = useState('tcp');
  const [logLevel, setLogLevel] = useState('INFO');
  const [logFormat, setLogFormat] = useState('json');
  const [size, setSize] = useState('100');
  const [retentionPeriod, setRetentionPeriod] = useState('30');
  const [logLocation, setLogLocation] = useState('/var/log/network/connections/connId-<<conn_id>>.log');
  const [logFields, setLogFields] = useState(['timestamp', 'sourceIP', 'destinationIP', 'protocol', 'port', 'status']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const networkLoggingPolicy = {
      networkLoggingPolicy: {
        protocol,
        logLevel,
        logFormat,
        logRotation: {
          size,
          retentionPeriod,
        },
        logLocation,
        logFields,
      },
    };
    console.log(networkLoggingPolicy);
    // TODO: Send networkLoggingPolicy to the backend
  };

  return (
    <DefaultLayout>
      <div className="container">
        <h1>Traffic Logging Policy</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="protocol">Protocol Filter</label>
            <select id="protocol" value={protocol} onChange={(e) => setProtocol(e.target.value)} required>
              <option value="tcp">TCP</option>
              <option value="udp">UDP</option>
              <option value="icmp">ICMP</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="logLevel">Log Level</label>
            <select id="logLevel" value={logLevel} onChange={(e) => setLogLevel(e.target.value)} required>
              <option value="DEBUG">DEBUG</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="logFormat">Log Format</label>
            <select id="logFormat" value={logFormat} onChange={(e) => setLogFormat(e.target.value)} required>
              <option value="json">JSON</option>
              <option value="xml">XML</option>
              <option value="csv">CSV</option>
              <option value="plaintext">Plaintext</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="size">Log Rotation Size (MB)</label>
            <input type="text" id="size" value={size} onChange={(e) => setSize(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="retentionPeriod">Log Rotation Retention Period (Days)</label>
            <input type="text" id="retentionPeriod" value={retentionPeriod} onChange={(e) => setRetentionPeriod(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="logLocation">Log Location</label>
            <input type="text" id="logLocation" value={logLocation} onChange={(e) => setLogLocation(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Log Fields</label>
            <div>
              {['timestamp', 'sourceIP', 'destinationIP', 'protocol', 'port', 'status'].map((field) => (
                <div key={field} className="flex items-center gap-2">
                  <input style={{ width: "10px" }} type="checkbox" id={field} checked={logFields.includes(field)} onChange={() => {
                    setLogFields((prevLogFields) => {
                      if (prevLogFields.includes(field)) {
                        return prevLogFields.filter((f) => f !== field);
                      } else {
                        return [...prevLogFields, field];
                      }
                    });
                  }} />
                  <label htmlFor={field}>{field}</label>
                </div>
              ))}
            </div>
          </div>
          <button type="submit">Submit</button>
        </form>
      </div >
    </DefaultLayout >
  );
};
