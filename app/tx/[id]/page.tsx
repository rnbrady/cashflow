"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TransactionPage } from "@/components/transaction-page";
import { Transaction } from "@/lib/types";
import {
  fetchTransactionData,
  setDataSource,
  getCurrentDataSource,
  DataSource,
} from "@/lib/chaingraph-api";

export default function TransactionPageContainer() {
  const params = useParams<{ id: string }>();
  const txId = params?.id ?? "";
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSourceState] = useState<DataSource>(
    getCurrentDataSource()
  );

  // Function to change data source
  const handleDataSourceChange = (source: DataSource) => {
    setDataSource(source);
    setDataSourceState(source);
    // Reset state and refetch data
    setTransaction(null);
    setError(null);
  };

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const tx = await fetchTransactionData(txId);
        setTransaction(tx);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch transaction"
        );
      }
    };

    fetchTransaction();
  }, [txId, dataSource]); // Re-fetch when data source changes

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <select
              value={dataSource}
              onChange={(e) =>
                handleDataSourceChange(e.target.value as DataSource)
              }
              className="bg-white border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="mock">Mock Data</option>
              <option value="mainnet">Mainnet</option>
            </select>
          </div>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <select
              value={dataSource}
              onChange={(e) =>
                handleDataSourceChange(e.target.value as DataSource)
              }
              className="bg-white border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="mock">Mock Data</option>
              <option value="mainnet">Mainnet</option>
            </select>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-3 mt-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-end p-4">
        <select
          value={dataSource}
          onChange={(e) => handleDataSourceChange(e.target.value as DataSource)}
          className="bg-white border border-gray-300 rounded px-3 py-1 text-sm"
        >
          <option value="mock">Mock Data</option>
          <option value="mainnet">Mainnet</option>
        </select>
      </div>
      <TransactionPage transaction={transaction} />
    </div>
  );
}
