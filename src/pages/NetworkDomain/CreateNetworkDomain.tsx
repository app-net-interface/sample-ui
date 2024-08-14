import { SetStateAction, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';
import '../../css/networkdomain.css';

// import imgs
import aws from '../../assets/images/providers/aws.png';
import azure from '../../assets/images/providers/azure.png';
import gcp from '../../assets/images/providers/gcp.png';
import ibm from '../../assets/images/providers/ibm.png';
import oracle from '../../assets/images/providers/oracle.png';
import cisco from '../../assets/images/providers/cisco.png';


const CreateNetworkDomain = () => {
    const [name, setName] = useState('');
    const [providers, setProviders] = useState('');

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const handleProviderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProviders(e.target.value);
    };

    const [selectedBox, setSelectedBox] = useState<number | null>(null);

    const boxes = [
        { id: 1, text: 'AWS', img: aws },
        { id: 2, text: 'Azure', img: azure },
        { id: 3, text: 'GCP', img: gcp },
        { id: 4, text: 'AWS GovCloud', img: aws },
        { id: 5, text: 'IBM Cloud', img: ibm },
        { id: 6, text: 'Oracle', img: oracle },
        { id: 7, text: 'Alibaba', img: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg' },
        { id: 8, text: 'Cisco ACI', img: cisco },
    ];

    const handleBoxClick = (id: number | null) => {
        setSelectedBox(id);
    };


    return (
        <DefaultLayout>
            <Breadcrumb pageName="Define Network Domains" />

            <div style={{ width: "75%" }}>
                <div style={{ backgroundColor: '#F5F5F5', padding: '10px', boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.2)', border: '1px solid #F5F5F5' }}>
                    <h1 style={{ fontWeight: 'bold', color: 'black', fontSize: '1em' }}>Name</h1>
                </div>
                <div className="text-sm text-black" style={{ backgroundColor: '#FFFFFF', paddingTop: '20px', padding: '10px', boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.2)', border: '1px solid #F5F5F5', borderTopColor: '#F0F0F0' }}>
                    <div >Name</div>
                    <input placeholder="e.g. My Network Domain" type="text" value={name} onChange={handleNameChange} style={{ width: '35%', height: '25px', padding: '5px', border: '1px solid #000000', }} />
                </div>

                <div style={{ backgroundColor: '#F5F5F5', padding: '10px', boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.2)', border: '1px solid #F5F5F5', marginTop: '20px' }}>
                    <h1 style={{ fontWeight: 'bold', color: 'black', fontSize: '1em' }}>Type and Provider</h1>
                </div>
                <div className="text-sm text-black" style={{ backgroundColor: '#FFFFFF', paddingTop: '20px', padding: '10px', boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.2)', border: '1px solid #F5F5F5', borderTopColor: '#F0F0F0' }}>
                    <div className="text-xs text-gray-500">When selecting the correct type, consider virtual private networks for isolated environments, virtual routing for advanced network segmentation, and local network segments for smaller, localized setups. Choose the provider based on your specific needs, including service reliability, integration capabilities, and cost-effectiveness.</div>
                    <input placeholder="Search providers" type="text" value={providers} onChange={handleProviderChange} style={{ width: '50%', height: '25px', padding: '5px', marginTop: '10px', marginBottom: '10px', border: '1px solid #000000', }} />
                    <div className="slider">
                        {boxes.map((box) => (
                            <div
                                key={box.id}
                                className={`box ${selectedBox === box.id ? 'selected' : ''}`}
                                onClick={() => handleBoxClick(box.id)}
                            >
                                <img src={box.img} alt={box.text} />
                                <p>{box.text}</p>
                            </div>
                        ))}
                    </div>
                    <div style={{ paddingTop: "10px" }}>
                        <select style={{ width: "40%" }}>
                            <option value="">Select an option</option>
                            <option value="option1">Option 1</option>
                            <option value="option2">Option 2</option>
                            <option value="option3">Option 3</option>
                            <option value="option4">Option 4</option>
                            <option value="option5">Option 5</option>
                        </select>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default CreateNetworkDomain;