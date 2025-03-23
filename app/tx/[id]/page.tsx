'use client';

import { ChaingraphClient } from "chaingraph-ts";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  decodeTransaction, 
  hexToBin, 
  lockingBytecodeToCashAddress,
  binToHex,
  Transaction,
  encodeTransaction,
  disassembleBytecodeBCH
} from "@bitauth/libauth";

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

function formatHexWithNewlines(hex: string): string {
  const charsPerLine = 128; // 64 bytes = 128 hex chars
  const lines = hex.match(new RegExp(`.{1,${charsPerLine}}`, 'g')) || [];
  return lines.join('\n');
}

function formatTimestamp(timestamp: string): string {
  return new Date(parseInt(timestamp) * 1000).toLocaleString();
}

function tryDecodeCashAddress(lockingBytecode: string): string {
  try {
    // Remove \x prefix if present
    const cleanHex = lockingBytecode.replace(/^\\x/, '');
    const bytecode = hexToBin(cleanHex);
    const result = lockingBytecodeToCashAddress({
      bytecode,
      prefix: 'bitcoincash'
    });
    if (typeof result === 'string') {
      return 'Invalid locking bytecode';
    }
    return result.address;
  } catch (e) {
    console.error('Error decoding address:', e);
    return 'Could not decode address';
  }
}

function formatSats(sats: string | null): string {
  if (!sats) return '0 sats';
  return `${parseInt(sats).toLocaleString()} sats`;
}

function parseScript(lockingBytecode: string): string {
  try {
    const cleanHex = lockingBytecode.replace(/^\\x/, '');
    const bytecode = hexToBin(cleanHex);
    const result = disassembleBytecodeBCH(bytecode);
    if (typeof result === 'string') {
      return result;
    }
    return result;
  } catch (e) {
    console.error('Error parsing script:', e);
    return 'Could not parse script';
  }
}

export default function TransactionPage() {
  const params = useParams();
  const txId = params.id as string;
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [decodedTx, setDecodedTx] = useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const blockInclusion = transaction.block_inclusions[0];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Transaction Details</h1>
      
      <div className="space-y-6">
        {/* Transaction Overview */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Transaction ID</p>
              <p className="font-mono text-sm break-all">{txId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Size</p>
              <p>{transaction.size_bytes} bytes</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fee</p>
              <p>{formatSats(transaction.fee_satoshis)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Locktime</p>
              <p>{transaction.locktime}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <p>{transaction.is_coinbase ? 'Coinbase' : 'Regular'}</p>
            </div>
          </div>
        </div>

        {/* Block Information */}
        {blockInclusion && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Block Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Block Height</p>
                <p>{blockInclusion.block.height}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Timestamp</p>
                <p>{formatTimestamp(blockInclusion.block.timestamp)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Block Hash</p>
                <p className="font-mono text-sm break-all">{blockInclusion.block.hash.replace('\\x', '')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Inputs */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">{transaction.inputs.length} Inputs</h2>
          <div className="space-y-4">
            {transaction.inputs.map((input) => (
              <div key={input.input_index} className="border rounded p-4">
                <div className="grid grid-cols-1 gap-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-600">Index</p>
                      <p>{input.input_index}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Value</p>
                      <p>{formatSats(input.value_satoshis)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Outpoint TxID</p>
                    <p className="font-mono text-sm break-all">{input.outpoint_transaction_hash.replace('\\x', '')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Outpoint Index</p>
                    <p>{input.outpoint_index}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sequence</p>
                    <p>{input.sequence_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Unlocking Bytecode</p>
                    <p className="font-mono text-sm break-all">{input.unlocking_bytecode?.replace('\\x', '') || 'No unlocking bytecode'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Unlocking Script</p>
                    <p className="font-mono text-sm break-all">{input.unlocking_bytecode ? parseScript(input.unlocking_bytecode) : 'No unlocking script'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Outputs */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">{transaction.outputs.length} Outputs</h2>
          <div className="space-y-4">
            {transaction.outputs.map((output) => (
              <div key={output.output_index} className="border rounded p-4">
                <div className="grid grid-cols-1 gap-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-600">Index</p>
                      <p>{output.output_index}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Value</p>
                      <p>{formatSats(output.value_satoshis)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-mono text-sm break-all">
                      {tryDecodeCashAddress(output.locking_bytecode)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Locking Bytecode</p>
                    <p className="font-mono text-sm break-all">{output.locking_bytecode.replace('\\x', '')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Locking Script</p>
                    <p className="font-mono text-sm break-all">{parseScript(output.locking_bytecode)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Raw Transaction */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Raw Transaction</h2>
          <pre className="font-mono text-sm bg-gray-50 p-4 rounded overflow-x-auto whitespace-pre-wrap">
            {formatHexWithNewlines(transaction.encoded_hex || '')}
          </pre>
        </div>
      </div>
    </div>
  );
} 