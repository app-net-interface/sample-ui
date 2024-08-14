import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Wrapper } from "@/components/views/wrapper";
import { Toolbar } from "./Toolbar";
import { serverStatus } from "@/common/constants";
import { useFetchNetworkDomainsConnections } from "@/common/hooks";
import { DataGrid, GridColDef, GridRowModel, GridRowSelectionModel, GridValueGetter } from '@mui/x-data-grid';
import { ConnectionInformation } from "@/_proto/grpc-service/ts/network_domain_connection";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/layout/DefaultLayout";


export const NetworkDomainsConnections = () => {
  const [selectedRows, setSelectedRows] = useState<ConnectionInformation[]>([]);
  const [connectionData, setConnectionData] = useState<ConnectionInformation[]>([]);

  const { array, fetchConnections } = useFetchNetworkDomainsConnections();

  useEffect(() => {
    fetchConnections();
  }, []);  // Call fetchConnections once on mount

  useEffect(() => {
    setConnectionData(array);
  }, [array]);

  const handleRowSelection = (selectionModel: GridRowSelectionModel) => {
    const selectedData = selectionModel.map((id: number | string) =>
      connectionData.find(row => row.id === id)
    ).filter((item): item is ConnectionInformation => !!item);
    setSelectedRows(selectedData);
    console.log('Selected Rows:', selectedData); // Add console log to verify
  };

  const columns: GridColDef<ConnectionInformation>[] = [
    { field: 'id', headerName: 'ID', width: 300 },
    {
      field: 'name',
      headerName: 'Name',
      width: 300,
      valueGetter: (value, row) => row?.metadata?.name

    },
    {
      field: 'sourceName',
      headerName: 'Source Name',
      width: 150,
      valueGetter: (value, row) => row?.source?.name
    },
    {
      field: 'sourceType',
      headerName: 'Source Type',
      width: 120,
      valueGetter: (value, row) => row?.source?.type
    },
    {
      field: 'sourceProvider',
      headerName: 'Source Provider',
      width: 120,
      valueGetter: (value, row) => row?.source?.provider
    },
    {
      field: 'destinationName',
      headerName: 'Destination Name',
      width: 150,
      valueGetter: (value, row) => row?.destination?.name
    },
    {
      field: 'destinationType',
      headerName: 'Destination Type',
      width: 120,
      valueGetter: (value, row) => row?.destination?.type
    },
    {
      field: 'destinationProvider',
      headerName: 'Destination Provider',
      width: 130,
      valueGetter: (value, row) => row?.destination?.provider
    },
    { field: 'status', headerName: 'Status', width: 90 },
  ];


  return (
    <DefaultLayout>
      <Breadcrumb pageName="Network Domains Connections" />
      <Toolbar selectedConnections={selectedRows} />
      <div style={{ height: 700, width: '100%' }}>
        <DataGrid
          rows={connectionData}
          columns={columns}
          checkboxSelection
          onRowSelectionModelChange={handleRowSelection}
        />
      </div>
    </DefaultLayout>
  );
};
