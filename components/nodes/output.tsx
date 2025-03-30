"use client";

import React, { memo } from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { hashToColor, getScriptType, tryDecodeCashAddress } from "@/lib/utils";
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
  if (scriptType === "OP_RETURN") badgeColor = "bg-blue-100 text-blue-800";

  const address = tryDecodeCashAddress(output.locking_bytecode);

  return (
    <TooltipProvider>
      <div className="output-node">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="p-2 rounded-md bg-gray-100 border-r-4 shadow-sm text-xs text-right"
              style={{ borderRightColor: borderColor }}
            >
              <div className="font-medium mb-1">
                Output #{output.output_index}
              </div>

              <div className="text-gray-600">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className={`px-1 rounded ${badgeColor}`}>
                    {scriptType}
                  </span>
                  <span className="font-medium">
                    {output.value_satoshis} sats
                  </span>
                </div>

                {output.locking_bytecode && (
                  <div className="text-[10px] truncate">{address}</div>
                )}
              </div>
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
