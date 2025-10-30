import { Layers, Maximize2, Minimize2, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import type { FlowNode, TopicWithChildren } from "../../types/database";
import ContentBlockEditor, {
  type ContentBlock,
} from "../content/ContentBlockEditor";
import BlockTypeSelector from "../content/block-editors/BlockTypeSelector";
import SingleBlockEditor from "../content/block-editors/SingleBlockEditor";

interface NodePropertiesPanelProps {
  selectedNode: FlowNode | null;
  updateNode: (nodeId: string, updates: Partial<FlowNode>) => void;
  deleteNode: (nodeId: string) => void;
  // quizPacks: any[];
  // loadingQuizPacks: boolean;
  topics: TopicWithChildren[];
  findTopicById: (
    topics: TopicWithChildren[],
    topicId: string
  ) => TopicWithChildren | null;
  getNodeColor: () => string[];
}

const NodePropertiesPanel: React.FC<NodePropertiesPanelProps> = ({
  selectedNode,
  updateNode,
  deleteNode,
  // quizPacks,
  // loadingQuizPacks,
  topics,
  findTopicById,
  getNodeColor,
}) => {
  // Avoid unused prop TypeScript warnings for legacy/optional props
  // void quizPacks;
  // void loadingQuizPacks;
  void topics;
  void findTopicById;
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showBlockTypeSelector, setShowBlockTypeSelector] = useState(false);

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

  const getDefaultDataForType = (type: ContentBlock["type"]): unknown => {
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
            {/* <span className="text-sm text-dark-400">
              (
              {selectedNode.type.charAt(0).toUpperCase() +
                selectedNode.type.slice(1)}{" "}
              Node)
            </span> */}
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
                    value={selectedNode.description ?? ""}
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
                      value={selectedNode.xp_reward || 0}
                      onChange={(e) =>
                        updateNode(selectedNode.id, {
                          xp_reward: parseInt(e.target.value) || 0,
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
                      value={selectedNode.difficulty ?? ""}
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
                      value={selectedNode.estimated_time?.toString() || ""}
                      onChange={(e) =>
                        updateNode(selectedNode.id, {
                          estimated_time: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="e.g., 5-10 min"
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Quiz pack legacy UI removed - MCQs are stored inside node content_blocks as JSON now. */}
              </div>
            ) : (
              <div className="space-y-4">
                {(() => {
                  const block = (selectedNode.content_blocks || []).find(
                    (b) => b.id === activeTab
                  );
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
                            const currentBlocks =
                              selectedNode.content_blocks || [];
                            const updatedBlocks = currentBlocks.filter(
                              (b) => b.id !== block.id
                            );
                            updateNode(selectedNode.id, {
                              content_blocks: updatedBlocks,
                            });
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
                          const currentBlocks =
                            selectedNode.content_blocks || [];
                          const updatedBlocks = currentBlocks.map((b) =>
                            b.id === block.id ? updatedBlock : b
                          );
                          updateNode(selectedNode.id, {
                            content_blocks: updatedBlocks,
                          });
                        }}
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
          <BlockTypeSelector
            onSelect={handleBlockTypeSelect}
            onClose={() => setShowBlockTypeSelector(false)}
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
              value={selectedNode.description ?? ""}
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
              value={selectedNode.xp_reward || 0}
              onChange={(e) =>
              updateNode(selectedNode.id, {
              xp_reward: parseInt(e.target.value) || 0,
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
              value={selectedNode.difficulty ?? ""}
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
              value={
                selectedNode.estimated_time !== undefined
                  ? String(selectedNode.estimated_time)
                  : ""
              }
              onChange={(e) => {
                const parsed = parseInt(e.target.value, 10);
                updateNode(selectedNode.id, {
                  estimated_time: isNaN(parsed) ? 0 : parsed,
                });
              }}
              placeholder="e.g., 5-10"
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Legacy quiz packs removed: prefer Content Blocks for MCQs */}
          {/* {selectedNode.type == "quiz" && (
            <div>
              <p className="text-dark-400 text-sm mt-1">
                Legacy quiz packs are no longer supported. Use the Content
                Blocks tab to add MCQs directly to this node.
              </p>
            </div>
          )} */}

          {/* <div className="flex items-center space-x-4 pt-4 border-t border-dark-600">
            <div className="flex items-center space-x-2">
            <div
            className={`w-4 h-4 ${
            getNodeColor()[0]
            } rounded`}
            />
            <span className="text-white text-sm">
            {selectedNode.content_blocks.length > 0
            ? `${selectedNode.content_blocks[0].type.charAt(0).toUpperCase() +
                  selectedNode.content_blocks[0].type.slice(1)} Node`
                : "Learning Node"}
              </span>
            </div>
          </div> */}
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

export default NodePropertiesPanel;
