import { CheckCircle, FileText, Play, Plus, Settings, Zap } from "lucide-react";
import React, { useRef, useState } from "react";
import { type FlowNode, type TopicWithChildren } from "../../types/database";

interface FlowCanvasProps {
  nodes: FlowNode[];
  selectedNode: FlowNode | null;
  onNodeSelect: (node: FlowNode) => void;
  onAddNode: () => void;
  isLoading: boolean;
  currentTopicId: string;
  getCurrentTopic: () => TopicWithChildren | null;
}

// Extended FlowNode with position for rendering
interface PositionedFlowNode extends FlowNode {
  position?: { x: number; y: number };
}

// 3-Column Grid System Configuration (matching mobile app)
const FLOW_CONFIG = {
  nodeSpacing: 160, // Vertical spacing between nodes - increased for better breathing room
  leftColumnX: 0.3, // 25% from left edge (left column)
  centerColumnX: 0.5, // 50% from left edge (center column)
  rightColumnX: 0.7, // 75% from left edge (right column)
  startY: 100, // Start 100px from top
  nodeSize: 100, // Node size - slightly smaller for cleaner look
  connectionOffset: 25, // Vertical offset for L-shaped connections
};

// Connection and styling constants for easy adjustments
const CONNECTION_CONFIG = {
  strokeWidth: 8, // Thickness of connection lines
  cornerRadius: 30, // Radius for rounded corners in L-shaped paths
  opacity: 0.6, // Opacity of connection lines
  color: "#8b5cf6", // Purple color for connections
};

const NODE_CONFIG = {
  borderRadius: 24, // Border radius for node circles
  width: 100, // Node width
  height: 100, // Node height
};

// Optional intermediate node configuration
const OPTIONAL_NODE_CONFIG = {
  width: 90, // Slightly smaller than regular nodes
  height: 90,
  borderRadius: 20,
  backgroundColor: "#4c4563", // Darker purple/gray color from image
  iconColor: "#ffffff",
};

// Interface for optional intermediate nodes (UI only, no database)
interface OptionalNode {
  id: string;
  title: string;
  description?: string;
}

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

  return { x, y };
};

// Generate flow positions using sort_order + presentation logic
const generateFlowPositions = (
  nodes: FlowNode[],
  containerWidth: number = 800 // Use fixed width for consistent positioning
): PositionedFlowNode[] => {
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
  node: PositionedFlowNode,
  direction: "top" | "bottom" | "left" | "right" | "center"
): { x: number; y: number } => {
  const centerX = node.position?.x || 0;
  const centerY = node.position?.y || 0;
  const halfWidth = NODE_CONFIG.width / 2;
  const halfHeight = NODE_CONFIG.height / 2;

  switch (direction) {
    case "top":
      return { x: centerX, y: centerY - halfHeight };
    case "bottom":
      return { x: centerX, y: centerY + halfHeight };
    case "left":
      return { x: centerX - halfWidth, y: centerY };
    case "right":
      return { x: centerX + halfWidth, y: centerY };
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
  const cornerRadius = CONNECTION_CONFIG.cornerRadius; // Larger radius for more rounded L-shaped corners

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

const FlowCanvas: React.FC<FlowCanvasProps> = ({
  nodes,
  selectedNode,
  onNodeSelect,
  onAddNode,
  isLoading,
  currentTopicId,
  getCurrentTopic,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // State for optional intermediate nodes (UI only)
  // Array index represents position: 0 = between nodes 1-3, 1 = between 3-5, 2 = between 5-7, etc.
  const [optionalNodes, setOptionalNodes] = useState<(OptionalNode | null)[]>(
    []
  );

  // Helper function to get node icon (all nodes use the same triangle play icon)
  const getNodeIcon = () => {
    return Play;
  };

  // Helper function to get node color (all nodes use the same color for now)
  const getNodeColor = () => {
    return ["#a78bfa", "#8b5cf6"]; // Softer purple gradient
  };

  // Compute flow positions
  const flowNodes = generateFlowPositions(nodes, 800); // Fixed width for consistent positioning

  // Generate vertical paths
  const verticalPaths = generateVerticalFlowPaths(flowNodes);

  // Calculate positions for optional intermediate nodes (between 1-3, 3-5, 5-7, etc.)
  const getOptionalNodePosition = (
    index: number,
    containerWidth: number = 800
  ) => {
    // Optional node at index i sits between flow nodes (2*i) and (2*i + 2)
    // For example: index 0 = between nodes 0 and 2 (nodes 1 and 3 in 1-based)
    const beforeNodeIndex = index * 2;
    const afterNodeIndex = index * 2 + 2;

    if (
      beforeNodeIndex >= flowNodes.length ||
      afterNodeIndex >= flowNodes.length
    ) {
      return null;
    }

    const beforeNode = flowNodes[beforeNodeIndex];
    const afterNode = flowNodes[afterNodeIndex];

    // Position in center, between the two nodes
    const y =
      ((beforeNode.position?.y || 0) + (afterNode.position?.y || 0)) / 2;
    const x = containerWidth * FLOW_CONFIG.centerColumnX; // Always in center

    return { x, y };
  };

  // Handler to add optional node
  const handleAddOptionalNode = (index: number) => {
    const newOptionalNodes = [...optionalNodes];
    newOptionalNodes[index] = {
      id: `optional-${Date.now()}`,
      title: "Optional Node",
      description: "Click to edit",
    };
    setOptionalNodes(newOptionalNodes);
  };

  // Handler to remove optional node
  const handleRemoveOptionalNode = (index: number) => {
    const newOptionalNodes = [...optionalNodes];
    newOptionalNodes[index] = null;
    setOptionalNodes(newOptionalNodes);
  };

  // Calculate total content height
  const totalContentHeight =
    flowNodes.length > 0
      ? (flowNodes[flowNodes.length - 1].position?.y || 0) +
        FLOW_CONFIG.nodeSpacing +
        300
      : 600;

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto flex justify-center bg-dark-900"
      style={{
        height: "600px",
        background:
          "#1f2937 radial-gradient(circle, #374151 1px, transparent 1px)",
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
                ? `Loading flow for ${getCurrentTopic()?.name || "topic"}...`
                : "Loading..."}
            </div>
            <div className="text-dark-300 text-sm">
              Please wait while we fetch your flow
            </div>
          </div>
        </div>
      )}
      <div
        className="relative mx-auto "
        style={{
          minHeight: totalContentHeight,
          width: "800px", // Fixed width for consistent centering
          maxWidth: "100%",
        }}
      >
        {/* SVG Connections */}
        <svg
          height={totalContentHeight}
          width="700"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {verticalPaths.map((path, index) => (
            <path
              key={index}
              d={path}
              stroke={CONNECTION_CONFIG.color}
              strokeWidth={CONNECTION_CONFIG.strokeWidth}
              fill="none"
              opacity={CONNECTION_CONFIG.opacity}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>

        {/* Learning Nodes */}
        {flowNodes.map((node) => {
          const Icon = getNodeIcon();
          const nodeColor = getNodeColor();

          const getNodeSize = () => {
            // Return width and height from constants
            return {
              width: NODE_CONFIG.width,
              height: NODE_CONFIG.height,
            };
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
                return ["#a78bfa", "#8b5cf6"]; // Purple for completed
              case "current":
                return ["#a78bfa", "#8b5cf6"]; // Purple for current
              case "locked":
                return ["#4b5563", "#374151"]; // Dark gray for locked
              default:
                return nodeColor;
            }
          };

          const { width: nodeWidth, height: nodeHeight } = getNodeSize();
          const StatusIcon = getNodeIconName();
          const statusColor = getStatusColor();
          const isDisabled = node.status === "locked";

          return (
            <div
              key={node.id}
              className={`absolute select-none ${
                selectedNode?.id === node.id ? "ring-2 ring-primary-500" : ""
              }`}
              style={{
                left: (node.position?.x || 0) - nodeWidth / 2,
                top: (node.position?.y || 0) - nodeHeight / 2,
              }}
              onClick={() => onNodeSelect(node)}
            >
              <button disabled={isDisabled} className="relative group">
                {/* Node Circle */}
                <div
                  className="flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  style={{
                    width: nodeWidth,
                    height: nodeHeight,
                    borderRadius: NODE_CONFIG.borderRadius, // Much larger border radius for rounded square look
                    background: `linear-gradient(135deg, ${statusColor[0]}, ${statusColor[1]})`,
                    boxShadow:
                      node.status === "locked"
                        ? `0 2px 8px rgba(0, 0, 0, 0.1)`
                        : `0 4px 12px rgba(139, 92, 246, 0.3)`,
                    border:
                      node.status === "locked" ? "2px solid #f3f4f6" : "none",
                  }}
                >
                  <StatusIcon
                    className={`${
                      node.status === "locked"
                        ? "w-6 h-6 text-gray-500"
                        : "w-8 h-8 text-white"
                    }`}
                  />
                </div>

                {/* Node Label */}
                <div
                  className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-center"
                  style={{ minWidth: 120 }}
                >
                  <p
                    className="text-sm font-medium"
                    style={{
                      color: node.status === "locked" ? "#9ca3af" : "#ffffff",
                    }}
                  >
                    {node.title}
                  </p>
                  {(node.xp_reward || 0) > 0 && (
                    <p
                      className="text-xs mt-1 font-semibold"
                      style={{
                        color: node.status === "locked" ? "#9ca3af" : "#fbbf24",
                      }}
                    >
                      +{node.xp_reward || 0} XP
                    </p>
                  )}
                </div>

                {/* Difficulty Indicator */}
                {node.status !== "locked" && (
                  <div className="absolute -top-2 -right-2 bg-white rounded-full px-2.5 py-1 min-w-[28px] shadow-md">
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

        {/* Optional Intermediate Nodes & Add Buttons */}
        {flowNodes.length > 2 &&
          Array.from({ length: Math.floor(flowNodes.length / 2) }).map(
            (_, index) => {
              const position = getOptionalNodePosition(index);
              if (!position) return null;

              const optionalNode = optionalNodes[index];
              const hasOptionalNode = !!optionalNode;

              return (
                <div key={`optional-slot-${index}`}>
                  {hasOptionalNode ? (
                    // Render optional node
                    <div
                      className="absolute select-none cursor-pointer group"
                      style={{
                        left: position.x - OPTIONAL_NODE_CONFIG.width / 2,
                        top: position.y - OPTIONAL_NODE_CONFIG.height / 2,
                      }}
                      onClick={() => {
                        // For now, just allow deletion on click
                        if (confirm("Remove this optional node?")) {
                          handleRemoveOptionalNode(index);
                        }
                      }}
                    >
                      <div
                        className="flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                        style={{
                          width: OPTIONAL_NODE_CONFIG.width,
                          height: OPTIONAL_NODE_CONFIG.height,
                          borderRadius: OPTIONAL_NODE_CONFIG.borderRadius,
                          backgroundColor: OPTIONAL_NODE_CONFIG.backgroundColor,
                          boxShadow: "0 4px 12px rgba(76, 69, 99, 0.4)",
                        }}
                      >
                        <Zap
                          className="text-white"
                          size={36}
                          strokeWidth={2.5}
                        />
                      </div>
                      {/* Optional Node Label */}
                      <div
                        className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-center"
                        style={{ minWidth: 120 }}
                      >
                        <p className="text-sm font-medium text-gray-400">
                          {optionalNode.title}
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Render + button to add optional node
                    <button
                      className="absolute group"
                      style={{
                        left: position.x - 20,
                        top: position.y - 20,
                      }}
                      onClick={() => handleAddOptionalNode(index)}
                    >
                      <div
                        className="flex items-center justify-center transition-all duration-300 hover:scale-110"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          backgroundColor: "#374151",
                          border: "2px dashed #6b7280",
                        }}
                      >
                        <Plus
                          className="text-gray-400 group-hover:text-white"
                          size={24}
                        />
                      </div>
                    </button>
                  )}
                </div>
              );
            }
          )}

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
              <button onClick={() => onAddNode()} className="btn-primary">
                Add Your First Node
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default FlowCanvas;
