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

      <div className={combineStyles(
        commonStyles.table.container,
        'transform perspective-1000'
      )}>
        <div className={commonStyles.table.header}>
          {[
            { key: 'name', label: 'Name' },
            { key: 'connection_type', label: 'Type' },
            { key: 'vpc_id_1', label: 'Source VPC' },
            { key: 'vpc_id_2', label: 'Destination VPC' },
            { key: 'status', label: 'Status' },
            { key: 'region', label: 'Region' },
            { key: 'account_id', label: 'Account ID' }
          ].map(({ key, label }) => (
            <span
              key={key}
              onClick={() => handleSortClick(key)}
              className={combineStyles(
                commonStyles.table.cell,
                'cursor-pointer font-semibold',
                key === 'name' ? 'justify-start' : '',
                sortConfig?.key === key ? 'text-blue-600 dark:text-blue-400' : ''
              )}
            >
              {label}
              {sortConfig?.key === key && (
                <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
              )}
            </span>
          ))}
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
                  <span className={combineStyles(commonStyles.table.cell, 'truncate justify-start')}>
                    {connection.name || 'N/A'}
                  </span>
                  <span className={combineStyles(
                    commonStyles.table.cell,
                    'px-3 py-1 rounded-full text-xs font-medium',
                    connection.type === 'peering' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    connection.type === 'transit_gateway' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    connection.type === 'vpn' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    connection.type === 'direct_connect' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    connection.type === 'interconnect' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  )}>
                    {connection.connection_type || 'Unknown'}
                  </span>
                  <span className={combineStyles(commonStyles.table.cell, 'font-mono text-sm')}>
                    {connection.vpc_id_1}
                  </span>
                  <span className={combineStyles(commonStyles.table.cell, 'font-mono text-sm')}>
                    {connection.vpc_id_2}
                  </span>
                  <span className={combineStyles(
                    commonStyles.table.cell,
                    'px-3 py-1 rounded-full text-xs font-medium',
                    connection.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    connection.status === 'inactive' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  )}>
                    {connection.status || 'N/A'}
                  </span>
                  <span className={combineStyles(commonStyles.table.cell, 'font-medium')}>
                    {connection.region}
                  </span>
                  <span className={combineStyles(commonStyles.table.cell, 'font-mono text-sm text-gray-600 dark:text-gray-400')}>
                    {connection.account_id}
                  </span>
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
