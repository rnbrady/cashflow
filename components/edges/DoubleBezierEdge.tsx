import { memo } from "react";
import { Position, getBezierPath } from "@xyflow/system";

import { BaseEdge } from "./BaseDoubleEdge";
import type { BezierEdgeProps } from "@xyflow/react";

function createBezierEdge(params: { isInternal: boolean }) {
  // eslint-disable-next-line react/display-name
  return memo(
    ({
      id,
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition = Position.Bottom,
      targetPosition = Position.Top,
      label,
      labelStyle,
      labelShowBg,
      labelBgStyle,
      labelBgPadding,
      labelBgBorderRadius,
      style,
      markerEnd,
      markerStart,
      pathOptions,
      interactionWidth,
      secondaryStyle,
    }: BezierEdgeProps & { secondaryStyle?: React.CSSProperties }) => {
      const [path, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        curvature: pathOptions?.curvature,
      });

      const _id = params.isInternal ? undefined : id;

      return (
        <BaseEdge
          id={_id}
          path={path}
          labelX={labelX}
          labelY={labelY}
          label={label}
          labelStyle={labelStyle}
          labelShowBg={labelShowBg}
          labelBgStyle={labelBgStyle}
          labelBgPadding={labelBgPadding}
          labelBgBorderRadius={labelBgBorderRadius}
          style={style}
          secondaryStyle={secondaryStyle}
          markerEnd={markerEnd}
          markerStart={markerStart}
          interactionWidth={interactionWidth}
        />
      );
    }
  );
}

/**
 * Component that can be used inside a custom edge to render a bezier curve.
 *
 * @public
 * @example
 *
 * ```tsx
 * import { BezierEdge } from '@xyflow/react';
 *
 * function CustomEdge({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition }) {
 *   return (
 *     <BezierEdge
 *       sourceX={sourceX}
 *       sourceY={sourceY}
 *       targetX={targetX}
 *       targetY={targetY}
 *       sourcePosition={sourcePosition}
 *       targetPosition={targetPosition}
 *     />
 *   );
 * }
 * ```
 */
const DoubleBezierEdge = createBezierEdge({ isInternal: false });

export { DoubleBezierEdge };
