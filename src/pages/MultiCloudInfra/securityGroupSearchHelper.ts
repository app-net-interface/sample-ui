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
// --- Helper Function: Parse Search Term ---
const parseSearchTerm = (term: string) => {
    const generalTerms: string[] = [];
    const ruleCriteria: { [key: string]: string } = {}; // Stores index as string key, value as search term
    const parts = term.toLowerCase().split(/ and | +/).filter(p => p.trim() !== '');

    parts.forEach(part => {
        const match = part.match(/^([a-z]+)=(.+)$/); // Match key=value (lowercase keys)
        if (match) {
            const key = match[1];
            const value = match[2].trim(); // Trim value
            // Map search keys to the keys used in the processedRules array
            const ruleKeyMap: { [key: string]: string } = {
                source: 'source',
                protocol: 'protocol',
                port: 'portRange', // Allow 'port' as an alias
                portrange: 'portRange',
                direction: 'direction',
            };
            // Map search keys to indices in the rule.array
            const ruleIndexMap: { [key: string]: number } = {
                protocol: 0,
                portRange: 1,
                source: 2,
                direction: 3,
            };

            if (ruleKeyMap[key] && ruleIndexMap.hasOwnProperty(ruleKeyMap[key])) {
                // Store the criteria with the *index* it corresponds to in rule.array
                ruleCriteria[ruleIndexMap[ruleKeyMap[key]]] = value;
            } else {
                // If key is not a known rule key, treat the value as a general term
                generalTerms.push(value);
            }
        } else {
            // Treat non key=value parts as general terms
            generalTerms.push(part.trim());
        }
    });

    // If only key=value pairs were entered, but none were rule keys, treat all values as general terms
    if (generalTerms.length === 0 && Object.keys(ruleCriteria).length === 0 && term.includes('=')) {
        parts.forEach(part => {
            const match = part.match(/^([a-z]+)=(.+)$/);
            if (match) generalTerms.push(match[2].trim());
        });
    }

    // ruleCriteria now looks like { '2': '0.0.0.0/0', '3': 'ingress' }
    return { generalTerms, ruleCriteria };
};

// --- Exported Function: Search Security Groups ---
export const searchSecurityGroups = (data: any[], searchTerm: string) => {
    if (!searchTerm.trim() || !data) return data || []; // Return all if no search term or no data

    const { generalTerms, ruleCriteria } = parseSearchTerm(searchTerm);
    const topLevelKeys = ['id', 'name', 'accountId', 'region', 'vpcId']; // Keys for general search

    // Check if there are any search terms at all
    const hasGeneralTerms = generalTerms.length > 0;
    const hasRuleCriteria = Object.keys(ruleCriteria).length > 0;

    if (!hasGeneralTerms && !hasRuleCriteria) return data; // Return all if parsing resulted in no terms

    return data.filter(group => {
        let match = false;

        // 1. Check general terms against top-level fields (if general terms exist)
        if (hasGeneralTerms) {
            match = generalTerms.some(term =>
                topLevelKeys.some(key =>
                    group.hasOwnProperty(key) && group[key] != null && String(group[key]).toLowerCase().includes(term)
                )
            );
        }

        // 2. Check rule criteria against rules map (if rule criteria exist)
        //    Match if (general terms match top-level) OR (rule criteria match a rule)
        if (!match && hasRuleCriteria && group.rules && typeof group.rules === 'object') {
            // Iterate over the *values* (original rule objects) of the rules map
            match = Object.values(group.rules).some((rule: any) => {
                // Check if THIS rule matches ALL specified criteria
                // rule.array holds the details: [protocol, portRange, source, direction, ...]
                const ruleDetails = rule?.array;
                if (!ruleDetails) return false; // Skip if rule details are missing

                return Object.entries(ruleCriteria).every(([indexStr, value]) => {
                    const index = parseInt(indexStr, 10); // Convert criteria key (index) back to number
                    // Check if the detail at the specified index exists and includes the search value
                    return ruleDetails.length > index && ruleDetails[index] != null && String(ruleDetails[index]).toLowerCase().includes(value);
                });
            });
        }

        return match;
    });
};