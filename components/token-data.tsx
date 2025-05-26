import { cn, hashToColor } from "@/lib/utils";
import { Input, Output } from "@/lib/types";

export function TokenData({
  input,
  output = input?.outpoint,
}: {
  input?: Partial<Input>;
  output?: Partial<Output> | null;
}) {
  if (!output || !output.token_category) return null;

  const tokenColor = output.token_category
    ? hashToColor(output.token_category)
    : "bg-gray-100 text-gray-800";

  return (
    <>
      <div
        className={cn(
          "flex justify-between items-center",
          input && "flex-row-reverse"
        )}
      >
        <div
          className="text-[10px] truncate px-1 rounded max-w-1/2 shrink-1"
          style={{
            backgroundColor: tokenColor,
            color: "white",
          }}
        >
          {output.token_category.slice(2)}
        </div>
        {Number(output.fungible_token_amount) > 0 && (
          <div
            className="text-[10px] rounded"
            style={{
              color: tokenColor,
            }}
          >
            {Number(output.fungible_token_amount).toLocaleString()}
          </div>
        )}
      </div>
      {output.nonfungible_token_capability && (
        <div
          className={cn(
            "flex justify-between items-center mt-1 gap-1",
            input && "flex-row-reverse"
          )}
        >
          <div
            className="text-[10px] truncate px-1 rounded max-w-2/3 shrink-0"
            style={{
              backgroundColor: tokenColor,
              color: "white",
            }}
          >
            {
              {
                minting: "minting nft",
                mutable: "mutable nft",
                none: "immutable nft",
                missing: "no nft",
              }[output.nonfungible_token_capability ?? "missing"]
            }
          </div>
          <div className="flex items-center overflow-hidden hover:overflow-visible hover:bg-gray-100 hover:relative hover:z-[2147483647]">
            {(output.nonfungible_token_commitment?.length ?? 0) > 2 && (
              <div
                className="text-[6px] px-0.25 rounded max-w-2/3 shrink-0"
                style={{
                  borderWidth: 1,
                  borderColor: tokenColor,
                  color: tokenColor,
                }}
              >
                {((output.nonfungible_token_commitment ?? "\\x").length - 2) /
                  2}
              </div>
            )}
            <div
              className="text-[10px] pl-0.5 rounded shrink truncate"
              style={{
                color: tokenColor,
              }}
            >
              {typeof output.nonfungible_token_commitment === "string" &&
              output.nonfungible_token_commitment.length > 2
                ? output.nonfungible_token_commitment.replace("\\x", "0x")
                : ""}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
