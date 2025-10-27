import React from "react";
import type { ContentBlock } from "../ContentBlockEditor";

interface MCQPackBlockEditorProps {
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
  onEdit: () => void;
}

const MCQPackBlockEditor: React.FC<MCQPackBlockEditorProps> = ({ block, onEdit }) => (
  <div className="p-4 bg-dark-700 rounded">
    <div className="flex items-center justify-between mb-3">
      <h4 className="text-white font-medium">{block.data.title}</h4>
      <button
        onClick={onEdit}
        className="px-3 py-1 bg-primary-500 text-white text-sm rounded hover:bg-primary-600 transition-colors"
      >
        Edit MCQs
      </button>
    </div>
    <p className="text-dark-400 text-sm">{block.data.description}</p>
    <p className="text-dark-400 text-xs mt-2">MCQ Pack with {block.data.mcqs?.length || 0} questions</p>
  </div>
);

export default MCQPackBlockEditor;
