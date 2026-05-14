"use client";

import React, { memo, useState } from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import { Lock } from "lucide-react";
import {
  hashToColor,
  tryDecodeCashAddress,
  decodeOpReturnContents,
} from "@/lib/utils";
import { OutputNodeType } from "@/lib/types";
import { TokenData } from "../token-data";
import { ScriptTypeBadge } from "../script-type-badge";

function OutputNode({
  data: { output },
  isConnectable,
}: NodeProps<OutputNodeType>) {
  const [decodeOpReturn, setDecodeOpReturn] = useState<boolean>(false);

  const borderColor = hashToColor(output.spent_by?.[0]?.transaction.hash);

  const normalizedLockingBytecodePattern =
    output.locking_bytecode_pattern?.replace(/^\\x/, "");
  const normalizedLockingBytecode = output.locking_bytecode?.replace(
    /^\\x/,
    ""
  );
  const isDataCarrier =
    normalizedLockingBytecodePattern?.startsWith("6a") ||
    normalizedLockingBytecode?.startsWith("6a");

  const address = isDataCarrier
    ? undefined
    : tryDecodeCashAddress(output.locking_bytecode, !!output.token_category);

  const toggleDecodeOpReturns = () => {
    setDecodeOpReturn((decodeOpReturn) => !decodeOpReturn);
  };

  return (
    <div className="output-node">
      <div
        className="rounded-md border-r-4 bg-accent p-2 text-right text-xs text-foreground shadow-md transparency:bg-tx-output-background/50"
        style={{ borderRightColor: borderColor }}
      >
        <div className="font-medium mb-1 flex justify-between items-center">
          <span className="font-medium text-muted-foreground">
            #{output.output_index}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
            {Number(output.value_satoshis).toLocaleString()}
          </span>
        </div>

        <div className="text-muted-foreground">
          <div className="flex justify-between text-[10px] mb-1 gap-2 items-start">
            <div className="flex items-center gap-0.5">
              <Lock className="size-2.5 shrink-0" />
              <ScriptTypeBadge output={output} />
            </div>
            {output.locking_bytecode && (
              <div className="truncate text-[10px] hover:absolute hover:z-[2147483647] hover:translate-x-22 hover:overflow-visible hover:whitespace-pre hover:bg-muted">
                {isDataCarrier || address === "Could not decode" ? (
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
                                className="text-primary"
                                onClick={(e) => e.stopPropagation()}
                                key={field}
                              >
                                {field}
                              </a>
                            );
                          }

                          if (field.startsWith("ipfs://")) {
                            return (
                              <a
                                href={`https://ipfs.io/ipfs/${field.slice(7)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary"
                                onClick={(e) => e.stopPropagation()}
                                key={field}
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
                                className="text-primary"
                                onClick={(e) => e.stopPropagation()}
                                key={field}
                              >
                                {field}
                              </a>
                            );
                          }

                          return <div key={field}>{field}</div>;
                        })
                    ) : (
                      <div className="flex items-center gap-0.5 truncate">
                        <div className="max-w-2/3 shrink-0 rounded border px-0.25 text-[6px]">
                          {65}
                        </div>
                        <div className="truncate">
                          {output.locking_bytecode.replace("\\x", "0x")}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  address?.replace("bitcoincash:", "") ?? "Unknown"
                )}
              </div>
            )}
          </div>
        </div>

        <TokenData output={output} />
      </div>

      {/* Output handle on the right */}
      <Handle
        id={`output-${output.output_index}`}
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="size-3 bg-green-500"
        style={{ right: -4 }}
      />
    </div>
  );
}

export default memo(OutputNode);
