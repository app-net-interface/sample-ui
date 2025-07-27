import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { commonStyles, combineStyles } from '@/styles/theme';
import { useFetchVpcConnections } from '@/common/hooks/useFetchVpcConnections';
import DefaultLayout from '@/layout/DefaultLayout';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import ProviderButtons from '@/components/ProviderRegion/ProviderRegionBar';
import { InfraResourceProvider } from '@/common/enum';

export const VPCConnections: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);

  const { selectedProvider, selectedAccountId } = useSelector(
    (state: RootState) => state.selectedResources
  );

  const { vpcConnections = [], fetchVPCConnections } = useFetchVpcConnections(
    selectedProvider as InfraResourceProvider,
    selectedAccountId
  ) || { vpcConnections: [], fetchVPCConnections: () => {} };

  useEffect(() => {
    fetchVPCConnections();
  }, [selectedProvider, selectedAccountId]);

  const handleSortClick = (key: string) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'ascending' };
      }
      if (current.direction === 'ascending') {
        return { key, direction: 'descending' };
      }
      return null;
    });
  };

  const sortedData = (data: any[]) => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  };

  const search = (data: any[]) => {
    if (!searchTerm) return data;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const searchKeys = ['id', 'name', 'vpc_id_1', 'vpc_id_2', 'status', 'region', 'account_id'];
    return data.filter(item =>
      searchKeys.some(key =>
        item[key]?.toString().toLowerCase().includes(lowerCaseSearchTerm)
      )
    );
  };

  const filteredAndSortedData = sortedData(search(vpcConnections));

  return (
    <DefaultLayout>
      <Breadcrumb pageName="VPC Connections" />
      <div className="flex justify-between mb-4">
        <div className="flex flex-col w-1/3">
          <input
            type="text"
            placeholder="Search VPC connections..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={combineStyles('input-field', commonStyles.input)}
          />
        </div>
        <ProviderButtons onProviderButtonClick={fetchVPCConnections} />
      </div>

      <div className={commonStyles.table.container}>
        <div className={commonStyles.table.header}>
          <span onClick={() => handleSortClick('name')} className={combineStyles(commonStyles.table.cell, 'w-1/6 cursor-pointer')}>Name</span>
          <span onClick={() => handleSortClick('vpc_id_1')} className={combineStyles(commonStyles.table.cell, 'w-1/6 cursor-pointer')}>Source VPC</span>
          <span onClick={() => handleSortClick('vpc_id_2')} className={combineStyles(commonStyles.table.cell, 'w-1/6 cursor-pointer')}>Destination VPC</span>
          <span onClick={() => handleSortClick('status')} className={combineStyles(commonStyles.table.cell, 'w-1/6 cursor-pointer')}>Status</span>
          <span onClick={() => handleSortClick('region')} className={combineStyles(commonStyles.table.cell, 'w-1/6 cursor-pointer')}>Region</span>
          <span onClick={() => handleSortClick('account_id')} className={combineStyles(commonStyles.table.cell, 'w-1/6 cursor-pointer')}>Account ID</span>
        </div>
        <div>
          {vpcConnections.length === 0 ? (
            <div className={combineStyles(commonStyles.container, commonStyles.states.empty, 'p-4')}>
              {searchTerm ? 'No VPC connections found matching your search criteria.' : 'No VPC connections available.'}
            </div>
          ) : (
            <>
              {filteredAndSortedData.map((connection) => (
                <div
                  key={connection.id}
                  className={combineStyles(
                    commonStyles.table.row.base,
                    selectedRow === connection.id ? commonStyles.table.row.selected : commonStyles.table.row.normal,
                    commonStyles.table.row.hover
                  )}
                  onClick={() => setSelectedRow(connection.id)}
                >
                  <span className="w-1/6 px-4 py-2 flex text-center justify-center">{connection.name || 'N/A'}</span>
                  <span className="w-1/6 px-4 py-2 flex text-center justify-center">{connection.vpc_id_1}</span>
                  <span className="w-1/6 px-4 py-2 flex text-center justify-center">{connection.vpc_id_2}</span>
                  <span className="w-1/6 px-4 py-2 flex text-center justify-center">{connection.status || 'N/A'}</span>
                  <span className="w-1/6 px-4 py-2 flex text-center justify-center">{connection.region}</span>
                  <span className="w-1/6 px-4 py-2 flex text-center justify-center">{connection.account_id}</span>
                </div>
              ))}
              {filteredAndSortedData.length === 0 && (
                <div className={combineStyles(commonStyles.container, commonStyles.states.empty, 'p-4')}>
                  {searchTerm ? 'No VPC connections found matching your search criteria.' : 'No VPC connections available.'}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};
