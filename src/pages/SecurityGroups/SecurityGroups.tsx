import { useState, useEffect } from "react";
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';
import '../../css/vpc.css';

// new 
import ProviderButtons from '@/components/ProviderRegion/ProviderRegionBar';
import { useSelector } from "react-redux";
import { useFetchVpcResourceSecurityGroups } from "@/common/hooks";
import { RootState } from "@/store/store";

const SecurityGroups = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const { selectedProvider, selectedAccountId } = useSelector((state: RootState) => state.selectedResources);
    const { vpcResourceSecurityGroups, fetchVpcResourceSecurityGroups } = useFetchVpcResourceSecurityGroups(selectedProvider, '', '', selectedAccountId);

    useEffect(() => {
        fetchVpcResourceSecurityGroups();
    }, [fetchVpcResourceSecurityGroups]);

    console.log("INFO: " + vpcResourceSecurityGroups);

    const info = vpcResourceSecurityGroups.map(sg => ({
        provider: sg.provider,
        accountId: sg.accountId,
        name: sg.name || '',
        region: sg.region,
        vpcId: sg.vpcId,
        labels: sg["labels"],
    }));

    console.log("INFO 2: " + info);


    // search function, id/name
    // const sgSearch: typeof info = info.filter(sg =>
    //     sg.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //     sg.name.toLowerCase().includes(searchTerm.toLowerCase())
    // );

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Security Groups View - Infrastructure Resources" />
            <div className="flex justify-between">
                <div className="flex flex-col w-1/4">
                    <input
                        type="text"
                        placeholder="Search by name or ID"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="input-field dark:bg-black"
                    />
                </div>
                <ProviderButtons onProviderButtonClick={() => { }}></ProviderButtons>
            </div>
            {/* table start */}
            <div className="mt-3">
                {/* header */}
                <div className="table-header flex justify-between text-left text-sm font-medium text-gray-700 rounded-lg">
                    <span className="w-1/4 px-4 py-2 text-center">Name</span>
                    <span className="w-1/4 px-2 py-2 text-center">ID</span>
                    <span className="w-1/4 px-1 py-2 text-center">Provider</span>
                    <span className="w-1/4 px-1 py-2 text-center">Account ID</span>
                    <span className="w-1/4 px-1 py-2 text-center">Region</span>
                    <span className="w-1/4 px-1 py-2 text-center">VPC ID</span>
                    <span className="w-1/4 px-1 py-2 text-center">Labels</span>
                </div>
                {/* table body */}
                <div>
                    {/* {sgSearch.map((sg, idx) => (
                        <div
                            key={idx}
                            className={`dark:bg-black dark:text-white flex items-center justify-between text-left text-sm font-medium text-gray-700 bg-white rounded-lg my-2 p-4 shadow`}
                        >
                            <span className="w-1/4 px-4 py-2 flex text-center justify-center">{sg.id}</span>
                            <span className="w-1/4 px-4 py-2 flex text-center justify-center">{sg.accountId}</span>
                            <span className="w-1/4 px-4 py-2 flex text-center justify-center">{sg.name}</span>
                            <span className="w-1/4 px-4 py-2 flex text-center justify-center">{sg.region}</span>
                        </div>
                    ))} */}
                </div>
            </div>
            {/* table end */}
        </DefaultLayout>
    );
};

export default SecurityGroups;
