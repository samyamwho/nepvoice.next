import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { PlayCircle } from 'lucide-react'; // Or any icon you prefer

const StartNode: React.FC<NodeProps> = ({ data, isConnectable }) => {
  return (
    <div className="bg-green-500 text-white p-3 rounded-lg shadow-md flex items-center space-x-2 w-48">
      <PlayCircle size={20} />
      <span className="font-semibold text-sm">{data.label || 'Start'}</span>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!bg-green-700"
      />
    </div>
  );
};

export default memo(StartNode);