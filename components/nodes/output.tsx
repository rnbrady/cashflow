"use client";

import React, { memo } from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  hashToColor,
  getScriptType,
  tryDecodeCashAddress,
  truncateMiddle,
} from "@/lib/utils";
import { OutputNodeType } from "@/lib/types";

function OutputNode({
  data: { output },
  isConnectable,
}: NodeProps<OutputNodeType>) {
  const borderColor = hashToColor(output.spent_by?.[0]?.transaction.hash);

  const scriptType = getScriptType(output.locking_bytecode_pattern);

  // Determine badge color based on script type
  let badgeColor = "bg-gray-100 text-gray-800";
  if (scriptType === "P2PKH") badgeColor = "bg-green-100 text-green-800";
  if (scriptType === "P2SH") badgeColor = "bg-purple-100 text-purple-800";
  if (scriptType === "P2SH32") badgeColor = "bg-fuchsia-100 text-fuchsia-800";
  if (scriptType === "OP_RETURN") badgeColor = "bg-blue-100 text-blue-800";

  const address = tryDecodeCashAddress(output.locking_bytecode);

  const tokenColor = output.token_category
    ? hashToColor(output.token_category)
    : "bg-gray-100 text-gray-800";

  return (
    <TooltipProvider>
      <div className="output-node">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="p-2 rounded-md bg-gray-100 border-r-4 shadow-md text-xs text-right"
              style={{ borderRightColor: borderColor }}
            >
              <div className="font-medium mb-1 flex justify-between items-center">
                <span className="font-medium text-gray-500">
                  #{output.output_index}
                </span>
                <span className="text-emerald-600 text-[10px]">
                  {Number(output.value_satoshis).toLocaleString()}
                </span>
              </div>

              <div className="text-gray-500">
                <div className="flex justify-between text-[10px] mb-1 gap-2">
                  <span className={`rounded ${badgeColor} px-1`}>
                    {scriptType}
                  </span>
                  {output.locking_bytecode && (
                    <div className="text-[10px] truncate">
                      {address.replace("bitcoincash:", "")}
                    </div>
                  )}
                </div>
              </div>

              {output.token_category && (
                <>
                  <div className="flex justify-between items-center">
                    <div
                      className="text-[10px] truncate px-1 rounded max-w-1/2 shrink-1"
                      style={{
                        backgroundColor: tokenColor,
                        color: "white",
                      }}
                    >
                      {output.token_category.slice(2)}
                    </div>
                    {Number(output.fungible_token_amount) > 0 && (
                      <div
                        className="text-[10px] pl-2 rounded"
                        style={{
                          color: tokenColor,
                        }}
                      >
                        {Number(output.fungible_token_amount).toLocaleString()}
                      </div>
                    )}
                  </div>
                  {output.nonfungible_token_capability && (
                    <div className="flex justify-between items-center mt-1">
                      <div
                        className="text-[10px] truncate px-1 rounded max-w-2/3 shrink-0"
                        style={{
                          backgroundColor: tokenColor,
                          color: "white",
                        }}
                      >
                        {
                          {
                            minting: "minting nft",
                            mutable: "mutable nft",
                            none: "immutable nft",
                            missing: "no nft",
                          }[output.nonfungible_token_capability ?? "missing"]
                        }
                      </div>
                      <div className="flex items-center">
                        {(output.nonfungible_token_commitment?.length ?? 0) >
                          2 && (
                          <div
                            className="text-[6px] truncate px-0.25 rounded max-w-2/3 shrink-0 text-"
                            style={{
                              borderWidth: 1,
                              borderColor: tokenColor,
                              color: tokenColor,
                            }}
                          >
                            {((output.nonfungible_token_commitment ?? "\\x")
                              .length -
                              2) /
                              2}
                          </div>
                        )}
                        <div
                          className="text-[10px] pl-0.5 rounded truncate"
                          style={{
                            color: tokenColor,
                          }}
                        >
                          {typeof output.nonfungible_token_commitment ===
                            "string" &&
                          output.nonfungible_token_commitment.length > 2
                            ? truncateMiddle(
                                output.nonfungible_token_commitment.replace(
                                  "\\x",
                                  "0x"
                                ),
                                5
                              )
                            : ""}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div>
              <div className="font-bold">Output #{output.output_index}</div>
              <div className="text-xs mt-1">
                <div>Value: {output.value_satoshis} sats</div>
                <div>Type: {scriptType}</div>
                {address && (
                  <div>
                    <div>Address: {address}</div>
                  </div>
                )}
                <div>Script: {output.locking_bytecode_pattern}</div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Output handle on the right */}
        <Handle
          id={`output-${output.output_index}`}
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
          className="w-3 h-3 bg-green-500"
          style={{ right: -4 }}
        />
      </div>
    </TooltipProvider>
  );
}

export default memo(OutputNode);
