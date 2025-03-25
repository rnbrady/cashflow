import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Node,
  type Edge,
  type Viewport
} from '@xyflow/react';
import Dagre from '@dagrejs/dagre';

export interface ChartState {
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setViewport: (viewport: Viewport) => void;
  addNodes: (nodes: Node[]) => void;
  addEdges: (edges: Edge[]) => void;
  layout: () => void;
} 
 
// this is our useStore hook that we can use in our components to get parts of the store and call actions
export const useStore = create<ChartState>((set, get) => ({
  nodes: [],
  edges: [],
  viewport: {
    x: 0,
    y: 0,
    zoom: 1,
  },
  setViewport: (viewport) => {
    set({ viewport });
  },
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
    const currentNodes = get().nodes;
    const updatedNodes = [...currentNodes];
    
    // Process each new node
    nodes.forEach(newNode => {
      // Check if a node with this ID already exists
      const existingNodeIndex = updatedNodes.findIndex(node => node.id === newNode.id);
      
      console.log(newNode)

      if (existingNodeIndex === -1) {
        updatedNodes.push(newNode);
      } else if (newNode.data.placeholder !== true) {
        updatedNodes[existingNodeIndex] = {
          ...updatedNodes[existingNodeIndex],
          ...newNode,
          position: updatedNodes[existingNodeIndex].position
        };
      }
      
    });
    
    set({ nodes: updatedNodes });
  },
  addEdges: (edges: Edge[]) => {
    const currentEdges = get().edges;
    const updatedEdges = [...currentEdges];
    
    // Process each new edge
    edges.forEach(newEdge => {
      // Check if an edge with the same source and target already exists
      const existingEdgeIndex = updatedEdges.findIndex(
        edge => edge.source === newEdge.source && edge.target === newEdge.target
      );
      
      if (existingEdgeIndex === -1) {
        // Add new edge
        updatedEdges.push(newEdge);
      } else {
        // Update existing edge
        updatedEdges[existingEdgeIndex] = newEdge;
      }
    });
    
    set({ edges: updatedEdges });
  },
  layout: () => {
    const { nodes, edges } = get();

    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

    g.setGraph({ rankdir: "LR" });
  
    edges.forEach((edge) => g.setEdge(edge.source.split("-")[0], edge.target.split("-")[0]));

    nodes
      .filter((node) => node.type === "transaction")
      .forEach((node) =>
        g.setNode(node.id, {
          ...node,
        width: node.measured?.width ?? 0,
        height: node.measured?.height ?? 0,
      }),
    );
  
    Dagre.layout(g);
  
    set({
      nodes: nodes.map((node) => {
        const position = g.node(node.id);

        if (!position) {
          return node;
        }

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        const x = position.x - (node.measured?.width ?? 0) / 2;
        const y = position.y - (node.measured?.height ?? 0) / 2;

        return { ...node, position: { x, y } };
      })
    });
  }
}));

