import React from "react";
import type { ContentBlock } from "../ContentBlockEditor";

interface MemeBlockEditorProps {
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
}

const MemeBlockEditor: React.FC<MemeBlockEditorProps> = ({ block, onChange }) => (
  <div className="space-y-3">
    <input
      type="text"
      value={block.data.url || ""}
      onChange={(e) => onChange(block.id, { ...block.data, url: e.target.value })}
      placeholder="Meme URL..."
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
    />
    <input
      type="text"
      value={block.data.caption || ""}
      onChange={(e) => onChange(block.id, { ...block.data, caption: e.target.value })}
      placeholder="Meme caption..."
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
    />
  </div>
);

export default MemeBlockEditor;
