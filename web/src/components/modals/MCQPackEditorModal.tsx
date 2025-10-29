import {
  X,
  Plus,
  Trash2,
  Save,
  GripVertical,
  Check,
} from "lucide-react";
import React, { useState } from "react";

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

interface MCQPackEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MCQPackData;
  onSave: (data: MCQPackData) => void;
}

const MCQPackEditorModal: React.FC<MCQPackEditorModalProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
}) => {
  const [packData, setPackData] = useState<MCQPackData>(data);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  if (!isOpen) return null;

  const updatePackField = (field: keyof MCQPackData, value: string) => {
    setPackData({ ...packData, [field]: value });
  };

  const addMCQ = () => {
    const newMCQ: MCQ = {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    };
    setPackData({
      ...packData,
      mcqs: [...packData.mcqs, newMCQ],
    });
    setActiveQuestionIndex(packData.mcqs.length);
  };

  const removeMCQ = (index: number) => {
    if (packData.mcqs.length === 1) {
      alert("Pack must have at least one question!");
      return;
    }
    const newMCQs = packData.mcqs.filter((_, i) => i !== index);
    setPackData({ ...packData, mcqs: newMCQs });
    if (activeQuestionIndex >= newMCQs.length) {
      setActiveQuestionIndex(newMCQs.length - 1);
    }
  };

  const updateMCQ = (index: number, field: keyof MCQ, value: any) => {
    const newMCQs = [...packData.mcqs];
    newMCQs[index] = { ...newMCQs[index], [field]: value };
    setPackData({ ...packData, mcqs: newMCQs });
  };

  const updateOption = (mcqIndex: number, optionIndex: number, value: string) => {
    const newMCQs = [...packData.mcqs];
    const newOptions = [...newMCQs[mcqIndex].options];
    newOptions[optionIndex] = value;
    newMCQs[mcqIndex] = { ...newMCQs[mcqIndex], options: newOptions };
    setPackData({ ...packData, mcqs: newMCQs });
  };

  const addOption = (mcqIndex: number) => {
    const newMCQs = [...packData.mcqs];
    if (newMCQs[mcqIndex].options.length < 6) {
      newMCQs[mcqIndex] = {
        ...newMCQs[mcqIndex],
        options: [...newMCQs[mcqIndex].options, ''],
      };
      setPackData({ ...packData, mcqs: newMCQs });
    }
  };

  const removeOption = (mcqIndex: number, optionIndex: number) => {
    const newMCQs = [...packData.mcqs];
    if (newMCQs[mcqIndex].options.length > 2) {
      newMCQs[mcqIndex] = {
        ...newMCQs[mcqIndex],
        options: newMCQs[mcqIndex].options.filter((_, i) => i !== optionIndex),
        correctAnswer: newMCQs[mcqIndex].correctAnswer >= optionIndex
          ? Math.max(0, newMCQs[mcqIndex].correctAnswer - 1)
          : newMCQs[mcqIndex].correctAnswer,
      };
      setPackData({ ...packData, mcqs: newMCQs });
    }
  };

  const handleSave = () => {
    // Validate
    if (!packData.title.trim()) {
      alert("Please enter a pack title");
      return;
    }
    if (packData.mcqs.length === 0) {
      alert("Pack must have at least one question");
      return;
    }
    
    // Check if all questions have content
    for (let i = 0; i < packData.mcqs.length; i++) {
      const mcq = packData.mcqs[i];
      if (!mcq.question.trim()) {
        alert(`Question ${i + 1} is missing question text`);
        return;
      }
      if (mcq.options.some(opt => !opt.trim())) {
        alert(`Question ${i + 1} has empty options`);
        return;
      }
    }

    onSave(packData);
    onClose();
  };

  const activeMCQ = packData.mcqs[activeQuestionIndex];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-900 rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">MCQ Pack Editor</h2>
            <p className="text-dark-400 text-sm mt-1">
              {packData.mcqs.length} question{packData.mcqs.length !== 1 ? 's' : ''} in this pack
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Pack</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body - Two Column Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Question List */}
          <div className="w-80 border-r border-dark-700 flex flex-col bg-dark-950">
            {/* Pack Info */}
            <div className="p-4 border-b border-dark-700 space-y-3">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Pack Title
                </label>
                <input
                  type="text"
                  value={packData.title}
                  onChange={(e) => updatePackField('title', e.target.value)}
                  placeholder="e.g., Variables Quiz"
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={packData.description}
                  onChange={(e) => updatePackField('description', e.target.value)}
                  placeholder="Brief description..."
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-20"
                />
              </div>
            </div>

            {/* Question List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-dark-400">Questions</span>
                <button
                  onClick={addMCQ}
                  className="px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white rounded text-sm flex items-center space-x-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
              {packData.mcqs.map((mcq, index) => (
                <div
                  key={index}
                  onClick={() => setActiveQuestionIndex(index)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    activeQuestionIndex === index
                      ? 'bg-primary-500/20 border-2 border-primary-500'
                      : 'bg-dark-800 border-2 border-transparent hover:border-dark-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 mr-2">
                      <div className="flex items-center space-x-2 mb-1">
                        <GripVertical className="w-4 h-4 text-dark-500" />
                        <span className="text-sm font-medium text-white">
                          Question {index + 1}
                        </span>
                        {mcq.question.trim() && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-xs text-dark-400 line-clamp-2">
                        {mcq.question || 'No question text yet...'}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMCQ(index);
                      }}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-dark-500">
                    {mcq.options.length} options
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Question Editor */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeMCQ ? (
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Question Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">
                    Question {activeQuestionIndex + 1}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setActiveQuestionIndex(Math.max(0, activeQuestionIndex - 1))}
                      disabled={activeQuestionIndex === 0}
                      className="px-3 py-1 bg-dark-800 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-700"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setActiveQuestionIndex(Math.min(packData.mcqs.length - 1, activeQuestionIndex + 1))}
                      disabled={activeQuestionIndex === packData.mcqs.length - 1}
                      className="px-3 py-1 bg-dark-800 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-700"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Question Text
                  </label>
                  <textarea
                    value={activeMCQ.question}
                    onChange={(e) => updateMCQ(activeQuestionIndex, 'question', e.target.value)}
                    placeholder="Enter your question here..."
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[120px] resize-none"
                  />
                </div>

                {/* Options */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-white font-medium">
                      Answer Options
                    </label>
                    {activeMCQ.options.length < 6 && (
                      <button
                        onClick={() => addOption(activeQuestionIndex)}
                        className="text-sm text-primary-400 hover:text-primary-300 flex items-center space-x-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Option</span>
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {activeMCQ.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-start space-x-3">
                        {/* Correct Answer Radio */}
                        <div className="flex items-center pt-3">
                          <input
                            type="radio"
                            checked={activeMCQ.correctAnswer === optionIndex}
                            onChange={() => updateMCQ(activeQuestionIndex, 'correctAnswer', optionIndex)}
                            className="w-5 h-5 text-primary-500 focus:ring-2 focus:ring-primary-500 cursor-pointer"
                          />
                        </div>
                        
                        {/* Option Input */}
                        <div className="flex-1">
                          <div className="relative">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(activeQuestionIndex, optionIndex, e.target.value)}
                              placeholder={`Option ${optionIndex + 1}`}
                              className={`w-full px-4 py-3 bg-dark-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                activeMCQ.correctAnswer === optionIndex
                                  ? 'border-green-500 bg-green-500/10'
                                  : 'border-dark-600'
                              }`}
                            />
                            {activeMCQ.correctAnswer === optionIndex && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Check className="w-5 h-5 text-green-500" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Remove Option */}
                        {activeMCQ.options.length > 2 && (
                          <button
                            onClick={() => removeOption(activeQuestionIndex, optionIndex)}
                            className="text-red-400 hover:text-red-300 p-3"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-dark-400 mt-2">
                    Select the correct answer by clicking the radio button
                  </p>
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Explanation (optional)
                  </label>
                  <textarea
                    value={activeMCQ.explanation}
                    onChange={(e) => updateMCQ(activeQuestionIndex, 'explanation', e.target.value)}
                    placeholder="Explain why this answer is correct..."
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px] resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-dark-400 text-lg">No questions yet</p>
                  <button
                    onClick={addMCQ}
                    className="mt-4 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center space-x-2 mx-auto transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add First Question</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCQPackEditorModal;
