import {
  BookOpen,
  CheckCircle,
  Diamond,
  FileText,
  Flame,
  Heart,
  HelpCircle,
  Menu,
  Play,
  Plus,
  Settings,
  Trophy,
  Video,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { AuthService } from "../../services/authService";
import { FlowBuilderService } from "../../services/flowBuilderService";
import { type ContentBlock, type TopicWithChildren } from "../../types/database";
import NodePropertiesPanel from "./NodePropertiesPanel";
import TopicHierarchySelector from "../forms/TopicHierarchySelector";

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
  sort_order: number; // Use sort_order instead of position
  config: any;
  connections: string[];
  status: "locked" | "available" | "completed" | "current";
  difficulty: "easy" | "medium" | "hard";
  xp: number;
  icon: string;
  color: [string, string];
  estimatedTime?: string;
  position?: { x: number; y: number }; // Position for rendering on canvas
  content_blocks?: ContentBlock[]; // ⭐ NEW: Flexible content blocks
}



interface FlowBuilderProps {
  nodes: FlowNode[];
  onNodesChange: (nodes: FlowNode[]) => void;
  subjectName: string;
  sidebarCollapsed?: boolean;
  topics: TopicWithChildren[];
  onTopicsChange: (topics: TopicWithChildren[]) => void;
  subjectId: string;
  onSubjectChange?: (subjectId: string) => void;
  currentFlowId?: string; // Add current flow ID
}

// 3-Column Grid System Configuration (matching mobile app)
const FLOW_CONFIG = {
  nodeSpacing: 140, // Vertical spacing between nodes
  leftColumnX: 0.2, // 20% from left edge (left column)
  centerColumnX: 0.5, // 50% from left edge (center column)
  rightColumnX: 0.8, // 80% from left edge (right column)
  startY: 100, // Start 100px from top
  nodeSize: 110, // Node diameter for positioning
  connectionOffset: 25, // Vertical offset for L-shaped connections
};

// 3-Column Grid Flow Pattern (Center acts as transition hub) - Mobile Logic
const POSITION_PATTERN = [
  "center", // Row 1: Start center
  "right", // Row 2: Move right
  "center", // Row 3: Back to center
  "left", // Row 4: Move left
  "center", // Row 5: Back to center
  "right", // Row 6: Move right
  "center", // Row 7: Back to center
  "left", // Row 8: Move left
  "center", // Row 9: Back to center
  "right", // Row 10: Move right
  "center", // Row 11: Back to center
  "left", // Row 12: Move left
];

// Get smart position for node based on mobile's organic pattern
const getSmartPosition = (index: number): "left" | "center" | "right" => {
  return POSITION_PATTERN[index % POSITION_PATTERN.length] as
    | "left"
    | "center"
    | "right";
};

// Calculate node position using simple switch case based on node position
const calculateNodePosition = (sortOrder: number, containerWidth: number) => {
  // Validate and provide default sort_order
  const validSortOrder =
    isNaN(sortOrder) || sortOrder === undefined || sortOrder === null
      ? 1
      : sortOrder;

  // Calculate Y position (vertical) - fixed spacing
  const y = FLOW_CONFIG.startY + (validSortOrder - 1) * FLOW_CONFIG.nodeSpacing;

  // Get position from mobile's organic pattern
  const positionKey = getSmartPosition(validSortOrder - 1);

  // Map position to actual X coordinate
  let x: number;
  switch (positionKey) {
    case "left":
      x = containerWidth * FLOW_CONFIG.leftColumnX;
      break;
    case "center":
      x = containerWidth * FLOW_CONFIG.centerColumnX;
      break;
    case "right":
      x = containerWidth * FLOW_CONFIG.rightColumnX;
      break;
    default:
      x = containerWidth * FLOW_CONFIG.centerColumnX;
  }

  // position calculated

  return { x, y };
};

// Generate flow positions using sort_order + presentation logic
const generateFlowPositions = (
  nodes: FlowNode[],
  containerWidth: number = 800 // Use fixed width for consistent positioning
): FlowNode[] => {
  return nodes.map((node) => {
    // Calculate position using sort_order
    const position = calculateNodePosition(node.sort_order, containerWidth);

    return {
      ...node,
      position: position,
    };
  });
};

// Get node anchor point based on position and direction
const getNodeAnchorPoint = (
  node: FlowNode,
  direction: "top" | "bottom" | "left" | "right" | "center"
): { x: number; y: number } => {
  const centerX = node.position?.x || 0;
  const centerY = node.position?.y || 0;
  const halfSize = FLOW_CONFIG.nodeSize / 2;

  switch (direction) {
    case "top":
      return { x: centerX, y: centerY - halfSize };
    case "bottom":
      return { x: centerX, y: centerY + halfSize };
    case "left":
      return { x: centerX - halfSize, y: centerY };
    case "right":
      return { x: centerX + halfSize, y: centerY };
    case "center":
      return { x: centerX, y: centerY };
    default:
      return { x: centerX, y: centerY };
  }
};

// Get connection points based on node positions and flow direction
const getConnectionPoints = (
  currentNode: FlowNode,
  nextNode: FlowNode
): { start: { x: number; y: number }; end: { x: number; y: number } } => {
  const currentPos = getSmartPosition((currentNode.sort_order || 1) - 1);
  const nextPos = getSmartPosition((nextNode.sort_order || 1) - 1);

  let startPoint: { x: number; y: number };
  let endPoint: { x: number; y: number };

  // Mobile-inspired connection logic
  if (currentPos === "center" && nextPos === "right") {
    // Center to Right: Start from RIGHT side, end at TOP
    startPoint = getNodeAnchorPoint(currentNode, "right");
    endPoint = getNodeAnchorPoint(nextNode, "top");
  } else if (currentPos === "right" && nextPos === "center") {
    // Right to Center: Start from BOTTOM, end at RIGHT side
    startPoint = getNodeAnchorPoint(currentNode, "bottom");
    endPoint = getNodeAnchorPoint(nextNode, "right");
  } else if (currentPos === "center" && nextPos === "left") {
    // Center to Left: Start from LEFT side, end at TOP
    startPoint = getNodeAnchorPoint(currentNode, "left");
    endPoint = getNodeAnchorPoint(nextNode, "top");
  } else if (currentPos === "left" && nextPos === "center") {
    // Left to Center: Start from BOTTOM, end at LEFT side
    startPoint = getNodeAnchorPoint(currentNode, "bottom");
    endPoint = getNodeAnchorPoint(nextNode, "left");
  } else {
    // Fallback for other combinations
    startPoint = getNodeAnchorPoint(currentNode, "bottom");
    endPoint = getNodeAnchorPoint(nextNode, "top");
  }

  return { start: startPoint, end: endPoint };
};

// Create proper L-shaped path with correct orientation
const createVerticalFlowPath = (
  startNode: FlowNode,
  endNode: FlowNode
): string => {
  const points = getConnectionPoints(startNode, endNode);
  const start = points.start;
  const end = points.end;

  const currentPos = getSmartPosition((startNode.sort_order || 1) - 1);
  const nextPos = getSmartPosition((endNode.sort_order || 1) - 1);

  let path: string;
  const cornerRadius = 8; // Small radius to smooth the sharp turns

  // Mobile-inspired L-shaped patterns with smooth corners
  if (currentPos === "center" && nextPos === "right") {
    // Center to Right: go RIGHT first, then DOWN with smooth corner
    const cornerX = end.x - cornerRadius;
    const cornerY = start.y + cornerRadius;
    path = `M ${start.x} ${start.y} L ${cornerX} ${start.y} Q ${end.x} ${start.y} ${end.x} ${cornerY} L ${end.x} ${end.y}`;
  } else if (currentPos === "right" && nextPos === "center") {
    // Right to Center: go DOWN first, then LEFT with smooth corner
    const cornerX = start.x - cornerRadius;
    const cornerY = end.y - cornerRadius;
    path = `M ${start.x} ${start.y} L ${start.x} ${cornerY} Q ${start.x} ${end.y} ${cornerX} ${end.y} L ${end.x} ${end.y}`;
  } else if (currentPos === "center" && nextPos === "left") {
    // Center to Left: go LEFT first, then DOWN with smooth corner
    const cornerX = end.x + cornerRadius;
    const cornerY = start.y + cornerRadius;
    path = `M ${start.x} ${start.y} L ${cornerX} ${start.y} Q ${end.x} ${start.y} ${end.x} ${cornerY} L ${end.x} ${end.y}`;
  } else if (currentPos === "left" && nextPos === "center") {
    // Left to Center: go DOWN first, then RIGHT with smooth corner
    const cornerX = start.x + cornerRadius;
    const cornerY = end.y - cornerRadius;
    path = `M ${start.x} ${start.y} L ${start.x} ${cornerY} Q ${start.x} ${end.y} ${cornerX} ${end.y} L ${end.x} ${end.y}`;
  } else if (currentPos === "center" && nextPos === "center") {
    // Center to Center: straight line down
    path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  } else {
    // Fallback: determine based on relative positions
    if (start.x === end.x) {
      // Same X position - straight line down
      path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    } else if (start.y === end.y) {
      // Same Y position - straight line across
      path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    } else {
      // Different X and Y - create L-shape with smooth corner
      if (end.x > start.x) {
        // Target is to the RIGHT of current - go RIGHT first, then DOWN with smooth corner
        const cornerX = end.x - cornerRadius;
        const cornerY = start.y + cornerRadius;
        path = `M ${start.x} ${start.y} L ${cornerX} ${start.y} Q ${end.x} ${start.y} ${end.x} ${cornerY} L ${end.x} ${end.y}`;
      } else {
        // Target is to the LEFT of current - go DOWN first, then LEFT with smooth corner
        const cornerX = start.x - cornerRadius;
        const cornerY = end.y - cornerRadius;
        path = `M ${start.x} ${start.y} L ${start.x} ${cornerY} Q ${start.x} ${end.y} ${cornerX} ${end.y} L ${end.x} ${end.y}`;
      }
    }
  }

  return path;
};

// Generate all vertical flow paths between consecutive nodes
const generateVerticalFlowPaths = (nodes: FlowNode[]): string[] => {
  if (nodes.length < 2) return [];

  const paths: string[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const currentPath = createVerticalFlowPath(nodes[i], nodes[i + 1]);
    paths.push(currentPath);
  }
  return paths;
};

const FlowBuilder: React.FC<FlowBuilderProps> = ({
  nodes,
  onNodesChange,
  subjectName,
  sidebarCollapsed = false,
  topics,
  onTopicsChange,
  subjectId,
  onSubjectChange,
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
  // Quiz packs are now stored inside flow nodes as JSON. Keep these values empty
  // so legacy UI paths gracefully fall back to content-blocks.
  const quizPacks: unknown[] = [];
  const loadingQuizPacks = false;
  const containerRef = useRef<HTMLDivElement>(null);

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
        const resolved = findTopicByIdHierarchical(hierarchicalTopics, storedTopicId);
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

  // Load quiz packs hierarchically when topic is selected
  // Quiz packs/MCQs are now stored inside flow nodes as JSON.
  // Avoid fetching legacy `quiz_packs` table which may not exist in the updated schema.
  // Keep quizPacks state empty and loading flag false so NodePropertiesPanel shows the content-blocks tip.

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

  // (leaf topic helper removed; keep topic utilities minimal)

  const nodeTypes = [
    {
      type: "start",
      name: "Start",
      icon: Play,
      color: ["#10b981", "#059669"],
      xp: 0,
      difficulty: "easy" as const,
    },
    {
      type: "study",
      name: "Study",
      icon: BookOpen,
      color: ["#3b82f6", "#1d4ed8"],
      xp: 25,
      difficulty: "medium" as const,
    },
    {
      type: "quiz",
      name: "Quiz",
      icon: HelpCircle,
      color: ["#f59e0b", "#d97706"],
      xp: 30,
      difficulty: "medium" as const,
    },
    {
      type: "video",
      name: "Video",
      icon: Video,
      color: ["#8b5cf6", "#7c3aed"],
      xp: 20,
      difficulty: "easy" as const,
    },
    {
      type: "assignment",
      name: "Assignment",
      icon: FileText,
      color: ["#6366f1", "#4f46e5"],
      xp: 40,
      difficulty: "hard" as const,
    },
    {
      type: "assessment",
      name: "Assessment",
      icon: CheckCircle,
      color: ["#ef4444", "#dc2626"],
      xp: 50,
      difficulty: "hard" as const,
    },
    {
      type: "end",
      name: "End",
      icon: Settings,
      color: ["#6b7280", "#4b5563"],
      xp: 0,
      difficulty: "easy" as const,
    },
  ];

  const getNodeIcon = (type: string) => {
    const nodeType = nodeTypes.find((nt) => nt.type === type);
    return nodeType ? nodeType.icon : BookOpen;
  };

  const getNodeColor = (type: string) => {
    const nodeType = nodeTypes.find((nt) => nt.type === type);
    return nodeType ? nodeType.color : ["#6b7280", "#4b5563"];
  };



  const findTopicByIdHierarchical = (topics: TopicWithChildren[], topicId: string): TopicWithChildren | null => {
    for (const topic of topics) {
      if (topic.id === topicId) return topic;
      if (topic.children && topic.children.length > 0) {
        const found = findTopicByIdHierarchical(topic.children, topicId);
        if (found) return found;
      }
    }
    return null;
  };

  const addNode = (type: string) => {
    const nodeType = nodeTypes.find((nt) => nt.type === type);
    if (!nodeType) return;

    // Get the highest sort_order from existing nodes and add 1
    const maxSortOrder =
      nodes.length > 0 ? Math.max(...nodes.map((n) => n.sort_order || 1)) : 0;
    const newSortOrder = maxSortOrder + 1;

    const newNode: FlowNode = {
      id: `node-${Date.now()}`,
      type: type as FlowNode["type"],
      title: `New ${nodeType.name}`,
      description: `Description for ${nodeType.name} node`,
      sort_order: newSortOrder, // Use unique sort_order
      config: {},
      connections: [],
      status: nodes.length === 0 ? "current" : "available", // First node is current, others are available
      difficulty: nodeType.difficulty,
      xp: nodeType.xp,
      icon: nodeType.icon.name,
      color: nodeType.color as [string, string],
      estimatedTime: "5 min",
      content_blocks: [], // 🎯 START WITH EMPTY BLOCKS - user adds content manually
    };

    // new node created
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
      connections: node.connections.filter((conn) => conn !== nodeId),
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
    const updateTopicFlow = (topicList: TopicWithChildren[]): TopicWithChildren[] => {
      return topicList.map((topic) => {
        if (topic.id === topicId) {
          return { ...topic, has_flow: true, flow_id: topicId };
        }
        if (topic.children && topic.children.length > 0) {
          return { ...topic, children: updateTopicFlow(topic.children) };
        }
        return topic;
      });
    };

    onTopicsChange(updateTopicFlow(topics));

    if (onSubjectChange) {
      onSubjectChange(topicId);
    }
  };

  // (debug effect intentionally removed)

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
            node_type: string;
            title: string;
            description: string;
            sort_order: number;
            config: unknown;
            connections: string[];
            status: string;
            difficulty: string;
            xp_reward: number;
            estimated_time?: number;
          }) => ({
            id: node.id,
            type: node.node_type as FlowNode["type"],
            title: node.title,
            description: node.description,
            sort_order: node.sort_order,
            config: node.config,
            connections: node.connections,
            status: node.status as FlowNode["status"],
            difficulty: node.difficulty as FlowNode["difficulty"],
            xp: node.xp_reward,
            icon: getNodeIcon(node.node_type).name,
            color: getNodeColor(node.node_type),
            estimatedTime: node.estimated_time
              ? `${node.estimated_time} min`
              : undefined,
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

  const currentTopic = getCurrentTopic();

  // Sort nodes by sort_order first, then generate positioned nodes and paths
  const sortedNodes = [...nodes].sort((a, b) => {
    const aOrder = a.sort_order || 1;
    const bOrder = b.sort_order || 1;
    return aOrder - bOrder;
  });

  // Fix nodes that don't have sort_order by assigning them based on their position in the array
  const fixedNodes = sortedNodes.map((node, index) => ({
    ...node,
    sort_order: node.sort_order || index + 1,
  }));

  console.log("FIXED NODES:", fixedNodes);

  const flowNodes = generateFlowPositions(fixedNodes, 800); // Fixed width for consistent positioning

  const verticalPaths = generateVerticalFlowPaths(flowNodes);

  // Calculate total content height
  const totalContentHeight =
    flowNodes.length > 0
      ? (flowNodes[flowNodes.length - 1].position?.y || 0) +
        FLOW_CONFIG.nodeSpacing +
        300
      : 600;

  // Calculate course progress
  const completedNodes = flowNodes.filter(
    (node) => node.status === "completed"
  ).length;
  const totalNodes = flowNodes.length;
  const courseProgress =
    totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0;

  // Mock user stats
  const userStats = {
    hearts: 5,
    coins: 200,
    streak: 7,
    totalXp: 1250,
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Learning Flow Builder
          </h2>
          <p className="text-dark-400">
            Design the learning path for "{subjectName}"
            {sidebarCollapsed && (
              <span className="ml-2 text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded">
                Sidebar Collapsed - Flow Centered
              </span>
            )}
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
            onClick={() => addNode("study")}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Node</span>
          </button>
        </div>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div className="flex gap-6">
        {/* Flow Container - Left Side */}
        <div className="flex-1 bg-dark-800 rounded-2xl overflow-hidden">
          {/* Header Section (matching mobile app) */}
          <div
            className="px-6 pt-6 pb-6"
            style={{
              background: "linear-gradient(135deg, #0f0f23, #1a1a2e)",
            }}
          >
            {/* User Stats */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-4">
                {/* Hearts */}
                <div className="bg-red-500 bg-opacity-20 px-4 py-2 rounded-full flex items-center">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="text-white font-bold ml-2">
                    {userStats.hearts}
                  </span>
                </div>

                {/* Coins */}
                <div className="bg-yellow-500 bg-opacity-20 px-4 py-2 rounded-full flex items-center">
                  <Diamond className="w-5 h-5 text-yellow-500" />
                  <span className="text-white font-bold ml-2">
                    {userStats.coins}
                  </span>
                </div>

                {/* Streak */}
                <div className="bg-orange-500 bg-opacity-20 px-4 py-2 rounded-full flex items-center">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-white font-bold ml-2">
                    {userStats.streak}
                  </span>
                </div>
              </div>

              {/* Menu */}
              <button className="bg-dark-700 p-3 rounded-full">
                <Menu className="w-6 h-6 text-primary-500" />
              </button>
            </div>

            {/* Course Title */}
            <div className="bg-dark-700 bg-opacity-50 px-6 py-4 rounded-2xl mb-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <button
                    onClick={() => {
                      console.log("Topic selector button clicked!");
                      setShowTopicSelector(true);
                    }}
                    className="text-left hover:bg-dark-600 rounded-lg p-2 -m-2 transition-colors group"
                  >
                    <h3 className="text-white text-2xl font-bold group-hover:text-primary-400 transition-colors">
                      {selectedTopicName ||
                        (currentTopic ? currentTopic.name : "Select a Topic")}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {currentTopic
                        ? `${Math.round(courseProgress)}% Complete`
                        : "Choose a topic to build flow"}
                    </p>
                    <p className="text-primary-400 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to {currentTopic ? "change topic" : "select topic"}
                    </p>
                    {/* topic selector modal state is handled separately */}
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-white text-xl font-bold">
                    {userStats.totalXp}
                  </p>
                  <p className="text-gray-400 text-xs">Total XP</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-dark-600 rounded-full h-3 mt-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-full h-3 transition-all duration-300"
                  style={{ width: `${courseProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Flow Canvas */}
          <div
            ref={containerRef}
            className="relative overflow-auto flex justify-center"
            style={{
              height: "600px",
              background:
                "radial-gradient(circle, #374151 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          >
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-dark-800 bg-opacity-80 flex items-center justify-center z-50">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                  <div className="text-white text-lg font-medium">
                    {currentTopicId
                      ? `Loading flow for ${
                          getCurrentTopic()?.name || "topic"
                        }...`
                      : "Loading..."}
                  </div>
                  <div className="text-dark-300 text-sm">
                    Please wait while we fetch your flow
                  </div>
                </div>
              </div>
            )}
            <div
              className="relative mx-auto"
              style={{
                minHeight: totalContentHeight,
                width: "800px", // Fixed width for consistent centering
                maxWidth: "100%",
              }}
            >
              {/* SVG Connections */}
              <svg
                height={totalContentHeight}
                width="800"
                style={{ position: "absolute", top: 0, left: 0 }}
              >
                {verticalPaths.map((path, index) => (
                  <path
                    key={index}
                    d={path}
                    stroke="#666666"
                    strokeWidth="6"
                    fill="none"
                    opacity={0.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
              </svg>

              {/* Learning Nodes */}
              {flowNodes.map((node) => {
                const Icon = getNodeIcon(node.type);
                const nodeColor = getNodeColor(node.type);

                const getNodeSize = () => {
                  const baseSize = FLOW_CONFIG.nodeSize;
                  switch (node.status) {
                    case "current":
                      return baseSize;
                    case "completed":
                      return baseSize * 0.9;
                    case "available":
                      return baseSize * 0.85;
                    case "locked":
                      return baseSize * 0.8;
                    default:
                      return baseSize * 0.85;
                  }
                };

                const getNodeIconName = () => {
                  switch (node.status) {
                    case "completed":
                      return CheckCircle;
                    case "locked":
                      return Settings; // Lock icon
                    case "current":
                      return Play;
                    default:
                      return Icon;
                  }
                };

                const getStatusColor = () => {
                  switch (node.status) {
                    case "completed":
                      return ["#10b981", "#059669"];
                    case "current":
                      return ["#8b5cf6", "#7c3aed"];
                    case "locked":
                      return ["#6b7280", "#4b5563"];
                    default:
                      return nodeColor;
                  }
                };

                const nodeSize = getNodeSize();
                const StatusIcon = getNodeIconName();
                const statusColor = getStatusColor();
                const isDisabled = node.status === "locked";

                return (
                  <div
                    key={node.id}
                    className={`absolute select-none ${
                      selectedNode?.id === node.id
                        ? "ring-2 ring-primary-500"
                        : ""
                    }`}
                    style={{
                      left: (node.position?.x || 0) - nodeSize / 2,
                      top: (node.position?.y || 0) - nodeSize / 2,
                    }}
                    onClick={() => setSelectedNode(node)}
                  >
                    <button disabled={isDisabled} className="relative group">
                      {/* Node Circle */}
                      <div
                        className="flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
                        style={{
                          width: nodeSize,
                          height: nodeSize,
                          borderRadius: 16,
                          background: `linear-gradient(135deg, ${statusColor[0]}, ${statusColor[1]})`,
                          boxShadow: `0 4px 8px rgba(0, 0, 0, 0.3), 0 0 0 0 ${statusColor[0]}40`,
                        }}
                      >
                        <StatusIcon className="w-8 h-8 text-white" />
                      </div>

                      {/* Node Label */}
                      <div
                        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center"
                        style={{ minWidth: 100 }}
                      >
                        <p
                          className="text-xs font-semibold"
                          style={{
                            color:
                              node.status === "locked" ? "#6b7280" : "#ffffff",
                          }}
                        >
                          {node.title}
                        </p>
                        {node.xp > 0 && (
                          <p
                            className="text-xs mt-1"
                            style={{
                              color:
                                node.status === "locked"
                                  ? "#6b7280"
                                  : "#fbbf24",
                            }}
                          >
                            +{node.xp} XP
                          </p>
                        )}
                      </div>

                      {/* Difficulty Indicator */}
                      {node.status !== "locked" && (
                        <div className="absolute -top-2 -right-2 bg-white rounded-full px-2 py-1 min-w-[20px]">
                          <p
                            className="text-xs font-bold text-center"
                            style={{
                              color:
                                node.difficulty === "easy"
                                  ? "#10b981"
                                  : node.difficulty === "medium"
                                  ? "#f59e0b"
                                  : "#ef4444",
                            }}
                          >
                            {node.difficulty === "easy"
                              ? "E"
                              : node.difficulty === "medium"
                              ? "M"
                              : "H"}
                          </p>
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}

              {/* Empty state */}
              {nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-dark-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Start Building Your Learning Flow
                    </h3>
                    <p className="text-dark-400 mb-6">
                      Add nodes to create an interactive learning path
                    </p>
                    <button
                      onClick={() => addNode("study")}
                      className="btn-primary"
                    >
                      Add Your First Node
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Info Panel */}
          <div className="bg-dark-700 bg-opacity-95 p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-semibold">
                  Next:{" "}
                  {flowNodes.find((n) => n.status === "current")?.title ||
                    "Complete the course!"}
                </p>
                <p className="text-gray-400 text-sm">
                  {flowNodes.filter((n) => n.status === "completed").length} of{" "}
                  {flowNodes.length} completed
                </p>
              </div>
              <div className="flex items-center">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="text-yellow-400 font-bold ml-1">
                  {Math.round(courseProgress)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Node Properties Panel - Right Side */}
        {selectedNode ? (
          <NodePropertiesPanel
            selectedNode={selectedNode}
            updateNode={updateNode}
            deleteNode={deleteNode}
            quizPacks={quizPacks}
            loadingQuizPacks={loadingQuizPacks}
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

      {/* Topic Selector Modal */}
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
              >
                ×
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
