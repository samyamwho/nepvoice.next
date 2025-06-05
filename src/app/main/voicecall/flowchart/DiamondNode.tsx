// DiamondNode.tsx
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

// This data structure should match or be compatible with your main NodeData
interface DiamondNodeData {
  label: string;
}

const DiamondNode: React.FC<NodeProps<DiamondNodeData>> = ({ data, isConnectable }) => {
  const nodeWidth = 160; // Increased width for better label fitting
  const nodeHeight = 90;  // Adjusted height

  // SVG path for the diamond, fitting within nodeWidth x nodeHeight
  const diamondPath = `M ${nodeWidth / 2} 0 
                       L ${nodeWidth} ${nodeHeight / 2} 
                       L ${nodeWidth / 2} ${nodeHeight} 
                       L 0 ${nodeHeight / 2} 
                       Z`;

  return (
    <div style={{ width: nodeWidth, height: nodeHeight, position: 'relative' }}>
      <svg
        width={nodeWidth}
        height={nodeHeight}
        viewBox={`0 0 ${nodeWidth} ${nodeHeight}`}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <path d={diamondPath} fill="#f0f8ff" stroke="#1E90FF" strokeWidth="2" />
      </svg>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '10px 20px', // More horizontal padding for diamond shape
          boxSizing: 'border-box',
          position: 'relative', 
          zIndex: 1,
          fontSize: '12px',
          color: '#333',
          wordBreak: 'break-word',
          lineHeight: '1.2',
        }}
      >
        {data.label}
      </div>
      <Handle
        type="target"
        position={Position.Top}
        id="target-top"
        style={{ background: '#555', top: -6 }} // Adjusted for visibility
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="source-right" // e.g., for "True" or "Yes"
        style={{ background: '#555', right: -6 }} // Adjusted for visibility
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom" // e.g., for "False" or "No"
        style={{ background: '#555', bottom: -6 }} // Adjusted for visibility
        isConnectable={isConnectable}
      />
      {/* Optional: Add a Left source handle if needed for more branches */}
      {/* <Handle
        type="source"
        position={Position.Left}
        id="source-left"
        style={{ background: '#555', left: -6 }}
        isConnectable={isConnectable}
      /> */}
    </div>
  );
};

export default memo(DiamondNode);