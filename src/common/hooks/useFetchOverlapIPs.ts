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
import { flattenAndCompareCIDRs } from "@/common/utils/overlappedCidr";
import { VpcCIDR, CIDREntry, OverlapGroup } from "@/common/interface/network";

// Added proto imports and client initialization locally
//const { ListSubnetsRequest } = require("@/_proto/infra-sdk/output/cloud_pb");
const { ListVPCRequest } = require("@/_proto/infra-sdk/output/cloud_pb");
const { CloudProviderServiceClient } = require("@/_proto/infra-sdk/output/cloud_grpc_web_pb");
const infraSdkResourcesClient = new CloudProviderServiceClient(BACKEND_API_PREFIX, null, null);

interface VpcResponse {
    getName(): string;
    getId(): string;
    getIpv4Cidr(): string;
    getAccountId(): string;
    getRegion(): string;
    getProvider(): { toUpperCase(): string };
}

export const useFetchOverlapIPs = (
    selectedProvider: string,
    region: string,
    selectedVpcId: string,
    selectedAccountId: string
) => {
    const [overlappedCIDRs, setOverlappedCIDRs] = useState<OverlapGroup[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchVpcResourcesOverlappedIP = async () => {
        console.log("Starting fetchVpcResourcesOverlappedIP");
        if (!selectedProvider) {
            console.log("No provider selected, skipping fetch");
            return;
        }

        setLoading(true);
        try {
            let vpcCIDRs: VpcCIDR[] = [];
            if (selectedProvider === "ALL_PROVIDERS") {
                const providers = ["aws", "gcp", "azure"];
                const responses = await Promise.all(providers.map(p => fetchForProvider(p)));
                vpcCIDRs = responses.flat();
            } else {
                vpcCIDRs = await fetchForProvider(selectedProvider);
            }
            
            vpcCIDRs.forEach((primaryCIDR: VpcCIDR) => {
                console.log("VPC Primary CIDR:", primaryCIDR.provider, primaryCIDR.accountId, primaryCIDR.id, primaryCIDR.cidrBlock);
            });

            const cidrEntries: CIDREntry[] = vpcCIDRs.map((item: VpcCIDR) => ({
                id: item.id,
                cidr: item.cidrBlock,
                name: item.name,
                provider: item.provider,
                accountId: item.accountId,
            }));
        
            const overlaps = flattenAndCompareCIDRs(cidrEntries);
            overlaps.forEach((overlap: OverlapGroup, index: number) => {
                console.log(`Overlap ${index + 1}:`, overlap);
            });
            setOverlappedCIDRs(overlaps);
        } catch (e) {
            console.error("Error fetching VPC Resources Overlapped IP:", e);
            setError(e instanceof Error ? e : new Error('An error occurred while fetching VPC resources'));
        } finally {
            setLoading(false);
            console.log("fetchVpcResourcesOverlappedIP completed");
        }
    };

    // Helper function for fetching VPC CIDRs for a specific provider
    function fetchForProvider(prov: string): Promise<VpcCIDR[]> {
        console.log("Fetching primary VPC CIDRs for provider:", prov);
        return new Promise((resolve, reject) => {
            const request = new ListVPCRequest();
            request.setProvider(prov);
            request.setRegion(region);
            request.setAccountId(selectedAccountId);
            infraSdkResourcesClient.listVPC(request, {}, (err: Error | null, response: any) => {
                if (err) return reject(err);
                const data = response?.getVpcsList();
                if (data) {
                    const result = data.map((vpc: VpcResponse) => ({
                        name: vpc.getName(),
                        id: vpc.getId(),
                        cidrBlock: vpc.getIpv4Cidr(),
                        accountId: vpc.getAccountId(),
                        region: vpc.getRegion(),
                        provider: vpc.getProvider().toUpperCase(),
                    }));
                    resolve(result);
                } else {
                    resolve([]);
                }
            });
        });
    }

    // Automatic fetch on dependency change
    useEffect(() => {
        if (selectedProvider && selectedAccountId) {
            fetchVpcResourcesOverlappedIP();
        }
    }, [selectedProvider, region, selectedVpcId, selectedAccountId]);

    return { overlappedCIDRs, loading, error, fetchVpcResourcesOverlappedIP };
};