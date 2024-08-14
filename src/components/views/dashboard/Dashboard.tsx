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

import React, { useEffect, useState } from 'react';
import { Button, ButtonGroup, Card, CardContent, Typography } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import './Dashboard.css';
import { calculateTotal, ResourceCount, Source } from "@/store/summary-slice/summarySlice";
import { useFetchSummary } from "@/common/hooks/useFetchSummary";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";

ChartJS.register(ArcElement, Tooltip, Legend);


const resourceCategories:
  {
    id: number; name: string; resources: ResourceCount[]
  }[] = [
    { id: 1, name: "Cloud Provider Accounts", resources: ["Accounts", "UserGroups", "Users", "IdentityProviders"] },
    { id: 2, name: "Cloud Resources", resources: ["VPC", "VM", "Subnets", "RouteTables", "ACL", "SecurityGroups", "NATGateways", "InternetGateways", "CloudRouters", "VPCEndpoints", "PublicIPAddresses"] },
    { id: 3, name: "Kubernetes Resources", resources: ["Clusters", "Services", "Pods", "Namespaces"] },
    { id: 4, name: "Enterprise Resources [ DC | Campus | Edge | User ] ", resources: ["SGT", "VRF", "VLAN"] },
  ];

export const Dashboard: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<Source>('All Providers');
  // OLD UI: blank strings for temporary error handling
  const { fetchSummary } = useFetchSummary('', '')
  const { count, status } = useSelector((state: RootState) => state.summary);

  useEffect(() => fetchSummary(), [])

  const handleSelect = (provider: Source) => {
    fetchSummary()
    setSelectedProvider(provider);
  };

  const statusData = status[selectedProvider]
  // VM : Pie chart data
  const vmPieChartData = {
    labels: ['Running', 'Stopped', 'Terminated'],
    datasets: [{
      data: [statusData.vm.running, statusData.vm.stopped, statusData.vm.terminated],
      backgroundColor: ['#36A2EB', '#FF6384', '#3F6386'],
    }],
  };

  // Pod: Pie chart data
  const podPieChartData = {
    labels: ['Running', 'Pending', 'CrashLoopBackOff'],
    datasets: [{
      data: [statusData.pod.running, statusData.pod.pending, statusData.pod.crash],
      backgroundColor: ['#36A2EB', '#FF6384', '#3F6386'],
    }],
  };

  return (
    <div className="dashboard">
      <div className="row-container">
        <div className="provider-selection">
          <ButtonGroup variant="contained" aria-label="contained button group">
            <Button onClick={() => handleSelect('AWS')}>AWS</Button>
            <Button onClick={() => handleSelect('GCP')}>GCP</Button>
            <Button onClick={() => handleSelect('Azure')}>Azure</Button>
            <Button onClick={() => handleSelect('Enterprise')}>Enterprise</Button>
            <Button onClick={() => handleSelect('All Providers')}>All Providers</Button>
          </ButtonGroup>
        </div>
        <div className="resource-section">
          <div className="resource-category-section">
            {/* ---- */}
            {resourceCategories.map(({ id, name, resources }) => (
              <Card key={id} className="resource-category-card">
                <div className="resource-category">
                  <Typography variant="h4">{name}</Typography>
                  <div className="resource-counts">
                    {resources.map((resource) => (
                      <div key={resource} className="resource-card">
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            {resource}
                          </Typography>
                          <Typography variant="h5" component="div">
                            {count[selectedProvider][resource]}
                          </Typography>
                        </CardContent>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
            {/* ---- */}
          </div>
        </div>
      </div>
      <div className="chart-section">
        <Typography variant="h4">VM States</Typography>
        <Pie data={vmPieChartData} />
        <Typography variant="h4">Pod States</Typography>
        <Pie data={podPieChartData} />
      </div>
    </div>
  );
};
