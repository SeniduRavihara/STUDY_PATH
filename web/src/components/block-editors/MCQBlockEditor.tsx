import React from "react";
import type { ContentBlock } from "../ContentBlockEditor";

interface MCQBlockEditorProps {
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
}

const MCQBlockEditor: React.FC<MCQBlockEditorProps> = ({ block, onChange }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-white font-medium mb-2">Question</label>
      <input
        type="text"
        value={block.data.question || ""}
        onChange={(e) => onChange(block.id, { ...block.data, question: e.target.value })}
        placeholder="Enter your question..."
        className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
      />
    </div>

    <div>
      <label className="block text-white font-medium mb-2">Options</label>
      <div className="space-y-2">
        {(block.data.options || []).map((option: string, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="radio"
              name={`correct-${block.id}`}
              checked={block.data.correctAnswer === index}
              onChange={() => onChange(block.id, { ...block.data, correctAnswer: index })}
              className="text-primary-500 focus:ring-primary-500"
            />
            <input
              type="text"
              value={option}
              onChange={(e) => {
                const newOptions = [...(block.data.options || [])];
                newOptions[index] = e.target.value;
                onChange(block.id, { ...block.data, options: newOptions });
              }}
              placeholder={`Option ${index + 1}...`}
              className="flex-1 px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        ))}
      </div>
    </div>

    <div>
      <label className="block text-white font-medium mb-2">Explanation</label>
      <textarea
        value={block.data.explanation || ""}
        onChange={(e) => onChange(block.id, { ...block.data, explanation: e.target.value })}
        placeholder="Explain why this is the correct answer..."
        className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 min-h-[80px]"
      />
    </div>
  </div>
);

export default MCQBlockEditor;
