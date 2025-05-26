"use client";

import React, { memo, useState } from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import { Lock } from "lucide-react";
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
  decodeOpReturnContents,
} from "@/lib/utils";
import { OutputNodeType } from "@/lib/types";
import "./overrides.css";
import { TokenData } from "../token-data";
import { ScriptTypeBadge } from "../script-type-badge";

function OutputNode({
  data: { output },
  isConnectable,
}: NodeProps<OutputNodeType>) {
  const [decodeOpReturn, setDecodeOpReturn] = useState<boolean>(false);

  const borderColor = hashToColor(output.spent_by?.[0]?.transaction.hash);

  const scriptType = getScriptType(output.locking_bytecode_pattern);

  const address = tryDecodeCashAddress(output.locking_bytecode);

  const tokenColor = output.token_category
    ? hashToColor(output.token_category)
    : "bg-gray-100 text-gray-800";

  const toggleDecodeOpReturns = () => {
    setDecodeOpReturn((decodeOpReturn) => !decodeOpReturn);
  };

  return (
    <TooltipProvider>
      <div className="output-node">
        <Tooltip>
          <div
            className="p-2 rounded-md bg-gray-100 transparency:bg-gray-200/50 border-r-4 shadow-md text-xs text-right"
            style={{ borderRightColor: borderColor }}
          >
            <TooltipTrigger asChild>
              <div className="font-medium mb-1 flex justify-between items-center">
                <span className="font-medium text-gray-500">
                  #{output.output_index}
                </span>
                <span className="text-emerald-600 text-[10px]">
                  {Number(output.value_satoshis).toLocaleString()}
                </span>
              </div>
            </TooltipTrigger>

            <div className="text-gray-500">
              <div className="flex justify-between text-[10px] mb-1 gap-2 items-start">
                <div className="flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5 shrink-0" />
                  <ScriptTypeBadge output={output} />
                </div>
                {output.locking_bytecode && (
                  <div className="text-[10px] truncate hover:overflow-visible hover:bg-gray-100 hover:z-[2147483647] hover:whitespace-pre hover:absolute hover:translate-x-22">
                    {address === "Could not decode" ? (
                      <div
                        onClick={toggleDecodeOpReturns}
                        className="flex gap-1 hover:gap-0 hover:flex-col items-start"
                      >
                        {decodeOpReturn ? (
                          decodeOpReturnContents(output.locking_bytecode)
                            .split(";")
                            .map((field) => {
                              if (
                                field.startsWith("https://") ||
                                field.startsWith("http://")
                              ) {
                                return (
                                  <a
                                    href={field}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {field}
                                  </a>
                                );
                              }

                              if (field.startsWith("ipfs://")) {
                                return (
                                  <a
                                    href={`https://ipfs.io/ipfs/${field.slice(
                                      7
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {field}
                                  </a>
                                );
                              }

                              if (/^[a-zA-Z0-9]+\..+\/.+$/.test(field)) {
                                return (
                                  <a
                                    href={`https://${field}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {field}
                                  </a>
                                );
                              }

                              return <div>{field}</div>;
                            })
                        ) : (
                          <div className="flex items-center gap-0.5 truncate">
                            <div className="text-[6px] px-0.25 rounded max-w-2/3 shrink-0 border border-gray-500 ">
                              {65}
                            </div>
                            <div className="truncate">
                              {output.locking_bytecode.replace("\\x", "0x")}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      address.replace("bitcoincash:", "")
                    )}
                  </div>
                )}
              </div>
            </div>

            <TokenData output={output} />
          </div>

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
