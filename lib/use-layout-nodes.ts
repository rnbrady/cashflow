import { useEffect } from "react";
import ELK from "elkjs";
import {
  type Edge,
  type Node,
  useNodesInitialized,
  useReactFlow,
} from "@xyflow/react";

// elk layouting options can be found here:
// https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-layered.html
const layoutOptions = {
  "elk.algorithm": "layered",
  "elk.direction": "RIGHT",
  "elk.layered.spacing.edgeNodeBetweenLayers": "150",
  "elk.spacing.nodeNode": "50",
  "elk.layered.nodePlacement.strategy": "SIMPLE",
};

const elk = new ELK();

// uses elkjs to give each node a layouted position
export const getLayoutedNodes = async (nodes: Node[], edges: Edge[]) => {
  console.log("Using ELK to layout nodes");

  const graph = {
    id: "root",
    layoutOptions,
    children: nodes
      .filter((node) => !node.parentId)
      .map((node) => {
        console.log("ELK node for", node.id);

        const inputHandles = nodes
          .filter(
            (handle) =>
              handle.type === "input" &&
              (handle.parentId === node.id || handle.id === node.id)
          )
          .map((input) => {
            console.log("input", input);

            return {
              id: input.id,
              properties: {
                side: "WEST",
                index:
                  // @ts-expect-error - TODO: fix this
                  (node.data?.transaction?.inputs?.length || 1) -
                  // @ts-expect-error - TODO: fix this
                  Number(input.data?.input?.input_index || "0") -
                  1,
              },
            };
          });

        const outputHandles = nodes
          .filter(
            (handle) =>
              handle.type === "output" &&
              (handle.parentId === node.id || handle.id === node.id)
          )
          .map((output) => ({
            id: output.id,
            properties: {
              side: "EAST",
              // @ts-expect-error - TODO: fix this
              index: Number(output.data?.output?.output_index || "0"),
            },
          }));

        return {
          id: node.id,
          width: node.measured?.width ?? 400,
          height: node.measured?.height ?? 245,
          properties: {
            "org.eclipse.elk.portConstraints": "FIXED_ORDER",
          },

          ports: [...inputHandles, ...outputHandles],
        };
      }),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layoutedGraph = await elk.layout(graph);

  const layoutedNodes = nodes.map((node) => {
    const layoutedNode = layoutedGraph.children?.find(
      (lgNode) => lgNode.id === node.id
    );

    return layoutedNode
      ? {
          ...node,
          position: {
            x: layoutedNode?.x ?? 0,
            y: layoutedNode?.y ?? 0,
          },
        }
      : node;
  });

  return layoutedNodes;
};

export default function useLayoutNodes() {
  const nodesInitialized = useNodesInitialized();
  const { getNodes, getEdges, setNodes, fitView } = useReactFlow<Node>();

  useEffect(() => {
    if (nodesInitialized) {
      const layoutNodes = async () => {
        const layoutedNodes = await getLayoutedNodes(
          getNodes() as Node[],
          getEdges()
        );

        setNodes(layoutedNodes);
        fitView();
      };

      layoutNodes();
    }
  }, [nodesInitialized, getNodes, getEdges, setNodes, fitView]);

  return null;
}
