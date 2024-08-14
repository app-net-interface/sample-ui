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

// NetworkMonitoringPolicyForm.tsx
import React, { useState } from 'react';
import { ConnectionMonitoringPolicy } from '@/common/interface';
import { fetchDataClient, openNotification } from "@/common/utils";
import { ApiEndpoints } from "@/common/enum";
import "./Styles.css"
import DefaultLayout from '../../../layout/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';


export const MonitoringPolicyCreator: React.FC = () => {
  const [name, setName] = useState('');
  const [frequency, setMonitorFrequency] = useState(0);
  const [metrics, setTrafficMetrics] = useState(['bandwidth', 'latency', 'loss', 'jitter']);
  const [detectAnomalies, setAnomalyDetection] = useState(true);
  const [baselineProfile, setBaselineProfile] = useState(0);
  const [anomalyThreshold, setAnomalyThreshold] = useState([
    { metric: 'bandwidth', increasePercentage: 0 },
    { metric: 'loss', increasePercentage: 0 },
    { metric: 'latency', increasePercentage: 0 },
    { metric: 'jitter', increasePercentage: 0 },

  ]);
  const [alertLevel, setAlertLevel] = useState('');
  const [alertMedium, setAlertMedium] = useState(['Email', 'SMS']);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmp: ConnectionMonitoringPolicy = {
      metadata: {
        name: name, // Start with an empty string, and update it with the user input
      },
      policy: {
        frequency: frequency,
        metrics: metrics,
        detectAnomalies: detectAnomalies,
        baselineProfile: baselineProfile,
        anomalyThreshold: {
          metrics: {
            bandwidth: {
              increasePercentage: anomalyThreshold.find(threshold => threshold.metric === 'bandwidth')?.increasePercentage || 0,
            },
            loss: {
              increasePercentage: anomalyThreshold.find(threshold => threshold.metric === 'loss')?.increasePercentage || 0,
            },
            latency: {
              increasePercentage: anomalyThreshold.find(threshold => threshold.metric === 'latency')?.increasePercentage || 0,
            },
            jitter: {
              increasePercentage: anomalyThreshold.find(threshold => threshold.metric === 'jitter')?.increasePercentage || 0,
            }
          }
        },
        alertConfig: {
          alertLevel: alertLevel,  // Start with an empty string or some default value
          alertMechanisms: alertMedium,  // Empty array to start
        }
      }
    };

    console.log("Monitoring policy ", cmp);
    try {
      const responseData = await fetchDataClient(ApiEndpoints.MONITORING_POLICIES, {
        method: "POST",
        data: cmp,
      });
      openNotification.success(`${responseData.name} monitoring policy created.`);
      return responseData;
    } catch (error: any) {
      const errorMessage = `${error.message}, ${error.request.response.split("\n")[0]}`;
      openNotification.error(errorMessage);
    }

  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Monitoring Policy Creator" />
      <div className="container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="frequency">Monitor Frequency (seconds)</label>
            <input type="number" id="frequency" value={frequency} onChange={(e) => setMonitorFrequency(e.target.valueAsNumber)} required />
          </div>
          <div className="form-group">
            <label>Traffic Metrics</label>
            <div className="w-10">
              {['bandwidth', 'latency', 'loss', 'jitter'].map((metric) => (
                <div key={metric} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id={metric} checked={metrics.includes(metric)} onChange={() => {
                    setTrafficMetrics((prevTrafficMetrics) => {
                      if (prevTrafficMetrics.includes(metric)) {
                        return prevTrafficMetrics.filter((m) => m !== metric);
                      } else {
                        return [...prevTrafficMetrics, metric];
                      }
                    });
                  }} />
                  <label htmlFor={metric}>{metric}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Anomaly Detection</label>
            <div className="checkbox-group">
              <div className="w-10" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input className="mt-3" type="checkbox" id="anomalyDetection" checked={detectAnomalies} onChange={(e) => setAnomalyDetection(e.target.checked)} />
                <label htmlFor="anomalyDetection">Enable</label>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="baselineProfile">Baseline Profile (Days)</label>
            <input type="number" id="baselineProfile" value={baselineProfile} onChange={(e) => setBaselineProfile(e.target.valueAsNumber)} required />
          </div>
          <div className="form-group">
            <label>Anomaly Threshold (increase %)</label>
            {anomalyThreshold.map((threshold, index) => (
              <div key={index} className="anomaly-threshold" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select value={threshold.metric} onChange={(e) => {
                  const newAnomalyThreshold = [...anomalyThreshold];
                  newAnomalyThreshold[index].metric = e.target.value;
                  setAnomalyThreshold(newAnomalyThreshold);
                }}>
                  <option value="bandwidth">Bandwidth Usage (%)</option>
                  <option value="loss">Packet Loss (%)</option>
                  <option value="latency">Latency (%)</option>
                  <option value="jitter">Jitter (%)</option>
                </select>
                <input type="number" value={threshold.increasePercentage} onChange={(e) => {
                  const newAnomalyThreshold = [...anomalyThreshold];
                  newAnomalyThreshold[index].increasePercentage = e.target.valueAsNumber;
                  setAnomalyThreshold(newAnomalyThreshold);
                }} required />
                <button type="button" onClick={() => {
                  setAnomalyThreshold((prevAnomalyThreshold) => prevAnomalyThreshold.filter((_, i) => i !== index));
                }}>-</button>
                {index === anomalyThreshold.length - 1 && <button type="button" onClick={() => {
                  setAnomalyThreshold((prevAnomalyThreshold) => [...prevAnomalyThreshold, { metric: 'bandwidth', increasePercentage: 50 }]);
                }}>+</button>}
              </div>
            ))}
          </div>
          <div className="form-group">
            <label htmlFor="alertLevel">Alert Level</label>
            <select id="alertLevel" value={alertLevel} onChange={(e) => setAlertLevel(e.target.value)} required>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
          <div className="form-group">
            <label>Alert Medium</label>
            <div className="checkbox-group">
              {['EMail', 'SMS'].map((medium) => (
                <div key={medium} className="mr-20" style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <input type="checkbox" className="ml-10" id={medium} checked={alertMedium.includes(medium)} onChange={() => {
                    setAlertMedium((prevAlertMedium) => {
                      if (prevAlertMedium.includes(medium)) {
                        return prevAlertMedium.filter((m) => m !== medium);
                      } else {
                        return [...prevAlertMedium, medium];
                      }
                    });
                  }} />
                  <label htmlFor={medium} style={{ marginLeft: '8px' }}>{medium}</label>
                </div>
              ))}
            </div>
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    </DefaultLayout>
  );
};
