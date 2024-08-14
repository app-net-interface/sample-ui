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

// NetworkDataPrivacyPolicyForm.tsx
import React, { useState } from 'react';
import "./Styles.css"
import DefaultLayout from '@/layout/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';

export const NetworkDataPrivacyPolicyCreator: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sourceIpObfuscation, setSourceIpObfuscation] = useState(false);
  const [destinationIpObfuscation, setDestinationIpObfuscation] = useState(false);
  const [maskSensitiveData, setMaskSensitiveData] = useState(false);
  const [roleBasedAccessControl, setRoleBasedAccessControl] = useState(false);
  const [collectOnlyNecessaryData, setCollectOnlyNecessaryData] = useState(false);
  const [trafficAnalysisProtection, setTrafficAnalysisProtection] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const networkDataPrivacyPolicy = {
      metadata: {
        name,
        description,
      },
      networkDataPrivacyPolicy: {
        ipObfuscation: {
          sourceIpObfuscation,
          destinationIpObfuscation,
        },
        dataMasking: {
          maskSensitiveData,
        },
        accessControl: {
          roleBasedAccessControl,
        },
        dataMinimization: {
          collectOnlyNecessaryData,
        },
        trafficAnalysisProtection,
      },
    };
    console.log(networkDataPrivacyPolicy);
    // TODO: Send networkDataPrivacyPolicy to the backend
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Network Data Privacy Policy Creator" />
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="form-group">
          <label>IP Address Randomization (IPv6)</label>
          <div className="checkbox-group">
            <div>
              <label>Source IP Address Randomization</label>

              <input type="checkbox" checked={sourceIpObfuscation} onChange={(e) => setSourceIpObfuscation(e.target.checked)} />

            </div>
            <div>
              <label>Destination IP Address Randomization</label>
              <input type="checkbox" checked={destinationIpObfuscation} onChange={(e) => setDestinationIpObfuscation(e.target.checked)} />
            </div>
            <div>
              <label>Group Address Randomization</label>
              <input type="checkbox" checked={destinationIpObfuscation} onChange={(e) => setDestinationIpObfuscation(e.target.checked)} />
            </div>

          </div>
        </div>
        <div className="form-group">
          <label>Data Masking</label>
          <div className="checkbox-group">
            <div>
              <label>Mask Sensitive Data</label>
              <input type="checkbox" checked={maskSensitiveData} onChange={(e) => setMaskSensitiveData(e.target.checked)} />
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>Access Control</label>
          <div className="checkbox-group">
            <div>
              <label>Role Based Access Control</label>
              <input type="checkbox" checked={roleBasedAccessControl} onChange={(e) => setRoleBasedAccessControl(e.target.checked)} />
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>Data Minimization</label>
          <div className="checkbox-group">
            <div>
              <label>Collect Only Necessary Data</label>
              <input type="checkbox" checked={collectOnlyNecessaryData} onChange={(e) => setCollectOnlyNecessaryData(e.target.checked)} />
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>Traffic Analysis Protection</label>
          <div className="checkbox-group">
            <div>
              <label>Traffic Analysis Protection</label>
              <input type="checkbox" checked={trafficAnalysisProtection} onChange={(e) => setTrafficAnalysisProtection(e.target.checked)} />
            </div>
          </div>
        </div>
        <button type="submit">Submit</button>
      </form>
    </DefaultLayout>
  );
};
