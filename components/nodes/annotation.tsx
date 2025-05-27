import {
  AnnotationNode,
  AnnotationNodeContent,
} from "@/components/ui/annotation";
import { AnnotationNodeType } from "@/lib/types";
import { hashToColor } from "@/lib/utils";
import { NodeProps, NodeResizer } from "@xyflow/react";
import { memo, useState, useRef, useEffect } from "react";
import { Textarea } from "../ui/textarea";

const AnnotationNodeDemo = ({
  data,
  parentId,
  selected = true,
}: NodeProps<AnnotationNodeType>) => {
  console.log("parentId", parentId);

  const [text, setText] = useState(data.annotation);

  const color = hashToColor(parentId);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  console.log("selected", selected);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.click();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <NodeResizer
        color={color}
        isVisible={selected}
        minWidth={100}
        minHeight={30}
      />
      <AnnotationNode className="px-2 py-1">
        <AnnotationNodeContent
          style={{ color }}
          className="w-full h-full overflow-hidden truncate flex"
        >
          {selected ? (
            <Textarea
              ref={textareaRef}
              value={text}
              className="min-h-4 min-w-8 resize-vertical w-full h-full shadow-none p-0 m-0 rounded-none border-0"
              spellCheck={false}
              onChange={(e) => setText(e.target.value)}
            />
          ) : (
            <div className="w-full h-full whitespace-pre-wrap truncate overflow-hidden">
              {text}
            </div>
          )}
        </AnnotationNodeContent>
      </AnnotationNode>
    </>
  );
};

export default memo(AnnotationNodeDemo);
