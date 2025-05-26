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
          className="w-3 h-3 bg-blue-500"
          style={{ left: -4 }}
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="p-2 rounded-md  bg-gray-100 transparency:bg-gray-200/50 border-l-4 shadow-sm text-xs"
              style={{ borderLeftColor: borderColor }}
            >
              <div className="font-medium mb-1 flex justify-between items-center">
                <span className="text-emerald-600 text-[10px]">
                  {Number(input.value_satoshis).toLocaleString()}
                </span>
                <span className="font-medium text-gray-500">
                  #{input.input_index}
                </span>
              </div>

              {input.unlocking_bytecode_pattern && (
                <div className="text-gray-500 flex justify-between mb-1 text-[10px] items-center">
                  <LockOpen className="w-2.5 h-2.5 inline-block mr-0.5 shrink-0" />{" "}
                  <ScriptTypeBadge output={input.outpoint} />
                  {input.unlocking_bytecode_pattern === "4121" && (
                    <div className="flex items-center">
                      <div className="text-[6px] truncate px-0.25 rounded max-w-2/3 shrink-0 border border-gray-500 ">
                        {65}
                      </div>
                      <PiSignatureBold className="w-2.5 h-2.5 inline-block ml-0.5 text-gray-500" />
                      <div className="text-[6px] truncate px-0.25 rounded max-w-2/3 shrink-0 border border-gray-500 ml-1">
                        {33}
                      </div>
                      <PiKeyBold className="w-2.5 h-2.5 inline-block ml-0.5 text-gray-500" />
                    </div>
                  )}
                  {input.outpoint?.locking_bytecode && (
                    <div className="text-[10px] truncate ml-1 text-gray-500 hover:overflow-visible hover:bg-gray-100 hover:fixed hover:z-[2147483647]">
                      {tryDecodeCashAddress(
                        input.outpoint?.locking_bytecode
                      )?.replace("bitcoincash:", "")}
                    </div>
                  )}
                </div>
              )}

              {isCoinbase && (
                <div className="text-gray-600">
                  <div className="bg-yellow-100 text-yellow-800 px-1 rounded text-[10px] inline-block mb-1">
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
