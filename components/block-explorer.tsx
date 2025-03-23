"use client"

import { useState, useCallback } from "react"
import { Search, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import TransactionGraph from "@/components/transaction-graph"
import TransactionDetails from "@/components/transaction-details"
import { fetchBlockData, fetchTransactionData } from "@/lib/api"

export default function BlockExplorer() {
  const [searchQuery, setSearchQuery] = useState("")
  const [blockData, setBlockData] = useState(null)
  const [transactionData, setTransactionData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery) return

    setLoading(true)
    setError("")
    setBlockData(null)
    setTransactionData(null)
    setSelectedTransaction(null)

    try {
      // Determine if the search is for a block or transaction
      if (searchQuery.length < 64) {
        // Likely a block height
        const data = await fetchBlockData(searchQuery)
        setBlockData(data)
      } else {
        // Likely a transaction hash or block hash
        const data = await fetchTransactionData(searchQuery)
        setTransactionData(data)
      }
    } catch (err) {
      setError("Failed to fetch data. Please check your input and try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleTransactionSelect = useCallback((txData) => {
    setSelectedTransaction(txData)
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Bitcoin Cash Visual Block Explorer</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <Input
          type="text"
          placeholder="Enter block height, block hash, or transaction hash"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Searching..." : <Search className="h-4 w-4 mr-2" />}
          Search
        </Button>
      </form>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>Transaction Graph</span>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[600px]">
            <TransactionGraph
              blockData={blockData}
              transactionData={transactionData}
              onTransactionSelect={handleTransactionSelect}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionDetails transaction={selectedTransaction} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

