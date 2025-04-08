"use client";

import { useCallback, useMemo, useState } from "react";
import { Search, Loader2 as Loader } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import {
  ReactFlow,
  NodeMouseHandler,
  Background,
  BackgroundVariant,
  MarkerType,
  useReactFlow,
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
import { fetchAndDraw } from "@/lib/fetch-and-draw";
import { cn, hashToColor } from "@/lib/utils";
import { Output } from "@/lib/types";

const raleway = Raleway({
  weight: ["700"],
  subsets: ["latin"],
});

export function ChartPage() {
  const [searchQuery, setSearchQuery] = useState(
    "5a4f6b25243c1a2dabb2434e3d9e574f65c31764ce0e7eb4127a46fa74657691"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const reactFlow = useReactFlow();

  const selector = useCallback(
    (state: ChartState) => ({
      nodes: state.nodes,
      edges: state.edges,
      onNodesChange: state.onNodesChange,
      onEdgesChange: state.onEdgesChange,
      onConnect: state.onConnect,
      layout: state.layout,
      addNodesAndEdges: state.addNodesAndEdges,
      clear: state.clear,
    }),
    []
  );

  const nodeTypes = useMemo(
    () => ({
      transaction: TransactionNode,
      input: InputNode,
      output: OutputNode,
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
    clear,
  } = useStore(useShallow(selector));

  const styledEdges = useMemo(
    () =>
      edges.map((edge: Edge<{ output?: Output }>) => {
        const tokenCategory = edge.data?.output?.token_category;
        const color = tokenCategory ? hashToColor(tokenCategory) : "#10b981";
        return {
          ...edge,
          label: edge.label ? Number(edge.label).toLocaleString() : edge.label,
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

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!searchQuery) return;

      setLoading(true);
      setError("");

      fetchAndDraw({
        transactionHash: searchQuery,
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
          transactionHash: node.id,
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
                onClick={layout}
                variant="outline"
                disabled={loading}
                className="flex-1 sm:flex-initial"
              >
                Arrange
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
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
