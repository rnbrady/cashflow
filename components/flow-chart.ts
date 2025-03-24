"use client"

import { ReactFlow } from '@xyflow/react';
import { useShallow } from 'zustand/react/shallow';

import TransactionNode from "@/components/legacy/nodes/transaction-node"
import InputNode from "@/components/legacy/nodes/input-node"
import OutputNode from "@/components/legacy/nodes/output-node"
import useStore from '@/lib/store';

import "@xyflow/react/dist/style.css"
import { ChartState } from '@/lib/types';

const nodeTypes = {
  transaction: TransactionNode,
  input: InputNode,
  output: OutputNode,
}
 
const selector = (state: ChartState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});
 
function FlowChart() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore(
    useShallow(selector),
  );
 
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
    />
  );
}
 
export default FlowChart;