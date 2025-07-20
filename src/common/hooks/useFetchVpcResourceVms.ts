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

const SUPPORTED_PROVIDERS = ["AWS", "GCP", "AZURE"] as const;
type SupportedProvider = typeof SUPPORTED_PROVIDERS[number];

export const useFetchVpcResourceVms = (provider: string, region: string, id: string, accountId: string) => {
    const [vpcResourceVms, setVpcResourceVms] = useState<VmResource[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dispatch = useDispatch();

    // Helper function to fetch VMs for a given provider.
    const fetchForProvider = async (prov: string): Promise<VmResource[]> => {
        return new Promise((resolve, reject) => {
            const request = new ListInstancesRequest();
            const upperProvider = prov.toUpperCase() as SupportedProvider;
            request.setProvider(upperProvider);

            // When provider is ALL_PROVIDERS, use empty parameters
            const useEmptyParams = provider === "ALL_PROVIDERS";
            request.setVpcId(useEmptyParams ? "" : id);
            request.setRegion(useEmptyParams ? "" : region);
            request.setAccountId(useEmptyParams ? "" : accountId);

            infraSdkResourcesClient.listInstances(request, {}, (err: any, response: any) => {
                if (err) {
                    console.error(`Error fetching VMs for provider ${upperProvider}:`, err);
                    return reject(new Error(`Failed to fetch VMs for ${upperProvider}: ${err.message}`));
                }

                const data = response?.getInstancesList();
                if (!data) {
                    console.warn(`No VM data returned for provider ${upperProvider}`);
                    return resolve([]);
                }

                const infraVms = data.map((instance: any) => {
                    // Extract labels and compliance info
                    const labels: Record<string, string> = {};
                    const labelsMap = instance.getLabelsMap();
                    labelsMap.forEach((value: string, key: string) => {
                        labels[key] = value;
                    });

                    const project = labels["project"] || labels["Project"] || "";
                    const owner = labels["owner"] || labels["Owner"] || "";
                    const compliant = (owner && project) ? "Yes" : "No";

                    // Handle creation timestamp
                    let createTime: string | undefined;
                    const createTimeObj = instance.getCreatedAt();
                    if (createTimeObj) {
                        try {
                            const seconds = createTimeObj.getSeconds?.();
                            const nanos = createTimeObj.getNanos?.();
                            if (typeof seconds === 'number') {
                                createTime = new Date(seconds * 1000 + (nanos ? nanos / 1000000 : 0)).toISOString();
                            } else {
                                createTime = createTimeObj.toString();
                            }
                        } catch (err) {
                            console.warn('Could not parse createTime:', err);
                        }
                    }

                    // Map instance data to VmResource
                    const vmResource: VmResource = {
                        name: instance.getName() || undefined,
                        vpcId: instance.getVpcid(),
                        region: instance.getRegion(),
                        id: instance.getId(),
                        accountId: instance.getAccountId(),
                        provider: upperProvider,
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
                        creationTimestamp: createTime,
                        instanceType: instance.getType(),
                        machineType: instance.getType(),
                    };

                    return vmResource;
                });

                resolve(infraVms);
            });
        });
    };

    const fetchVpcResourcesVms = async () => {
        setIsLoading(true);
        setError(null);

        try {
            let results: VmResource[] = [];

            if (provider === "ALL_PROVIDERS") {
                // Fetch from all providers in parallel
                const responses = await Promise.allSettled(
                    SUPPORTED_PROVIDERS.map(prov => fetchForProvider(prov))
                );

                // Handle responses, including partial failures
                responses.forEach((response, index) => {
                    if (response.status === 'fulfilled') {
                        results = results.concat(response.value);
                    } else {
                        console.error(`Failed to fetch from ${SUPPORTED_PROVIDERS[index]}:`, response.reason);
                    }
                });
            } else {
                results = await fetchForProvider(provider);
            }

            // Always update state and dispatch results, even if empty
            setVpcResourceVms(results);
            dispatch(setResourceFetchedEntities(results));
            
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
            console.error("Error fetching VMs:", errorMessage);
            setError(errorMessage);
            // Set empty results on error
            setVpcResourceVms([]);
            dispatch(setResourceFetchedEntities([]));
        } finally {
            setIsLoading(false);
        }
    };

    return { vpcResourceVms, isLoading, error, fetchVpcResourcesVms };
};
