import React from "react";
import type { ContentBlock } from "../ContentBlockEditor";

interface TextBlockEditorProps {
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
}

const TextBlockEditor: React.FC<TextBlockEditorProps> = ({ block, onChange }) => (
  <textarea
    value={block.data.content || ""}
    onChange={(e) => onChange(block.id, { content: e.target.value })}
    placeholder="Enter text content..."
    className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 min-h-[200px]"
  />
);

export default TextBlockEditor;
