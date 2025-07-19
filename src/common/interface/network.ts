/**
 * Copyright (c) 2025 Cisco Systems, Inc. and its affiliates
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

export interface VpcCIDR {
    id: string;
    name: string;
    cidrBlock: string;
    provider: string;
    accountId: string;
    region: string;
}

export interface CIDREntry {
    provider: string;
    accountId: string;
    name: string;
    id: string;
    cidr: string;
}

export interface OverlapCIDREntry {
    cidr: string;
    vpcId: string;
    vpcName: string;
    accountId: string;
    provider: string;
}

export interface OverlapGroup {
    entries: OverlapCIDREntry[];
    startIP: string;
    endIP: string;
}
