import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Modal from 'react-modal';
import '../../css/vpc.css';


interface ModalComponentProps {
    isModalOpen: boolean;
    onRequestClose: () => void;
    selectedRow: any; // Replace 'any' with the type of your selected row
}

const ModalComponent: React.FC<ModalComponentProps> = ({ isModalOpen, onRequestClose, selectedRow }) => {

    const [selectedTab, setSelectedTab] = useState(1);

    return (

        // Modal component
        <Modal
            isOpen={isModalOpen}
            onRequestClose={onRequestClose}
            style={{
                overlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                content: {
                    position: 'absolute',
                    top: '7%',
                    left: '50%',
                    right: '0',
                    bottom: '0%',
                    overflow: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    borderRadius: '4px',
                    outline: 'none',
                    padding: '20px',
                    zIndex: 1000,
                }
            }}
        >

            {/* close button */}
            <button
                className="modal-close-button"
                onClick={onRequestClose}
            >
                Close
            </button>


            {/* modal content */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
                style={{ textAlign: 'left', marginTop: '50px' }} // Align text to the left
            >
                {selectedRow ? (
                    <>
                        <div style={{ backgroundColor: '#F5F5F5', padding: '10px', boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.2)', border: '1px solid #F5F5F5' }}>
                            <h1 style={{ fontWeight: 'bold', color: 'black', fontSize: '1em' }}>Resource summary for {selectedRow.accountId} ({selectedRow.name})</h1>
                            <p className="text-sm">Updated about 8 hours ago</p>
                        </div>
                        <div style={{ backgroundColor: '#FFFFFF', padding: '10px', boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.2)', border: '1px solid #F5F5F5', borderTopColor: '#F0F0F0' }}>
                            <div className="grid grid-cols-3 gap-5 text-sm ml-1">
                                <div className="text-gray-400 mt-2">
                                    IPv4 CIDR
                                    <div className="text-black" >
                                        Information
                                    </div>
                                </div>
                                <div className="text-gray-400 mt-2">
                                    IPv6 CIDR
                                    <div className="text-black" >
                                        Information
                                    </div>
                                </div>
                                <div className="text-gray-400 mt-2">
                                    Labels
                                    <div className="text-black" >
                                        Information
                                    </div>
                                </div>
                                <div className="text-gray-400 mt-5">
                                    Compliant Tags
                                    <div className="text-black" >
                                        Information
                                    </div>
                                </div>
                                <div className="text-gray-400 mt-5">
                                    Notify Account Owner
                                    <div className="text-black" >
                                        Information
                                    </div>
                                </div>
                                <div className="text-gray-400 mt-5">
                                    Item 1
                                    <div className="text-black" >
                                        Information
                                    </div>
                                </div>
                                <div className="text-gray-400 mt-5">
                                    Hostname Type
                                    <div className="text-black" >
                                        Information
                                    </div>
                                </div>
                                <div className="text-gray-400 mt-5">
                                    VPC ID
                                    <div className="text-black" >
                                        Information
                                    </div>
                                </div>
                                <div className="text-gray-400 mt-5">
                                    Resource type
                                    <div className="text-black" >
                                        Information
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex text-black-900 font-semibold text-sm" style={{ backgroundColor: '#F5F5F5', padding: '10px', boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.2)', border: '1px solid #F5F5F5' }}>
                            <div className={`flex-1 text-center border-r border-gray-400 cursor-pointer px-2 ${selectedTab === 1 ? 'pb-2 border-b-2 border-black' : ''}`} onClick={() => setSelectedTab(1)}>Nodes</div>
                            <div className={`flex-1 text-center border-r border-gray-400 cursor-pointer px-2 ${selectedTab === 2 ? 'pb-2 border-b-2 border-black' : ''}`} onClick={() => setSelectedTab(2)}>Pods</div>
                            <div className={`flex-1 text-center border-r border-gray-400 cursor-pointer px-2 ${selectedTab === 3 ? 'pb-2 border-b-2 border-black' : ''}`} onClick={() => setSelectedTab(3)}>Services</div>
                            <div className={`flex-1 text-center cursor-pointer px-2 ${selectedTab === 4 ? 'pb-2 border-b-2 border-black' : ''}`} onClick={() => setSelectedTab(4)}>Namespaces</div>
                        </div>
                        <div style={{ backgroundColor: '#FFFFFF', padding: '10px', boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.2)', border: '1px solid #F5F5F5' }}>
                            {selectedTab === 1 &&
                                <div>
                                    <h2 className="text-black font-semibold">Node Information</h2>
                                    <div className="flex grid grid-cols-2">
                                        <div className="flex justify-between pb-100">
                                            <div className="text-gray-400 mt-2">
                                                <div className="text-black" >
                                                    Instance 1: Offline
                                                </div>
                                            </div>
                                            <div className="text-gray-400 mt-2">
                                                <div className="text-black" >
                                                    Instance 2: Online
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                            {selectedTab === 2 &&
                                <div>
                                    <h2 className="text-black font-semibold">Pod Information</h2>

                                </div>}
                            {selectedTab === 3 &&
                                <div>
                                    <h2 className="text-black font-semibold">Services Information</h2>
                                </div>
                            }
                            {selectedTab === 4 &&
                                <div>
                                    <h2 className="text-black font-semibold">Namespaces Information</h2>
                                </div>
                            }
                        </div>
                    </>
                ) : (
                    <p style={{ color: 'red' }}>An error has occured. Please refresh your page.</p>
                )}
            </motion.div>
        </Modal>
    );
};

export default ModalComponent;