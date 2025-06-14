"use client";

import React, { memo, useCallback } from "react";
import { NodeProps, useReactFlow } from "@xyflow/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn, getContrastColor, hashToColor } from "@/lib/utils";
import { TransactionNodeType } from "@/lib/types";
import { CaptionsOff, Copy, PencilLine, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { useShallow } from "zustand/react/shallow";
import { ChartState, useStore } from "@/lib/store";

function TransactionNode({
  data: { transaction, placeholder },
  selected,
}: NodeProps<TransactionNodeType>) {
  const color = hashToColor(transaction.hash);
  const textColor = getContrastColor(color);

  // Calculate height based on number of inputs and outputs
  const numInputs = Math.max(
    transaction.minInputs || 0,
    transaction.inputs?.length || 0
  );

  const numOutputs = Math.max(
    transaction.minOutputs || 0,
    transaction.outputs?.length || 0
  );

  const contentHeight = Math.max(numInputs, numOutputs) * 93 + 8;

  const cleanHash = transaction.hash?.replace(/\\x/g, "") || "";

  const selector = useCallback(
    (state: ChartState) => ({
      addAnnotation: state.addAnnotation,
      deleteTransaction: state.deleteTransaction,
    }),
    []
  );

  const { addAnnotation, deleteTransaction } = useStore(useShallow(selector));

  const annotate = () => {
    addAnnotation(transaction.hash || "", "");
  };

  const { deleteElements } = useReactFlow();

  return (
    <TooltipProvider>
      <div className={`transaction-node`} style={{ width: 400 }}>
        {/* Transaction container */}
        <div
          className={cn(
            `relative rounded-lg border border-gray-300 bg-white transparency:bg-white/90 overflow-hidden`,
            selected && `outline-2 outline-offset-1 outline-gray-300`
          )}
        >
          {/* Transaction header with hash-based color */}
          <div
            className="px-3 py-2 border-b group"
            style={{
              backgroundColor: placeholder ? "lightgray" : color,
              color: placeholder ? "white" : textColor,
            }}
          >
            <div className="text-sm font-medium truncate group-hover:mr-28">
              {cleanHash}
            </div>
            <div className="absolute right-2 top-2 flex gap-1">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(cleanHash);
                }}
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: textColor }}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  annotate();
                }}
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: textColor }}
              >
                <PencilLine className="h-4 w-4" />
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTransaction(transaction.hash || "");
                }}
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: textColor }}
              >
                <CaptionsOff className="h-4 w-4" />
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteElements({ nodes: [{ id: transaction.hash || "" }] });
                }}
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: textColor }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Transaction content - will contain child nodes */}
          <div className="p-2" style={{ height: `${contentHeight}px` }}>
            {/* Child nodes will be rendered here */}
          </div>

          {/* Transaction footer with additional info */}
          <div className="px-3 py-1 border-t border-gray-200 bg-gray-50 flex justify-between text-[10px] text-gray-500">
            <div>
              {transaction.size_bytes ? `${transaction.size_bytes} bytes` : ""}
            </div>
            <div>
              {numInputs} inputs / {numOutputs} outputs
            </div>
            <div>
              {transaction.locktime ? `locktime ${transaction.locktime}` : ""}
            </div>
            <div>
              {transaction.fee_satoshis ? (
                <>
                  {`fee `}
                  <span className="text-emerald-600 text-[10px]">
                    {Number(transaction.fee_satoshis).toLocaleString()}
                  </span>
                </>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default memo(TransactionNode);
