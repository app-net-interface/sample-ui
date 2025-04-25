import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import './IconNode.css';

// Data expected from the main graph component
interface IconNodeData {
  provider: string;
  resourceType: string;
  // We don't strictly need 'label' here anymore if we use node.id
  // Keep originalData if needed for click handlers etc.
  originalData?: any;
}

const ICONS_BASE_PATH = '/assets/icons/'; // <-- Make sure this starts with '/' for public folder
const DEFAULT_ICON = `${ICONS_BASE_PATH}default.svg`;

const IconNode: React.FC<NodeProps<IconNodeData>> = ({ id, data }) => {
  const { provider = 'unknown', resourceType = 'unknown' } = data;

  // Ensure provider and resourceType are lowercase before constructing path
  const lowerProvider = provider.toLowerCase();
  const lowerResourceType = resourceType.toLowerCase();
  const iconPath = `${ICONS_BASE_PATH}${lowerProvider}/${lowerResourceType}.svg`;

  // *** Add Log Here ***
  console.log(`IconNode ID: ${id}, Provider: ${lowerProvider}, Type: ${lowerResourceType}, Path: ${iconPath}`);

  return (
    <div className={`icon-node icon-node-${lowerProvider}-${lowerResourceType}`}>
      {/* Ensure BOTH handles are present */}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={true}
        className="single-handle" // Use a specific class
      />
      <Handle
        type="target"
        position={Position.Bottom}
        isConnectable={true}
        className="single-handle" // Use the same specific class
      />

      <div className="icon-node-content">
        <img
          src={iconPath} // Use the generated path
          alt={`${lowerResourceType} icon`}
          className="node-icon"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            // Log the error path before falling back
            console.error(`Failed to load icon at path: ${iconPath}. Falling back to default.`);
            target.src = DEFAULT_ICON;
            target.classList.add('icon-error');
          }}
        />
        <div className="node-label" title={id}>{id}</div>
      </div>
    </div>
  );
};

export default memo(IconNode);