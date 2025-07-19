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

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setResourceFetchedEntities } from "@/store/infra-resources-slice/infraResourcesSlice";
import { BACKEND_API_PREFIX } from "@/common/constants";
import { VmResource } from "@/common/interface/network";

const { ListInstancesRequest } = require("@/_proto/infra-sdk/output/cloud_pb");
const { CloudProviderServiceClient } = require("@/_proto/infra-sdk/output/cloud_grpc_web_pb");

const infraSdkResourcesClient = new CloudProviderServiceClient(BACKEND_API_PREFIX, null, null);

export const useFetchVpcResourceVms = (provider: string, region: string, id: string, accountId: string) => {
    const [vpcResourceVms, setVpcResourceVms] = useState<VmResource[]>([]);
    const dispatch = useDispatch();

    // Helper function to fetch VMs for a given provider.
    const fetchForProvider = (prov: string): Promise<VmResource[]> => {
        return new Promise((resolve, reject) => {
            const request = new ListInstancesRequest();
            request.setProvider(prov.toUpperCase());
            // When provider is ALL_PROVIDERS, assume the parameters are empty
            if (provider === "ALL_PROVIDERS") {
                request.setVpcId("");
                request.setRegion("");
                request.setAccountId("");
            } else {
                request.setVpcId(id);
                request.setRegion(region);
                request.setAccountId(accountId);
            }
            infraSdkResourcesClient.listInstances(request, {}, (err: any, response: any) => {
                if (err) return reject(err);
                const data = response?.getInstancesList();
                if (data) {
                    const infraVms = data.map((instance: any) => {
                        let project = "";
                        let owner = "";
                        let compliant = "No";
                        const labels: Record<string, string> = {};
                        const labelsMap = instance.getLabelsMap();
                        labelsMap.forEach((value: string, key: string) => {
                            labels[key] = value;
                        });
                        if (labels && (("project" in labels) || ("Project" in labels))) {
                            project = labels["project"] || labels["Project"];
                        }
                        if (labels && (("owner" in labels) || ("Owner" in labels))) {
                            owner = labels["owner"] || labels["Owner"];
                        }
                        if (owner && project) {
                            compliant = "Yes";
                        }

                        // Convert createTime to a serializable format
                        const createTimeObj = instance.getCreatedAt();
                        let createTime: string | undefined = undefined;
                        if (createTimeObj) {
                            try {
                                // Try to get seconds and nanos if available
                                const seconds = createTimeObj.getSeconds?.();
                                const nanos = createTimeObj.getNanos?.();
                                if (typeof seconds === 'number') {
                                    // Convert to milliseconds and create a date string
                                    createTime = new Date(seconds * 1000 + (nanos ? nanos / 1000000 : 0)).toISOString();
                                } else {
                                    // Fallback: try to get the value directly
                                    createTime = createTimeObj.toString();
                                }
                            } catch (err) {
                                console.warn('Could not parse createTime:', err);
                            }
                        }

                        return {
                            name: instance.getName() || undefined,
                            vpcId: instance.getVpcid(),
                            region: instance.getRegion(),
                            id: instance.getId(),
                            accountId: instance.getAccountId(),
                            provider: instance.getProvider().toUpperCase(),
                            owner,
                            project,
                            type: instance.getType(),
                            subnetId: instance.getSubnetid(),
                            publicIp: instance.getPublicip(),
                            privateIp: instance.getPrivateip(),
                            state: instance.getState(),
                            labels,
                            compliant,
                            selfLink: instance.getSelfLink(),
                            securityGroups: instance.getSecuritygroupidsList()?.slice() || [],
                            interfaceIds: instance.getInterfaceidsList()?.slice() || [],
                            zone: instance.getZone(),
                            createTime,
                            // Add creationTimestamp and instance type information
                            creationTimestamp: createTime,
                            instanceType: instance.getType(),
                            machineType: instance.getType(),
                        };
                    });
                    resolve(infraVms);
                } else {
                    resolve([]);
                }
            });
        });
    };

    const fetchVpcResourcesVms = async () => {
        try {
            let results: VmResource[] = [];
            if (provider === "ALL_PROVIDERS") {
                const providers = ["AWS", "GCP", "AZURE"];
                const responses = await Promise.all(providers.map(prov => fetchForProvider(prov)));
                responses.forEach(res => results = results.concat(res));
            } else {
                results = await fetchForProvider(provider);
            }
            setVpcResourceVms(results);
            dispatch(setResourceFetchedEntities(results));
        } catch (e) {
            console.error("Error fetching VMs:", e);
        }
    };

    return { vpcResourceVms, fetchVpcResourcesVms };
};
