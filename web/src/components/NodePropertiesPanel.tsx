import {
  Code,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  Maximize2,
  MessageSquare,
  Minimize2,
  Plus,
  Settings,
  Sparkles,
  Trash2,
  Type,
  Video,
} from "lucide-react";
import React, { useState } from "react";
import type { TopicWithChildren } from "../lib/database";
import ContentBlockEditor, { type ContentBlock } from "./ContentBlockEditor";
import MCQPackEditorModal from "./MCQPackEditorModal";

interface FlowNode {
  id: string;
  type:
    | "quiz"
    | "study"
    | "video"
    | "assignment"
    | "assessment"
    | "start"
    | "end";
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

interface NodePropertiesPanelProps {
  selectedNode: FlowNode | null;
  updateNode: (nodeId: string, updates: Partial<FlowNode>) => void;
  deleteNode: (nodeId: string) => void;
  quizPacks: any[];
  loadingQuizPacks: boolean;
  topics: TopicWithChildren[];
  findTopicById: (
    topics: TopicWithChildren[],
    topicId: string
  ) => TopicWithChildren | null;
  getNodeColor: (type: string) => string[];
}

// Single Block Editor Component
const SingleBlockEditor: React.FC<{
  block: ContentBlock;
  onChange: (block: ContentBlock) => void;
  onEditMCQPack: (blockId: string, data: any) => void;
}> = ({ block, onChange, onEditMCQPack }) => {
  const updateBlock = (_id: string, data: any) => {
    onChange({ ...block, data });
  };

  switch (block.type) {
    case "text":
      return <TextBlockEditor block={block} onChange={updateBlock} />;
    case "note":
      return <NoteBlockEditor block={block} onChange={updateBlock} />;
    case "mcq":
      return <MCQBlockEditor block={block} onChange={updateBlock} />;
    case "mcq_pack":
      return (
        <MCQPackBlockPreview
          block={block}
          onChange={updateBlock}
          onEdit={() => onEditMCQPack(block.id, block.data)}
        />
      );
    case "poll":
      return <PollBlockEditor block={block} onChange={updateBlock} />;
    case "video":
      return <VideoBlockEditor block={block} onChange={updateBlock} />;
    case "image":
      return <ImageBlockEditor block={block} onChange={updateBlock} />;
    case "meme":
      return <MemeBlockEditor block={block} onChange={updateBlock} />;
    case "code":
      return <CodeBlockEditor block={block} onChange={updateBlock} />;
    default:
      return <div>Unknown block type</div>;
  }
};

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
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showBlockTypeSelector, setShowBlockTypeSelector] = useState(false);
  const [editingMCQPack, setEditingMCQPack] = useState<{
    blockId: string;
    data: any;
  } | null>(null);

  if (!selectedNode) return null;

  const handleContentBlocksChange = (blocks: ContentBlock[]) => {
    console.log("📝 NodePropertiesPanel: Content blocks changed:", blocks);
    updateNode(selectedNode.id, { content_blocks: blocks });
  };

  const addNewContentBlock = (type: ContentBlock["type"] = "text") => {
    const currentBlocks = selectedNode.content_blocks || [];
    const newBlock: ContentBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      order: currentBlocks.length,
      data: getDefaultDataForType(type),
    };
    const updatedBlocks = [...currentBlocks, newBlock];
    updateNode(selectedNode.id, { content_blocks: updatedBlocks });
    // Switch to the new block tab
    setActiveTab(newBlock.id);
  };

  const handleAddBlockClick = () => {
    setShowBlockTypeSelector(true);
  };

  const handleBlockTypeSelect = (type: ContentBlock["type"]) => {
    addNewContentBlock(type);
    setShowBlockTypeSelector(false);
  };

  // Block types configuration (copied from ContentBlockEditor)
  const blockTypes = [
    { type: "text" as const, label: "Text", icon: Type, color: "bg-blue-500" },
    { type: "note" as const, label: "Note", icon: FileText, color: "bg-yellow-500" },
    { type: "mcq" as const, label: "MCQ", icon: HelpCircle, color: "bg-green-500" },
    { type: "mcq_pack" as const, label: "MCQ Pack", icon: Settings, color: "bg-purple-500" },
    { type: "poll" as const, label: "Poll", icon: MessageSquare, color: "bg-pink-500" },
    { type: "video" as const, label: "Video", icon: Video, color: "bg-red-500" },
    { type: "image" as const, label: "Image", icon: ImageIcon, color: "bg-indigo-500" },
    { type: "meme" as const, label: "Meme", icon: Sparkles, color: "bg-orange-500" },
    { type: "code" as const, label: "Code", icon: Code, color: "bg-gray-500" },
  ];

  const getDefaultDataForType = (type: ContentBlock["type"]): any => {
    switch (type) {
      case "text":
        return { content: "" };
      case "note":
        return { title: "", content: "", style: "info" };
      case "mcq":
        return {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          explanation: "",
        };
      case "mcq_pack":
        return {
          title: "MCQ Pack",
          description: "",
          mcqs: [
            {
              question: "",
              options: ["", "", "", ""],
              correctAnswer: 0,
              explanation: "",
            },
          ],
        };
      case "poll":
        return {
          question: "",
          options: ["Yes", "No"],
          allowMultiple: false,
        };
      case "video":
        return { url: "", title: "", description: "" };
      case "image":
        return { url: "", alt: "", caption: "" };
      case "meme":
        return { url: "", caption: "" };
      case "code":
        return { code: "", language: "javascript" };
      default:
        return {};
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Full screen overlay
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-900 z-50 flex flex-col">

        {/* Full Screen Header */}
        <div className="bg-dark-800 px-6 py-4 border-b border-dark-700 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-xl font-semibold text-white">
              Node Properties - {selectedNode.title}
            </h3>
            <span className="text-sm text-dark-400">
              (
              {selectedNode.type.charAt(0).toUpperCase() +
                selectedNode.type.slice(1)}{" "}
              Node)
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleFullScreen}
              className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
              title="Exit fullscreen"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => deleteNode(selectedNode.id)}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete node"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Full Screen Tabs */}
        <div className="bg-dark-800 px-6 border-b border-dark-700">
          <div className="flex space-x-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("basic")}
              className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "basic"
                  ? "text-primary-400 border-b-2 border-primary-400"
                  : "text-dark-400 hover:text-white"
              }`}
            >
              Basic Info
            </button>
            {(selectedNode.content_blocks || []).map((block, index) => (
              <button
                key={block.id}
                onClick={() => setActiveTab(block.id)}
                className={`px-6 py-3 text-sm font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === block.id
                    ? "text-primary-400 border-b-2 border-primary-400"
                    : "text-dark-400 hover:text-white"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Block {index + 1}</span>
                <span className="capitalize text-xs bg-dark-600 px-2 py-1 rounded">
                  {block.type}
                </span>
              </button>
            ))}
            <button
              onClick={handleAddBlockClick}
              className="px-4 py-3 text-dark-400 hover:text-primary-400 transition-colors flex items-center space-x-2"
              title="Add new content block"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Full Screen Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            {activeTab === "basic" ? (
              <div className="space-y-6">
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
                      updateNode(selectedNode.id, {
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 h-32 resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      XP Reward
                    </label>
                    <input
                      type="number"
                      value={selectedNode.xp || 0}
                      onChange={(e) =>
                        updateNode(selectedNode.id, {
                          xp: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Difficulty
                    </label>
                    <select
                      value={selectedNode.difficulty}
                      onChange={(e) =>
                        updateNode(selectedNode.id, {
                          difficulty: e.target.value as
                            | "easy"
                            | "medium"
                            | "hard",
                        })
                      }
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Estimated Time
                    </label>
                    <input
                      type="text"
                      value={selectedNode.estimatedTime || ""}
                      onChange={(e) =>
                        updateNode(selectedNode.id, {
                          estimatedTime: e.target.value,
                        })
                      }
                      placeholder="e.g., 5-10 min"
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {selectedNode.type === "quiz" && (
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Quiz Pack (Legacy)
                    </label>
                    <select
                      value={selectedNode.config?.quiz_pack_id || ""}
                      onChange={(e) => {
                        const newConfig = {
                          ...selectedNode.config,
                          quiz_pack_id: e.target.value || undefined,
                        };
                        updateNode(selectedNode.id, { config: newConfig });
                      }}
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={loadingQuizPacks}
                    >
                      <option value="">
                        {loadingQuizPacks
                          ? "Loading quiz packs..."
                          : "Select a quiz pack (optional)"}
                      </option>
                      {quizPacks.map((pack) => {
                        const topicName = pack.topic_id
                          ? findTopicById(topics, pack.topic_id)?.name ||
                            "Unknown Topic"
                          : "Entire Subject";
                        return (
                          <option key={pack.id} value={pack.id}>
                            {pack.title} ({pack.mcq_count} questions) -{" "}
                            {topicName}
                          </option>
                        );
                      })}
                    </select>
                    {quizPacks.length === 0 && !loadingQuizPacks && (
                      <p className="text-dark-400 text-sm mt-2">
                        💡 Use Content Blocks tab to add MCQs directly to this
                        node!
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {(() => {
                  const block = (selectedNode.content_blocks || []).find(b => b.id === activeTab);
                  if (!block) return <div>Block not found</div>;

                  return (
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-white text-lg font-semibold capitalize">
                            {block.type} Block
                          </h3>
                          <p className="text-dark-400 text-sm">
                            Edit this content block
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const currentBlocks = selectedNode.content_blocks || [];
                            const updatedBlocks = currentBlocks.filter(b => b.id !== block.id);
                            updateNode(selectedNode.id, { content_blocks: updatedBlocks });
                            setActiveTab("basic"); // Switch back to basic if block is deleted
                          }}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                        >
                          Delete Block
                        </button>
                      </div>
                      <SingleBlockEditor
                        block={block}
                        onChange={(updatedBlock: ContentBlock) => {
                          const currentBlocks = selectedNode.content_blocks || [];
                          const updatedBlocks = currentBlocks.map(b =>
                            b.id === block.id ? updatedBlock : b
                          );
                          updateNode(selectedNode.id, { content_blocks: updatedBlocks });
                        }}
                        onEditMCQPack={(blockId, data) => setEditingMCQPack({ blockId, data })}
                      />
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Block Type Selector Modal */}
        {showBlockTypeSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-dark-800 rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Choose Block Type</h3>
                <button
                  onClick={() => setShowBlockTypeSelector(false)}
                  className="text-dark-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {blockTypes.map((blockType) => {
                  const Icon = blockType.icon;
                  return (
                    <button
                      key={blockType.type}
                      onClick={() => handleBlockTypeSelect(blockType.type)}
                      className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-dark-700 transition-colors group"
                    >
                      <div className={`${blockType.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs text-dark-300 group-hover:text-white text-center">
                        {blockType.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MCQ Pack Editor Modal */}
        {editingMCQPack && (
          <MCQPackEditorModal
            isOpen={true}
            onClose={() => setEditingMCQPack(null)}
            data={editingMCQPack.data}
            onSave={(updatedData) => {
              const currentBlocks = selectedNode.content_blocks || [];
              const updatedBlocks = currentBlocks.map(b =>
                b.id === editingMCQPack.blockId ? { ...b, data: updatedData } : b
              );
              updateNode(selectedNode.id, { content_blocks: updatedBlocks });
              setEditingMCQPack(null);
            }}
          />
        )}
      </div>
    );
  }

  // Normal side panel view
  return (
    <div className="bg-dark-800 rounded-2xl p-6 max-h-[calc(100vh-120px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Node Properties</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleFullScreen}
            className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
            title="Open in fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => deleteNode(selectedNode.id)}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete node"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-dark-600">
        <button
          onClick={() => setActiveTab("basic")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "basic"
              ? "text-primary-400 border-b-2 border-primary-400"
              : "text-dark-400 hover:text-white"
          }`}
        >
          Basic Info
        </button>
        <button
          onClick={() => setActiveTab("content")}
          className={`px-4 py-2 text-sm font-medium transition-colors flex items-center space-x-2 ${
            activeTab === "content"
              ? "text-primary-400 border-b-2 border-primary-400"
              : "text-dark-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Content Blocks</span>
          {selectedNode.content_blocks &&
            selectedNode.content_blocks.length > 0 && (
              <span className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {selectedNode.content_blocks.length}
              </span>
            )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "basic" ? (
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
                updateNode(selectedNode.id, {
                  xp: parseInt(e.target.value) || 0,
                })
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
                updateNode(selectedNode.id, {
                  difficulty: e.target.value as "easy" | "medium" | "hard",
                })
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
              value={selectedNode.estimatedTime || ""}
              onChange={(e) =>
                updateNode(selectedNode.id, { estimatedTime: e.target.value })
              }
              placeholder="e.g., 5-10"
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Quiz Pack Selection - Only show for quiz nodes (LEGACY) */}
          {selectedNode.type === "quiz" && (
            <div>
              <label className="block text-white font-medium mb-2">
                Quiz Pack (Legacy)
              </label>
              <select
                value={selectedNode.config?.quiz_pack_id || ""}
                onChange={(e) => {
                  const newConfig = {
                    ...selectedNode.config,
                    quiz_pack_id: e.target.value || undefined,
                  };
                  updateNode(selectedNode.id, { config: newConfig });
                }}
                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={loadingQuizPacks}
              >
                <option value="">
                  {loadingQuizPacks
                    ? "Loading quiz packs..."
                    : "Select a quiz pack (optional)"}
                </option>
                {quizPacks.map((pack) => {
                  const topicName = pack.topic_id
                    ? findTopicById(topics, pack.topic_id)?.name ||
                      "Unknown Topic"
                    : "Entire Subject";
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
              <div
                className={`w-4 h-4 ${
                  getNodeColor(selectedNode.type)[0]
                } rounded`}
              />
              <span className="text-white text-sm">
                {selectedNode.type.charAt(0).toUpperCase() +
                  selectedNode.type.slice(1)}{" "}
                Node
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Content Blocks Editor */}
          <div className="mb-4">
            <p className="text-dark-300 text-sm mb-4">
              ✨ Add flexible content blocks to this node. Mix text, notes,
              MCQs, polls, videos, images, and more!
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

// Block Editor Components
const TextBlockEditor: React.FC<{
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
}> = ({ block, onChange }) => (
  <textarea
    value={block.data.content || ""}
    onChange={(e) => onChange(block.id, { content: e.target.value })}
    placeholder="Enter text content..."
    className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 min-h-[200px]"
  />
);

const NoteBlockEditor: React.FC<{
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
}> = ({ block, onChange }) => (
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
      <option value="info">💡 Info</option>
      <option value="warning">⚠️ Warning</option>
      <option value="success">✅ Success</option>
      <option value="error">❌ Error</option>
    </select>
  </div>
);

// Enhanced block editors
const MCQBlockEditor: React.FC<{
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
}> = ({ block, onChange }) => (
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

const MCQPackBlockPreview: React.FC<{
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
  onEdit: () => void;
}> = ({ block, onEdit }) => (
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

const PollBlockEditor: React.FC<{
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
}> = ({ block, onChange }) => (
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

const VideoBlockEditor: React.FC<{
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
}> = ({ block, onChange }) => (
  <div className="space-y-3">
    <input
      type="text"
      value={block.data.url || ""}
      onChange={(e) => onChange(block.id, { ...block.data, url: e.target.value })}
      placeholder="Video URL..."
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
    />
    <input
      type="text"
      value={block.data.title || ""}
      onChange={(e) => onChange(block.id, { ...block.data, title: e.target.value })}
      placeholder="Video title..."
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
    />
  </div>
);

const ImageBlockEditor: React.FC<{
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
}> = ({ block, onChange }) => (
  <div className="space-y-3">
    <input
      type="text"
      value={block.data.url || ""}
      onChange={(e) => onChange(block.id, { ...block.data, url: e.target.value })}
      placeholder="Image URL..."
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
    />
    <input
      type="text"
      value={block.data.caption || ""}
      onChange={(e) => onChange(block.id, { ...block.data, caption: e.target.value })}
      placeholder="Image caption..."
      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
    />
  </div>
);

const MemeBlockEditor: React.FC<{
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
}> = ({ block, onChange }) => (
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

const CodeBlockEditor: React.FC<{
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
}> = ({ block, onChange }) => (
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

export default NodePropertiesPanel;
