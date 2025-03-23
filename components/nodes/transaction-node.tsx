import { memo } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"

// Helper function to truncate hashes/addresses
const truncateHash = (hash) => {
  if (!hash) return ""
  return `${hash.substring(0, 4)}...${hash.substring(hash.length - 4)}`
}

// Helper to generate a contrasting text color based on background
const getContrastColor = (hexColor) => {
  // Convert hex to RGB
  let r = 0,
    g = 0,
    b = 0

  if (hexColor.startsWith("#")) {
    r = Number.parseInt(hexColor.slice(1, 3), 16)
    g = Number.parseInt(hexColor.slice(3, 5), 16)
    b = Number.parseInt(hexColor.slice(5, 7), 16)
  } else if (hexColor.startsWith("hsl")) {
    // For HSL colors, just use a simple heuristic
    const match = hexColor.match(/hsl$$(\d+),\s*(\d+)%,\s*(\d+)%$$/)
    if (match) {
      const l = Number.parseInt(match[3])
      return l > 50 ? "#000000" : "#ffffff"
    }
    return "#ffffff"
  }

  // Calculate perceived brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000

  // Return black or white based on brightness
  return brightness > 128 ? "#000000" : "#ffffff"
}

function TransactionNode({ data, isConnectable }) {
  const isMain = data.isMain || false
  const color = data.color || "#6366f1" // Default to indigo if no color provided
  const textColor = getContrastColor(color)
  
  // Calculate height based on number of inputs and outputs
  const numInputs = data.vin?.length || 0
  const numOutputs = data.vout?.length || 0
  const contentHeight = Math.max(numInputs, numOutputs) * 80 + 20

  return (
    <TooltipProvider>
      <div className="transaction-node">
        {/* Transaction container */}
        <div
          className={`relative rounded-lg border border-gray-300 bg-white overflow-hidden`}
        >
          {/* Transaction header with hash-based color */}
          <div
            className="px-3 py-2 border-b"
            style={{
              backgroundColor: color,
              color: textColor,
            }}
          >
            <div className="text-sm font-medium truncate">{truncateHash(data.txid)}</div>
          </div>

          {/* Transaction content - will contain child nodes */}
          <div className="p-2" style={{ height: `${contentHeight}px` }}>{/* Child nodes will be rendered here */}</div>

          {/* Transaction footer with additional info */}
          <div className="px-3 py-1 border-t border-gray-200 bg-gray-50 flex justify-between text-[10px] text-gray-500">
            <div>{data.size || "?"} bytes</div>
            <div>v1</div>
            <div>locktime {data.locktime || 0}</div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default memo(TransactionNode)

