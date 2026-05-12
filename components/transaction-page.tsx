import Link from "next/link";
import { useState, useEffect } from "react";
import {
  formatHexWithNewlines,
  formatTimestamp,
  tryDecodeCashAddress,
  formatValue,
  parseScript,
  getScriptType,
  ValueUnit,
} from "@/lib/utils";
import { Transaction } from "@/lib/types";

interface TransactionPageProps {
  transaction: Transaction;
}

export function TransactionPage({ transaction }: TransactionPageProps) {
  const [unit, setUnit] = useState<ValueUnit>("sats");
  const [usdRate, setUsdRate] = useState<number>();
  const txId = transaction.hash.replace("\\x", "");
  const blockInclusion = transaction.block_inclusions[0];

  useEffect(() => {
    async function fetchExchangeRate() {
      try {
        const response = await fetch(
          "https://api.coinbase.com/v2/exchange-rates?currency=BCH"
        );
        const data = await response.json();
        setUsdRate(parseFloat(data.data.rates.USD));
      } catch (error) {
        console.error("Failed to fetch exchange rate:", error);
      }
    }
    fetchExchangeRate();
  }, []);

  const toggleUnit = () => {
    setUnit((prev) => {
      switch (prev) {
        case "sats":
          return "BCH";
        case "BCH":
          return "USD";
        default:
          return "sats";
      }
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Transaction Details</h1>

      <div className="flex flex-col gap-6">
        {/* Transaction Overview */}
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Transaction ID</p>
              <p className="font-mono text-sm break-all">{txId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Size</p>
              <p>{transaction.size_bytes} bytes</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fee</p>
              <button
                onClick={toggleUnit}
                className="transition-colors hover:text-primary"
                title="Click to toggle between sats, BCH, and USD"
              >
                {formatValue(transaction.fee_satoshis, unit, usdRate)}
              </button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Locktime</p>
              <p>{transaction.locktime}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p>{transaction.is_coinbase ? "Coinbase" : "Regular"}</p>
            </div>
          </div>
        </div>

        {/* Block Information */}
        {blockInclusion && (
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Block Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Block Height</p>
                <p>{blockInclusion.block.height}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Timestamp</p>
                <p>{formatTimestamp(blockInclusion.block.timestamp)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Block Hash</p>
                <p className="font-mono text-sm break-all">
                  {blockInclusion.block.hash.replace("\\x", "")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Transaction I/O */}
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Inputs */}
            <div>
              <h2 className="text-lg font-semibold mb-4">
                {transaction.inputs.length} Inputs
              </h2>
              <div className="flex flex-col gap-4">
                {transaction.inputs.map((input) => (
                  <div key={input.input_index} className="border rounded p-4">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Index</p>
                          <p>{input.input_index}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Value</p>
                          <button
                            onClick={toggleUnit}
                            className="transition-colors hover:text-primary"
                            title="Click to toggle between sats, BCH, and USD"
                          >
                            {formatValue(input.value_satoshis, unit, usdRate)}
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Outpoint TxID</p>
                        <Link
                          href={`/tx/${input.outpoint_transaction_hash.replace(
                            "\\x",
                            ""
                          )}`}
                          className="font-mono text-sm break-all text-primary hover:underline"
                        >
                          {input.outpoint_transaction_hash.replace("\\x", "")}
                        </Link>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Outpoint Index</p>
                        <p>{input.outpoint_index}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Sequence</p>
                        <p>{input.sequence_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Unlocking Bytecode
                        </p>
                        <p className="font-mono text-sm break-all">
                          {input.unlocking_bytecode?.replace("\\x", "") ||
                            "No unlocking bytecode"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Unlocking Script
                        </p>
                        <p className="font-mono text-sm break-all">
                          {input.unlocking_bytecode
                            ? parseScript(input.unlocking_bytecode)
                            : "No unlocking script"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Outputs */}
            <div>
              <h2 className="text-lg font-semibold mb-4">
                {transaction.outputs.length} Outputs
              </h2>
              <div className="flex flex-col gap-4">
                {transaction.outputs.map((output) => (
                  <div key={output.output_index} className="border rounded p-4">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Index</p>
                          <p>{output.output_index}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Value</p>
                          <button
                            onClick={toggleUnit}
                            className="transition-colors hover:text-primary"
                            title="Click to toggle between sats, BCH, and USD"
                          >
                            {formatValue(output.value_satoshis, unit, usdRate)}
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-mono text-sm break-all">
                          {tryDecodeCashAddress(
                            output.locking_bytecode,
                            !!output.token_category
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Locking Bytecode
                        </p>
                        <p className="font-mono text-sm break-all">
                          {output.locking_bytecode?.replace("\\x", "") ||
                            "No locking bytecode"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Locking Script</p>
                        <p className="font-mono text-sm break-all">
                          {output.locking_bytecode
                            ? parseScript(output.locking_bytecode)
                            : "No locking script"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="text-sm">
                          {getScriptType(output.locking_bytecode_pattern, true)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tokens</p>
                        <p className="text-sm">
                          {output.nonfungible_token_capability}{" "}
                          {output.nonfungible_token_commitment}{" "}
                          {output.fungible_token_amount}
                        </p>
                      </div>
                      {output.spent_by?.[0] && (
                        <div>
                          <p className="text-sm text-muted-foreground">Spent By</p>
                          <Link
                            href={`/tx/${output.spent_by[0].transaction.hash.replace(
                              "\\x",
                              ""
                            )}`}
                            className="font-mono text-sm break-all text-primary hover:underline"
                          >
                            {output.spent_by[0].transaction.hash.replace(
                              "\\x",
                              ""
                            )}
                          </Link>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Input Index: {output.spent_by[0].input_index}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Raw Transaction */}
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Raw Transaction</h2>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-muted p-4 font-mono text-sm">
            {formatHexWithNewlines(transaction.encoded_hex || "")}
          </pre>
        </div>
      </div>
    </div>
  );
}
