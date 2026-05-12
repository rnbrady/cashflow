"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { LockOpen } from "lucide-react";
import { PiSignatureBold, PiKeyBold } from "react-icons/pi";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { hashToColor, tryDecodeCashAddress } from "@/lib/utils";
import { InputNodeType } from "@/lib/types";
import { TokenData } from "../token-data";
import { ScriptTypeBadge } from "../script-type-badge";

function InputNode({
  data: { input },
  isConnectable,
}: NodeProps<InputNodeType>) {
  const borderColor = input.outpoint_transaction_hash
    ? hashToColor(input.outpoint_transaction_hash)
    : "#6366f1";

  const isCoinbase =
    input.outpoint_transaction_hash ===
    "0000000000000000000000000000000000000000000000000000000000000000";

  return (
    <TooltipProvider>
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

        <Tooltip>
          <TooltipTrigger asChild>
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

              {input.unlocking_bytecode_pattern && (
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
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            {isCoinbase ? (
              <div>
                <div className="font-bold">Coinbase Input</div>
                <div className="text-xs mt-1">
                  <div>Sequence: {input.sequence_number}</div>
                  <div className="break-all">
                    Data: {input.unlocking_bytecode}
                  </div>
                  <div className="break-all">
                    Decoded:{" "}
                    {Buffer.from(
                      input.unlocking_bytecode?.replace(/^0x/, "") || "",
                      "hex"
                    ).toString("ascii")}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="font-bold">Input #{input.input_index}</div>
                <div className="text-xs mt-1">
                  <div>Previous TX: {input.outpoint_transaction_hash}</div>
                  <div>Output Index: {input.outpoint_index}</div>
                  <div>Sequence: {input.sequence_number}</div>
                </div>
              </div>
            )}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export default memo(InputNode);
