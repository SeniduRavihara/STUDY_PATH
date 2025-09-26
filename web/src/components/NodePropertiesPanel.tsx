import {
  Trash2,
} from "lucide-react";
import React from "react";

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
  if (!selectedNode) return null;

  return (
    <div className="bg-dark-800 rounded-2xl p-6">
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

        {/* Quiz Pack Selection - Only show for quiz nodes */}
        {selectedNode.type === 'quiz' && (
          <div>
            <label className="block text-white font-medium mb-2">
              Quiz Pack
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
                No quiz packs available for this topic. Create quiz packs in the Quiz Packs tab.
              </p>
            )}
          </div>
        )}

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 ${getNodeColor(selectedNode.type)[0]} rounded`} />
            <span className="text-white text-sm">
              {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)} Node
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodePropertiesPanel;