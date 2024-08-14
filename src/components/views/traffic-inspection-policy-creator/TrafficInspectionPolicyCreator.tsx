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

// TrafficInspectionPolicyForm.tsx
import React, { useState } from 'react';
import './Styles.css';
import DefaultLayout from '@/layout/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';

export const TrafficInspectionPolicyCreator: React.FC = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [deepPacketInspection, setDeepPacketInspection] = useState(true);
    const [encryptionInspection, setEncryptionInspection] = useState(true);
    const [trafficTypes, setTrafficTypes] = useState(['']);
    const [internalThreatDetection, setInternalThreatDetection] = useState({ lateralMovement: false, insiderAttacks: false });
    const [allowedApplications, setAllowedApplications] = useState(['']);
    const [fileAndPayloadAnalysis, setFileAndPayloadAnalysis] = useState(false);
    const [threatDetection, setThreatDetection] = useState({ viruses: false, malware: false, ransomware: false });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const policy = {
            metadata: {
                name,
                description,
            },
            trafficInspectionPolicy: {
                deepPacketInspection,
                trafficTypeInspection: trafficTypes,
                internalThreatDetection,
                applicationWhitelisting: {
                    allowedApplications,
                },
                fileAndPayloadAnalysis,
                threatDetection,
                encryptionInspection,
            },
        };
        console.log(policy);
        // TODO: Send the policy to the backend
    };

    const handleAddTrafficType = () => {
        setTrafficTypes([...trafficTypes, '']);
    };

    const handleRemoveTrafficType = (index: number) => {
        const newTrafficTypes = trafficTypes.filter((_, i) => i !== index);
        setTrafficTypes(newTrafficTypes);
    };

    const handleTrafficTypeChange = (index: number, value: string) => {
        const newTrafficTypes = [...trafficTypes];
        newTrafficTypes[index] = value;
        setTrafficTypes(newTrafficTypes);
    };

    const handleAddApplication = () => {
        setAllowedApplications([...allowedApplications, '']);
    };

    const handleRemoveApplication = (index: number) => {
        const newAllowedApplications = allowedApplications.filter((_, i) => i !== index);
        setAllowedApplications(newAllowedApplications);
    };

    const handleApplicationChange = (index: number, value: string) => {
        const newAllowedApplications = [...allowedApplications];
        newAllowedApplications[index] = value;
        setAllowedApplications(newAllowedApplications);
    };

    // TrafficInspectionPolicyForm.tsx
    // ... rest of the code

    return (
        <DefaultLayout>
            <h1>Traffic Inspection Policy</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Inspection Settings</label>
                    <div className="checkbox-group">
                        <label>
                            Deep Packet Inspection
                        </label>
                        <input type="checkbox" checked={deepPacketInspection} onChange={(e) => setDeepPacketInspection(e.target.checked)} />

                        <label style={{ opacity: deepPacketInspection ? 1 : 0.5, pointerEvents: deepPacketInspection ? 'auto' : 'none' }}>
                            Encryption Inspection
                        </label>
                        <input type="checkbox" checked={encryptionInspection} onChange={(e) => setEncryptionInspection(e.target.checked)} disabled={!deepPacketInspection} />

                    </div>
                </div>
                <div className="form-group" style={{ opacity: deepPacketInspection ? 1 : 0.5, pointerEvents: deepPacketInspection ? 'auto' : 'none' }}>                    <label>Traffic Type Inspection</label>
                    {trafficTypes.map((trafficType, index) => (
                        <div key={index} className="input-row">
                            <input list="traffic-types" value={trafficType} onChange={(e) => handleTrafficTypeChange(index, e.target.value)} />
                            <datalist id="traffic-types">
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
                            {trafficTypes.length > 1 && <button type="button" onClick={() => handleRemoveTrafficType(index)}>-</button>}
                        </div>
                    ))}
                    <button type="button" onClick={handleAddTrafficType}>+</button>
                </div>
                <div className="form-group" style={{ opacity: deepPacketInspection ? 1 : 0.5, pointerEvents: deepPacketInspection ? 'auto' : 'none' }}>                    <label>Allowed Applications</label>
                    {allowedApplications.map((application, index) => (
                        <div key={index} className="input-row">
                            <input list="applications" value={application} onChange={(e) => handleApplicationChange(index, e.target.value)} />
                            <datalist id="applications">
                                <option value="web-browsing" />
                                <option value="ssl" />
                                <option value="dns" />
                                <option value="ping" />
                                <option value="smtp" />
                                <option value="pop3" />
                                <option value="imap" />
                                <option value="http" />
                                <option value="https" />
                                <option value="ftp" />
                                <option value="ssh" />
                                <option value="telnet" />
                                <option value="snmp" />
                                <option value="ldap" />
                                <option value="rdp" />
                                <option value="sip" />
                                <option value="h323" />
                                <option value="mysql" />
                                <option value="mssql" />
                                <option value="oracle" />
                                <option value="postgresql" />
                                <option value="mongodb" />
                                <option value="cassandra" />
                                <option value="redis" />
                                <option value="elasticsearch" />
                                <option value="kafka" />
                                <option value="rabbitmq" />
                                <option value="zookeeper" />
                                <option value="memcached" />
                                <option value="nginx" />
                                <option value="apache" />
                                <option value="iis" />
                                <option value="tomcat" />
                                <option value="nodejs" />
                                <option value="php" />
                                <option value="python" />
                                <option value="java" />
                                <option value="ruby" />
                                <option value="perl" />
                                <option value="go" />
                                <option value="sap" />
                                <option value="salesforce" />
                                <option value="microsoft-365" />
                                <option value="google-cloud" />
                                <option value="amazon-web-services" />
                                <option value="azure" />
                                <option value="docker" />
                                <option value="kubernetes" />
                                <option value="openstack" />
                                <option value="vmware" />
                                <option value="citrix" />
                                <option value="ansible" />
                                <option value="puppet" />
                                <option value="chef" />
                                <option value="terraform" />
                                <option value="jenkins" />
                                <option value="git" />
                                <option value="svn" />
                                <option value="jira" />
                                <option value="confluence" />
                                <option value="slack" />
                                <option value="microsoft-teams" />
                                <option value="zoom" />
                                <option value="cisco-webex" />
                                <option value="gotomeeting" />
                                <option value="trello" />
                                <option value="asana" />
                            </datalist>
                            {allowedApplications.length > 1 && <button type="button" onClick={() => handleRemoveApplication(index)}>-</button>}
                        </div>
                    ))}
                    <button type="button" onClick={handleAddApplication}>+</button>
                </div>
                <div className="form-group" style={{ opacity: deepPacketInspection ? 1 : 0.5, pointerEvents: deepPacketInspection ? 'auto' : 'none' }}>                    <label>File and Payload Analysis</label>
                    <input type="checkbox" checked={fileAndPayloadAnalysis} onChange={(e) => setFileAndPayloadAnalysis(e.target.checked)} />
                </div>
                <div className="form-group" style={{ opacity: deepPacketInspection ? 1 : 0.5, pointerEvents: deepPacketInspection ? 'auto' : 'none' }}>                    <label>Internal Threat Detection</label>
                    <div className="checkbox-group">
                        <label>
                            Lateral Movement
                        </label>
                        <input type="checkbox" checked={internalThreatDetection.lateralMovement} onChange={(e) => setInternalThreatDetection({ ...internalThreatDetection, lateralMovement: e.target.checked })} />

                        <label>
                            Insider Attacks
                        </label>
                        <input type="checkbox" checked={internalThreatDetection.insiderAttacks} onChange={(e) => setInternalThreatDetection({ ...internalThreatDetection, insiderAttacks: e.target.checked })} />
                    </div>
                </div>
                <button type="submit">Submit</button>
            </form>
        </DefaultLayout>
    );
};
