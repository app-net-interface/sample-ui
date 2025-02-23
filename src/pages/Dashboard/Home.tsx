import React, { useState, useEffect } from 'react';
import CardMedium from '../../components/Cards/CardMedium';
import CardLarge from '../../components/Cards/CardLarge';
import PieChart from '../../components/Charts/PieChart';
import DefaultLayout from '../../layout/DefaultLayout';
import ProviderRegionBar from '@/components/ProviderRegion/ProviderRegionBar';

import { Source } from "@/store/summary-slice/summarySlice";
import { useFetchSummary } from "@/common/hooks/useFetchSummary";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setSelectedProvider } from "@/store/selectedRegionAccountId-slice/selectedRegionAccountIdSlice";
import { InfraResourceProvider } from '@/common/enum';

const ALL_PROVIDERS: Source = 'All Providers';

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // State from Redux
  const { selectedProvider, selectedAccountId, selectedVpc } = useSelector((state: RootState) => state.selectedResources);
  
  // Set the default provider only once on mount.
  useEffect(() => {
    dispatch(setSelectedProvider(InfraResourceProvider.AWS));
  }, [dispatch]);

  // Fallback to default if selectedProvider is undefined.
  const provider = selectedProvider || InfraResourceProvider.AWS;

  // Fetch summary data.
  const { fetchSummary } = useFetchSummary(selectedAccountId, selectedVpc);
  const { count, status } = useSelector((state: RootState) => state.summary);
  
  const [renderCharts, setRenderCharts] = useState(false);

  // Only fetch summary if an individual provider is selected.
  useEffect(() => {
    // Only fetch for individual providers.
    if (provider !== 'All Providers') {
      // Immediately call fetchSummary once.
      fetchSummary();
    }
  }, [selectedAccountId, selectedVpc, provider]);

  // Delay rendering pie charts to allow data to load.
  useEffect(() => {
    const timer = setTimeout(() => setRenderCharts(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const cloudResources = [
    { label: 'VPC', value: count[provider].VPC },
    { label: 'VM', value: count[provider].VM },
    { label: 'Subnets', value: count[provider].Subnets },
    { label: 'Route Tables', value: count[provider].RouteTables },
    { label: 'ACL', value: count[provider].ACL },
    { label: 'Security Groups', value: count[provider].SecurityGroups },
    { label: 'NAT Gateways', value: count[provider].NATGateways },
    { label: 'Internet Gateways', value: count[provider].InternetGateways },
    { label: 'Cloud Routers', value: count[provider].CloudRouters },
    { label: 'VPC Endpoints', value: count[provider].VPCEndpoints },
    { label: 'Public IP Addresses', value: count[provider].PublicIPAddresses }
  ];

  const kubernetesResources = [
    { label: 'Clusters', value: count[provider].Clusters },
    { label: 'Services', value: count[provider].Services },
    { label: 'Pods', value: count[provider].Pods },
    { label: 'Namespaces', value: count[provider].Namespaces }
  ];

  const enterpriseResources = [
    { label: 'SGT', value: count[provider].SGT },
    { label: 'VRF', value: count[provider].VRF },
    { label: 'VLAN', value: count[provider].VLAN }
  ];

  return (
    <DefaultLayout>
      <div className="flex justify-between">
        <div className="flex flex-col w-1/6">
          {/* spacer */}
        </div>
        <ProviderRegionBar home={true} onProviderButtonClick={() => {}} />
      </div>
      <div className="gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5 mb-4">
        <CardLarge title="Cloud Resources" data={cloudResources} />
      </div>
      <div className="flex gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5 mb-4 items-stretch">
        <CardMedium title="Kubernetes Resources" data={kubernetesResources} />
        <CardMedium title="Enterprise Resources [DC | Campus | Edge | User]" data={enterpriseResources} />
      </div>
      <div className="order border-stroke bg-white py-4 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <div className="col-span-12 overflow-auto h-[500px]">
          {renderCharts && (
            <div className="space-y-4">
              <div className="py-4">
                <PieChart 
                  series={[status[provider].vm.running, status[provider].vm.stopped, status[provider].vm.terminated]} 
                  title="VM States" 
                />
              </div>
              <div className="p-4">
                <PieChart 
                  series={[status[provider].pod.running, status[provider].pod.pending, status[provider].pod.crash]} 
                  title="Pod States" 
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default React.memo(Home);
