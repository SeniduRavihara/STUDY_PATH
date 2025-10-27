import React from "react";
import type { ContentBlock } from "../ContentBlockEditor";

interface NoteBlockEditorProps {
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
}

const NoteBlockEditor: React.FC<NoteBlockEditorProps> = ({ block, onChange }) => (
  <div className="space-y-3">
    <input
      type="text"
      value={block.data.title || ""}
      onChange={(e) => onChange(block.id, { ...block.data, title: e.target.value })}
      placeholder="Note title..."
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
    />
    <textarea
      value={block.data.content || ""}
      onChange={(e) => onChange(block.id, { ...block.data, content: e.target.value })}
      placeholder="Note content..."
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 min-h-[100px]"
    />
    <select
      value={block.data.style || "info"}
      onChange={(e) => onChange(block.id, { ...block.data, style: e.target.value })}
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
    >
      <option value="info">Info</option>
      <option value="warning">Warning</option>
      <option value="success">Success</option>
      <option value="error">Error</option>
    </select>
  </div>
);

export default NoteBlockEditor;
