import { Plus, Settings, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { AuthService } from "../../services/authService";
import { FlowBuilderService } from "../../services/flowBuilderService";
import { type FlowNode, type TopicWithChildren } from "../../types/database";
import FlowCanvas from "./FlowCanvas";
import NodePropertiesPanel from "./NodePropertiesPanel";
import TopicHierarchySelector from "./TopicHierarchySelector";

interface FlowBuilderProps {
  nodes: FlowNode[];
  onNodesChange: (nodes: FlowNode[]) => void;
  subjectName: string;
  topics: TopicWithChildren[];
  onTopicsChange: (topics: TopicWithChildren[]) => void;
  subjectId: string;
  currentFlowId?: string; // Add current flow ID
}

const FlowBuilder: React.FC<FlowBuilderProps> = ({
  nodes,
  onNodesChange,
  subjectName,
  topics,
  onTopicsChange,
  subjectId,
  currentFlowId,
}) => {
  // FlowBuilder received props
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [currentTopicId, setCurrentTopicId] = useState("");
  const [selectedTopicName, setSelectedTopicName] = useState<string | null>(
    null
  );
  const [flowId, setFlowId] = useState<string | null>(currentFlowId || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  // Topics are already hierarchical
  const hierarchicalTopics = topics;

  // Helper function to check if topic exists in the hierarchy
  const topicExistsInHierarchy = (
    topics: TopicWithChildren[],
    targetId: string
  ): boolean => {
    for (const topic of topics) {
      if (topic.id === targetId) return true;
      if (topic.children && topic.children.length > 0) {
        if (topicExistsInHierarchy(topic.children, targetId)) return true;
      }
    }
    return false;
  };

  // Load last selected topic from localStorage on mount
  useEffect(() => {
    // Only restore a stored topic id if we don't already have an active selection.
    // This avoids overwriting a freshly-selected topic when `topics` updates
    // (for example, after onTopicsChange runs).
    if (currentTopicId) return;

    const storedTopicId = localStorage.getItem(
      `lastSelectedTopic_${subjectId}`
    );
    if (storedTopicId && topics.length > 0) {
      // Check if the stored topic still exists in the hierarchy
      if (topicExistsInHierarchy(hierarchicalTopics, storedTopicId)) {
        setCurrentTopicId(storedTopicId);
        const resolved = findTopicByIdHierarchical(
          hierarchicalTopics,
          storedTopicId
        );
        if (resolved) setSelectedTopicName(resolved.name);
      } else {
        // Remove invalid stored topic
        localStorage.removeItem(`lastSelectedTopic_${subjectId}`);
      }
    }
  }, [subjectId, topics]);

  // Save selected topic to localStorage when it changes
  useEffect(() => {
    if (currentTopicId) {
      localStorage.setItem(`lastSelectedTopic_${subjectId}`, currentTopicId);
    }
  }, [currentTopicId, subjectId]);

  // Load existing flow when topic is selected
  useEffect(() => {
    const loadExistingFlow = async () => {
      if (!currentTopicId) {
        // Clear everything when no topic is selected
        onNodesChange([]);
        setFlowId(null);
        return;
      }

      setIsLoading(true);
      try {
        // Get flows for this topic
        const flows = await FlowBuilderService.getFlowsByTopic(currentTopicId);

        if (flows.length > 0) {
          // Load the first flow (you can modify this logic to load a specific flow)
          const flow = flows[0];
          await loadFlow(flow.id, false); // Don't show alert when auto-loading
        } else {
          // No flow exists for this topic, start fresh
          onNodesChange([]);
          setFlowId(null);
        }
      } catch (error) {
        console.error("Error loading existing flow:", error);
        // On error, start fresh
        onNodesChange([]);
        setFlowId(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingFlow();
  }, [currentTopicId]);

  const getNodeColor = () => {
    return ["#10b981", "#059669"];
  };

  const findTopicByIdHierarchical = (
    topics: TopicWithChildren[],
    topicId: string
  ): TopicWithChildren | null => {
    for (const topic of topics) {
      if (topic.id === topicId) return topic;
      if (topic.children && topic.children.length > 0) {
        const found = findTopicByIdHierarchical(topic.children, topicId);
        if (found) return found;
      }
    }
    return null;
  };

  const addNode = () => {
    // Get the highest sort_order from existing nodes and add 1
    const maxSortOrder =
      nodes.length > 0 ? Math.max(...nodes.map((n) => n.sort_order || 1)) : 0;
    const newSortOrder = maxSortOrder + 1;

    const newNode: FlowNode = {
      id: `node-${Date.now()}`,
      flow_id: flowId || "", // Use current flow ID or empty string
      title: `New Learning Node`,
      description: `A new learning node that you can customize with content blocks`,
      sort_order: newSortOrder,
      config: {},
      connections: [],
      status: nodes.length === 0 ? "current" : "available",
      difficulty: "medium",
      xp_reward: 20,
      estimated_time: 10,
      content_blocks: [], // Start with empty content blocks - user adds them manually
      is_active: true,
      created_by: null, // Will be set when saved
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // New node created
    onNodesChange([...nodes, newNode]);
  };

  const updateNode = (nodeId: string, updates: Partial<FlowNode>) => {
    console.log("🔧 FlowBuilder updateNode called:", nodeId, updates);
    const updatedNodes = nodes.map((node) =>
      node.id === nodeId ? { ...node, ...updates } : node
    );
    console.log("🔧 Updated nodes array:", updatedNodes);
    onNodesChange(updatedNodes);

    // 🎯 UPDATE selectedNode with fresh reference
    if (selectedNode && selectedNode.id === nodeId) {
      const freshNode = updatedNodes.find((n) => n.id === nodeId);
      if (freshNode) {
        setSelectedNode(freshNode);
      }
    }
  };

  const deleteNode = (nodeId: string) => {
    const updatedNodes = nodes.filter((node) => node.id !== nodeId);
    // Remove connections to this node
    const cleanedNodes = updatedNodes.map((node) => ({
      ...node,
      connections: node.connections!.filter((conn) => conn !== nodeId),
    }));
    onNodesChange(cleanedNodes);
    setSelectedNode(null);
  };

  const handleTopicChange = (topicId: string) => {
    setCurrentTopicId(topicId);
    // Try to resolve the topic immediately and store its name so the header updates
    const resolved = findTopicByIdHierarchical(hierarchicalTopics, topicId);
    if (resolved) {
      setSelectedTopicName(resolved.name);
    } else {
      setSelectedTopicName(null);
    }
    setShowTopicSelector(false);

    // Mark the topic as having a flow
    // const updateTopicFlow = (
    //   topicList: TopicWithChildren[]
    // ): TopicWithChildren[] => {
    //   return topicList.map((topic) => {
    //     if (topic.id === topicId) {
    //       return { ...topic, has_flow: true, flow_id: topicId };
    //     }
    //     if (topic.children && topic.children.length > 0) {
    //       return { ...topic, children: updateTopicFlow(topic.children) };
    //     }
    //     return topic;
    //   });
    // };

    // onTopicsChange(updateTopicFlow(topics));

  };

  // Save flow to database
  const saveFlow = async () => {
    if (!currentTopicId || nodes.length === 0) {
      alert("Please select a topic and add some nodes before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) {
        alert("Please log in to save flows.");
        return;
      }

      let currentFlowId = flowId;

      // Create flow if it doesn't exist
      if (!currentFlowId) {
        const flow = await FlowBuilderService.createFlow({
          topicId: currentTopicId,
          name: `${getCurrentTopic()?.name || "Topic"} Flow`,
          description: `Learning flow for ${
            getCurrentTopic()?.name || "topic"
          }`,
          createdBy: user.id,
        });
        currentFlowId = flow.id;
        setFlowId(currentFlowId);
      }

      // Save flow nodes
      await FlowBuilderService.saveFlowNodes(currentFlowId || "", nodes);

      alert("Flow saved successfully!");
    } catch (error) {
      console.error("Error saving flow:", error);
      alert("Error saving flow. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Load flow from database
  const loadFlow = async (flowId: string, showAlert: boolean = true) => {
    try {
      const flowWithNodes = await FlowBuilderService.loadFlowWithNodes(flowId);
      if (flowWithNodes) {
        // Convert database nodes back to FlowNode format
        const convertedNodes: FlowNode[] = flowWithNodes.nodes.map(
          (node: {
            id: string;
            title: string;
            description: string;
            sort_order: number;
            config: unknown;
            connections: string[];
            status: string;
            difficulty: string;
            xp_reward: number;
            estimated_time?: number;
            content_blocks?: unknown[];
            flow_id: string;
            is_active: boolean;
            created_by: string | null;
            created_at: string;
            updated_at: string;
          }) => ({
            id: node.id,
            flow_id: node.flow_id,
            title: node.title,
            description: node.description,
            sort_order: node.sort_order,
            config: node.config,
            connections: node.connections || [],
            status: node.status as FlowNode["status"],
            difficulty: node.difficulty as FlowNode["difficulty"],
            xp_reward: node.xp_reward,
            estimated_time: node.estimated_time,
            content_blocks: node.content_blocks || [],
            is_active: node.is_active,
            created_by: node.created_by,
            created_at: node.created_at,
            updated_at: node.updated_at,
          })
        );

        onNodesChange(convertedNodes);
        setFlowId(flowId);

        if (showAlert) {
          alert("Flow loaded successfully!");
        }
      }
    } catch (error) {
      console.error("Error loading flow:", error);
      if (showAlert) {
        alert("Error loading flow. Please try again.");
      }
    }
  };

  const getCurrentTopic = () => {
    if (!currentTopicId) return null;
    return findTopicByIdHierarchical(hierarchicalTopics, currentTopicId);
  };

  return (
    <div className="space-y-6">
      {/*---------------------------------- Toolbar-------------------------------------- */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Learning Flow Builder
          </h2>
          <p className="text-dark-400">
            Design the learning path for "{subjectName}"
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {isLoading && (
            <div className="flex items-center space-x-2 text-blue-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              <span className="text-sm">
                {currentTopicId
                  ? `Loading flow for ${getCurrentTopic()?.name || "topic"}...`
                  : "Loading..."}
              </span>
            </div>
          )}
          <button
            onClick={saveFlow}
            disabled={
              isSaving || !currentTopicId || nodes.length === 0 || isLoading
            }
            className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              !currentTopicId
                ? "Please select a topic first"
                : nodes.length === 0
                ? "Please add some nodes first"
                : "Save flow to database"
            }
          >
            <Settings className="w-5 h-5" />
            <span>
              {isSaving
                ? "Saving..."
                : !currentTopicId
                ? "Select Topic First"
                : nodes.length === 0
                ? "Add Nodes First"
                : "Save Flow"}
            </span>
          </button>
          <button
            onClick={() => addNode()}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Node</span>
          </button>
        </div>
      </div>

      {/*------------------- Main Content - Side by Side Layout --------------------------*/}
      <div className="flex gap-6">
        {/* Flow Container - Left Side */}
        <div className="flex-1 bg-dark-800 rounded-2xl overflow-hidden">
          {/* Header Section */}
          <div
            className="px-6 pt-6 pb-6"
            style={{
              background: "linear-gradient(135deg, #0f0f23, #1a1a2e)",
            }}
          >
            {/* Course Title */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <button
                    onClick={() => {
                      setShowTopicSelector(true);
                    }}
                    className="flex items-center gap-3 w-full bg-dark-700 hover:bg-dark-600 border border-primary-500/30 rounded-xl px-6 py-4 shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 group cursor-pointer"
                    style={{ minHeight: 64 }}
                  >
                    <span className="inline-flex items-center justify-center w-9 h-9 bg-primary-500/10 rounded-full mr-3">
                      {/* Topic icon */}
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          fill="#38bdf8"
                          opacity="0.15"
                        />
                        <path
                          d="M8 12h8M8 16h8M8 8h8"
                          stroke="#38bdf8"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <div className="flex flex-col items-start">
                      <h3 className="text-white text-xl font-bold group-hover:text-primary-400 transition-colors">
                        {selectedTopicName ||
                          getCurrentTopic()?.name ||
                          "Select a Topic"}
                      </h3>
                      <p className="text-primary-400 text-xs mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        Click to{" "}
                        {getCurrentTopic() ? "change topic" : "select topic"}
                      </p>
                    </div>
                  </button>
                </div>
              </div>
          </div>

          {/* Flow Canvas */}
          <FlowCanvas
            nodes={nodes}
            selectedNode={selectedNode}
            onNodeSelect={setSelectedNode}
            onAddNode={addNode}
            isLoading={isLoading}
            currentTopicId={currentTopicId}
            getCurrentTopic={getCurrentTopic}
          />
        </div>

        {/* Node Properties Panel - Right Side */}
        {selectedNode ? (
          <NodePropertiesPanel
            selectedNode={selectedNode}
            updateNode={updateNode}
            deleteNode={deleteNode}
            // quizPacks={quizPacks}
            // loadingQuizPacks={loadingQuizPacks}
            topics={hierarchicalTopics}
            findTopicById={findTopicByIdHierarchical}
            getNodeColor={getNodeColor}
          />
        ) : (
          <div className="w-80 bg-dark-800 rounded-2xl p-6 flex-shrink-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-dark-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Node Properties
              </h3>
              <p className="text-dark-400 text-sm">
                Click on a node to edit its properties
              </p>
            </div>
          </div>
        )}
      </div>

      {/*--------------------------- Topic Selector Modal-------------------------------- */}
      {showTopicSelector && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-dark-900 rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Select Topic for Flow
                </h3>
                <p className="text-dark-400 text-sm mt-1">
                  Only the latest/deepest topics (leaf topics) can have flows
                  assigned. Each leaf topic gets its own separate flow.
                </p>
                {/* Debug button removed */}
              </div>
              <button
                onClick={() => setShowTopicSelector(false)}
                className="text-dark-400 hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {topics.map((topic) => (
                <TopicHierarchySelector
                  key={topic.id}
                  topic={topic}
                  currentTopicId={currentTopicId}
                  onTopicSelect={handleTopicChange}
                  allTopics={topics}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowBuilder;
