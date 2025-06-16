"use client";

import React, { useCallback, MouseEvent, useEffect, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  MiniMap,
  Node,
  Edge,
  Connection,
  useReactFlow,
  NodeTypes,
  OnNodesChange,
  OnEdgesChange,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import StartNode from './StartNode';
import EndNode from './EndNode';
import FlowDataExporter from './FlowDataExporter';
import FlowChatComp from './FlowChatComp';
import { X, Download, MessageSquare } from 'lucide-react'; // Added icons used in modal

export interface NodeData {
  label: string;
}
export type FlowNode = Node<NodeData>;
export type FlowEdge = Edge<{ link_info?: string; linkInfo?: string }>; // Ensure linkInfo is also accepted for backward compatibility during import

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

// --- Helper functions moved from audiodashboard.tsx ---
let localIdCounter = 1;
const getNextNodeIdLocal = (): string => `node_${localIdCounter++}`;

const extractIdNumberLocal = (id: string): number => {
  if (typeof id === 'string') {
    const parts = id.split('_');
    const numPart = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(numPart)) return numPart;
  }
  return 0; // Return 0 or throw error, depending on desired behavior for malformed IDs
};

const synchronizeIdCounterWithNodesLocal = (flowNodes: FlowNode[]) => {
  const highestIdNum = flowNodes.reduce((maxNum, node) => {
    if (node.id && typeof node.id === 'string' && node.id.startsWith('node_')) {
      const num = extractIdNumberLocal(node.id);
      return Math.max(maxNum, num);
    }
    return maxNum;
  }, 0);
  localIdCounter = highestIdNum + 1;
};

const initialNodesRaw: FlowNode[] = [
  { id: 'node_1', type: 'start', data: { label: 'Start Flow' }, position: { x: 250, y: 50 }, draggable: false, deletable: false },
  { id: 'node_2', type: 'end', data: { label: 'End Flow' }, position: { x: 250, y: 450 }, draggable: true },
];
// Initialize the counter based on initial nodes
synchronizeIdCounterWithNodesLocal(initialNodesRaw);
// --- End of helper functions ---


interface FlowchartContentProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  setNodes: (updater: FlowNode[] | ((nodes: FlowNode[]) => FlowNode[])) => void;
  setEdges: (updater: FlowEdge[] | ((edges: FlowEdge[]) => FlowEdge[])) => void;
  getNextNodeId: () => string; // Renamed from getNodeId for clarity
  extractIdNumber: (id: string) => number; // Renamed for clarity
}

const FlowchartContent: React.FC<FlowchartContentProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  setNodes,
  setEdges,
  getNextNodeId, // Use the passed prop
  extractIdNumber // Use the passed prop
}) => {
  const [newNodeLabelInput, setNewNodeLabelInput] = useState<string>('');
  const [isEditorPopupOpen, setIsEditorPopupOpen] = useState<boolean>(false);
  const [editingConfig, setEditingConfig] = useState<EditingConfig | null>(null);
  const [popupInputText, setPopupInputText] = useState<string>('');
  const [popupLinkInfoInput, setPopupLinkInfoInput] = useState<string>('');

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
      if (checkWouldCreateCycle(connection.source!, connection.target!, currentEdges as FlowEdge[])) {
         console.warn("Connection would create a cycle.");
         return false;
      }
      return true;
    },
    [getNodes, getCurrentReactFlowEdges]
  );

  const addNodeType = useCallback((type: 'default' | 'end') => {
    const newNodeId = getNextNodeId(); // Use prop
    let label = newNodeLabelInput || '';
    if (!label) {
      if (type === 'end') label = `End Flow ${extractIdNumber(newNodeId)}`; // Use prop
      else label = `Node ${extractIdNumber(newNodeId)}`; // Use prop
    }
    const newNode: FlowNode = {
      id: newNodeId,
      data: { label },
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      type: type,
    };
    setNodes((nds) => nds.concat(newNode));
    setNewNodeLabelInput('');
  }, [newNodeLabelInput, setNodes, getNextNodeId, extractIdNumber]);

  const openEditorPopup = useCallback((type: 'node' | 'edge', element: FlowNode | FlowEdge) => {
    setEditingConfig({ type, element });
    if (type === 'node') {
      setPopupInputText((element as FlowNode).data.label);
      setPopupLinkInfoInput('');
    } else {
      const edgeElement = element as FlowEdge;
      setPopupInputText(typeof edgeElement.label === 'string' ? edgeElement.label : '');
      setPopupLinkInfoInput(edgeElement.data?.link_info || edgeElement.data?.linkInfo || ''); // Check both
    }
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
    setPopupLinkInfoInput('');
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
        eds.map((e) => {
          if (e.id === element.id) {
            const newEdgeData: { link_info?: string } = {};
            if (popupLinkInfoInput && popupLinkInfoInput.trim() !== '') {
              newEdgeData.link_info = popupLinkInfoInput;
            }
            return {
              ...e,
              label: popupInputText,
              data: newEdgeData,
            };
          }
          return e;
        })
      );
    }
    closeEditorPopup();
  }, [editingConfig, popupInputText, popupLinkInfoInput, setNodes, setEdges, closeEditorPopup]);

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
            <button onClick={handleDeleteSelected} disabled={isEditorPopupOpen} className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed">Delete Selected</button>
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
            className="h-full w-full"
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
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Edit {editingConfig.type === 'node' ? 'Node' : 'Link'}</h3>
              <div>
                <label htmlFor="popupLabelInput" className="block text-sm font-medium text-gray-700 mb-1">
                  Label
                </label>
                <input
                  id="popupLabelInput"
                  type="text"
                  value={popupInputText}
                  onChange={(e) => setPopupInputText(e.target.value)}
                  placeholder={`Enter ${editingConfig.type} label`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-500 text-gray-900"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') closeEditorPopup(); }}
                />
              </div>

              {editingConfig.type === 'edge' && (
                <div className="mt-4">
                  <label htmlFor="popupLinkInfoInput" className="block text-sm font-medium text-gray-700 mb-1">
                    Link Information
                  </label>
                  <textarea
                    id="popupLinkInfoInput"
                    value={popupLinkInfoInput}
                    onChange={(e) => setPopupLinkInfoInput(e.target.value)}
                    placeholder="Enter link information"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-500 text-gray-900"
                    rows={3}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); } if (e.key === 'Escape') closeEditorPopup(); }}
                  />
                </div>
              )}

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


interface FlowchartEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FlowchartTab = 'exporter' | 'chat';

const FlowchartEditorModal: React.FC<FlowchartEditorModalProps> = ({ isOpen, onClose }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>(initialNodesRaw);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>([]);
  const [activeFlowchartTab, setActiveFlowchartTab] = useState<FlowchartTab>('exporter');

  // Effect to synchronize localIdCounter when component mounts or initialNodesRaw changes
  // This is already done globally once, but if initialNodesRaw were dynamic, this would be important
  useEffect(() => {
    synchronizeIdCounterWithNodesLocal(nodes); // Or initialNodesRaw if nodes are reset
  }, [nodes]); // Or on initialNodesRaw if it can change

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdgeId = `edge_${params.source}_${params.target}_${Date.now()}`;
      const newEdge: FlowEdge = {
        ...params,
        id: newEdgeId,
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { link_info: '' } // Changed from linkInfo to link_info to match FlowDataExporter expectation
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const handleImportJson = useCallback((data: { nodes: FlowNode[]; edges: FlowEdge[] }) => {
    const validNodes = data.nodes.filter(n => n.id && n.position && n.data);
    const validEdges = data.edges.filter(e => e.id && e.source && e.target)
                              .map(edge => ({
                                ...edge,
                                // Ensure data.link_info is preferred as FlowDataExporter exports it like that.
                                // It also handles old data that might have linkInfo.
                                data: edge.data ? { link_info: edge.data.link_info || edge.data.linkInfo || '', ...edge.data } : { link_info: '' }
                              }));

    setNodes(validNodes);
    setEdges(validEdges as FlowEdge[]); // Cast needed as we are ensuring data structure
    synchronizeIdCounterWithNodesLocal(validNodes);
  }, [setNodes, setEdges]);

  const tabButtonClasses = (isActive: boolean) =>
    `flex-1 py-2.5 px-3 text-xs font-medium text-center flex items-center justify-center space-x-1.5 transition-all duration-200 ease-in-out focus:outline-none ${
      isActive
        ? 'border-b-2 border-indigo-500 text-indigo-600 bg-white shadow-sm'
        : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-100 border-b border-transparent'
    }`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
        <div className="p-1 pl-3 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Flowchart Editor</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1.5 rounded-full hover:bg-gray-200 transition-colors" aria-label="Close flowchart editor">
            <X size={24} />
          </button>
        </div>
        <div className="flex flex-grow overflow-hidden">
          <div className="w-full md:w-2/3 h-full overflow-hidden">
            <ReactFlowProvider>
              <FlowchartContent
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                setNodes={setNodes}
                setEdges={setEdges}
                getNextNodeId={getNextNodeIdLocal}
                extractIdNumber={extractIdNumberLocal}
              />
            </ReactFlowProvider>
          </div>
          <div className="w-full md:w-1/3 h-full border-l border-gray-200 bg-gray-50 flex flex-col">
            <div className="flex border-b h-18 border-gray-300 bg-gray-100">
              <button
                className={tabButtonClasses(activeFlowchartTab === 'exporter')}
                onClick={() => setActiveFlowchartTab('exporter')}
              >
                <Download size={14} />
                <span>Data</span>
              </button>
              <button
                className={tabButtonClasses(activeFlowchartTab === 'chat')}
                onClick={() => setActiveFlowchartTab('chat')}
              >
                <MessageSquare size={14} />
                <span>Chat</span>
              </button>
            </div>
            <div className="flex-grow overflow-y-auto"> {/* Removed p-4 here as sub-components have it */}
              {activeFlowchartTab === 'exporter' && (
                <FlowDataExporter
                  nodes={nodes}
                  edges={edges}
                  onImportJson={handleImportJson}
                />
              )}
              {activeFlowchartTab === 'chat' && (
                <FlowChatComp />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowchartEditorModal;