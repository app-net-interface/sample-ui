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

import { FC, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";

import styles from "./data-grid.module.scss";
import { color } from "d3";

interface DataGridProps {
  rowData: any;
  columnDefs: ColDef[];
  heightAndWidth?: {
    width?: string;
    height?: string;
  };
  rowSelection?: "single" | "multiple";
  sortable?: boolean;
  resizable?: boolean;
  onRowSelected?: any;
  ref?: any;
}

export const DataGrid: FC<DataGridProps> = ({
  rowData,
  sortable = true,
  resizable = true,
  columnDefs,
  heightAndWidth,
  rowSelection = "single",
  onRowSelected,
  ref,
}) => {
  const defaultColDef = useMemo<Partial<ColDef>>(
    () => ({
      sortable: sortable,
      resizable: resizable,
    }),
    []
  );

  return (
    <div className="ag-theme-material" style={{ ...heightAndWidth, backgroundColor: 'transparent' }}>
      <AgGridReact
        ref={ref}
        className={styles.dataGrid}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowSelection={rowSelection}
        suppressRowClickSelection={false}
        onRowSelected={onRowSelected}
      />
    </div>
  );
};
