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
/**
 * Handler functions for VPCView actions.
 */

export const handleButtonClick = async (
  name: string,
  fetchFunction: (() => Promise<any>) | undefined,
  selectedAccountId: string,
  setSelectedView: (view: string) => void,
  setLastUpdated: (date: Date) => void,
  setIsModalOpen: (open: boolean) => void,
  setSelectedAccountId: (id: string) => void
) => {
  // Close modal if open, set selected view and update last updated timestamp.
  setIsModalOpen(false);
  setSelectedAccountId(selectedAccountId);
  setSelectedView(name);
  setLastUpdated(new Date());
  // Execute additional fetch action if provided.
  if (fetchFunction) {
    await fetchFunction();
  }
};

export const handleOpenModal = (
  item: any,
  setSelectedItem: (item: any) => void,
  setIsModalOpen: (open: boolean) => void
) => {
  // Set the item and open modal
  setSelectedItem(item);
  setIsModalOpen(true);
};