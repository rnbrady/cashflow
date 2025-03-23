import { memo } from "react"
import { Handle, Position } from "reactflow"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Helper function to truncate hashes/addresses
const truncateHash = (hash) => {
  if (!hash) return ""
  return `${hash.substring(0, 4)}...${hash.substring(hash.length - 4)}`
}

function InputNode({ data, isConnectable }) {
  const { input, index, parentColor } = data
  const isCoinbase = !!input.coinbase

  // Lighter version of parent color for the border
  const borderColor = parentColor || "#6366f1"

  return (
    <TooltipProvider>
      <div className="input-node">
        {/* Input handle on the left */}
        <Handle
          id={`input-${index}`}
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          className="w-3 h-3 bg-blue-500"
          style={{ left: -8 }}
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="p-2 rounded-md bg-gray-100 border-l-4 shadow-sm text-xs"
              style={{ borderLeftColor: borderColor}}
            >
              <div className="font-medium mb-1">Input #{index}</div>

              {isCoinbase ? (
                <div className="text-gray-600">
                  <div className="bg-yellow-100 text-yellow-800 px-1 rounded text-[10px] inline-block mb-1">
                    Coinbase
                  </div>
                  <div className="text-[10px] truncate">{input.coinbase?.substring(0, 20)}...</div>
                </div>
              ) : (
                <div className="text-gray-600">
                  <div className="flex justify-between text-[10px]">
                    <span>From TX:</span>
                    <span>{truncateHash(input.txid)}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span>Output:</span>
                    <span>#{input.vout}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span>Sequence:</span>
                    <span>{input.sequence}</span>
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
                  <div>Sequence: {input.sequence}</div>
                  <div className="break-all">Data: {input.coinbase}</div>
                </div>
              </div>
            ) : (
              <div>
                <div className="font-bold">Input #{index}</div>
                <div className="text-xs mt-1">
                  <div>Previous TX: {input.txid}</div>
                  <div>Output Index: {input.vout}</div>
                  <div>Sequence: {input.sequence}</div>
                  {input.scriptSig && (
                    <div>
                      <div>Script Type: {input.scriptSig.asm?.includes("OP_") ? "Script" : "Signature"}</div>
                      <div className="truncate">Script: {input.scriptSig.hex?.substring(0, 20)}...</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}

export default memo(InputNode)

