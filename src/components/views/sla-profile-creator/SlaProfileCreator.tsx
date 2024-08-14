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
import React, { useState } from 'react';
import "./Styles.css"
import { fetchDataClient, openNotification } from "@/common/utils";
import { ApiEndpoints } from "@/common/enum";
import DefaultLayout from '@/layout/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';

export const SlaProfileCreator: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('business-critical');
  const [trafficType, setTrafficType] = useState('');
  const [priority, setPriority] = useState(0);
  const [bandwidth, setBandwidth] = useState(20);
  const [jitter, setJitter] = useState(5);
  const [latency, setLatency] = useState(60);
  const [loss, setLoss] = useState(0.5);
  const [enforcementRequest, setEnforcementRequest] = useState('hard');
  const [schedule, setSchedule] = useState([{ days: '', startTime: '', endTime: '' }]);

  const handleScheduleChange = (index: number, field: string, value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
  };

  const addSchedulePeriod = () => {
    setSchedule([...schedule, { days: '', startTime: '', endTime: '' }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const networkSLOPolicy = {
      metadata: {
        name,
        description,
        category,
        trafficType,
      },
      trafficSLO: {
        priority,
        QoSParams: {
          bandwidth,
          jitter,
          latency,
          loss,
        },
        enforcementRequest,
      },
      schedule,
    };
    console.log(networkSLOPolicy);
    // TODO: Send networkSLOPolicy to the backend
    try {
      const responseData = await fetchDataClient(ApiEndpoints.CUSTOM_SLA_PROFILES, {
        method: "POST",
        data: networkSLOPolicy,
      });
      openNotification.success(`${networkSLOPolicy.metadata.name} profile created.`);
      return responseData;
    } catch (error: any) {
      const errorMessage = `${error.message}, ${error.request.response.split("\n")[0]}`;
      openNotification.error(errorMessage);
    }
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="SLA Profile Creator" />
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="business-critical">Business Critical</option>
            <option value="mission-critical">Mission Critical</option>
            <option value="essential">Essential</option>
            <option value="strategic">Strategic</option>
            <option value="compliance">Compliance</option>
            <option value="customer-facing">Customer-Facing</option>
            <option value="operational">Operational</option>
            <option value="support">Support</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="trafficType">Traffic Type</label>
          <input list="trafficTypes" id="trafficType" value={trafficType} onChange={(e) => setTrafficType(e.target.value)} required />
          <datalist id="trafficTypes">
            <option value="API Services" />
            <option value="Artificial Intelligence (AI) Applications" />
            <option value="Augmented Reality (AR)" />
            <option value="Backup and Recovery Systems" />
            <option value="Big Data Processing" />
            <option value="Blockchain Transactions" />
            <option value="Business Intelligence Tools" />
            <option value="Business Process Management (BPM)" />
            <option value="Collaboration Tools" />
            <option value="Content Delivery Networks (CDN)" />
            <option value="Content Management Systems (CMS)" />
            <option value="CRM Software" />
            <option value="Customer Relationship Management (CRM)" />
            <option value="Database Systems" />
            <option value="Document Management Systems" />
            <option value="Email Servers" />
            <option value="Engineering" />
            <option value="Enterprise Asset Management (EAM)" />
            <option value="Enterprise Resource Planning (ERP)" />
            <option value="ERP Systems" />
            <option value="File Sharing and Storage" />
            <option value="Financial Services" />
            <option value="Gaming" />
            <option value="Generic" />
            <option value="Human Resources Management (HRM)" />
            <option value="Identity and Access Management" />
            <option value="Intranet and Internal Web Applications" />
            <option value="Internet of Things (IoT) Devices" />
            <option value="Learning Management Systems (LMS)" />
            <option value="Machine Learning (ML) Training" />
            <option value="Messaging Services" />
            <option value="Mixed Reality (MR)" />
            <option value="Network Management and Monitoring" />
            <option value="Product Lifecycle Management (PLM)" />
            <option value="Project Management" />
            <option value="Real-time Analytics" />
            <option value="Security Services" />
            <option value="Service Mesh" />
            <option value="Software Development and Version Control" />
            <option value="Streaming Services" />
            <option value="Supply Chain Management (SCM)" />
            <option value="Virtual Meeting Platforms" />
            <option value="Virtual Private Network (VPN)" />
            <option value="Virtual Reality (VR)" />
            <option value="Video Streaming Services" />
            <option value="VoIP Systems" />
          </datalist>
        </div>
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <input type="number" id="priority" value={priority} onChange={(e) => setPriority(Number(e.target.value))} required min="0" max="10" />
        </div>
        <div className="form-group">
          <label>Network Parameters</label>
          <div className="network-parameters-group">
            <div>
              <label htmlFor="bandwidth">Bandwidth (Mbps)</label>
              <input type="number" id="bandwidth" value={bandwidth} onChange={(e) => setBandwidth(Number(e.target.value))} required />
            </div>
            <div>
              <label htmlFor="jitter">Jitter (ms)</label>
              <input type="number" id="jitter" value={jitter} onChange={(e) => setJitter(Number(e.target.value))} required />
            </div>
            <div>
              <label htmlFor="latency">Latency (ms)</label>
              <input type="number" id="latency" value={latency} onChange={(e) => setLatency(Number(e.target.value))} required />
            </div>
            <div>
              <label htmlFor="loss">Loss (%)</label>
              <input type="number" id="loss" value={loss} onChange={(e) => setLoss(Number(e.target.value))} required step="0.1" />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Schedule</label>
          {schedule.map((period, index) => (
            <div key={index} className="schedule-period">
              <div>
                <label htmlFor={`days-${index}`}>Days</label>
                <input
                  type="text"
                  id={`days-${index}`}
                  value={period.days}
                  onChange={(e) => handleScheduleChange(index, 'days', e.target.value)}
                  placeholder="e.g., Monday,Wednesday,Friday"
                  required
                />
              </div>
              <div>
                <label htmlFor={`startTime-${index}`}>Start Time</label>
                <input
                  type="time"
                  id={`startTime-${index}`}
                  value={period.startTime}
                  onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor={`endTime-${index}`}>End Time</label>
                <input
                  type="time"
                  id={`endTime-${index}`}
                  value={period.endTime}
                  onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                  required
                />
              </div>
            </div>
          ))}
        </div>
        <div className="form-group">
          <label htmlFor="enforcementRequest">Enforcement Request</label>
          <select id="enforcementRequest" value={enforcementRequest} onChange={(e) => setEnforcementRequest(e.target.value)} required>
            <option value="hard">Hard</option>
            <option value="soft">Soft</option>
          </select>
        </div>
        <button type="submit">Submit</button>
      </form>
    </DefaultLayout>
  );
};

export default SlaProfileCreator;
