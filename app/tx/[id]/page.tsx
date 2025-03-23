'use client';

import { ChaingraphClient } from "chaingraph-ts";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { decodeTransaction, hexToBin } from "@bitauth/libauth";
import { TransactionPage } from "@/components/transaction-page";
import { Transaction, ParentTransaction } from "@/lib/types";
import { GET_TRANSACTION_DETAILS, GET_PARENT_TRANSACTION } from "@/lib/queries";

// Cache for parent transactions
const parentTxCache = new Map<string, ParentTransaction>();

export default function TransactionPageContainer() {
  const params = useParams();
  const txId = params.id as string;
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parentTransactions, setParentTransactions] = useState<Map<string, ParentTransaction>>(new Map());

  // Function to fetch a parent transaction
  const fetchParentTransaction = async (txHash: string, chaingraphClient: ChaingraphClient) => {
    // If we already have this transaction in cache, skip fetching
    if (parentTxCache.has(txHash)) {
      setParentTransactions(prev => new Map(prev).set(txHash, parentTxCache.get(txHash)!));
      return;
    }

    try {
      const result = await chaingraphClient.query(GET_PARENT_TRANSACTION, { txHash });

      if (result.data?.transaction?.[0]) {
        const parentTx = result.data.transaction[0];
        // Update both the cache and state
        parentTxCache.set(txHash, parentTx);
        setParentTransactions(prev => new Map(prev).set(txHash, parentTx));
      }
    } catch (err) {
      console.error('Failed to fetch parent transaction:', err);
    }
  };

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const chaingraphUrl = process.env.NEXT_PUBLIC_CHAINGRAPH_URL;
        if (!chaingraphUrl) {
          throw new Error("Chaingraph URL not configured");
        }

        const chaingraphClient = new ChaingraphClient(chaingraphUrl);
        
        const result = await chaingraphClient.query(GET_TRANSACTION_DETAILS, { txHash: `\\x${txId}` });

        if (!result.data?.transaction?.[0]) {
          throw new Error("Transaction not found");
        }
        
        const tx = result.data.transaction[0];
        console.log(tx);
        setTransaction(tx);

        // Fetch parent transactions
        for (const input of tx.inputs) {
          fetchParentTransaction(input.outpoint_transaction_hash, chaingraphClient);
        }

        // Try to decode the transaction
        if (tx.encoded_hex) {
          const decoded = decodeTransaction(hexToBin(tx.encoded_hex));
          if (typeof decoded === 'string') {
            console.error('Failed to decode transaction:', decoded);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch transaction");
      }
    };

    fetchTransaction();
  }, [txId]);

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-3 mt-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TransactionPage 
      transaction={transaction}
      parentTransactions={parentTransactions}
    />
  );
} 