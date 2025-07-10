import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import './IconNode.css';

// Data expected from the main graph component
interface IconNodeData {
  provider: string;
  resourceType: string;
  label: string; // Expect the label to be passed in data
  originalData?: any;
  isSelected?: boolean;  // Flag to indicate if this node is selected
}

const ICONS_BASE_PATH = '/assets/icons/';
const DEFAULT_ICON = `${ICONS_BASE_PATH}default.svg`;

const IconNode: React.FC<NodeProps<IconNodeData>> = ({ id, data, type }) => {
  // Destructure label and isSelected from data, provide fallbacks
  const { provider = 'unknown', resourceType = 'unknown', label = id, isSelected = false } = data;

  const lowerProvider = provider.toLowerCase();
  const lowerResourceType = resourceType.toLowerCase();
  const iconPath = `${ICONS_BASE_PATH}${lowerProvider}/${lowerResourceType}.svg`;

  // If the node is a group (our subnet container), render it differently.
  if (type === 'group') {
    return (
      <div className="subnet-group-node">
        <div className="subnet-group-label">{label}</div>
      </div>
    );
  }

  console.log(`IconNode ID: ${id}, Label: ${label}, Provider: ${lowerProvider}, Type: ${lowerResourceType}, Path: ${iconPath}`);

  return (
    <div className={`icon-node icon-node-${lowerProvider}-${lowerResourceType}`}>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={true}
        className="single-handle"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        isConnectable={true}
        className="single-handle"
      />

      <div className="icon-node-content">
        <img
          src={iconPath}
          alt={`${lowerResourceType} icon`}
          className="node-icon"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            console.error(`Failed to load icon at path: ${iconPath}. Falling back to default.`);
            target.src = DEFAULT_ICON;
            target.classList.add('icon-error');
          }}
        />
        {/* Use data.label for the display, and id for the title tooltip */}
        <div 
          className="node-label" 
          title={id}
          style={{ color: isSelected ? 'red' : 'inherit', fontWeight: isSelected ? 'bold' : 'normal' }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

export default memo(IconNode);