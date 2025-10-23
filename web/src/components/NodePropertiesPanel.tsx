import {
  Trash2,
  Layers,
} from "lucide-react";
import React, { useState } from "react";
import ContentBlockEditor, { type ContentBlock } from "./ContentBlockEditor";

interface FlowNode {
  id: string;
  type: "quiz" | "study" | "video" | "assignment" | "assessment" | "start" | "end";
  title: string;
  description: string;
  sort_order: number;
  config: any;
  connections: string[];
  status: "locked" | "available" | "completed" | "current";
  difficulty: "easy" | "medium" | "hard";
  xp: number;
  icon: string;
  color: [string, string];
  estimatedTime?: string;
  position?: { x: number; y: number };
  content_blocks?: ContentBlock[]; // NEW: Content blocks array
}

interface Topic {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  level: number;
  hasFlow: boolean;
  flowId?: string;
  children: Topic[];
  isExpanded?: boolean;
}

interface NodePropertiesPanelProps {
  selectedNode: FlowNode | null;
  updateNode: (nodeId: string, updates: Partial<FlowNode>) => void;
  deleteNode: (nodeId: string) => void;
  quizPacks: any[];
  loadingQuizPacks: boolean;
  topics: Topic[];
  findTopicById: (topics: Topic[], topicId: string) => Topic | null;
  getNodeColor: (type: string) => string[];
}

const NodePropertiesPanel: React.FC<NodePropertiesPanelProps> = ({
  selectedNode,
  updateNode,
  deleteNode,
  quizPacks,
  loadingQuizPacks,
  topics,
  findTopicById,
  getNodeColor,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'content'>('basic');
  
  if (!selectedNode) return null;

  const handleContentBlocksChange = (blocks: ContentBlock[]) => {
    console.log('📝 NodePropertiesPanel: Content blocks changed:', blocks);
    updateNode(selectedNode.id, { content_blocks: blocks });
  };

  return (
    <div className="bg-dark-800 rounded-2xl p-6 max-h-[calc(100vh-120px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Node Properties
        </h3>
        <button
          onClick={() => deleteNode(selectedNode.id)}
          className="text-red-400 hover:text-red-300 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-dark-600">
        <button
          onClick={() => setActiveTab('basic')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'basic'
              ? 'text-primary-400 border-b-2 border-primary-400'
              : 'text-dark-400 hover:text-white'
          }`}
        >
          Basic Info
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 text-sm font-medium transition-colors flex items-center space-x-2 ${
            activeTab === 'content'
              ? 'text-primary-400 border-b-2 border-primary-400'
              : 'text-dark-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Content Blocks</span>
          {selectedNode.content_blocks && selectedNode.content_blocks.length > 0 && (
            <span className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {selectedNode.content_blocks.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'basic' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">
              Node Title
            </label>
            <input
              type="text"
              value={selectedNode.title}
              onChange={(e) =>
                updateNode(selectedNode.id, { title: e.target.value })
              }
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">
              Description
            </label>
            <textarea
              value={selectedNode.description}
              onChange={(e) =>
                updateNode(selectedNode.id, { description: e.target.value })
              }
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 resize-none"
            />
          </div>

          {/* XP Reward */}
          <div>
            <label className="block text-white font-medium mb-2">
              XP Reward
            </label>
            <input
              type="number"
              value={selectedNode.xp || 0}
              onChange={(e) =>
                updateNode(selectedNode.id, { xp: parseInt(e.target.value) || 0 })
              }
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              min="0"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-white font-medium mb-2">
              Difficulty
            </label>
            <select
              value={selectedNode.difficulty}
              onChange={(e) =>
                updateNode(selectedNode.id, { difficulty: e.target.value as 'easy' | 'medium' | 'hard' })
              }
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Estimated Time */}
          <div>
            <label className="block text-white font-medium mb-2">
              Estimated Time (minutes)
            </label>
            <input
              type="text"
              value={selectedNode.estimatedTime || ''}
              onChange={(e) =>
                updateNode(selectedNode.id, { estimatedTime: e.target.value })
              }
              placeholder="e.g., 5-10"
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Quiz Pack Selection - Only show for quiz nodes (LEGACY) */}
          {selectedNode.type === 'quiz' && (
            <div>
              <label className="block text-white font-medium mb-2">
                Quiz Pack (Legacy)
              </label>
              <select
                value={selectedNode.config?.quiz_pack_id || ''}
                onChange={(e) => {
                  const newConfig = {
                    ...selectedNode.config,
                    quiz_pack_id: e.target.value || undefined
                  };
                  updateNode(selectedNode.id, { config: newConfig });
                }}
                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={loadingQuizPacks}
              >
                <option value="">
                  {loadingQuizPacks ? 'Loading quiz packs...' : 'Select a quiz pack (optional)'}
                </option>
                {quizPacks.map((pack) => {
                  const topicName = pack.topic_id ? 
                    (findTopicById(topics, pack.topic_id)?.name || 'Unknown Topic') : 
                    'Entire Subject';
                  return (
                    <option key={pack.id} value={pack.id}>
                      {pack.title} ({pack.mcq_count} questions) - {topicName}
                    </option>
                  );
                })}
              </select>
              {quizPacks.length === 0 && !loadingQuizPacks && (
                <p className="text-dark-400 text-sm mt-2">
                  💡 Use Content Blocks tab to add MCQs directly to this node!
                </p>
              )}
            </div>
          )}

          <div className="flex items-center space-x-4 pt-4 border-t border-dark-600">
            <div className="flex items-center space-x-2">
              <div className={`w-4 h-4 ${getNodeColor(selectedNode.type)[0]} rounded`} />
              <span className="text-white text-sm">
                {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)} Node
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Content Blocks Editor */}
          <div className="mb-4">
            <p className="text-dark-300 text-sm mb-4">
              ✨ Add flexible content blocks to this node. Mix text, notes, MCQs, polls, videos, images, and more!
            </p>
          </div>
          <ContentBlockEditor
            blocks={selectedNode.content_blocks || []}
            onChange={handleContentBlocksChange}
          />
        </div>
      )}
    </div>
  );
};

export default NodePropertiesPanel;