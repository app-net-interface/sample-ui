import React from 'react';
// import Modal from 'react-modal';
import '../../css/vpc.css';
import { OverlapGroup } from '../../common/utils/overlappedCidr';

interface ModalComponentProps {
  isModalOpen: boolean;
  onRequestClose: () => void;
  overlappingCIDRs: OverlapGroup[];
}

const CIDROverlapModal: React.FC<ModalComponentProps> = ({ isModalOpen, onRequestClose, overlappingCIDRs }) => {
  console.log('CIDROverlapModal received overlappingCIDRs:', overlappingCIDRs);

  if (!isModalOpen) return null;

  return (
    <div className="inline-modal-container" style={{
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '20px',
      margin: '20px',
      backgroundColor: '#fff'
    }}>
      {/* close button */}
      <button className="modal-close-button" onClick={onRequestClose}>Close</button>
      
      {/* modal header */}
      <h1 className="text-xl font-bold my-4">Overlapping CIDRs</h1>
      
      <div>
        {overlappingCIDRs.map((group, index) => (
          <div key={index} className="mb-6 p-4 border rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Overlap Group {index + 1}</h2>
            <p><strong>IP Range:</strong> {group.startIP} - {group.endIP}</p>
            <div className="mt-2">
              <h3 className="font-semibold">CIDRs</h3>
              <ul>
                {group.entries.map((entry, cIndex) => (
                  <li key={cIndex}>{entry.cidr} ({entry.provider} | {entry.accountId} | {entry.vpcId} | {entry.vpcName})</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CIDROverlapModal;
