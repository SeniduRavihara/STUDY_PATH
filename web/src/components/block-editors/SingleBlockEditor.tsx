import React from "react";
import type { ContentBlock } from "../ContentBlockEditor";
import TextBlockEditor from "./TextBlockEditor";
import NoteBlockEditor from "./NoteBlockEditor";
import MCQBlockEditor from "./MCQBlockEditor";
import MCQPackBlockEditor from "./MCQPackBlockEditor";
import PollBlockEditor from "./PollBlockEditor";
import VideoBlockEditor from "./VideoBlockEditor";
import ImageBlockEditor from "./ImageBlockEditor";
import MemeBlockEditor from "./MemeBlockEditor";
import CodeBlockEditor from "./CodeBlockEditor";

interface SingleBlockEditorProps {
  block: ContentBlock;
  onChange: (block: ContentBlock) => void;
  onEditMCQPack: (blockId: string, data: any) => void;
}

const SingleBlockEditor: React.FC<SingleBlockEditorProps> = ({
  block,
  onChange,
  onEditMCQPack
}) => {
  const updateBlock = (_id: string, data: any) => {
    onChange({ ...block, data });
  };

  switch (block.type) {
    case "text":
      return <TextBlockEditor block={block} onChange={updateBlock} />;
    case "note":
      return <NoteBlockEditor block={block} onChange={updateBlock} />;
    case "mcq":
      return <MCQBlockEditor block={block} onChange={updateBlock} />;
    case "mcq_pack":
      return (
        <MCQPackBlockEditor
          block={block}
          onChange={updateBlock}
          onEdit={() => onEditMCQPack(block.id, block.data)}
        />
      );
    case "poll":
      return <PollBlockEditor block={block} onChange={updateBlock} />;
    case "video":
      return <VideoBlockEditor block={block} onChange={updateBlock} />;
    case "image":
      return <ImageBlockEditor block={block} onChange={updateBlock} />;
    case "meme":
      return <MemeBlockEditor block={block} onChange={updateBlock} />;
    case "code":
      return <CodeBlockEditor block={block} onChange={updateBlock} />;
    default:
      return <div>Unknown block type</div>;
  }
};

export default SingleBlockEditor;
