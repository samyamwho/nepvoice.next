'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Node, Edge, MarkerType } from 'reactflow';
interface NodeData {
  label: string;
}
type FlowNode = Node<NodeData>;
type FlowEdge = Edge;

interface FlowDataExporterProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  onImportJson: (data: { nodes: FlowNode[]; edges: FlowEdge[] }) => void;
}

const FlowDataExporter: React.FC<FlowDataExporterProps> = ({ nodes, edges, onImportJson }) => {
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const generateCurrentFlowJson = useCallback(() => {
    const flowData = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
        width: node.width,
        height: node.height,
        selected: node.selected,
        positionAbsolute: node.positionAbsolute,
        dragging: node.dragging,
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        type: edge.type,
        markerEnd: edge.markerEnd,
        selected: edge.selected,
      })),
    };
    return JSON.stringify(flowData, null, 2);
  }, [nodes, edges]);

  // useEffect now solely responsible for updating jsonOutput on flow changes
  useEffect(() => {
    setJsonOutput(generateCurrentFlowJson());
    setError(null);
  }, [nodes, edges, generateCurrentFlowJson]);

  const handleApplyJsonChanges = useCallback(() => {
    try {
      setError(null);
      const parsedData = JSON.parse(jsonOutput);

      if (!parsedData || !Array.isArray(parsedData.nodes) || !Array.isArray(parsedData.edges)) {
        throw new Error("Invalid JSON structure. Expected 'nodes' and 'edges' arrays.");
      }

      parsedData.nodes.forEach((node: any) => {
        // Basic validation for required properties in nodes
        if (typeof node.id === 'undefined' || typeof node.position === 'undefined' || typeof node.data === 'undefined') {
          throw new Error(`Node with ID '${node.id || 'unknown'}' is missing required properties (id, position, data).`);
        }
      });
      parsedData.edges.forEach((edge: any) => {
        // Basic validation for required properties in edges
        if (typeof edge.id === 'undefined' || typeof edge.source === 'undefined' || typeof edge.target === 'undefined') {
          throw new Error(`Edge with ID '${edge.id || 'unknown'}' is missing required properties (id, source, target).`);
        }
      });

      onImportJson(parsedData as { nodes: FlowNode[]; edges: FlowEdge[] });
      alert('JSON data applied to the flow!');
    } catch (e: unknown) {
      let errorMessage = 'An unknown error occurred.';
      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e === 'string') {
        errorMessage = e;
      }
      setError(`Error applying JSON: ${errorMessage}`);
      alert(`Failed to apply JSON: ${errorMessage}. See console for details.`);
      console.error('Error applying JSON:', e);
    }
  }, [jsonOutput, onImportJson]);

  const handleCopy = useCallback(() => {
    if (jsonOutput) {
      navigator.clipboard.writeText(jsonOutput)
        .then(() => alert('JSON data copied to clipboard!'))
        .catch((err: unknown) => {
          let errorMessage = 'An unknown error occurred.';
          if (err instanceof Error) {
            errorMessage = err.message;
          } else if (typeof err === 'string') {
            errorMessage = err;
          }
          alert(`Failed to copy JSON: ${errorMessage}. See console for details.`);
          console.error('Failed to copy JSON:', err);
        });
    }
  }, [jsonOutput]);

  const handleLoadExampleFlow = useCallback(() => {
    const exampleNodes: FlowNode[] = [
      {
        id: 'node_100',
        type: 'start',
        data: { label: 'Example Start' },
        position: { x: 150, y: 50 },
        draggable: true,
        deletable: false,
      },
      {
        id: 'node_101',
        type: 'default',
        data: { label: 'Process Step A' },
        position: { x: 150, y: 200 },
        draggable: true,
      },
      {
        id: 'node_102',
        type: 'default',
        data: { label: 'Process Step B' },
        position: { x: 350, y: 200 },
        draggable: true,
      },
      {
        id: 'node_103',
        type: 'end',
        data: { label: 'Example End' },
        position: { x: 250, y: 350 },
        draggable: true,
      },
    ];

    const exampleEdges: FlowEdge[] = [
      {
        id: 'edge_100_101',
        source: 'node_100',
        target: 'node_101',
        label: 'Start -> A',
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      {
        id: 'edge_101_103',
        source: 'node_101',
        target: 'node_103',
        label: 'A -> End',
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      {
        id: 'edge_100_102',
        source: 'node_100',
        target: 'node_102',
        label: 'Start -> B',
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      {
        id: 'edge_102_103',
        source: 'node_102',
        target: 'node_103',
        label: 'B -> End',
        markerEnd: { type: MarkerType.ArrowClosed },
      },
    ];

    onImportJson({ nodes: exampleNodes, edges: exampleEdges });
    alert('Example flow loaded!');
  }, [onImportJson]);

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-700 overflow-hidden">
      <div className="p-3 sm:p-4 flex-shrink-0 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Edit/Export Flow Data</h3>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handleLoadExampleFlow}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            Load Example Flow
          </button>
          {jsonOutput && (
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              Copy JSON
            </button>
          )}
          <button
            onClick={handleApplyJsonChanges}
            disabled={!jsonOutput}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            Apply JSON to Flow
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 sm:p-4 bg-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex-grow flex flex-col min-h-0 p-3 sm:p-4">
        <textarea
          value={jsonOutput}
          onChange={(e) => {
            setJsonOutput(e.target.value);
            if (error) setError(null);
          }}
          className={`w-full flex-grow min-h-0 p-3 border rounded-md shadow-sm text-sm bg-white text-slate-800 focus:ring-indigo-500 focus:border-indigo-500 resize-none ${error ? 'border-red-500' : 'border-slate-300'}`}
          placeholder="JSON data can be edited here..."
          aria-label="Editable JSON data for the flow"
        />
      </div>
    </div>
  );
};

export default FlowDataExporter;