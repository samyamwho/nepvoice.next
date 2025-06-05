"use client"; // IMPORTANT: Add this at the very top for App Router

import React, { useCallback, MouseEvent, useEffect, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  MiniMap,
  // MarkerType, // Not directly used in this component, but keep if Start/End Nodes use it
  Node,
  Edge,
  Connection,
  useReactFlow,
  NodeTypes,
  OnNodesChange,
  OnEdgesChange,
} from 'reactflow';
import StartNode from './StartNode'; // Assuming StartNode.tsx is in the same directory
import EndNode from './EndNode';   // Assuming EndNode.tsx is in the same directory

export interface NodeData {
  label: string;
}
export type FlowNode = Node<NodeData>;
export type FlowEdge = Edge;

const nodeTypes: NodeTypes = {
  start: StartNode,
  end: EndNode,
};

interface EditingConfig {
  type: 'node' | 'edge';
  element: FlowNode | FlowEdge;
}

const checkWouldCreateCycle = (
  sourceId: string,
  targetId: string,
  edges: FlowEdge[]
): boolean => {
  if (sourceId === targetId) return true;
  const queue: string[] = [targetId];
  const visitedInPath = new Set<string>();
  while (queue.length > 0) {
    const currentNodeId = queue.shift()!;
    if (currentNodeId === sourceId) return true;
    if (visitedInPath.has(currentNodeId)) continue;
    visitedInPath.add(currentNodeId);
    edges.forEach(edge => {
      if (edge.source === currentNodeId) queue.push(edge.target);
    });
  }
  return false;
};

interface FlowchartContentProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  setNodes: (updater: FlowNode[] | ((nodes: FlowNode[]) => FlowNode[])) => void;
  setEdges: (updater: FlowEdge[] | ((edges: FlowEdge[]) => FlowEdge[])) => void;
  getNodeId: () => string;
  extractIdNumber: (id: string) => number;
}

const FlowchartContent: React.FC<FlowchartContentProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  setNodes,
  setEdges,
  getNodeId,
  extractIdNumber
}) => {
  const [newNodeLabelInput, setNewNodeLabelInput] = useState<string>('');
  const [isEditorPopupOpen, setIsEditorPopupOpen] = useState<boolean>(false);
  const [editingConfig, setEditingConfig] = useState<EditingConfig | null>(null);
  const [popupInputText, setPopupInputText] = useState<string>('');

  const { deleteElements, fitView, getNodes, getEdges: getCurrentReactFlowEdges } = useReactFlow();

  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.1, duration: 300 });
    }, 50);
    return () => clearTimeout(timer);
  }, [nodes, edges, fitView]);

  const isValidConnection = useCallback(
    (connection: Connection): boolean => {
      const currentNodes = getNodes();
      const currentEdges = getCurrentReactFlowEdges();
      const sourceNode = currentNodes.find(node => node.id === connection.source);
      const targetNode = currentNodes.find(node => node.id === connection.target);

      if (!sourceNode || !targetNode) return false;
      if (connection.source === connection.target) return false;
      if (sourceNode.type === 'end') return false;
      if (targetNode.type === 'start') return false;
      if (checkWouldCreateCycle(connection.source!, connection.target!, currentEdges)) {
         console.warn("Connection would create a cycle.");
         return false;
      }
      return true;
    },
    [getNodes, getCurrentReactFlowEdges]
  );

  const addNodeType = useCallback((type: 'default' | 'end') => {
    const newNodeId = getNodeId();
    let label = newNodeLabelInput || '';
    if (!label) {
      if (type === 'end') label = `End Flow ${extractIdNumber(newNodeId)}`;
      else label = `Node ${extractIdNumber(newNodeId)}`;
    }
    const newNode: FlowNode = {
      id: newNodeId,
      data: { label },
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      type: type,
    };
    setNodes((nds) => nds.concat(newNode));
    setNewNodeLabelInput('');
  }, [newNodeLabelInput, setNodes, getNodeId, extractIdNumber]);

  const openEditorPopup = useCallback((type: 'node' | 'edge', element: FlowNode | FlowEdge) => {
    setEditingConfig({ type, element });
    setPopupInputText(type === 'node' ? (element as FlowNode).data.label : (typeof (element as FlowEdge).label === 'string' ? (element as FlowEdge).label as string : ''));
    setIsEditorPopupOpen(true);
  }, []);

  const onNodeClick = useCallback((_event: MouseEvent, node: FlowNode) => {
    openEditorPopup('node', node);
  }, [openEditorPopup]);

  const onEdgeClick = useCallback((_event: MouseEvent, edge: FlowEdge) => {
    openEditorPopup('edge', edge);
  }, [openEditorPopup]);

  const closeEditorPopup = useCallback(() => {
    setIsEditorPopupOpen(false);
    setEditingConfig(null);
    setPopupInputText('');
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingConfig) return;
    const { type, element } = editingConfig;
    if (type === 'node') {
      setNodes((nds) =>
        nds.map((n) => (n.id === element.id ? { ...n, data: { ...n.data, label: popupInputText } } : n))
      );
    } else if (type === 'edge') {
      setEdges((eds) =>
        eds.map((e) => (e.id === element.id ? { ...e, label: popupInputText } : e))
      );
    }
    closeEditorPopup();
  }, [editingConfig, popupInputText, setNodes, setEdges, closeEditorPopup]);

  const onNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      if (editingConfig?.type === 'node' && deletedNodes.some(n => n.id === editingConfig.element.id)) {
        closeEditorPopup();
      }
    },
    [editingConfig, closeEditorPopup]
  );

  const onEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      if (editingConfig?.type === 'edge' && deletedEdges.some(e => e.id === editingConfig.element.id)) {
        closeEditorPopup();
      }
    },
    [editingConfig, closeEditorPopup]
  );

  const onPaneClick = useCallback(() => {}, []);

  const handleDeleteSelected = useCallback(() => {
    const nodesToReallyDelete = nodes.filter(node => node.selected && node.deletable !== false);
    const selectedEdges = edges.filter(edge => edge.selected);
    if (nodesToReallyDelete.length > 0 || selectedEdges.length > 0) {
      deleteElements({ nodes: nodesToReallyDelete.map(n => ({ id: n.id })), edges: selectedEdges.map(e => ({ id: e.id })) });
    }
  }, [nodes, edges, deleteElements]);

  return (
    <>
      <div className="w-full h-full flex flex-col font-sans antialiased overflow-hidden">
        <div className="p-3 sm:p-4 bg-slate-100 border-b border-slate-300 shadow-sm flex-shrink-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <input
              type="text"
              value={newNodeLabelInput}
              onChange={(e) => setNewNodeLabelInput(e.target.value)}
              placeholder="New Node Label"
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm w-full sm:max-w-xs flex-grow sm:flex-grow-0 placeholder-gray-500 text-gray-900"
            />
            <button onClick={() => addNodeType('default')} disabled={isEditorPopupOpen} className="px-3 py-1.5 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed">New Node</button>
            <button onClick={() => addNodeType('end')} disabled={isEditorPopupOpen} className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed">End Node</button>
            <button onClick={handleDeleteSelected} disabled={isEditorPopupOpen} className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed">Delete Node</button>
          </div>
        </div>

        <div className="flex flex-row flex-grow min-h-0">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onNodesDelete={onNodesDelete}
            onEdgesDelete={onEdgesDelete}
            nodeTypes={nodeTypes}
            isValidConnection={isValidConnection}
            deleteKeyCode={['Backspace', 'Delete']}
            className="h-full w-full" // Tailwind handles this, ReactFlow provides a base class
            fitView
          >
            <Controls />
            <MiniMap nodeStrokeWidth={3} zoomable pannable />
            <Background color="#e0e0e0" gap={16} size={1} />
          </ReactFlow>
        </div>

        {isEditorPopupOpen && editingConfig && (
           <>
            <div className="fixed inset-0 backdrop-blur-sm z-40" onClick={closeEditorPopup}></div>
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl z-50 w-full max-w-sm sm:max-w-md">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Edit {editingConfig.type === 'node' ? 'Node' : 'Link'} Label</h3>
              <input
                type="text"
                value={popupInputText}
                onChange={(e) => setPopupInputText(e.target.value)}
                placeholder={`Enter ${editingConfig.type} label`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-500 text-gray-900"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') closeEditorPopup(); }}
              />
              <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0">
                <button type="button" onClick={closeEditorPopup} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto">Cancel</button>
                <button type="button" onClick={handleSaveEdit} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto">Save</button>
              </div>
              <p className="text-xs text-gray-500 mt-3">Editing {editingConfig.type === 'node' ? 'Node' : 'Link'} ID: {editingConfig.element.id}</p>
            </div>
          </>
        )}
      </div>
    </>
  );
};

interface FlowchartProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  setNodes: (updater: FlowNode[] | ((nodes: FlowNode[]) => FlowNode[])) => void;
  setEdges: (updater: FlowEdge[] | ((edges: FlowEdge[]) => FlowEdge[])) => void;
  getNodeId: () => string;
  extractIdNumber: (id: string) => number;
}

const Flowchart: React.FC<FlowchartProps> = (props) => {
  return (
    <ReactFlowProvider>
      <FlowchartContent {...props} />
    </ReactFlowProvider>
  );
};

export default Flowchart;