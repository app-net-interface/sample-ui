import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Modal from 'react-modal';
import '../../css/vpc.css';

interface LoadBalancerModalProps {
    isModalOpen: boolean;
    onRequestClose: () => void;
    selectedLoadBalancer: any;
}

const LoadBalancerModal: React.FC<LoadBalancerModalProps> = ({ isModalOpen, onRequestClose, selectedLoadBalancer }) => {
    const [selectedTab, setSelectedTab] = useState(1);
    const [showCopiedPopup, setShowCopiedPopup] = useState(false);

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setShowCopiedPopup(true);
        setTimeout(() => setShowCopiedPopup(false), 2000);
    };

    const renderTagsTable = (tags: { [key: string]: string } | undefined) => {
        if (tags && Object.keys(tags).length > 0) {
            return (
                <>
                    <p className="text-sm">Click to copy a (tag, value) pair.</p>
                    <table className="text-sm mt-3" style={{ padding: '10px', boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.2)', border: '1px solid #F5F5F5', width: "100%" }}>
                        <thead style={{ backgroundColor: "rgb(245, 245, 245)" }}>
                            <tr>
                                <th className="p-2 text-left">Tag</th>
                                <th className="p-2 text-left">Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(tags).map(([key, value], index) => (
                                <tr key={index} className="even:bg-gray-100 cursor-pointer hover:bg-gray-200" onClick={() => handleCopyToClipboard(`${key}: ${value}`)}>
                                    <td className="p-2">{key}</td>
                                    <td className="p-2">{String(value)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            );
        } else {
            return <p className="mt-2 text-sm">No tags available.</p>;
        }
    };

    return (
        <Modal
            isOpen={isModalOpen}
            shouldCloseOnOverlayClick={false}
            onRequestClose={onRequestClose}
            style={{
                overlay: { backgroundColor: 'transparent', pointerEvents: 'none' },
                content: {
                    position: 'absolute',
                    top: '7%',
                    left: '65%',
                    right: '0%',
                    bottom: '0%',
                    overflow: 'auto',
                    borderRadius: '4px',
                    outline: 'none',
                    padding: '20px',
                    zIndex: 1000,
                    pointerEvents: 'auto',
                }
            }}
        >
            <button className="modal-close-button" onClick={onRequestClose}>
                Close
            </button>

            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
                style={{ textAlign: 'left', marginTop: '50px' }}
            >
                {selectedLoadBalancer ? (
                    <>
                        <div style={{ backgroundColor: '#F5F5F5', padding: '10px', boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.2)', border: '1px solid #F5F5F5' }}>
                            <h1 style={{ fontWeight: 'bold', color: 'black', fontSize: '1em' }}>Resource summary for {selectedLoadBalancer.name || 'Load Balancer'} ({selectedLoadBalancer.id})</h1>
                        </div>
                        <div style={{ backgroundColor: '#FFFFFF', padding: '10px', boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.2)', border: '1px solid #F5F5F5', borderTopColor: '#F0F0F0' }}>
                            <div className="grid grid-cols-3 gap-5 text-sm ml-1">
                                <div className="text-gray-400 mt-5">
                                    Load Balancer ID
                                    <div className="text-black">{selectedLoadBalancer.id}</div>
                                </div>
                                <div className="text-gray-400 mt-5">
                                    Primary IP Address
                                    <div className="text-black">{selectedLoadBalancer.ipAddress || "N/A"}</div>
                                </div>
                                <div className="text-gray-400 mt-5">
                                    Public IP Address
                                    <div className="text-black">{selectedLoadBalancer.publicIpAddress || "N/A"}</div>
                                </div>
                                <div className="text-gray-400 mt-5">
                                    Private IP Address
                                    <div className="text-black">{selectedLoadBalancer.privateIpAddress || "N/A"}</div>
                                </div>
                                <div className="text-gray-400 mt-5">
                                    Type
                                    <div className="text-black">{selectedLoadBalancer.type || "N/A"}</div>
                                </div>
                                <div className="text-gray-400 mt-5">
                                    State
                                    <div className="text-black">{selectedLoadBalancer.state || "N/A"}</div>
                                </div>
                                <div className="text-gray-400 mt-5">
                                    VPC ID
                                    <div className="text-black">{selectedLoadBalancer.vpcId || "N/A"}</div>
                                </div>
                                <div className="text-gray-400 mt-5">
                                    Region
                                    <div className="text-black">{selectedLoadBalancer.region || "N/A"}</div>
                                </div>
                                <div className="text-gray-400 mt-5">
                                    Project
                                    <div className="text-black">{selectedLoadBalancer.project || "N/A"}</div>
                                </div>
                                <div className="text-gray-400 mt-5">
                                    Provider
                                    <div className="text-black">{selectedLoadBalancer.provider || "N/A"}</div>
                                </div>
                                {selectedLoadBalancer.selfLink && (
                                <div className="text-gray-400 mt-5">
                                    Self Link
                                    <div className="text-blue-500 hover:text-blue-400" >
                                        <a target="_blank" href={selectedLoadBalancer.selfLink} rel="noopener noreferrer">Click Here</a>
                                    </div>
                                </div>
                                )}
                            </div>
                        </div>

                        <div className="flex text-black-900 font-semibold text-sm" style={{ backgroundColor: '#F5F5F5', padding: '10px', boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.2)', border: '1px solid #F5F5F5' }}>
                            <div className={`flex-1 text-center border-r border-gray-400 cursor-pointer px-2 ${selectedTab === 1 ? 'pb-2 border-b-2 border-black' : ''}`} onClick={() => setSelectedTab(1)}>Tags</div>
                            <div className={`flex-1 text-center cursor-pointer px-2 ${selectedTab === 2 ? 'pb-2 border-b-2 border-black' : ''}`} onClick={() => setSelectedTab(2)}>Listeners</div>
                        </div>
                        <div style={{ backgroundColor: '#FFFFFF', padding: '10px', boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.2)', border: '1px solid #F5F5F5' }}>
                            {selectedTab === 1 && (
                                <div>
                                    <h2 className="text-black font-semibold">Tag Information</h2>
                                    {renderTagsTable(selectedLoadBalancer.tags || selectedLoadBalancer.labels)}
                                </div>
                            )}
                            {selectedTab === 2 && (
                                <div>
                                    <h2 className="text-black font-semibold">Listener Information</h2>
                                    {selectedLoadBalancer.listeners && selectedLoadBalancer.listeners.length > 0 ? (
                                        <table className="text-sm mt-3" style={{ padding: '10px', boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.2)', border: '1px solid #F5F5F5', width: "100%" }}>
                                            <thead style={{ backgroundColor: "rgb(245, 245, 245)" }}>
                                                <tr>
                                                    <th className="p-2 text-left">Protocol</th>
                                                    <th className="p-2 text-left">Port</th>
                                                    <th className="p-2 text-left">Target</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedLoadBalancer.listeners.map((listener: any, index: number) => (
                                                    <tr key={index} className="even:bg-gray-100">
                                                        <td className="p-2">{listener.protocol || 'N/A'}</td>
                                                        <td className="p-2">{listener.port || 'N/A'}</td>
                                                        <td className="p-2">{listener.target || 'N/A'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="mt-2 text-sm">No listener information available.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <p style={{ color: 'red' }}>An error has occurred. Please select a resource to view details.</p>
                )}
            </motion.div>
            {showCopiedPopup && (
                <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: '#333', color: 'white', padding: '10px 20px', borderRadius: '5px', zIndex: 2000 }}>
                    Copied to clipboard!
                </div>
            )}
        </Modal>
    );
};

export default LoadBalancerModal;
