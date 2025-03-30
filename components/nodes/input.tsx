"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { hashToColor, truncateHash } from "@/lib/utils";
import { InputNodeType } from "@/lib/types";

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
          className="w-3 h-3 bg-blue-500"
          style={{ left: -4 }}
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="p-2 rounded-md bg-gray-100 border-l-4 shadow-sm text-xs"
              style={{ borderLeftColor: borderColor }}
            >
              <div className="font-medium mb-1">Input #{input.input_index}</div>

              {isCoinbase ? (
                <div className="text-gray-600">
                  <div className="bg-yellow-100 text-yellow-800 px-1 rounded text-[10px] inline-block mb-1">
                    Coinbase
                  </div>
                  <div className="text-[10px] truncate">
                    {input.outpoint_transaction_hash?.substring(0, 20)}...
                  </div>
                </div>
              ) : (
                <div className="text-gray-600">
                  <div className="flex justify-between text-[10px]">
                    <span>From TX:</span>
                    <span>{truncateHash(input.outpoint_transaction_hash)}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span>Output:</span>
                    <span>#{input.outpoint_index}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span>Sequence:</span>
                    <span>{input.sequence_number}</span>
                  </div>
                </div>
              )}
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
