import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges, type Node } from '@xyflow/react';
 
import { type ChartState } from './types';
 
// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<ChartState>((set, get) => ({
  nodes: [],
  edges: [],
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  setNodes: (nodes) => {
    set({ nodes });
  },
  setEdges: (edges) => {
    set({ edges });
  },
  addNodes: (nodes: Node[]) => {
    set({ nodes: [...get().nodes, ...nodes] });
  },
}));

export default useStore;