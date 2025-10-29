import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { ContentBlock } from "../ContentBlockEditor";

interface MCQ {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface MCQPackData {
  title: string;
  description: string;
  mcqs: MCQ[];
}

interface MCQPackBlockEditorProps {
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
}

const MCQPackBlockEditor: React.FC<MCQPackBlockEditorProps> = ({ block, onChange }) => {
  const [packData, setPackData] = useState<MCQPackData>(block.data);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  // Update local state and propagate to parent
  const updatePackData = (newData: MCQPackData) => {
    setPackData(newData);
    onChange(block.id, newData);
  };

  const updatePackField = (field: keyof MCQPackData, value: string) => {
    updatePackData({ ...packData, [field]: value });
  };

  const addMCQ = () => {
    const newMCQ: MCQ = {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    };
    const newData = {
      ...packData,
      mcqs: [...packData.mcqs, newMCQ],
    };
    updatePackData(newData);
    setActiveQuestionIndex(packData.mcqs.length);
  };

  const removeMCQ = (index: number) => {
    if (packData.mcqs.length === 1) {
      alert("Pack must have at least one question!");
      return;
    }
    const newMCQs = packData.mcqs.filter((_, i) => i !== index);
    updatePackData({ ...packData, mcqs: newMCQs });
    if (activeQuestionIndex >= newMCQs.length) {
      setActiveQuestionIndex(newMCQs.length - 1);
    }
  };

  const updateMCQ = (index: number, field: keyof MCQ, value: any) => {
    const newMCQs = [...packData.mcqs];
    newMCQs[index] = { ...newMCQs[index], [field]: value };
    updatePackData({ ...packData, mcqs: newMCQs });
  };

  const updateOption = (mcqIndex: number, optionIndex: number, value: string) => {
    const newMCQs = [...packData.mcqs];
    const newOptions = [...newMCQs[mcqIndex].options];
    newOptions[optionIndex] = value;
    newMCQs[mcqIndex] = { ...newMCQs[mcqIndex], options: newOptions };
    updatePackData({ ...packData, mcqs: newMCQs });
  };

  const addOption = (mcqIndex: number) => {
    const newMCQs = [...packData.mcqs];
    if (newMCQs[mcqIndex].options.length < 6) {
      newMCQs[mcqIndex] = {
        ...newMCQs[mcqIndex],
        options: [...newMCQs[mcqIndex].options, ''],
      };
      updatePackData({ ...packData, mcqs: newMCQs });
    }
  };

  const removeOption = (mcqIndex: number, optionIndex: number) => {
    const newMCQs = [...packData.mcqs];
    if (newMCQs[mcqIndex].options.length > 2) {
      newMCQs[mcqIndex] = {
        ...newMCQs[mcqIndex],
        options: newMCQs[mcqIndex].options.filter((_, i) => i !== optionIndex),
      };
      // Adjust correct answer if needed
      if (newMCQs[mcqIndex].correctAnswer >= newMCQs[mcqIndex].options.length) {
        newMCQs[mcqIndex].correctAnswer = newMCQs[mcqIndex].options.length - 1;
      }
      updatePackData({ ...packData, mcqs: newMCQs });
    }
  };

  const currentMCQ = packData.mcqs[activeQuestionIndex];

  return (
    <div className="space-y-6">
      {/* Pack Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-white font-medium mb-2">Pack Title</label>
          <input
            type="text"
            value={packData.title}
            onChange={(e) => updatePackField('title', e.target.value)}
            className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="MCQ Pack Title"
          />
        </div>
        <div>
          <label className="block text-white font-medium mb-2">Description</label>
          <textarea
            value={packData.description}
            onChange={(e) => updatePackField('description', e.target.value)}
            className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-primary-500 min-h-[80px]"
            placeholder="Pack description..."
          />
        </div>
      </div>

      {/* MCQ Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {packData.mcqs.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveQuestionIndex(index)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                activeQuestionIndex === index
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
              }`}
            >
              Q{index + 1}
            </button>
          ))}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={addMCQ}
            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
          {packData.mcqs.length > 1 && (
            <button
              onClick={() => removeMCQ(activeQuestionIndex)}
              className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center space-x-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove</span>
            </button>
          )}
        </div>
      </div>

      {/* Current MCQ Editor */}
      {currentMCQ && (
        <div className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">Question {activeQuestionIndex + 1}</label>
            <input
              type="text"
              value={currentMCQ.question}
              onChange={(e) => updateMCQ(activeQuestionIndex, 'question', e.target.value)}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Enter your question..."
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Options</label>
            <div className="space-y-2">
              {currentMCQ.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`correct-${activeQuestionIndex}`}
                    checked={currentMCQ.correctAnswer === optionIndex}
                    onChange={() => updateMCQ(activeQuestionIndex, 'correctAnswer', optionIndex)}
                    className="text-primary-500 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(activeQuestionIndex, optionIndex, e.target.value)}
                    placeholder={`Option ${optionIndex + 1}...`}
                    className="flex-1 px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  {currentMCQ.options.length > 2 && (
                    <button
                      onClick={() => removeOption(activeQuestionIndex, optionIndex)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded"
                      title="Remove option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {currentMCQ.options.length < 6 && (
                <button
                  onClick={() => addOption(activeQuestionIndex)}
                  className="w-full py-2 border border-dashed border-dark-600 rounded text-dark-400 hover:text-primary-400 hover:border-primary-400 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Option</span>
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Explanation</label>
            <textarea
              value={currentMCQ.explanation}
              onChange={(e) => updateMCQ(activeQuestionIndex, 'explanation', e.target.value)}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-primary-500 min-h-[80px]"
              placeholder="Explain why this is the correct answer..."
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MCQPackBlockEditor;
