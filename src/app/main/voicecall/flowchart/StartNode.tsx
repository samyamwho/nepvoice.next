import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const StartNode: React.FC<NodeProps> = ({ data, isConnectable }) => {
  return (
    <div className="bg-white text-black p-3 rounded-lg shadow-md flex items-center justify-center">
      <span className="font-semibold text-sm">{data.label || 'Start'}</span>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!bg-gray-400"
      />
    </div>
  );
};

export default memo(StartNode);