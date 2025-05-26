import { getScriptType } from "@/lib/utils";
import { Output } from "@/lib/types";

export function ScriptTypeBadge({
  output,
}: {
  output?: Partial<Output> | null;
}) {
  if (!output || !output.locking_bytecode_pattern) return null;

  const scriptType = getScriptType(output?.locking_bytecode_pattern);

  // Determine badge color based on script type
  let badgeColor = "bg-gray-100 text-gray-800";
  if (scriptType === "P2PKH") badgeColor = "bg-green-100 text-green-800";
  if (scriptType === "P2SH") badgeColor = "bg-purple-100 text-purple-800";
  if (scriptType === "P2SH32") badgeColor = "bg-fuchsia-100 text-fuchsia-800";
  if (scriptType === "OP_RETURN") badgeColor = "bg-blue-100 text-blue-800";

  return <span className={`rounded ${badgeColor} px-1`}>{scriptType}</span>;
}
