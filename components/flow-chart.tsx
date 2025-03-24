"use client"

import { ReactFlow } from '@xyflow/react';
import { useShallow } from 'zustand/react/shallow';
import TransactionNode from "@/components/nodes/transaction"
import InputNode from "@/components/nodes/input"
import OutputNode from "@/components/nodes/output"
import useStore from '@/lib/store';
import { ChartState } from '@/lib/types';
import "@xyflow/react/dist/style.css"

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
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
    />
  );
}
 
export default FlowChart;