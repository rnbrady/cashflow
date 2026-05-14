"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { LockOpen } from "lucide-react";
import { PiSignatureBold, PiKeyBold } from "react-icons/pi";

import { hashToColor, tryDecodeCashAddress } from "@/lib/utils";
import { InputNodeType } from "@/lib/types";
import { TokenData } from "../token-data";
import { ScriptTypeBadge } from "../script-type-badge";

function InputNode({
  data: { input, synthetic },
  isConnectable,
}: NodeProps<InputNodeType>) {
  const borderColor = input.outpoint_transaction_hash
    ? hashToColor(input.outpoint_transaction_hash)
    : "#6366f1";

  const isCoinbase =
    !synthetic &&
    input.outpoint_transaction_hash ===
    "0000000000000000000000000000000000000000000000000000000000000000";
  const isParsingBytecode = synthetic && input.input_index === "1";

  return (
    <div className="input-node">
      {/* Input handle on the left */}
      <Handle
        id={`input-${input.input_index}`}
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="size-3 bg-blue-500"
        style={{ left: -4 }}
      />

      <div
        className="rounded-md border-l-4 p-2 text-xs text-foreground shadow-sm transparency:bg-tx-input-background/50"
        style={{ borderLeftColor: borderColor }}
      >
        <div className="font-medium mb-1 flex justify-between items-center">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
            {Number(input.value_satoshis).toLocaleString()}
          </span>
          <span className="font-medium text-muted-foreground">
            #{input.input_index}
          </span>
        </div>

        {isParsingBytecode && (
          <div className="flex justify-end text-right">
            <div className="mb-1 inline-block rounded bg-blue-500/15 px-1 text-[10px] text-blue-700 dark:text-blue-300">
              Parsing bytecode
            </div>
          </div>
        )}

        {!isParsingBytecode && input.unlocking_bytecode_pattern && (
          <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
            <LockOpen className="mr-0.5 inline-block size-2.5 shrink-0" />{" "}
            <ScriptTypeBadge output={input.outpoint} />
            {input.unlocking_bytecode_pattern === "4121" && (
              <div className="flex items-center">
                <div className="max-w-2/3 shrink-0 truncate rounded border px-0.25 text-[6px]">
                  {65}
                </div>
                <PiSignatureBold className="ml-0.5 inline-block size-2.5 text-muted-foreground" />
                <div className="ml-1 max-w-2/3 shrink-0 truncate rounded border px-0.25 text-[6px]">
                  {33}
                </div>
                <PiKeyBold className="ml-0.5 inline-block size-2.5 text-muted-foreground" />
              </div>
            )}
            {input.outpoint?.locking_bytecode && (
              <div className="ml-1 truncate text-[10px] text-muted-foreground hover:fixed hover:z-[2147483647] hover:overflow-visible hover:bg-muted">
                {tryDecodeCashAddress(
                  input.outpoint?.locking_bytecode,
                  !!input.outpoint?.token_category
                )?.replace("bitcoincash:", "")}
              </div>
            )}
          </div>
        )}

        {isCoinbase && (
          <div className="text-muted-foreground">
            <div className="mb-1 inline-block rounded bg-yellow-500/15 px-1 text-[10px] text-yellow-700 dark:text-yellow-300">
              Coinbase
            </div>
            <div className="text-[10px] truncate">
              {input.outpoint_transaction_hash?.substring(0, 20)}...
            </div>
          </div>
        )}

        <TokenData input={input} />
      </div>
    </div>
  );
}

export default memo(InputNode);
