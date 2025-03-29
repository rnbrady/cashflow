"use client"

import { useCallback, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { useShallow } from 'zustand/react/shallow';
import { NodeChange, ReactFlow, NodeMouseHandler, Background, BackgroundVariant, MarkerType } from '@xyflow/react';
import "@xyflow/react/dist/style.css"

import { useStore, ChartState } from '@/lib/store';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TransactionNode } from "@/components/nodes/transaction"
import { InputNode } from "@/components/nodes/input"
import { OutputNode } from "@/components/nodes/output"
import { fetchAndDraw } from "@/lib/fetch-and-draw"

export function ChartPage() {
  const [searchQuery, setSearchQuery] = useState("5a4f6b25243c1a2dabb2434e3d9e574f65c31764ce0e7eb4127a46fa74657691")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const selector = useCallback((state: ChartState) => ({
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    addNodes: state.addNodes,
    addEdges: state.addEdges,
    layout: state.layout,
  }), []);
  
  const nodeTypes = useMemo(() => ({
    transaction: TransactionNode,
    input: InputNode,
    output: OutputNode,
  }), []);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNodes,
    addEdges,
    layout
  } = useStore(useShallow(selector));

  const handleSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!searchQuery) return

      setLoading(true)
      setError("")
      
    fetchAndDraw({
          transactionHash: searchQuery,
          addNodes,
          addEdges,
    })
    .then(() => setTimeout(layout, 1))
      .catch(err => {
        setError("Failed to fetch transaction. Please check your input and try again.")
        console.error(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [addNodes, addEdges, searchQuery])

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    console.log(changes)
    onNodesChange(changes)
  }, [onNodesChange])

  const handleNodeClick: NodeMouseHandler = useCallback((event, node) => {
    event.preventDefault();

    if (node.type === 'transaction' && node.id) {
      fetchAndDraw({
        transactionHash: node.id,
        addNodes,
        addEdges
      })
      .then(() => setTimeout(layout, 100))
      .catch(err => {
        setError("Failed to fetch transaction. Please check your input and try again.");
        console.error(err);
      });
    }
  }, [addNodes, addEdges])

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b p-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Cashflow Bitcoin Cash Explorer</h1>

        <form onSubmit={handleSearch} className="flex gap-2 mt-4">
          <Input
            type="text"
            placeholder="Enter transaction hash"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading} variant="default">
            {loading ? "Searching..." : <Search className="h-4 w-4 mr-2" />}
            Search
          </Button>
          <Button 
            type="button" 
            onClick={layout} 
            variant="outline"
            disabled={loading}
          >
            Arrange
          </Button>
        </form>

        {error && <div className="text-red-500 mt-2">{error}</div>}
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges.map((edge) => ({
            ...edge,
            label: edge.label ? Number(edge.label).toLocaleString() : edge.label,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#10b981"
            },
            style: { stroke: "#10b981", strokeWidth: 2 },
            labelStyle: { fill: "#10b981" },
            labelBgPadding: [2,1],
            labelBgBorderRadius: 2,
            labelShowBg: true,
            labelBgStyle: { fill: "#ffffff" },
          }))}
          nodeTypes={nodeTypes}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          minZoom={0.01}
          maxZoom={10}
          fitView
          >
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="lightgray" />
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}

