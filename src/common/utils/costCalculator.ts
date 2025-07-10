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

// A mock price list for various instance types.
// In a real-world application, this would come from a pricing API.
const HOURLY_COST_PER_INSTANCE_TYPE: { [key: string]: number } = {
  // AWS - NOTE: Prices are illustrative. Please verify with the latest AWS pricing.
  't2.nano': 0.0058,
  't2.micro': 0.0116,
  't2.small': 0.023,
  't2.medium': 0.0464,
  't2.large': 0.0928,
  't3.nano': 0.0052,
  't3.micro': 0.0104,
  't3.small': 0.0208,
  't3.medium': 0.0416,
  't3.large': 0.0832,
  't3.xlarge': 0.1664,
  't3.2xlarge': 0.3328,
  'm5.large': 0.096,
  'm5.xlarge': 0.192,
  'm5.2xlarge': 0.384,
  'c5.large': 0.085,
  'c5.xlarge': 0.17,
  'c5.2xlarge': 0.34,
  'c5.4xlarge': 0.68,
  'c5.9xlarge': 1.53,
  // Azure - Using Azure instance type names
  'Standard_B1s': 0.012,
  'Standard_B2s': 0.0472,
  'Standard_D2s_v3': 0.096,
  // GCP - Using GCP machine type names
  'e2-micro': 0.0077,
  'e2-small': 0.0153,
  'e2-medium': 0.0306,
  // Default
  'default': 0.05, // A fallback cost
};

/**
 * Calculates the running cost of a virtual machine.
 * @param instance The instance object, which should have state, instanceType, and creationTimestamp properties.
 * @returns The calculated cost as a number, or null if calculation is not applicable.
 */
export const calculateRunningCost = (instance: any): number | null => {
  const { state, instanceType, creationTimestamp, createTime } = instance;

  // Only calculate for running instances
  if (String(state).toLowerCase() !== 'running') {
    return null;
  }

  // Check for necessary data
  const timestamp = creationTimestamp || createTime;
  if (!timestamp || !instanceType) {
    return null;
  }

  const hourlyRate = HOURLY_COST_PER_INSTANCE_TYPE[instanceType] || HOURLY_COST_PER_INSTANCE_TYPE['default'];
  
  try {
    const startTime = new Date(timestamp);
    const now = new Date();
    
    // @ts-ignore
    const durationInMs = now - startTime;
    const durationInHours = durationInMs / (1000 * 60 * 60);
    
    const totalCost = durationInHours * hourlyRate;
    
    return totalCost;
  } catch (error) {
    console.error("Error calculating running cost:", error);
    return null;
  }
};
