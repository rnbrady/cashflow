import { TooltipProvider } from "@/components/ui/tooltip"
import { truncateHash, getContrastColor, hashToColor } from "@/lib/utils"
import { Transaction, PlaceholderTransaction } from "@/lib/types"
import { Node, NodeProps } from "@xyflow/react"

export type TransactionNode = Node<{
  transaction: Transaction | PlaceholderTransaction
}, 'transaction'>

export function TransactionNode({ data: { transaction } }: NodeProps<TransactionNode>) {
  const color = hashToColor(transaction.hash);
  const textColor = getContrastColor(color)
  
  // Calculate height based on number of inputs and outputs
  const numInputs = transaction.inputs?.length || 1
  const numOutputs = transaction.outputs?.length || 1
  const contentHeight = Math.max(numInputs, numOutputs) * 82 + 18

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
            <div className="text-sm font-medium">{truncateHash(transaction.hash, 24)}</div>
          </div>

          {/* Transaction content - will contain child nodes */}
          <div className="p-2" style={{ height: `${contentHeight}px` }}>{/* Child nodes will be rendered here */}</div>

          {/* Transaction footer with additional info */}
          <div className="px-3 py-1 border-t border-gray-200 bg-gray-50 flex justify-between text-[10px] text-gray-500">
            <div>{transaction.size_bytes || "?"} bytes</div>
            <div>v1</div>
            <div>locktime {transaction.locktime}</div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}


