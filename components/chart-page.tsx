"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { NodeChange, ReactFlow, useOnViewportChange, Viewport, type Node, type Edge } from '@xyflow/react';
import { useShallow } from 'zustand/react/shallow';
import {TransactionNode} from "@/components/nodes/transaction"
import { InputNode } from "@/components/nodes/input"
import { OutputNode } from "@/components/nodes/output"
import { useStore, type ChartState } from '@/lib/store';
import "@xyflow/react/dist/style.css"
import { fetchAndDraw } from "@/lib/fetch-and-draw"


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
  addNodes: state.addNodes,
  addEdges: state.addEdges,
  layout: state.layout,
});


export function ChartPage() {
  const [searchQuery, setSearchQuery] = useState("5a4f6b25243c1a2dabb2434e3d9e574f65c31764ce0e7eb4127a46fa74657691")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
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
  
  useOnViewportChange({
    onStart: (viewport: Viewport) => console.log('start', viewport),
    onChange: (viewport: Viewport) => console.log('change', viewport),
    onEnd: (viewport: Viewport) => {console.log('end', viewport)},
  });


  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!searchQuery) return

    setLoading(true)
    setError("")

    try {
      await fetchAndDraw({
        transactionHash: searchQuery,
        addNodes,
        addEdges
      });
    } catch (err) {
      setError("Failed to fetch transaction. Please check your input and try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleNodesChange = (changes: NodeChange[]) => {
    console.log(changes)
    onNodesChange(changes)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b p-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">CashFlow Bitcoin Cash Explorer</h1>

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
            onClick={() => layout()} 
            variant="outline"
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
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          />
        
        </div>

      </div>
    </div>
  )
}

