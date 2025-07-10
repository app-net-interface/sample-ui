import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const SubnetContainerNode = ({ data, selected }: NodeProps) => {
  const { label, childNodes, isSourceVpc } = data;
  
  // Color based on whether this is source or destination VPC
  const color = isSourceVpc ? '#3585e2' : '#e23535';
  
  return (
    <div 
      className="subnet-container" 
      style={{
        border: `1px dashed ${color}`,
        borderRadius: '8px',
        padding: '20px 10px 10px 10px',
        backgroundColor: `${color}10`,
        minWidth: '200px',
        minHeight: '100px',
        position: 'relative'
      }}
    >
      <div 
        className="subnet-header" 
        style={{
          position: 'absolute',
          top: '-10px',
          left: '10px',
          backgroundColor: color,
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        {label}
      </div>
      
      <div 
        className="subnet-content" 
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'center'
        }}
      >
        {childNodes?.map((childNode: any) => (
          <div 
            key={childNode.id} 
            className="instance-node" 
            style={{
              border: `1px solid ${color}`,
              borderRadius: '4px',
              padding: '5px',
              backgroundColor: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: '11px',
              width: '70px',
              height: '70px'
            }}
            title={childNode.label}
          >
            <img 
              src={childNode.icon || '/icons/generic.svg'} 
              alt={childNode.resourceType || 'resource'} 
              width="32" 
              height="32" 
              style={{ marginBottom: '5px' }}
            />
            <div style={{ 
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              width: '100%'
            }}>
              {childNode.label}
            </div>
          </div>
        ))}
      </div>
      
      {/* Connection points */}
      <Handle type="target" position={Position.Top} style={{ background: color }} />
      <Handle type="source" position={Position.Bottom} style={{ background: color }} />
      <Handle type="target" position={Position.Left} style={{ background: color }} />
      <Handle type="source" position={Position.Right} style={{ background: color }} />
    </div>
  );
};

export default memo(SubnetContainerNode);