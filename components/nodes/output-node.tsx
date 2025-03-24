import { memo } from "react"
import { Handle, Position } from "reactflow"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Output } from "@/lib/types"
import { hashToColor } from "@/lib/utils"
import { getScriptType, tryDecodeCashAddress } from "@/lib/utils"


function OutputNode({ output, isConnectable }: { output: Output, isConnectable: boolean }) {
  const borderColor = output.transaction_hash ? hashToColor(output.transaction_hash) : "#6366f1"

  const scriptType = getScriptType(output.locking_bytecode_pattern)

  // Determine badge color based on script type
  let badgeColor = "bg-gray-100 text-gray-800"
  if (scriptType === "P2PKH")
    badgeColor = "bg-green-100 text-green-800"
  if (scriptType === "P2SH") 
    badgeColor = "bg-purple-100 text-purple-800"
  if (scriptType === "OP_RETURN")
    badgeColor = "bg-blue-100 text-blue-800"

  return (
    <TooltipProvider>
      <div className="output-node">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="p-2 rounded-md bg-gray-100 border-r-4 shadow-sm text-xs text-right"
              style={{ borderRightColor: borderColor }}
            >
              <div className="font-medium mb-1">Output #{output.output_index}</div>

              <div className="text-gray-600">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className={`px-1 rounded ${badgeColor}`}>{scriptType}</span>
                  <span className="font-medium">{output.value_satoshis} sats</span>
                </div>

                {output.locking_bytecode && <div className="text-[10px] truncate">{tryDecodeCashAddress(output.locking_bytecode)}</div>}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div>
              <div className="font-bold">Output #{output.output_index}</div>
              <div className="text-xs mt-1">
                <div>Value: {output.value_satoshis} sats</div>
                <div>Type: {scriptType}</div>
                {tryDecodeCashAddress(output.locking_bytecode) && (
                  <div>
                    <div>Address: {tryDecodeCashAddress(output.locking_bytecode)}</div>
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
          style={{ right: -8 }}
        />
      </div>
    </TooltipProvider>
  )
}

export default memo(OutputNode)

