import Link from "next/link";
import { Transaction } from "@bitauth/libauth";
import { 
  formatHexWithNewlines,
  formatTimestamp,
  tryDecodeCashAddress,
  formatSats,
  parseScript
} from "../lib/transaction-utils";

interface TransactionPageProps {
  transaction: {
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
  };
  decodedTx: Transaction | null;
  parentTransactions?: Map<string, any>;
}

export function TransactionPage({ transaction, decodedTx, parentTransactions }: TransactionPageProps) {
  const txId = transaction.hash.replace('\\x', '');
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
                    <Link 
                      href={`/tx/${input.outpoint_transaction_hash.replace('\\x', '')}`}
                      className="font-mono text-sm break-all text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {input.outpoint_transaction_hash.replace('\\x', '')}
                    </Link>
                    {parentTransactions?.get(input.outpoint_transaction_hash) && (
                      <div className="mt-1 text-xs text-gray-500">
                        <p>Size: {parentTransactions.get(input.outpoint_transaction_hash).size_bytes} bytes</p>
                        <p>Fee: {formatSats(parentTransactions.get(input.outpoint_transaction_hash).fee_satoshis)}</p>
                        {parentTransactions.get(input.outpoint_transaction_hash).block_inclusions?.[0]?.block && (
                          <p>
                            Block: {parentTransactions.get(input.outpoint_transaction_hash).block_inclusions[0].block.height}
                            ({formatTimestamp(parentTransactions.get(input.outpoint_transaction_hash).block_inclusions[0].block.timestamp)})
                          </p>
                        )}
                      </div>
                    )}
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