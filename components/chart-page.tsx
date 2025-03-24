"use client"

import { useState, useCallback } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import FlowChart from "@/components/flow-chart"
import { fetchTransactionData } from "@/lib/chaingraph-api"

export default function ExplorerPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [transactionData, setTransactionData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!searchQuery) return

    setLoading(true)
    setError("")
    setTransactionData(null)
    setSelectedTransaction(null)

    try {
      // Search for transaction by hash
      const data = await fetchTransactionData(searchQuery)
      setTransactionData(data)
      setSelectedTransaction(data)
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
          <FlowChart />
        </div>

      </div>
    </div>
  )
}

