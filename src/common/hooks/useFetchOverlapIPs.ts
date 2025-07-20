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

// Added proto imports and client initialization locally
//const { ListSubnetsRequest } = require("@/_proto/infra-sdk/output/cloud_pb");
const { ListVPCRequest } = require("@/_proto/infra-sdk/output/cloud_pb");
const { CloudProviderServiceClient } = require("@/_proto/infra-sdk/output/cloud_grpc_web_pb");
const infraSdkResourcesClient = new CloudProviderServiceClient(BACKEND_API_PREFIX, null, null);

export const useFetchOverlapIPs = (
	selectedProvider: string,
	region: string,
	selectedVpcId: string,
	selectedAccountId: string
) => {
	const [overlappedCIDRs, setOverlappedCIDRs] = useState<any[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<any>(null);

	const fetchVpcResourcesOverlappedIP = async () => {
		setLoading(true);
		try {
			let vpcCIDRs: any[] = [];
			if (selectedProvider === "ALL_PROVIDERS") {
				const providers = ["aws", "gcp", "azure"];
				const responses = await Promise.all(providers.map(p => fetchForProvider(p)));
				responses.forEach(res => vpcCIDRs = vpcCIDRs.concat(res));
			} else {
				vpcCIDRs = await fetchForProvider(selectedProvider);
			}
			
			vpcCIDRs.forEach((primaryCIDR: any) => {
				//console.log("VPC Primary CIDR:", primaryCIDR.provider,primaryCIDR.accountId,primaryCIDR.id,primaryCIDR.cidrBlock);
			});
			// Format each subnet for compareCIDRLists
			const formattedCIDRs = vpcCIDRs.map((item: any) => ({
				id: item.id,
				cidr: item.cidrBlock,
				name: item.name,
				provider: item.provider,
				accountId: item.accountId,
			}));
		
			// Determine overlapping CIDRs using the utility function
			//const overlaps = compareCIDRsWithinList(formattedCIDRs);
			const overlaps = flattenAndCompareCIDRs(formattedCIDRs);
			overlaps.forEach((overlap: any, index: number) => {
				console.log(`Overlap ${index + 1}:`, overlap);
			});
			setOverlappedCIDRs(overlaps);
		} catch (e) {
			console.error("Error fetching VPC Resources Overlapped IP:", e);
			setError(e);
		} finally {
			setLoading(false);
			//console.log("fetchVpcResourcesOverlappedIP completed");
		}
	};

	// New helper function re-implementing the subnets fetch logic locally
	function fetchForProvider(prov: string): Promise<any[]> {
		//console.log("Fetching primary VPC CIDRs for provider:", selectedProvider);
		return new Promise((resolve, reject) => {
			const request = new ListVPCRequest();
			request.setProvider(prov);
			request.setRegion(region);
			request.setAccountId(selectedAccountId);
			infraSdkResourcesClient.listVPC(request, {}, (err: any, response: any) => {
				if (err) return reject(err);
				const data = response?.getVpcsList();
				if (data) {
					const result = data.map((vpc: any) => {
						const name = vpc.getName();
						const id = vpc.getId();
						const cidrBlock = vpc.getIpv4Cidr();
						const accountId = vpc.getAccountId();
						const region = vpc.getRegion();
						const provider = vpc.getProvider().toUpperCase();
						//console.log("VPC Info:", provider, accountId, id, cidrBlock);
						return { id, name, cidrBlock, provider, accountId, region };
					});
					resolve(result);
				} else {
					resolve([]);
				}
			});
		});
	}
	// Automatic fetch on dependency change.
	useEffect(() => {
		fetchVpcResourcesOverlappedIP();
	}, [selectedProvider, region, selectedVpcId, selectedAccountId]);
	return { overlappedCIDRs, loading, error, fetchVpcResourcesOverlappedIP };
};