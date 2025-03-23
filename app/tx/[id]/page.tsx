'use client';

import { ChaingraphClient } from "chaingraph-ts";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { decodeTransaction, hexToBin, Transaction } from "@bitauth/libauth";
import { TransactionPage } from "../../../components/transaction-page";

interface TransactionDetails {
  hash: string;
  encoded_hex: string | null;
  size_bytes: string;
  is_coinbase: boolean;
  locktime: string;
  fee_satoshis: string | null;
  block_inclusions: Array<{
    block: {
      height: string;
      hash: string;
      timestamp: string;
    };
  }>;
  inputs: Array<{
    input_index: string;
    outpoint_transaction_hash: string;
    outpoint_index: string;
    sequence_number: string;
    value_satoshis: string | null;
    unlocking_bytecode?: string;
  }>;
  outputs: Array<{
    output_index: string;
    value_satoshis: string;
    locking_bytecode: string;
  }>;
}

// Cache for parent transactions
const parentTxCache = new Map<string, {
  size_bytes: string;
  fee_satoshis: string | null;
  block_inclusions?: Array<{
    block: {
      height: string;
      timestamp: string;
    };
  }>;
}>();

export default function TransactionPageContainer() {
  const params = useParams();
  const txId = params.id as string;
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [decodedTx, setDecodedTx] = useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parentTransactions, setParentTransactions] = useState<Map<string, any>>(new Map());

  // Function to fetch a parent transaction
  const fetchParentTransaction = async (txHash: string, chaingraphClient: ChaingraphClient) => {
    // If we already have this transaction in cache, skip fetching
    if (parentTxCache.has(txHash)) {
      setParentTransactions(prev => new Map(prev).set(txHash, parentTxCache.get(txHash)));
      return;
    }

    try {
      const result = await chaingraphClient.query(`
        query GetParentTransaction($txHash: bytea!) {
          transaction(where: { hash: { _eq: $txHash } }) {
            size_bytes
            fee_satoshis
            block_inclusions {
              block {
                height
                timestamp
              }
            }
          }
        }
      `, { txHash });

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
        
        const result = await chaingraphClient.query(`
          query GetTransactionDetails($txHash: bytea!) {
            transaction(where: { hash: { _eq: $txHash } }) {
              hash
              encoded_hex
              size_bytes
              is_coinbase
              locktime
              fee_satoshis
              block_inclusions {
                block {
                  height
                  hash
                  timestamp
                }
              }
              inputs {
                input_index
                outpoint_transaction_hash
                outpoint_index
                sequence_number
                value_satoshis
                unlocking_bytecode
              }
              outputs {
                output_index
                value_satoshis
                locking_bytecode
              }
            }
          }
        `, { txHash: `\\x${txId}` });

        if (!result.data?.transaction?.[0]) {
          throw new Error("Transaction not found");
        }
        
        const tx = result.data.transaction[0];
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
          } else {
            setDecodedTx(decoded);
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
      decodedTx={decodedTx}
      parentTransactions={parentTransactions}
    />
  );
} 