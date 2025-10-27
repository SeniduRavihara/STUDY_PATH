import React from "react";
import type { ContentBlock } from "../ContentBlockEditor";

interface CodeBlockEditorProps {
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
}

const CodeBlockEditor: React.FC<CodeBlockEditorProps> = ({ block, onChange }) => (
  <div className="space-y-3">
    <select
      value={block.data.language || "javascript"}
      onChange={(e) => onChange(block.id, { ...block.data, language: e.target.value })}
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
    >
      <option value="javascript">JavaScript</option>
      <option value="python">Python</option>
      <option value="java">Java</option>
      <option value="cpp">C++</option>
      <option value="html">HTML</option>
      <option value="css">CSS</option>
    </select>
    <textarea
      value={block.data.code || ""}
      onChange={(e) => onChange(block.id, { ...block.data, code: e.target.value })}
      placeholder="Enter code..."
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 min-h-[150px] font-mono"
    />
  </div>
);

export default CodeBlockEditor;
