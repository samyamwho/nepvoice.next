import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface NodeData {
  label: string;
}

const StartNode: React.FC<NodeProps<NodeData>> = ({ data, isConnectable }) => {
  return (
    
    <div className="px-4 py-2 shadow-md rounded-md bg-white border border-gray-300 text-gray-800 text-center flex flex-col items-center justify-center min-w-[120px] min-h-[40px] ">
      <div className="text-sm font-semibold truncate">
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        id="a"
        className="react-flow__handle"
      />
    </div>
  );
};

export default memo(StartNode);