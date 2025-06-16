// src/components/voicecall/flowchart/FlowchartEditor.tsx
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
  Position,
  Handle,
  NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Download, MessageSquare, PlayCircle, Square } from 'lucide-react'; // Added icons

// --- Type Definitions ---
export interface NodeData {
  label: string;
}
export type FlowNode = Node<NodeData>;
export type FlowEdge = Edge<{ link_info?: string }>;

// --- Custom Node: StartNode (Simplified version, or import from ./StartNode) ---
const StartNodeComponent: React.FC<NodeProps<NodeData>> = ({ data, isConnectable }) => (
  <div className="bg-green-500 text-white p-3.5 rounded-lg shadow-md flex items-center space-x-2 w-48 text-sm">
    <PlayCircle size={18} className="text-green-100" />
    <strong className="font-medium">{data.label || 'Start'}</strong>
    <Handle
      type="source"
      position={Position.Bottom}
      isConnectable={isConnectable}
      className="!bg-green-700 w-3 h-3"
      style={{ bottom: -6 }}
    />
  </div>
);

// --- Custom Node: EndNode (Import or define here if simple) ---
// Assuming EndNode.tsx content is similar to this or imported:
// import EndNodeComponent from './EndNode'; // If you have EndNode.tsx
const EndNodeComponent: React.FC<NodeProps<NodeData>> = ({ data, isConnectable }) => (
  <div className="bg-red-500 text-white p-3.5 rounded-lg shadow-md flex items-center space-x-2 w-48 text-sm">
    <Square size={18} className="text-red-100" /> {/* Using Square as a placeholder for stop */}
    <strong className="font-medium">{data.label || 'End'}</strong>
    <Handle
      type="target"
      position={Position.Top}
      isConnectable={isConnectable}
      className="!bg-red-700 w-3 h-3"
      style={{ top: -6 }}
    />
  </div>
);


const nodeTypes: NodeTypes = {
  start: StartNodeComponent,
  end: EndNodeComponent,
  // default: DefaultNode (ReactFlow provides one, or you can customize)
};

// --- Helper: Cycle Detection ---
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

// --- Helper: ID Management ---
let idCounterGlobal = 1; // Keep track of IDs globally within this module
const getNodeId = (): string => `node_${idCounterGlobal++}`;

const extractIdNumber = (id: string): number => {
  if (typeof id === 'string') {
    const parts = id.split('_');
    const numPart = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(numPart)) return numPart;
  }
  return 0; // Fallback or could throw error
};

const synchronizeIdCounterWithNodes = (flowNodes: FlowNode[]) => {
  const highestIdNum = flowNodes.reduce((maxNum, node) => {
    if (node.id && typeof node.id === 'string' && node.id.startsWith('node_')) {
      const num = extractIdNumber(node.id);
      return Math.max(maxNum, num);
    }
    return maxNum;
  }, 0);
  idCounterGlobal = highestIdNum + 1;
};

const initialNodesRaw: FlowNode[] = [
  { id: 'node_1', type: 'start', data: { label: 'Start Flow' }, position: { x: 250, y: 50 }, deletable: false },
  { id: 'node_2', type: 'end', data: { label: 'End Flow' }, position: { x: 250, y: 450 } },
];
// Synchronize counter with initial nodes once
synchronizeIdCounterWithNodes(initialNodesRaw);


// --- Placeholder FlowDataExporter (or import from ./FlowDataExporter) ---
interface FlowDataExporterProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  onImportJson: (data: { nodes: FlowNode[]; edges: FlowEdge[] }) => void;
}
const FlowDataExporter: React.FC<FlowDataExporterProps> = ({ nodes, edges, onImportJson }) => {
  const [jsonInput, setJsonInput] = useState('');
  const handleExport = () => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowchart-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const handleImport = () => {
    try {
      const parsedData = JSON.parse(jsonInput);
      if (parsedData.nodes && parsedData.edges) {
        onImportJson(parsedData);
      } else {
        alert('Invalid JSON format for flowchart data.');
      }
    } catch (error) {
      alert('Error parsing JSON: ' + (error as Error).message);
    }
  };
  return (
    <div className="space-y-4 p-1">
      <h4 className="text-md font-semibold text-gray-700">Export Flow</h4>
      <button onClick={handleExport} className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
        Export JSON
      </button>
      <hr className="my-4"/>
      <h4 className="text-md font-semibold text-gray-700">Import Flow</h4>
      <textarea
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder="Paste JSON here"
        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
      <button onClick={handleImport} className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
        Import JSON
      </button>
    </div>
  );
};

// --- Placeholder FlowChatComp (or import from ./FlowChatComp) ---
const FlowChatComp: React.FC = () => {
  return (
    <div className="p-1">
      <h4 className="text-md font-semibold text-gray-700 mb-2">Chat with Flow AI</h4>
      <p className="text-sm text-gray-600">Chat functionality for your flow (to be implemented).</p>
      {/* Add chat UI elements here */}
      <textarea placeholder="Type your message to the flow AI..." className="w-full mt-2 p-2 border rounded text-sm h-24"/>
      <button className="mt-2 px-3 py-1.5 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600">Send</button>
    </div>
  );
};


// --- Editing Popup Related ---
interface EditingConfig {
  type: 'node' | 'edge';
  element: FlowNode | FlowEdge;
}

// --- Main Flowchart Editor Content ---
interface FlowchartEditorContentProps {
  initialNodes?: FlowNode[];
  initialEdges?: FlowEdge[];
}

const FlowchartEditorContent: React.FC<FlowchartEditorContentProps> = ({
  initialNodes = initialNodesRaw,
  initialEdges = [],
}) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState<NodeData>(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState<FlowEdge>(initialEdges);

  useEffect(() => {
    // Ensure idCounter is synchronized if initialNodes are passed externally
    synchronizeIdCounterWithNodes(nodes);
  }, [nodes]);


  const [newNodeLabelInput, setNewNodeLabelInput] = useState<string>('');
  const [isEditorPopupOpen, setIsEditorPopupOpen] = useState<boolean>(false);
  const [editingConfig, setEditingConfig] = useState<EditingConfig | null>(null);
  const [popupInputText, setPopupInputText] = useState<string>('');
  const [popupLinkInfoInput, setPopupLinkInfoInput] = useState<string>('');
  const [activeFlowchartTab, setActiveFlowchartTab] = useState<'exporter' | 'chat'>('exporter');


  const { deleteElements, fitView, getNodes, getEdges: getCurrentReactFlowEdges } = useReactFlow();

  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.1, duration: 300 });
    }, 50);
    return () => clearTimeout(timer);
  }, [nodes, edges, fitView]);

  const onNodesChange: OnNodesChange = (changes) => {
    onNodesChangeInternal(changes);
  };

  const onEdgesChange: OnEdgesChange = (changes) => {
    onEdgesChangeInternal(changes);
  };

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdgeId = `edge_${params.source}_${params.target}_${Date.now()}`;
      const newEdge: FlowEdge = {
        ...params,
        id: newEdgeId,
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { link_info: '' } // Changed from linkInfo to link_info
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const isValidConnection = useCallback(
    (connection: Connection): boolean => {
      const currentNodes = getNodes(); // from useReactFlow
      const currentEdges = getCurrentReactFlowEdges(); // from useReactFlow
      const sourceNode = currentNodes.find(node => node.id === connection.source);
      const targetNode = currentNodes.find(node => node.id === connection.target);

      if (!sourceNode || !targetNode) return false;
      if (connection.source === connection.target) return false;
      if (sourceNode.type === 'end') return false; // Cannot connect from an end node
      if (targetNode.type === 'start') return false; // Cannot connect to a start node
      if (checkWouldCreateCycle(connection.source!, connection.target!, currentEdges as FlowEdge[])) {
         console.warn("Connection would create a cycle.");
         return false;
      }
      return true;
    },
    [getNodes, getCurrentReactFlowEdges] // getNodes and getEdges are stable from useReactFlow
  );

  const addNodeType = useCallback((type: 'default' | 'end' | 'start') => {
    const newNodeId = getNodeId(); // Uses the module-level getNodeId
    let label = newNodeLabelInput || '';
    if (!label) {
      if (type === 'end') label = `End ${extractIdNumber(newNodeId)}`;
      else if (type === 'start') label = `Start ${extractIdNumber(newNodeId)}`;
      else label = `Node ${extractIdNumber(newNodeId)}`;
    }
    const newNode: FlowNode = {
      id: newNodeId,
      data: { label },
      position: { x: Math.random() * 200 + 50, y: Math.random() * 150 + 50 }, // Adjusted random position
      type: type,
    };
    setNodes((nds) => nds.concat(newNode));
    setNewNodeLabelInput('');
  }, [newNodeLabelInput, setNodes]); // Removed getNodeId, extractIdNumber from deps as they are stable module funcs

  const openEditorPopup = useCallback((type: 'node' | 'edge', element: FlowNode | FlowEdge) => {
    setEditingConfig({ type, element });
    if (type === 'node') {
      setPopupInputText((element as FlowNode).data.label);
      setPopupLinkInfoInput('');
    } else {
      const edgeElement = element as FlowEdge;
      setPopupInputText(typeof edgeElement.label === 'string' ? edgeElement.label : '');
      setPopupLinkInfoInput(edgeElement.data?.link_info || '');
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
      // Close popup if the element being edited is deleted
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
  
  const handleDeleteSelected = useCallback(() => {
    const nodesToDelete = nodes.filter(node => node.selected && node.deletable !== false);
    const edgesToDelete = edges.filter(edge => edge.selected);
    
    if (nodesToDelete.length > 0 || edgesToDelete.length > 0) {
      deleteElements({ 
        nodes: nodesToDelete.map(n => ({ id: n.id })), 
        edges: edgesToDelete.map(e => ({ id: e.id })) 
      });
    }
  }, [nodes, edges, deleteElements]);

  const handleImportJson = useCallback((data: { nodes: FlowNode[]; edges: FlowEdge[] }) => {
    const validNodes = data.nodes.filter(n => n.id && n.position && n.data);
    const validEdges = data.edges.filter(e => e.id && e.source && e.target)
                              .map(edge => ({
                                ...edge,
                                markerEnd: { type: MarkerType.ArrowClosed }, // Ensure imported edges have markers
                                data: edge.data ? { link_info: edge.data.link_info || '', ...edge.data } : { link_info: '' }
                              }));

    setNodes(validNodes);
    setEdges(validEdges as FlowEdge[]); // Cast needed if FlowEdge has specific data
    synchronizeIdCounterWithNodes(validNodes); // Use module-level function
    setTimeout(() => fitView({padding: 0.1, duration: 200}), 50); // fit view after import
  }, [setNodes, setEdges, fitView]); // Removed synchronizeIdCounter from deps

  const tabButtonClasses = (isActive: boolean) =>
  `flex-1 py-2.5 px-3 text-xs font-medium text-center flex items-center justify-center space-x-1.5 transition-all duration-200 ease-in-out focus:outline-none ${
    isActive
      ? 'border-b-2 border-indigo-500 text-indigo-600 bg-white shadow-sm'
      : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-100 border-b border-transparent'
  }`;

  return (
    <div className="w-full h-full flex flex-col font-sans antialiased overflow-hidden">
      {/* Top Controls: Add Node, Delete */}
      <div className="p-3 sm:p-4 bg-slate-100 border-b border-slate-300 shadow-sm flex-shrink-0">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <input
            type="text"
            value={newNodeLabelInput}
            onChange={(e) => setNewNodeLabelInput(e.target.value)}
            placeholder="New Node Label"
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm w-full sm:max-w-xs flex-grow sm:flex-grow-0 placeholder-gray-500 text-gray-900"
          />
          <button onClick={() => addNodeType('default')} disabled={isEditorPopupOpen} className="px-3 py-1.5 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50">New Node</button>
          <button onClick={() => addNodeType('end')} disabled={isEditorPopupOpen} className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50">End Node</button>
          {/* Add Start Node Button if needed, or rely on initial start node */}
          {/* <button onClick={() => addNodeType('start')} disabled={isEditorPopupOpen} className="px-3 py-1.5 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600 disabled:opacity-50">Start Node</button> */}
          <button onClick={handleDeleteSelected} disabled={isEditorPopupOpen || (!nodes.some(n=>n.selected) && !edges.some(e=>e.selected))} className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-50">Delete Selected</button>
        </div>
      </div>

      {/* Main Area: ReactFlow Canvas + Sidebar */}
      <div className="flex flex-row flex-grow min-h-0">
        {/* ReactFlow Canvas */}
        <div className="flex-grow h-full w-2/3"> {/* Adjusted width */}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
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

        {/* Sidebar for Exporter/Chat */}
        <div className="w-1/3 h-full border-l border-gray-200 bg-gray-50 flex flex-col">
          <div className="flex border-b h-12 border-gray-300 bg-gray-100"> {/* Adjusted height */}
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
          <div className="flex-grow overflow-y-auto p-4">
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

      {/* Editor Popup Modal */}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') closeEditorPopup(); }}
              />
            </div>

            {editingConfig.type === 'edge' && (
              <div className="mt-4">
                <label htmlFor="popupLinkInfoInput" className="block text-sm font-medium text-gray-700 mb-1">
                  Link Information (Optional)
                </label>
                <textarea
                  id="popupLinkInfoInput"
                  value={popupLinkInfoInput}
                  onChange={(e) => setPopupLinkInfoInput(e.target.value)}
                  placeholder="Enter link information"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  rows={3}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); } if (e.key === 'Escape') closeEditorPopup(); }}
                />
              </div>
            )}

            <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0">
              <button type="button" onClick={closeEditorPopup} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancel</button>
              <button type="button" onClick={handleSaveEdit} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Save</button>
            </div>
            <p className="text-xs text-gray-500 mt-3">Editing ID: {editingConfig.element.id}</p>
          </div>
        </>
      )}
    </div>
  );
};


// --- Wrapper Component that includes ReactFlowProvider ---
interface FlowchartEditorProps extends FlowchartEditorContentProps {
  // No onClose needed here as the modal is handled by audiodashboard
}

const FlowchartEditor: React.FC<FlowchartEditorProps> = (props) => {
  return (
    <ReactFlowProvider>
      <FlowchartEditorContent {...props} />
    </ReactFlowProvider>
  );
};

export default FlowchartEditor;