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
import { ThemeToggle } from "@/components/theme-toggle";

const dataSourceSelectClass =
  "h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

function DataSourceSelect({
  value,
  onChange,
}: {
  value: DataSource;
  onChange: (source: DataSource) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as DataSource)}
      className={dataSourceSelectClass}
    >
      <option value="mock">Mock Data</option>
      <option value="mainnet">Mainnet</option>
    </select>
  );
}

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
          <div className="flex justify-end gap-2">
            <DataSourceSelect
              value={dataSource}
              onChange={handleDataSourceChange}
            />
            <ThemeToggle />
          </div>
          <div className="rounded border border-destructive/40 bg-destructive/10 px-4 py-3 text-destructive">
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
          <div className="flex justify-end gap-2">
            <DataSourceSelect
              value={dataSource}
              onChange={handleDataSourceChange}
            />
            <ThemeToggle />
          </div>
          <div className="animate-pulse">
            <div className="h-4 w-3/4 rounded bg-muted"></div>
            <div className="mt-4 flex flex-col gap-3">
              <div className="h-4 rounded bg-muted"></div>
              <div className="h-4 rounded bg-muted"></div>
              <div className="h-4 rounded bg-muted"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-end gap-2 p-4">
        <DataSourceSelect
          value={dataSource}
          onChange={handleDataSourceChange}
        />
        <ThemeToggle />
      </div>
      <TransactionPage transaction={transaction} />
    </div>
  );
}
