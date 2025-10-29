import React from "react";
import type { ContentBlock } from "../ContentBlockEditor";

interface PollBlockEditorProps {
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
}

const PollBlockEditor: React.FC<PollBlockEditorProps> = ({ block, onChange }) => (
  <div className="space-y-3">
    <input
      type="text"
      value={block.data.question || ""}
      onChange={(e) => onChange(block.id, { ...block.data, question: e.target.value })}
      placeholder="Poll question..."
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
    />
    {(block.data.options || []).map((option: string, index: number) => (
      <input
        key={index}
        type="text"
        value={option}
        onChange={(e) => {
          const newOptions = [...(block.data.options || [])];
          newOptions[index] = e.target.value;
          onChange(block.id, { ...block.data, options: newOptions });
        }}
        placeholder={`Option ${index + 1}...`}
        className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
      />
    ))}
  </div>
);

export default PollBlockEditor;
