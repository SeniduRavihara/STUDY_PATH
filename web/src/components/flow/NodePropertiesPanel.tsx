import {
  BarChart3,
  BookOpen,
  Check,
  Code,
  FileText,
  HelpCircle,
  Image,
  Layers,
  Minimize2,
  Play,
  Plus,
  Settings,
  Smile,
  StickyNote,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useModal } from "../../contexts/ModalContext";
import type { FlowNode, TopicWithChildren } from "../../types/database";
import BlockTypeSelector from "../content/block-editors/BlockTypeSelector";
import SingleBlockEditor from "../content/block-editors/SingleBlockEditor";

type ContentBlock = FlowNode["content_blocks"][0];

interface NodePropertiesPanelProps {
  selectedNode: FlowNode | null;
  updateNode: (
    nodeId: string,
    updates: Partial<FlowNode>,
    persist?: boolean
  ) => Promise<void>;
  deleteNode: (nodeId: string) => Promise<void>;
  topics: TopicWithChildren[];
  findTopicById: (
    topics: TopicWithChildren[],
    topicId: string
  ) => TopicWithChildren | null;
}

const NodePropertiesPanel: React.FC<NodePropertiesPanelProps> = ({
  selectedNode,
  updateNode,
  deleteNode,
  topics,
  findTopicById,
}) => {
  // Avoid unused prop TypeScript warnings for legacy/optional props
  // void quizPacks;
  // void loadingQuizPacks;
  void topics;
  void findTopicById;
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showBlockTypeSelector, setShowBlockTypeSelector] = useState(false);
  // Local copies of content blocks while in full-screen editor.
  // Keys are block IDs, values are editable copies. This preserves
  // edits when switching between blocks without saving to parent state.
  const [localBlocks, setLocalBlocks] = useState<Record<string, ContentBlock>>(
    {}
  );
  // Track which blocks have unsaved local edits
  const [dirtyBlocks, setDirtyBlocks] = useState<Record<string, boolean>>({});
  const modal = useModal();

  // Helper to set active tab and persist editorBlock in the URL so refresh
  // can restore which exact block/tab the user was editing.
  function setActiveTabAndUrl(tabId: string) {
    setActiveTab(tabId);
    try {
      const params = new URLSearchParams(window.location.search);
      if (tabId === "basic") {
        params.delete("editorBlockOrder");
      } else {
        // Persist the block by its order (stable across bulk-save ID changes)
        const blocks = selectedNode?.content_blocks || [];
        const found = blocks.find((b) => b.id === tabId);
        if (found && typeof found.order === "number") {
          params.set("editorBlockOrder", String(found.order));
        } else {
          // Fallback: remove param if we can't resolve order
          params.delete("editorBlockOrder");
        }
      }
      const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState({}, "", newUrl);
    } catch {
      // ignore
    }
  }

  // Keep localBlocks in sync when the selected node or its blocks change
  useEffect(() => {
    if (!isFullScreen || !selectedNode) return;

    // Ensure local map contains all current blocks (merge new ones)
    setLocalBlocks((prev) => {
      const next = { ...prev };
      (selectedNode.content_blocks || []).forEach((b) => {
        if (!next[b.id]) next[b.id] = { ...b };
      });
      return next;
    });
    // If node changed (different id), keep dirty flags only for blocks that still exist
    setDirtyBlocks((prev) => {
      const next: Record<string, boolean> = {};
      (selectedNode.content_blocks || []).forEach((b) => {
        if (prev[b.id]) next[b.id] = prev[b.id];
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullScreen, selectedNode?.id, selectedNode?.content_blocks?.length]);

  // If the URL contains editorNode=<id> and it matches the selected node,
  // open the full-screen editor automatically (used after page refresh).
  useEffect(() => {
    if (!selectedNode) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const editorNode = params.get("editorNode");
      const editorNodeOrder = params.get("editorNodeOrder");

      // Open editor if either: URL references this exact node id, OR
      // the URL references this node's sort_order (fallback after bulk-save).
      const matchesById = editorNode && editorNode === selectedNode.id;
      const matchesByOrder =
        editorNodeOrder &&
        selectedNode.sort_order !== undefined &&
        selectedNode.sort_order !== null &&
        parseInt(editorNodeOrder, 10) === selectedNode.sort_order;

      if ((matchesById || matchesByOrder) && !isFullScreen) {
        // If we matched by order (because IDs changed), normalize the URL to
        // use the current node id so subsequent logic is simpler.
        if (matchesByOrder && selectedNode.id) {
          params.set("editorNode", selectedNode.id);
          const newUrl =
            window.location.pathname +
            (params.toString() ? `?${params.toString()}` : "");
          window.history.replaceState({}, "", newUrl);
        }

        const seed: Record<string, ContentBlock> = {};
        (selectedNode.content_blocks || []).forEach((b) => {
          seed[b.id] = { ...b };
        });
        setLocalBlocks(seed);
        setDirtyBlocks({});

        const editorBlockOrder = params.get("editorBlockOrder");
        // If editorBlockOrder points to an existing block order, open that tab,
        // otherwise open basic. We persist block by its order because block
        // IDs may change after a bulk save.
        if (editorBlockOrder) {
          const parsed = parseInt(editorBlockOrder, 10);
          if (!isNaN(parsed)) {
            const byOrder = (selectedNode.content_blocks || []).find(
              (b) => b.order === parsed
            );
            if (byOrder) {
              setActiveTab(byOrder.id);
            } else {
              setActiveTab("basic");
            }
          } else {
            setActiveTab("basic");
          }
        } else {
          setActiveTab("basic");
        }
        setIsFullScreen(true);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNode?.id, selectedNode?.sort_order]);

  if (!selectedNode) return null;

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
    // Switch to the new block tab and persist in URL
    setActiveTabAndUrl(newBlock.id);
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

  // Save any local edits (only the dirty blocks) back to the parent FlowNode
  const saveLocalChanges = async () => {
    if (!selectedNode) return;

    // If nothing dirty, no-op
    const dirtyIds = Object.keys(dirtyBlocks).filter((id) => dirtyBlocks[id]);
    if (dirtyIds.length === 0) return;

    const currentBlocks = selectedNode.content_blocks || [];
    const updatedBlocks = currentBlocks.map((b) =>
      dirtyBlocks[b.id] ? localBlocks[b.id] ?? b : b
    );

    // Call parent updater once with all changes and request immediate persistence
    await updateNode(selectedNode.id, { content_blocks: updatedBlocks }, true);

    // Clear dirty tracking for saved blocks
    setDirtyBlocks((prev) => {
      const next = { ...prev };
      dirtyIds.forEach((id) => delete next[id]);
      return next;
    });
  };

  // Guarded toggle: when closing, prompt to save local edits
  const guardedToggleFullScreen = async () => {
    if (isFullScreen) {
      // closing
      const hasDirty = Object.values(dirtyBlocks).some(Boolean);
      if (hasDirty) {
        const shouldSave = await modal.confirm(
          "You have unsaved content changes. Save before exiting?",
          "Save",
          "Discard"
        );
        if (shouldSave) {
          await saveLocalChanges();
        }
      }
      // Remove editor query params when closing
      try {
        const params = new URLSearchParams(window.location.search);
        params.delete("editorNode");
        params.delete("editorBlockOrder");
        params.delete("editorNodeOrder");
        const newUrl =
          window.location.pathname +
          (params.toString() ? `?${params.toString()}` : "");
        window.history.replaceState({}, "", newUrl);
      } catch {
        // ignore
      }
      setIsFullScreen(false);
    } else {
      // opening: seed localBlocks from selectedNode
      if (selectedNode) {
        const seed: Record<string, ContentBlock> = {};
        (selectedNode.content_blocks || []).forEach((b) => {
          seed[b.id] = { ...b };
        });
        setLocalBlocks(seed);
        setDirtyBlocks({});
        // ensure we open on basic tab if nothing selected
        if (!activeTab) setActiveTab("basic");
      }
      // Add editor query params so refresh keeps editor open for this node
      try {
        const params = new URLSearchParams(window.location.search);
        params.set("editorNode", selectedNode?.id ?? "");
        // Persist block tab by its order (if we can resolve it)
        if (activeTab && activeTab !== "basic") {
          const blocks = selectedNode?.content_blocks || [];
          const found = blocks.find((b) => b.id === activeTab);
          if (found && typeof found.order === "number") {
            params.set("editorBlockOrder", String(found.order));
          } else {
            params.delete("editorBlockOrder");
          }
        } else {
          params.delete("editorBlockOrder");
        }
        // Also persist current sort_order so we can re-find this node after a save+reload
        if (
          selectedNode?.sort_order !== undefined &&
          selectedNode?.sort_order !== null
        ) {
          params.set("editorNodeOrder", String(selectedNode.sort_order));
        } else {
          params.delete("editorNodeOrder");
        }
        const newUrl =
          window.location.pathname +
          (params.toString() ? `?${params.toString()}` : "");
        window.history.replaceState({}, "", newUrl);
      } catch {
        // ignore
      }
      setIsFullScreen(true);
    }
  };

  // Full screen overlay
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-900 z-50 flex flex-col">
        {/* Full Screen Header */}
        <div className="bg-dark-800 px-6 py-4 border-b border-dark-700 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Layers className="w-6 h-6 text-primary-400" />
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Content Editor - {selectedNode.title}
                </h3>
                <p className="text-dark-400 text-sm">
                  Add and edit content blocks for this learning node
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={saveLocalChanges}
              disabled={
                !Object.values(dirtyBlocks).some((v) => v) || !selectedNode
              }
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Save changes"
            >
              <Check className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={() => guardedToggleFullScreen()}
              className="btn-secondary flex items-center space-x-2"
              title="Exit content editor"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Exit Editor</span>
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
              onClick={() => setActiveTabAndUrl("basic")}
              className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "basic"
                  ? "text-primary-400 border-b-2 border-primary-400"
                  : "text-dark-400 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Basic Info</span>
              </div>
            </button>
            {(selectedNode.content_blocks || []).map((block, index) => (
              <button
                key={block.id}
                onClick={() => setActiveTabAndUrl(block.id)}
                className={`px-6 py-3 text-sm font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === block.id
                    ? "text-primary-400 border-b-2 border-primary-400"
                    : "text-dark-400 hover:text-white"
                }`}
              >
                <span className="text-primary-400">
                  {block.type === "text" && <FileText className="w-4 h-4" />}
                  {block.type === "note" && <StickyNote className="w-4 h-4" />}
                  {block.type === "mcq" && <HelpCircle className="w-4 h-4" />}
                  {block.type === "mcq_pack" && (
                    <BookOpen className="w-4 h-4" />
                  )}
                  {block.type === "poll" && <BarChart3 className="w-4 h-4" />}
                  {block.type === "video" && <Play className="w-4 h-4" />}
                  {block.type === "image" && <Image className="w-4 h-4" />}
                  {block.type === "meme" && <Smile className="w-4 h-4" />}
                  {block.type === "code" && <Code className="w-4 h-4" />}
                </span>
                <span className="flex items-center space-x-2">
                  <span>Block {index + 1}</span>
                  {dirtyBlocks[block.id] && (
                    <span
                      className="inline-block w-2 h-2 bg-orange-400 rounded-full"
                      title="Unsaved changes"
                    />
                  )}
                </span>
                <span className="capitalize text-xs bg-dark-600 px-2 py-1 rounded">
                  {block.type.replace("_", " ")}
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
        <div className="flex-1 overflow-y-auto bg-dark-950">
          <div className="max-w-6xl mx-auto p-8">
            {activeTab === "basic" ? (
              <div className="bg-dark-800 rounded-2xl p-8 space-y-8">
                <div className="text-center mb-8">
                  <h4 className="text-2xl font-bold text-white mb-2">
                    Basic Information
                  </h4>
                  <p className="text-dark-400">
                    Configure the fundamental properties of this learning node
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-white font-semibold mb-3 text-lg">
                        Node Title
                      </label>
                      <input
                        type="text"
                        value={selectedNode.title}
                        onChange={(e) =>
                          updateNode(selectedNode.id, { title: e.target.value })
                        }
                        className="w-full px-6 py-4 bg-dark-700 border border-dark-600 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter a descriptive title..."
                      />
                    </div>

                    <div>
                      <label className="block text-white font-semibold mb-3 text-lg">
                        Description
                      </label>
                      <textarea
                        value={selectedNode.description ?? ""}
                        onChange={(e) =>
                          updateNode(selectedNode.id, {
                            description: e.target.value,
                          })
                        }
                        className="w-full px-6 py-4 bg-dark-700 border border-dark-600 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent h-40 resize-none"
                        placeholder="Describe what learners will accomplish in this node..."
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-white font-semibold mb-3 text-lg">
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
                        className="w-full px-6 py-4 bg-dark-700 border border-dark-600 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        min="0"
                        placeholder="e.g., 20"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-semibold mb-3 text-lg">
                        Difficulty Level
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
                        className="w-full px-6 py-4 bg-dark-700 border border-dark-600 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="easy">Easy - Basic concepts</option>
                        <option value="medium">
                          Medium - Moderate challenge
                        </option>
                        <option value="hard">Hard - Advanced concepts</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-white font-semibold mb-3 text-lg">
                        Estimated Time (minutes)
                      </label>
                      <input
                        type="number"
                        value={selectedNode.estimated_time?.toString() || ""}
                        onChange={(e) =>
                          updateNode(selectedNode.id, {
                            estimated_time: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="e.g., 15"
                        className="w-full px-6 py-4 bg-dark-700 border border-dark-600 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {(() => {
                  const block = (selectedNode.content_blocks || []).find(
                    (b) => b.id === activeTab
                  );
                  if (!block)
                    return (
                      <div className="bg-dark-800 rounded-2xl p-8 text-center">
                        <div className="text-dark-400 text-lg">
                          Content block not found
                        </div>
                      </div>
                    );

                  return (
                    <div className="bg-dark-800 rounded-2xl overflow-hidden">
                      <div className="px-8 py-6 border-b border-dark-700 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-primary-400">
                            {block.type === "text" && (
                              <FileText className="w-6 h-6" />
                            )}
                            {block.type === "note" && (
                              <StickyNote className="w-6 h-6" />
                            )}
                            {block.type === "mcq" && (
                              <HelpCircle className="w-6 h-6" />
                            )}
                            {block.type === "mcq_pack" && (
                              <BookOpen className="w-6 h-6" />
                            )}
                            {block.type === "poll" && (
                              <BarChart3 className="w-6 h-6" />
                            )}
                            {block.type === "video" && (
                              <Play className="w-6 h-6" />
                            )}
                            {block.type === "image" && (
                              <Image className="w-6 h-6" />
                            )}
                            {block.type === "meme" && (
                              <Smile className="w-6 h-6" />
                            )}
                            {block.type === "code" && (
                              <Code className="w-6 h-6" />
                            )}
                          </span>
                          <div>
                            <h3 className="text-xl font-semibold text-white capitalize">
                              {block.type.replace("_", " ")} Block
                            </h3>
                            <p className="text-dark-400 text-sm">
                              Edit this content block
                            </p>
                          </div>
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
                          className="btn-danger flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete Block</span>
                        </button>
                      </div>
                      <div className="p-8">
                        <SingleBlockEditor
                          block={localBlocks[block.id] ?? block}
                          onChange={(updatedBlock: ContentBlock) => {
                            // Update local copy and mark dirty; persist only when user hits Save
                            setLocalBlocks((prev) => ({
                              ...prev,
                              [updatedBlock.id]: updatedBlock,
                            }));
                            setDirtyBlocks((prev) => ({
                              ...prev,
                              [updatedBlock.id]: true,
                            }));
                          }}
                        />
                      </div>
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Node Properties</h3>
          <p className="text-dark-400 text-sm">Basic information</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => guardedToggleFullScreen()}
            className="btn-primary flex items-center space-x-2"
            title="Edit content blocks in fullscreen"
          >
            <Layers className="w-4 h-4" />
            {/* <span>Edit Content</span> */}
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

      {/* Basic Info Only - No Tabs */}
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
              updateNode(selectedNode.id, { description: e.target.value })
            }
            className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 resize-none"
          />
        </div>

        {/* XP Reward */}
        <div>
          <label className="block text-white font-medium mb-2">XP Reward</label>
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

        {/* Content Blocks Summary */}
        <div className="bg-dark-700 rounded-xl p-6 border border-dark-600">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Layers className="w-5 h-5 text-primary-400" />
              <div>
                <h4 className="text-white font-semibold">Content Blocks</h4>
                <p className="text-dark-400 text-sm">
                  {selectedNode.content_blocks &&
                  selectedNode.content_blocks.length > 0
                    ? `${selectedNode.content_blocks.length} block${
                        selectedNode.content_blocks.length > 1 ? "s" : ""
                      } added`
                    : "No content blocks yet"}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              {selectedNode.content_blocks &&
                selectedNode.content_blocks.length > 0 && (
                  <div className="flex space-x-1">
                    {selectedNode.content_blocks.slice(0, 3).map((block) => (
                      <span
                        key={block.id}
                        className="text-xs bg-dark-600 text-dark-300 px-2 py-1 rounded"
                        title={`${block.type} block`}
                      >
                        {block.type === "text" && (
                          <FileText className="w-3 h-3" />
                        )}
                        {block.type === "note" && (
                          <StickyNote className="w-3 h-3" />
                        )}
                        {block.type === "mcq" && (
                          <HelpCircle className="w-3 h-3" />
                        )}
                        {block.type === "mcq_pack" && (
                          <BookOpen className="w-3 h-3" />
                        )}
                        {block.type === "poll" && (
                          <BarChart3 className="w-3 h-3" />
                        )}
                        {block.type === "video" && <Play className="w-3 h-3" />}
                        {block.type === "image" && (
                          <Image className="w-3 h-3" />
                        )}
                        {block.type === "meme" && <Smile className="w-3 h-3" />}
                        {block.type === "code" && <Code className="w-3 h-3" />}
                      </span>
                    ))}
                    {selectedNode.content_blocks.length > 3 && (
                      <span className="text-xs bg-dark-600 text-dark-300 px-2 py-1 rounded">
                        +{selectedNode.content_blocks.length - 3}
                      </span>
                    )}
                  </div>
                )}
            </div>
          </div>
          <button
            onClick={() => guardedToggleFullScreen()}
            className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
          >
            <Layers className="w-5 h-5" />
            <span>
              {selectedNode.content_blocks &&
              selectedNode.content_blocks.length > 0
                ? "Edit Content Blocks"
                : "Add Content Blocks"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodePropertiesPanel;
