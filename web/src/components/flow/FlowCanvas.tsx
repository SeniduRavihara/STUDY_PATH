import React, { useRef } from "react";
import { CheckCircle, FileText, Play, Settings } from "lucide-react";
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

  // Helper function to get node icon (all nodes use the same triangle play icon)
  const getNodeIcon = () => {
    return Play;
  };

  // Helper function to get node color (all nodes use the same color for now)
  const getNodeColor = () => {
    return ["#10b981", "#059669"];
  };

  // Compute flow positions
  const flowNodes = generateFlowPositions(nodes, 800); // Fixed width for consistent positioning

  // Generate vertical paths
  const verticalPaths = generateVerticalFlowPaths(flowNodes);

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
      className="relative overflow-auto flex justify-center"
      style={{
        height: "600px",
        background: "radial-gradient(circle, #374151 1px, transparent 1px)",
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
          const Icon = getNodeIcon();
          const nodeColor = getNodeColor();

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
                selectedNode?.id === node.id ? "ring-2 ring-primary-500" : ""
              }`}
              style={{
                left: (node.position?.x || 0) - nodeSize / 2,
                top: (node.position?.y || 0) - nodeSize / 2,
              }}
              onClick={() => onNodeSelect(node)}
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
                      color: node.status === "locked" ? "#6b7280" : "#ffffff",
                    }}
                  >
                    {node.title}
                  </p>
                  {(node.xp_reward || 0) > 0 && (
                    <p
                      className="text-xs mt-1"
                      style={{
                        color: node.status === "locked" ? "#6b7280" : "#fbbf24",
                      }}
                    >
                      +{node.xp_reward || 0} XP
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
