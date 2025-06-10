'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Node, Edge, MarkerType } from 'reactflow';
import { Copy } from 'lucide-react';

interface NodeData {
  label: string;
}
type FlowNode = Node<NodeData>;

interface EdgeDataWithLinkInfo {
  link_info?: string;
  [key: string]: any;
}
type FlowEdge = Edge<EdgeDataWithLinkInfo>;

interface FlowDataExporterProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  onImportJson: (data: { nodes: FlowNode[]; edges: FlowEdge[] }) => void;
  // Optional: Add a prop for the test call handler if you want to pass it from parent
  // onTestCall?: (flowData: { nodes: FlowNode[]; edges: FlowEdge[] }) => void;
}

const FlowDataExporter: React.FC<FlowDataExporterProps> = ({
  nodes,
  edges,
  onImportJson,
  // onTestCall // Uncomment if you add the prop
}) => {
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
      })),
      edges: edges.map(edge => {
        const edgeDataForOutput: { link_info: string } | undefined =
          (edge.data && typeof edge.data.link_info === 'string')
            ? { link_info: edge.data.link_info }
            : undefined;

        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          type: edge.type,
          markerEnd: edge.markerEnd,
          selected: edge.selected,
          data: edgeDataForOutput,
        };
      }),
    };
    return JSON.stringify(flowData, null, 2);
  }, [nodes, edges]);

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

      parsedData.nodes.forEach((node: any, index: number) => {
        if (typeof node.id === 'undefined' || typeof node.position === 'undefined' || typeof node.data === 'undefined') {
          throw new Error(`Node at index ${index} (ID: '${node.id || 'unknown'}') is missing required properties (id, position, data).`);
        }
      });
      parsedData.edges.forEach((edge: any, index: number) => {
        if (typeof edge.id === 'undefined' || typeof edge.source === 'undefined' || typeof edge.target === 'undefined') {
          throw new Error(`Edge at index ${index} (ID: '${edge.id || 'unknown'}') is missing required properties (id, source, target).`);
        }
        if (edge.data && typeof edge.data.link_info !== 'undefined' && typeof edge.data.link_info !== 'string') {
          throw new Error(`Edge with ID '${edge.id}' has 'data.link_info' but it's not a string.`);
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
      { id: 'node_100', type: 'start', data: { label: 'Example Start' }, position: { x: 150, y: 50 } },
      { id: 'node_101', type: 'default', data: { label: 'Process Step A' }, position: { x: 150, y: 200 } },
      { id: 'node_102', type: 'default', data: { label: 'Process Step B' }, position: { x: 350, y: 200 } },
      { id: 'node_103', type: 'end', data: { label: 'Example End' }, position: { x: 250, y: 350 } },
    ];
    const exampleEdges: FlowEdge[] = [
      { id: 'edge_100_101', source: 'node_100', target: 'node_101', label: 'Start -> A', markerEnd: { type: MarkerType.ArrowClosed }, data: { link_info: 'This connects Start to Step A' } },
      { id: 'edge_101_103', source: 'node_101', target: 'node_103', label: 'A -> End', markerEnd: { type: MarkerType.ArrowClosed }, data: { link_info: 'From Step A to End' } },
      { id: 'edge_100_102', source: 'node_100', target: 'node_102', label: 'Start -> B', markerEnd: { type: MarkerType.ArrowClosed }, data: { link_info: 'Alternative path: Start to B', someOtherRandomProp: 'will_be_ignored_on_export' } },
      { id: 'edge_102_103', source: 'node_102', target: 'node_103', label: 'B -> End', markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'edge_invalid_link_info', source: 'node_101', target: 'node_102', label: 'Invalid -> B', markerEnd: { type: MarkerType.ArrowClosed }, data: { link_info: 123 as any, additionalInfo: "test" } },
    ];
    onImportJson({ nodes: exampleNodes, edges: exampleEdges });
    alert('Example flow loaded!');
  }, [onImportJson]);

  const handleTestCall = useCallback(() => {
    // Placeholder for actual test call logic
    // You might want to use the current 'nodes' and 'edges' or 'jsonOutput'
    console.log("Test Call button clicked.");
    console.log("Current JSON data:", jsonOutput);
    // Or if you want to use the parsed, validated data:
    try {
      const parsedData = JSON.parse(jsonOutput);
      // Basic validation (can be more thorough if needed for the test call)
      if (!parsedData || !Array.isArray(parsedData.nodes) || !Array.isArray(parsedData.edges)) {
        alert("Cannot perform test call: Invalid JSON structure.");
        return;
      }
      alert(`Test Call Initiated (placeholder).\nCheck console for current flow data.`);
      // Example: if (onTestCall) onTestCall(parsedData);
      // Or make an API call directly here:
      // fetch('/api/test-flow', { method: 'POST', body: jsonOutput, headers: {'Content-Type': 'application/json'} })
      //  .then(res => res.json())
      //  .then(data => alert('Test call response: ' + JSON.stringify(data)))
      //  .catch(err => alert('Test call failed: ' + err.message));

    } catch (e) {
      alert("Cannot perform test call: JSON is not valid. Please correct the JSON data.");
      console.error("Error parsing JSON for test call:", e);
    }
  }, [jsonOutput /*, onTestCall */]); // Add onTestCall if you use it as a prop

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
          <button
            onClick={handleApplyJsonChanges}
            disabled={!jsonOutput}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            Apply JSON to Flow
          </button>
          {/* New Test Call Button */}
          <button
            onClick={handleTestCall}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Test Call
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 sm:p-4 bg-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex-grow flex flex-col min-h-0 p-3 sm:p-4">
        <div className="relative w-full flex-grow flex flex-col min-h-0">
          <textarea
            value={jsonOutput}
            onChange={(e) => {
              setJsonOutput(e.target.value);
              if (error) setError(null);
            }}
            className={`w-full flex-grow min-h-0 p-3 pr-10 border rounded-md shadow-sm text-sm bg-white text-slate-800 focus:ring-indigo-500 focus:border-indigo-500 resize-none ${error ? 'border-red-500' : 'border-slate-300'}`}
            placeholder="JSON data can be edited here..."
            aria-label="Editable JSON data for the flow"
          />
          {jsonOutput && (
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded"
              aria-label="Copy JSON to clipboard"
              title="Copy JSON"
            >
              <Copy size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowDataExporter;