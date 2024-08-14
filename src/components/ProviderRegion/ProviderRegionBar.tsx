import { useState, useEffect } from 'react';
import { InfraResourceProvider } from "@/common/enum";

// new imports
import { useFetchVpcAccounts, useFetchRegions, useFetchVpcsResources } from "@/common/hooks";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setInfraVpcs } from "@/store/infra-resources-slice/infraResourcesSlice";
import { setSelectedAccountId, setSelectedProvider, setSelectedRegion, setSelectedVpc } from '@/store/selectedRegionAccountId-slice/selectedRegionAccountIdSlice';

interface ProviderButtonsProps {
    onProviderButtonClick: () => void;
    home?: boolean;
}

const ProviderRegionBar: React.FC<ProviderButtonsProps> = ({ onProviderButtonClick, home = false }) => {

    const dispatch = useDispatch<AppDispatch>();

    // accounts + regions
    const { accounts } = useSelector((state: RootState) => state.infraResources);
    const { regions } = useSelector((state: RootState) => state.infraResources);

    const [selectedAccountId, setSelectedAccountIdState] = useState('');
    const [selectedRegion, setSelectedRegionState] = useState('');
    const [selectedButton, setLastClickedProvider] = useState<InfraResourceProvider>(InfraResourceProvider.AWS);
    const [selectedVpc, setSelectedVpcLocal] = useState('');

    // api calls 
    const { fetchAccounts } = useFetchVpcAccounts(selectedButton);
    const { vpcs, fetchVpcs } = useFetchVpcsResources(selectedButton, selectedAccountId, selectedRegion); // optional params.
    const { fetchRegions } = useFetchRegions(selectedButton);

    useEffect(() => {
        handleProviderSelect(InfraResourceProvider.AWS);
        fetchAccounts();
        fetchVpcs();
        fetchRegions();
    }, []);

    // display all accountIds and regionName
    const accountIds: any[] = accounts.reduce((uniqueIds: any[], account: any, index: number) => {
        const accountId = account.accountId;
        if (!uniqueIds.some((item: any) => item.value === accountId)) {
            uniqueIds.push({
                label: accountId,
                value: accountId,
                key: accountId + index,
            });
        }
        return uniqueIds;
    }, []);

    const regionNames: any[] = regions.reduce((uniqueIds: any[], region: any, index: number) => {
        const regionName = region.regionName;
        if (!uniqueIds.some((item: any) => item.value === regionName)) {
            uniqueIds.push({
                label: regionName,
                value: regionName,
                key: regionName + index,
            });
        }
        return uniqueIds;
    }, []);

    const vpcIds: any[] = vpcs.reduce((uniqueIds: any[], vpc: any, index: number) => {
        const vpcId = vpc.id;
        if (!uniqueIds.some((item: any) => item.value === vpcId)) {
            uniqueIds.push({
                label: vpcId,
                value: vpcId,
                key: vpcId + index,
            });
        }
        return uniqueIds;
    }, []);

    useEffect(() => {
        handleProviderSelect(selectedButton)
    }, [selectedAccountId]);

    const handleAccountIdChange = (value: string) => {
        setSelectedAccountIdState(value)
        dispatch(setSelectedAccountId(value));
        handleProviderSelect(selectedButton)
    };

    const handleRegionChange = (value: string) => {
        setSelectedRegionState(value)
        dispatch(setSelectedRegion(value));
        handleProviderSelect(selectedButton)
    };

    const handleVpcChange = (value: string) => {

        setSelectedVpcLocal(value)
        dispatch(setSelectedVpc(value));
        // handleProviderSelect(selectedButton)
    };

    const handleProviderSelect = (value: any) => {
        if (!value) {
            dispatch(setInfraVpcs([]));
        } else {
            switch (value) {
                case InfraResourceProvider.AWS:
                    dispatch(setInfraVpcs([]));
                    dispatch(setSelectedProvider(InfraResourceProvider.AWS));
                    setLastClickedProvider(InfraResourceProvider.AWS);
                    fetchAccounts()
                    fetchVpcs();
                    fetchRegions();
                    break;
                case InfraResourceProvider.GCP:
                    dispatch(setInfraVpcs([]));
                    dispatch(setSelectedProvider(InfraResourceProvider.GCP));
                    setLastClickedProvider(InfraResourceProvider.GCP);
                    fetchAccounts()
                    fetchVpcs();
                    fetchRegions();
                    break;
                case InfraResourceProvider.AZURE:
                    dispatch(setInfraVpcs([]));
                    dispatch(setSelectedProvider(InfraResourceProvider.AZURE));
                    setLastClickedProvider(InfraResourceProvider.AZURE);
                    fetchAccounts()
                    fetchVpcs();
                    fetchRegions();
                    break;

                case InfraResourceProvider.CISCO_ISE:
                    dispatch(setInfraVpcs([]));
                    dispatch(setSelectedProvider(InfraResourceProvider.CISCO_ISE));
                    setLastClickedProvider(InfraResourceProvider.CISCO_ISE);
                    break;

                case InfraResourceProvider.ALL_PROVIDERS:
                    dispatch(setInfraVpcs([]));
                    dispatch(setSelectedProvider(InfraResourceProvider.ALL_PROVIDERS));
                    setLastClickedProvider(InfraResourceProvider.ALL_PROVIDERS);
                    break;
                default:
                    console.log(`Unhandled exception, value is ${value}`);
                    break;
            }
        }
    };

    return (
        <>
            <div style={{ marginBottom: "10px", justifyContent: "space-between" }}>
                {/* Provider buttons */}
                <div className="flex justify-end">
                    {[
                        { name: 'AWS', enum: InfraResourceProvider.AWS },
                        { name: 'GCP', enum: InfraResourceProvider.GCP },
                        { name: 'Azure', enum: InfraResourceProvider.AZURE },
                        { name: 'Cisco', enum: InfraResourceProvider.CISCO_ISE },
                        { name: 'All Providers', enum: InfraResourceProvider.ALL_PROVIDERS },
                    ].map((button) => (
                        <button
                            className={`dark:border-white dark:text-white button-blue text-lg px-3 py-2 ${selectedButton === button.enum ? 'selected' : ''}`}
                            key={button.name}
                            onClick={() => { handleProviderSelect(button.enum); onProviderButtonClick() }}
                        >
                            {button.name}
                        </button>
                    ))}
                </div>
            </div>
            {/* account id and region selection */}
            <div className="flex flex-col w-1/6">
                <select
                    value={selectedAccountId}
                    onChange={e => handleAccountIdChange(e.target.value)}
                    className="dark:bg-black select-field"
                >
                    <option value="">Select Account ID</option>
                    {accountIds.map(account => <option key={account.key} value={account.value}>{account.label}</option>)}
                </select>

                <select
                    value={selectedRegion}
                    onChange={e => handleRegionChange(e.target.value)}
                    className="dark:bg-black select-field"
                >
                    <option value="">Select Region</option>
                    {regionNames.map(region => <option key={region.key} value={region.value}>{region.label}</option>)}
                </select>

                {/* render if only on home page, vpc ids select */}
                {home && (
                    <select
                        value={selectedVpc}
                        onChange={e => handleVpcChange(e.target.value)}
                        className="dark:bg-black select-field"
                    >
                        <option value="">Select VPC</option>
                        {vpcIds.map(vpc => (
                            <option key={vpc.key} value={vpc.value}>
                                {vpc.label}
                            </option>
                        ))}
                    </select>
                )}
            </div>
        </>
    );
};

export default ProviderRegionBar;