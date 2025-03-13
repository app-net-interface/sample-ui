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

const { ListInstancesRequest } = require("@/_proto/infra-sdk/output/cloud_pb");
const { CloudProviderServiceClient } = require("@/_proto/infra-sdk/output/cloud_grpc_web_pb");

const infraSdkResourcesClient = new CloudProviderServiceClient(BACKEND_API_PREFIX, null, null);

export const useFetchVpcResourceVms = (provider: string, region: string, id: string, accountId: string) => {
	const [vpcResourceVms, setVpcResourceVms] = useState<any[]>([]);
	const dispatch = useDispatch();

	// Helper function to fetch VMs for a given provider.
	const fetchForProvider = (prov: string): Promise<any[]> => {
		return new Promise((resolve, reject) => {
			const request = new ListInstancesRequest();
			request.setProvider(prov);
			// When provider is "all", assume the parameters are empty
			if (provider === "all") {
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
						const labels: any = {};
						const labelsMap = instance.getLabelsMap();
						labelsMap.forEach((value: string, key: string) => {
							labels[key] = value;
						});
						if (labels && (("project" in labels) || ("Project" in labels))) {
							project = labels["project"];
						}
						if (labels && (("owner" in labels) || ("Owner" in labels))) {
							owner = labels["owner"];
						}
						if (owner && project) {
							compliant = "Yes";
						}
						return {
							name: instance.getName(),
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
							securityGroups: instance.getSecuritygroupidsList(),
							interfaceIds: instance.getInterfaceidsList(),
							zone: instance.getZone(),
						};
					});
					resolve(infraVms);
				} else {
					resolve([]);
				}
			});
		});
	};

	// Modified fetchVpcResourcesVms to handle "all" providers.
	const fetchVpcResourcesVms = async () => {
		try {
			let results: any[] = [];
			if (provider === "ALL_PROVIDERS") {
				const providers = ["aws", "gcp", "azure"];
				const responses = await Promise.all(providers.map(prov => fetchForProvider(prov)));
				responses.forEach(res => results = results.concat(res));
			} else {
				results = await fetchForProvider(provider);
			}
			setVpcResourceVms(results);
		} catch (e) {
			console.log("error", e);
		}
	};

	useEffect(() => {
		if (vpcResourceVms.length) {
			dispatch(setResourceFetchedEntities(vpcResourceVms));
		}
	}, [vpcResourceVms]);

	return { vpcResourceVms, fetchVpcResourcesVms };
};
