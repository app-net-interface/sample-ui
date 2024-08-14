import { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';
import ModalComponent from '../../components/Modal/KubernetesModal';
import ProviderRegionBar from '@/components/ProviderRegion/ProviderRegionBar';

const clusters = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');

    const data = [
        {
            id: 1,
            name: 'Cluster-1',
            fullName: 'Full Cluster-1',
            arn: 'arn:aws:eks:us-west-1:123456789012:cluster/Cluster-1',
            region: 'us-west-1',
            vpcId: 'vpc-0abcd1234efgh5678',
            provider: 'AWS',
            accountId: '123456789012',
            labels: 'Label1'
        },
        {
            id: 2,
            name: 'Cluster-2',
            fullName: 'Full Cluster-2',
            arn: 'arn:aws:eks:us-west-2:123456789012:cluster/Cluster-2',
            region: 'us-west-2',
            vpcId: 'vpc-0abcd1234efgh5678',
            provider: 'AWS',
            accountId: '123456789012',
            labels: 'Label2'
        },
        {
            id: 3,
            name: 'Cluster-3',
            fullName: 'Full Cluster-3',
            arn: 'arn:aws:eks:us-east-1:123456789012:cluster/Cluster-3',
            region: 'us-east-1',
            vpcId: 'vpc-0abcd1234efgh5678',
            provider: 'AWS',
            accountId: '123456789012',
            labels: 'Label3'
        },
    ]

    const filteredData: typeof data = data.filter(row =>
        row.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedAccountId ? row.accountId === selectedAccountId : true) &&
        (selectedRegion ? row.region === selectedRegion : true)
    );


    return (
        <DefaultLayout>
            <Breadcrumb pageName="Kubernetes Clusters Across All Providers" />

            <div className="flex justify-between">
                <div className="flex flex-col w-1/4">
                    <input
                        type="text"
                        placeholder="Search by name"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="dark:bg-black input-field"
                    />
                </div>
                <ProviderRegionBar onProviderButtonClick={() => { }}></ProviderRegionBar>
            </div>

            <div className="mt-3">
                <div>
                    <div className="table-header flex justify-between text-left text-sm font-medium text-gray-700 rounded-lg">
                        <span className="w-1/4 px-4 py-2 text-center">Name</span>
                        <span className="w-1/4 px-2 py-2 text-center">Fullname</span>
                        <span className="w-1/4 px-1 py-2 text-center">ARN</span>
                        <span className="w-1/4 px-1 py-2 text-center">Region</span>
                        <span className="w-1/4 px-1 py-2 text-center">VPC ID</span>
                        <span className="w-1/4 px-1 py-2 text-center">Provider</span>
                        <span className="w-1/4 px-1 py-2 text-center">Account ID</span>
                        <span className="w-1/4 px-1 py-2 text-center">Labels</span>
                    </div>
                    <div>
                        {filteredData.map((vpc, idx) => (
                            <div
                                key={idx}
                                className={`dark:bg-black dark:text-white flex items-center justify-between text-left text-xs font-medium bg-white text-gray-700 rounded-lg my-2 p-2 shadow`} // Adjusted font size and padding
                            >
                                <span className="w-1/4 px-2 py-1 flex text-center justify-center">{vpc.name}</span>
                                <span className="w-1/4 px-2 py-1 flex text-center justify-center">{vpc.fullName}</span>
                                <span className="w-1/4 px-2 py-1 flex text-center justify-center">{vpc.arn}</span>
                                <span className="w-1/4 px-2 py-1 flex text-center justify-center">{vpc.region}</span>
                                <span className="w-1/4 px-2 py-1 flex text-center justify-center">{vpc.vpcId}</span>
                                <span className="w-1/4 px-2 py-1 flex text-center justify-center">{vpc.provider}</span>
                                <span className="w-1/4 px-2 py-1 flex text-center justify-center">{vpc.accountId}</span>
                                <span className="w-1/4 px-2 py-1 flex text-center justify-center">{vpc.labels}</span>
                            </div>
                        ))}
                    </div>
                </div >
            </div>
        </DefaultLayout>
    );
};

export default clusters;
