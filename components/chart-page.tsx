"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { fetchTransactionData } from "@/lib/chaingraph-api"
import { ReactFlow } from '@xyflow/react';
import { useShallow } from 'zustand/react/shallow';
import {TransactionNode} from "@/components/nodes/transaction"
import { InputNode } from "@/components/nodes/input"
import { OutputNode } from "@/components/nodes/output"
import useStore from '@/lib/store';
import { ChartState, Transaction } from '@/lib/types';
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
  addNode: state.addNode,
});


export function ChartPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } = useStore(
    useShallow(selector),
  );

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!searchQuery) return

    setLoading(true)
    setError("")

    try {
      // Search for transaction by hash
      const transaction: Transaction = await fetchTransactionData(searchQuery)
      addNode({
        id: transaction.hash,
        type: "transaction",
        data: {
          transaction: transaction,
        },
        position: {
          x: 0,
          y: 0,
        },
      })
    } catch (err) {
      setError("Failed to fetch transaction. Please check your input and try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
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
        </form>

        {error && <div className="text-red-500 mt-2">{error}</div>}
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        />
        </div>

      </div>
    </div>
  )
}

