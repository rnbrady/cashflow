import { create } from "zustand";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Node,
  type Edge,
  type Viewport,
} from "@xyflow/react";
import Dagre from "@dagrejs/dagre";
import { Output, TransactionNodeType, isTransactionNode } from "./types";

export interface ChartState {
  nodes: Node[];
  edges: Edge<{ output?: Output }>[];
  viewport: Viewport;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge<{ output?: Output }>[]) => void;
  setViewport: (viewport: Viewport) => void;
  addNodes: (nodes: Node[]) => void;
  addEdges: (edges: Edge<{ output?: Output }>[]) => void;
  layout: () => void;
  addNodesAndEdges: ({
    newNodes,
    newEdges,
    layout,
  }: {
    newNodes: Node[];
    newEdges: Edge<{ output?: Output }>[];
    layout?: boolean;
  }) => void;
  clear: () => void;
  addAnnotation: (transactionHash: string, annotation?: string) => void;
  deleteTransaction: (œtransactionHash: string) => void;
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
  addNodes: (newNodes: Node[]) => {
    const currentNodes = get().nodes;

    const nodes = upsertNodes({ currentNodes, newNodes });

    set({ nodes });
  },
  addEdges: (newEdges) => {
    const currentEdges = get().edges;

    const edges = upsertEdges({ currentEdges, newEdges });

    set({ edges });
  },
  layout: () => {
    set(layoutNodes(get()));
  },
  addNodesAndEdges: ({
    newNodes,
    newEdges,
    layout = false,
  }: {
    newNodes: Node[];
    newEdges: Edge<{ output?: Output }>[];
    layout?: boolean;
  }) => {
    const state = get();

    const nodes = upsertNodes({ currentNodes: state.nodes, newNodes });

    const edges = upsertEdges({ currentEdges: state.edges, newEdges });

    set(layout ? layoutNodes({ nodes, edges }) : { nodes, edges });
  },
  clear: () => {
    set({ nodes: [], edges: [] });
  },
  addAnnotation: (transactionHash: string, annotation?: string) => {
    set({
      nodes: [
        ...get().nodes,
        {
          id: `annotation-${transactionHash}`,
          type: "annotation",
          data: { annotation: annotation || "" },
          position: { x: 0, y: -40 },
          style: { width: 180 },
          parentId: transactionHash,
          selected: true,
        },
      ],
    });
  },
  deleteTransaction: (transactionHash: string) => {
    const currentNodes = get().nodes;
    const currentEdges = get().edges;

    // Find the transaction node to get its position
    const transactionNode = currentNodes.find(
      (node) => node.id === transactionHash
    );
    const parentPosition = transactionNode?.position || { x: 0, y: 0 };

    // Orphan child input/output nodes by removing their parentId and converting positions to absolute
    const updatedNodes = currentNodes
      .map((node) => {
        if (
          node.parentId === transactionHash &&
          (node.type === "input" || node.type === "output")
        ) {
          return {
            ...node,
            extent: undefined,
            dragHandle: undefined,
            position: {
              x: node.position.x + parentPosition.x,
              y: node.position.y + parentPosition.y,
            },
          };
        }
        return node;
      })
      // Remove the transaction node and any annotation nodes with this parentId
      .filter((node) => {
        if (node.id === transactionHash) return false; // Remove transaction node
        if (node.parentId === transactionHash && node.type === "annotation")
          return false; // Remove annotation nodes
        return true;
      });

    // Remove edges connected to the transaction node
    const updatedEdges = currentEdges.filter(
      (edge) =>
        edge.source !== transactionHash && edge.target !== transactionHash
    );

    set({
      nodes: updatedNodes,
      edges: updatedEdges,
    });
  },
}));

function upsertEdges({
  currentEdges,
  newEdges,
}: {
  currentEdges: Edge<{ output?: Output }>[];
  newEdges: Edge<{ output?: Output }>[];
}) {
  const updatedEdges = [...currentEdges];

  // Process each new edge
  newEdges.forEach((newEdge) => {
    // Check if an edge with the same source and target already exists
    const existingEdgeIndex = updatedEdges.findIndex(
      (edge) => edge.source === newEdge.source && edge.target === newEdge.target
    );

    if (existingEdgeIndex === -1) {
      // Add new edge
      updatedEdges.push(newEdge);
    } else {
      // Update existing edge
      updatedEdges[existingEdgeIndex] = newEdge;
    }
  });

  return updatedEdges;
}

function upsertNodes({
  currentNodes,
  newNodes,
}: {
  currentNodes: Node[];
  newNodes: Node[];
}) {
  const updatedNodes = [...currentNodes];

  // Process each new node
  newNodes.forEach((newNode) => {
    // Check if a node with this ID already exists
    const existingNodeIndex = updatedNodes.findIndex(
      (node) => node.id === newNode.id
    );

    // Node not seen before, simply add it
    if (existingNodeIndex === -1) {
      updatedNodes.push(newNode);
      return;
    }

    // placeholder transaction, existing transaction is also a placeholder
    if (
      newNode.data.placeholder &&
      updatedNodes[existingNodeIndex].data.placeholder &&
      isTransactionNode(newNode) &&
      isTransactionNode(updatedNodes[existingNodeIndex])
    ) {
      const updatedNode: TransactionNodeType = {
        ...updatedNodes[existingNodeIndex],
        ...newNode,
        type: "transaction",
        data: {
          ...newNode.data,
          transaction: {
            ...updatedNodes[existingNodeIndex].data.transaction,
            ...newNode.data.transaction,
            minInputs: Math.max(
              newNode.data.transaction.minInputs ?? 0,
              updatedNodes[existingNodeIndex].data.transaction.minInputs ?? 0
            ),
            minOutputs: Math.max(
              newNode.data.transaction.minOutputs ?? 0,
              updatedNodes[existingNodeIndex].data.transaction.minOutputs ?? 0
            ),
          },
          placeholder: true,
        },
        position: updatedNodes[existingNodeIndex].position,
      };

      updatedNodes[existingNodeIndex] = updatedNode;
      return;
    }

    // new node is a placeholder, existing node is not a placeholder
    if (
      newNode.data.placeholder &&
      !updatedNodes[existingNodeIndex].data.placeholder
    ) {
      if (newNode.parentId) {
        updatedNodes[existingNodeIndex] = {
          ...updatedNodes[existingNodeIndex],
          parentId: newNode.parentId,
          extent: "parent" as const,
        };
      }
      return;
    }

    // new node is not a placeholder but a full node
    if (!newNode.data.placeholder) {
      updatedNodes[existingNodeIndex] = {
        ...updatedNodes[existingNodeIndex],
        ...newNode,
        data: {
          ...newNode.data,
          placeholder: false,
        },
        position:
          newNode.type === "transaction"
            ? updatedNodes[existingNodeIndex].position
            : newNode.position,
      };
    }
  });

  return updatedNodes.sort((a, b) => {
    return a.id < b.id ? -1 : 1;
  });
}

function layoutNodes({
  nodes,
  edges,
}: {
  nodes: Node[];
  edges: Edge<{ output?: Output }>[];
}) {
  console.log("Using Dagre to layout nodes");

  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  g.setGraph({ rankdir: "LR", ranksep: 150, ranker: "longest-path" });

  edges.forEach((edge) => {
    const source = nodes.find((node) => node.id === edge.source);
    const target = nodes.find((node) => node.id === edge.target);

    if (!source || !target) return;

    g.setEdge(
      source.parentId ? source.id.split("-")[0] : source.id,
      target.parentId ? target.id.split("-")[0] : target.id
    );
  });

  nodes
    .filter((node) => !node.parentId)
    .forEach((node) => {
      g.setNode(node.id, {
        ...node,
        width: node.measured?.width ?? 400,
        height: node.measured?.height ?? 245,
      });
    });

  Dagre.layout(g);

  nodes
    .filter((node) => node.type === "input")
    .forEach((node) => {
      console.log("input height:", node.measured?.height);
    });

  nodes
    .filter((node) => node.type === "output")
    .forEach((node) => {
      console.log("output height:", node.measured?.height);
    });

  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);

      if (!position) {
        return node;
      }

      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - (node.measured?.width ?? 400) / 2;
      const y = position.y - (node.measured?.height ?? 245) / 2;

      return { ...node, position: { x, y } };
    }),
    edges,
  };
}
