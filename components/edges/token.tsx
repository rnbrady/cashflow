import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from "@xyflow/react";
import { memo } from "react";

function CustomEdge({ id, sourceX, sourceY, targetX, targetY }: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ stroke: "#10b981", transform: "translate(0%, 3%)" }}
      />
      <EdgeLabelRenderer>
        <div className="text-xs text-gray-500">Token</div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(CustomEdge);
