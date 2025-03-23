import { memo } from "react"
import { Handle, Position } from "reactflow"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Helper function to truncate hashes/addresses
const truncateHash = (hash) => {
  if (!hash) return ""
  return `${hash.substring(0, 4)}...${hash.substring(hash.length - 4)}`
}

function OutputNode({ data, isConnectable }) {
  const { output, index, parentColor } = data
  const scriptType = output.scriptPubKey?.type?.toUpperCase() || "UNKNOWN"
  const address = output.scriptPubKey?.addresses?.[0] || ""

  // Lighter version of parent color for the border
  const borderColor = parentColor || "#6366f1"

  // Determine badge color based on script type
  let badgeColor = "bg-gray-100 text-gray-800"
  if (scriptType === "PUBKEY" || scriptType === "PUBKEYHASH") {
    badgeColor = "bg-green-100 text-green-800"
  } else if (scriptType === "SCRIPTHASH") {
    badgeColor = "bg-purple-100 text-purple-800"
  } else if (scriptType === "MULTISIG") {
    badgeColor = "bg-blue-100 text-blue-800"
  }

  return (
    <TooltipProvider>
      <div className="output-node">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="p-2 rounded-md bg-gray-100 border-r-4 shadow-sm text-xs text-right"
              style={{ borderRightColor: borderColor }}
            >
              <div className="font-medium mb-1">Output #{index}</div>

              <div className="text-gray-600">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className={`px-1 rounded ${badgeColor}`}>{scriptType}</span>
                  <span className="font-medium">{output.value} BCH</span>
                </div>

                {address && <div className="text-[10px] truncate">{truncateHash(address)}</div>}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div>
              <div className="font-bold">Output #{index}</div>
              <div className="text-xs mt-1">
                <div>Value: {output.value} BCH</div>
                <div>Type: {output.scriptPubKey?.type}</div>
                {address && (
                  <div>
                    <div>Address: {address}</div>
                  </div>
                )}
                <div>Script: {output.scriptPubKey?.hex?.substring(0, 20)}...</div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Output handle on the right */}
        <Handle
          id={`output-${index}`}
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

