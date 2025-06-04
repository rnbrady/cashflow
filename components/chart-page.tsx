"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { Search, Loader2 as Loader } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import {
  ReactFlow,
  NodeMouseHandler,
  Background,
  BackgroundVariant,
  MarkerType,
  useReactFlow,
  useNodesInitialized,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Raleway } from "next/font/google";

import { useStore, ChartState } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TransactionNode from "@/components/nodes/transaction";
import InputNode from "@/components/nodes/input";
import OutputNode from "@/components/nodes/output";
import AnnotationNode from "@/components/nodes/annotation";
import { fetchAndDraw } from "@/lib/fetch-and-draw";
import { cn, hashToColor } from "@/lib/utils";
import { InputNodeType, OutputNodeType, Output } from "@/lib/types";
import { DevTools } from "./devtools";
import { useHotkeys } from "react-hotkeys-hook";
import { getLayoutedNodes } from "@/lib/use-layout-nodes";
import { useSearchParams } from "next/navigation";

const raleway = Raleway({
  weight: ["700"],
  subsets: ["latin"],
});

export function ChartPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const [error, setError] = useState("");
  const reactFlow = useReactFlow();

  const nodesInitialized = useNodesInitialized();

  const layoutNodes = useCallback(async () => {
    const layoutedNodes = await getLayoutedNodes(
      reactFlow.getNodes(),
      reactFlow.getEdges()
    );

    reactFlow.setNodes(layoutedNodes);
  }, [reactFlow]);

  useEffect(() => {
    if (nodesInitialized) {
      layoutNodes();
    }
  }, [nodesInitialized, layoutNodes]);

  useHotkeys("d", () => setShowDevTools((current) => !current));

  useHotkeys("x", () => {
    // expand (fetch and draw) all selected nodes
    const selectedNodes = reactFlow.getNodes().filter((node) => node.selected);
    if (selectedNodes.length === 0) return;

    selectedNodes.forEach((node) => {
      fetchAndDraw({
        transactionHashes: [node.id.split("-")[0]],
        addNodesAndEdges,
      });
    });
  });

  const selector = useCallback(
    (state: ChartState) => ({
      nodes: state.nodes,
      edges: state.edges,
      onNodesChange: state.onNodesChange,
      onEdgesChange: state.onEdgesChange,
      onConnect: state.onConnect,
      layout: state.layout,
      addNodesAndEdges: state.addNodesAndEdges,
      addAnnotation: state.addAnnotation,
      clear: state.clear,
    }),
    []
  );

  const nodeTypes = useMemo(
    () => ({
      transaction: TransactionNode,
      input: InputNode,
      output: OutputNode,
      annotation: AnnotationNode,
    }),
    []
  );

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    layout,
    addNodesAndEdges,
    addAnnotation,
    clear,
  } = useStore(useShallow(selector));

  const styledEdges = useMemo(
    () =>
      edges.map((edge: Edge<{ output?: Output }>) => {
        const tokenCategory = edge.data?.output?.token_category;
        const color = tokenCategory
          ? hashToColor(tokenCategory)
          : "var(--color-emerald-500)";
        return {
          ...edge,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color,
          },
          style: {
            stroke: color,
            strokeWidth: 2,
          },
          labelStyle: {
            fill: color,
          },
          labelBgPadding: [2, 1] as [number, number],
          labelBgBorderRadius: 2,
          labelShowBg: true,
          labelBgStyle: { fill: "#ffffff" },
        };
      }),
    [edges]
  );

  const searchParams = useSearchParams();

  const transactionHashes = searchParams.getAll("tx");
  const transactionNotes = searchParams.getAll("note");

  useEffect(() => {
    console.log("searchParams effect running");

    if (transactionHashes.length > 0) {
      fetchAndDraw({
        transactionHashes,
        addNodesAndEdges,
      }).then(() => {
        transactionNotes.forEach((note, index) => {
          addAnnotation("\\x" + transactionHashes[index], note);
        });
        setTimeout(() => reactFlow.fitView(), 100);
      });
    }
  }, [transactionHashes, addNodesAndEdges, addAnnotation, transactionNotes]);

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!searchQuery) return;

      setLoading(true);
      setError("");

      fetchAndDraw({
        transactionHashes: [searchQuery],
        addNodesAndEdges,
      })
        .catch((err) => {
          setError(
            "Failed to fetch transaction. Please check your input and try again."
          );
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
          setSearchQuery("");
        });
    },
    [searchQuery, addNodesAndEdges]
  );

  const handleNodeClick: NodeMouseHandler = useCallback(
    (event, node) => {
      event.preventDefault();

      if (node.type === "transaction" && node.id) {
        fetchAndDraw({
          transactionHashes: [node.id],
          addNodesAndEdges,
        }).catch((err) => {
          setError(
            "Failed to fetch transaction. Please check your input and try again."
          );
          console.error(err);
        });
      }

      if (node.type === "input") {
        const inputNode: InputNodeType = node as InputNodeType;
        const transactionHash = inputNode.data.input.transaction?.hash;
        if (!transactionHash) return;
        fetchAndDraw({
          transactionHashes: [transactionHash],
          addNodesAndEdges,
        }).catch((err) => {
          setError(
            "Failed to fetch transaction. Please check your input and try again."
          );
          console.error(err);
        });
      }

      if (node.type === "output") {
        const outputNode: OutputNodeType = node as OutputNodeType;
        const transactionHash = outputNode.data.output.transaction_hash;
        if (!transactionHash) return;
        fetchAndDraw({
          transactionHashes: [transactionHash],
          addNodesAndEdges,
        }).catch((err) => {
          setError(
            "Failed to fetch transaction. Please check your input and try again."
          );
          console.error(err);
        });
      }
    },
    [addNodesAndEdges]
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b p-4 shadow-sm">
        <div className="flex justify-between flex-col md:flex-row md:items-end gap-4">
          <div className="shrink-0 text-center md:text-left">
            <h1 className={cn("text-xl text-gray-800 ", raleway.className)}>
              Cashflow
            </h1>
            <h2 className="text-xs text-gray-500">
              Bitcoin Cash Graph Explorer
            </h2>
          </div>

          <form
            onSubmit={handleSearch}
            className="flex flex-col w-full sm:flex-row gap-2 justify-end"
          >
            <Input
              type="text"
              placeholder="Enter transaction hash"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-auto sm:flex-1 max-w-xl min-w-64"
              spellCheck={false}
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={loading}
                variant="default"
                className="flex-1 sm:flex-initial"
              >
                {loading ? (
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Add
              </Button>
              <Button
                type="button"
                onClick={layoutNodes}
                variant="outline"
                disabled={loading}
                className="flex-1 sm:flex-initial"
              >
                Elk
              </Button>
              <Button
                type="button"
                onClick={layout}
                variant="outline"
                disabled={loading}
                className="flex-1 sm:flex-initial"
              >
                Dagre
              </Button>
              <Button
                type="button"
                onClick={() => reactFlow.fitView()}
                variant="outline"
                disabled={loading}
                className="flex-1 sm:flex-initial"
              >
                Fit
              </Button>
              <Button
                type="button"
                onClick={clear}
                variant="outline"
                disabled={loading}
                className="flex-1 sm:flex-initial"
              >
                Clear
              </Button>
            </div>
          </form>
        </div>

        {error && <div className="text-red-500 mt-2">{error}</div>}
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 h-full">
          <ReactFlow
            nodes={nodes}
            edges={styledEdges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            minZoom={0.01}
            maxZoom={10}
            fitView
            nodesDraggable
            nodesFocusable
            elementsSelectable
            // https://reactflow.dev/learn/troubleshooting/remove-attribution
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={12}
              size={1}
              color="lightgray"
            />
            {showDevTools && <DevTools position="top-left" />}
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
