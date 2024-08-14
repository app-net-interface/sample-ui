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

// GeofencingPolicyForm.tsx
import React, { useState } from 'react';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '@/layout/DefaultLayout';
import './Styles.css';

interface GeoRestriction {
    region: string;
    action: string;
}

export const GeofencingPolicyCreator: React.FC = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [geoRestrictions, setGeoRestrictions] = useState<GeoRestriction[]>([{ region: '', action: '' }]);

    const handleAddGeoRestriction = () => {
        setGeoRestrictions([...geoRestrictions, { region: '', action: '' }]);
    };

    const handleRemoveGeoRestriction = (index: number) => {
        const newGeoRestrictions = geoRestrictions.filter((_, i) => i !== index);
        setGeoRestrictions(newGeoRestrictions);
    };

    const handleGeoRestrictionChange = (index: number, field: keyof GeoRestriction, value: string) => {
        const newGeoRestrictions = [...geoRestrictions];
        newGeoRestrictions[index][field] = value;
        setGeoRestrictions(newGeoRestrictions);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const geofencingPolicy = {
            metadata: {
                name,
                description,
            },
            geofencingPolicy: {
                geoRestriction: geoRestrictions,
            },
        };
        console.log(geofencingPolicy);
        // TODO: Send geofencingPolicy to the backend
    };

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Geofencing Policy Creator" />
            <div className="container">
                <h1>Geofencing Policy</h1>
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
                        <label>Geo Restrictions</label>
                        {geoRestrictions.map((geoRestriction, index) => (
                            <div key={index} className="input-row">
                                <input list="regions" value={geoRestriction.region} onChange={(e) => handleGeoRestrictionChange(index, 'region', e.target.value)} required />
                                <datalist id="regions">
                                    <option value="EEA" />
                                    <option value="Non-EEA" />
                                    <option value="APAC" />
                                    <option value="NAFTA" />
                                    <option value="GCC" />
                                    <option value="MENA" />
                                    <option value="SAARC" />
                                    <option value="ASEAN" />
                                    <option value="CIS" />
                                    <option value="ECOWAS" />
                                    <option value="SADC" />
                                    <option value="MERCOSUR" />
                                    <option value="CARICOM" />
                                    <option value="EU" />
                                    <option value="Schengen Area" />
                                    <option value="Sub-Saharan Africa" />
                                    <option value="North America" />
                                    <option value="South America" />
                                    <option value="Central America" />
                                    <option value="East Asia" />
                                    <option value="Southeast Asia" />
                                    <option value="South Asia" />
                                    <option value="Central Asia" />
                                    <option value="Western Asia" />
                                    <option value="Eastern Europe" />
                                    <option value="Western Europe" />
                                    <option value="Northern Europe" />
                                    <option value="Southern Europe" />
                                </datalist>

                                <select value={geoRestriction.action} onChange={(e) => handleGeoRestrictionChange(index, 'action', e.target.value)} required>
                                    <option value="" disabled>Select action</option>
                                    <option value="allow">Allow</option>
                                    <option value="block">Block</option>
                                </select>
                                {geoRestrictions.length > 1 && <button type="button" onClick={() => handleRemoveGeoRestriction(index)}>-</button>}
                            </div>
                        ))}
                        <button type="button" onClick={handleAddGeoRestriction}>+</button>
                    </div>
                    <button type="submit">Submit</button>
                </form>
            </div>
        </DefaultLayout>
    );
};
