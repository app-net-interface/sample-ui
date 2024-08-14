import { useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';
import '../../css/vpc.css';
import { useFetchNetworkDomains } from "@/common/hooks";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

const ListNetworkDomain = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { fetchAllNetworkDomains } = useFetchNetworkDomains();
    const { grpcData } = useSelector((state: RootState) => state.grpcNetworkDomains);

    useEffect(() => {
        fetchAllNetworkDomains()
    }, []);

    const data = grpcData.map((item: any) => ({
        name: item.name,
        type: item.type,
        provider: item.provider,
        region: item.region,
        id: item.id,
    }));

    const filteredData: typeof data = data.filter(row =>
        row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DefaultLayout>
            <Breadcrumb pageName="List Network Domains" />
            <div className="flex justify-between">
                <div className="flex flex-col w-1/4">
                    <input
                        type="text"
                        placeholder="Search by anything"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="dark:bg-black input-field h-10"
                    />
                </div>
            </div>
            <div className="mt-3">
                <div className="table-header flex justify-between text-left text-sm font-medium text-gray-700 rounded-lg">
                    <span className="w-1/4 px-4 py-2 text-center">Name</span>
                    <span className="w-1/4 px-2 py-2 text-center">Type</span>
                    <span className="w-1/4 px-1 py-2 text-center">Provider</span>
                    <span className="w-1/4 px-1 py-2 text-center">Region</span>
                    <span className="w-1/4 px-1 py-2 text-center">ID</span>
                </div>
                <div>
                    {filteredData.map((row, idx) => (
                        <div
                            key={idx}
                            className={`dark:bg-black dark:text-white flex items-center justify-between text-left text-sm font-medium text-gray-700 bg-white rounded-lg my-2 p-4 shadow`}
                        >
                            <span className="w-1/4 px-4 py-2 flex text-center justify-center">{row.name}</span>                            <span className="w-1/4 px-4 py-2 flex text-center justify-center">{row.type.toUpperCase()}</span>
                            <span className="w-1/4 px-4 py-2 flex text-center justify-center">{row.provider}</span>
                            <span className="w-1/4 px-4 py-2 flex text-center justify-center">{row.region}</span>
                            <span className="w-1/4 px-4 py-2 flex text-center justify-center">{row.id}</span>
                        </div>
                    ))}
                </div>
            </div>
        </DefaultLayout >
    );
};

export default ListNetworkDomain;