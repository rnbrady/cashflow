import { getScriptType } from "@/lib/utils";
import { Output } from "@/lib/types";

export function ScriptTypeBadge({
  output,
}: {
  output?: Partial<Output> | null;
}) {
  if (!output || !output.locking_bytecode_pattern) return null;

  const scriptType = getScriptType(output?.locking_bytecode_pattern);

  let badgeColor = "bg-muted text-muted-foreground";
  if (scriptType === "P2PKH") {
    badgeColor = "bg-green-500/15 text-green-700 dark:text-green-300";
  }
  if (scriptType === "P2SH") {
    badgeColor = "bg-purple-500/15 text-purple-700 dark:text-purple-300";
  }
  if (scriptType === "P2SH32") {
    badgeColor = "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300";
  }
  if (scriptType === "OP_RETURN") {
    badgeColor = "bg-blue-500/15 text-blue-700 dark:text-blue-300";
  }

  return <span className={`rounded ${badgeColor} px-1`}>{scriptType}</span>;
}
