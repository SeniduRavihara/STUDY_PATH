import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
Animated,
ColorValue,
Dimensions,
ScrollView,
StyleSheet,
Text,
TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

const { width: screenWidth } = Dimensions.get("window");

// Types for learning nodes
export interface LearningNode {
  id: string;
  title: string;
  type: "lesson" | "quiz" | "project" | "milestone";
  status: "locked" | "available" | "completed" | "current";
  difficulty: "easy" | "medium" | "hard";
  xp: number;
  position: { x: number; y: number };
  icon: keyof typeof Ionicons.glyphMap;
  color: [string, string];
  description?: string;
  estimatedTime?: string;
  config?: {
    quiz_pack_id?: string;
    [key: string]: any;
  };
}

interface LearningFlowPathProps {
  nodes: LearningNode[];
  onNodePress: (node: LearningNode) => void;
  userStats: {
    hearts: number;
    coins: number;
    streak: number;
    totalXp: number;
  };
  courseTitle: string;
  courseProgress: number;
  onTitlePress?: () => void;
}

// 3-Column Grid System Configuration
const FLOW_CONFIG = {
  nodeSpacing: 140,
  leftColumnX: 0.2,
  centerColumnX: 0.5,
  rightColumnX: 0.8,
  startY: 100,
  nodeSize: 110,
  connectionOffset: 25,
};

// 3-Column Grid Flow Pattern (Center acts as transition hub)
const POSITION_PATTERN = [
  "center",
  "right",
  "center",
  "left",
  "center",
  "right",
  "center",
  "left",
  "center",
  "right",
  "center",
  "left",
];

// Get smart position for node based on Mimo's organic pattern
const getSmartPosition = (index: number): "left" | "center" | "right" => {
  return POSITION_PATTERN[index % POSITION_PATTERN.length] as
    | "left"
    | "center"
    | "right";
};

// Generate vertical flow positions for nodes using 3-column system
const generateVerticalFlowPositions = (
  nodes: LearningNode[]
): LearningNode[] => {
  const { width: screenWidth } = Dimensions.get("window");

  return nodes.map((node, index) => {
    const positionKey = getSmartPosition(index);

    let x: number;
    switch (positionKey) {
      case "left":
        x = screenWidth * FLOW_CONFIG.leftColumnX;
        break;
      case "center":
        x = screenWidth * FLOW_CONFIG.centerColumnX;
        break;
      case "right":
        x = screenWidth * FLOW_CONFIG.rightColumnX;
        break;
    }

    const y = FLOW_CONFIG.startY + index * FLOW_CONFIG.nodeSpacing;

    return {
      ...node,
      position: { x, y },
    };
  });
};

// Get node anchor point based on position and direction
const getNodeAnchorPoint = (
  node: LearningNode,
  direction: "top" | "bottom" | "left" | "right" | "center"
): { x: number; y: number } => {
  const centerX = node.position.x;
  const centerY = node.position.y;
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
  currentNode: LearningNode,
  nextNode: LearningNode,
  currentIndex: number
): { start: { x: number; y: number }; end: { x: number; y: number } } => {
  const currentPos = getSmartPosition(currentIndex);
  const nextPos = getSmartPosition(currentIndex + 1);

  let startPoint: { x: number; y: number };
  let endPoint: { x: number; y: number };

  if (currentPos === "center" && nextPos === "right") {
    startPoint = getNodeAnchorPoint(currentNode, "right");
    endPoint = getNodeAnchorPoint(nextNode, "top");
  } else if (currentPos === "right" && nextPos === "center") {
    startPoint = getNodeAnchorPoint(currentNode, "bottom");
    endPoint = getNodeAnchorPoint(nextNode, "right");
  } else if (currentPos === "center" && nextPos === "left") {
    startPoint = getNodeAnchorPoint(currentNode, "left");
    endPoint = getNodeAnchorPoint(nextNode, "top");
  } else if (currentPos === "left" && nextPos === "center") {
    startPoint = getNodeAnchorPoint(currentNode, "bottom");
    endPoint = getNodeAnchorPoint(nextNode, "left");
  } else {
    startPoint = getNodeAnchorPoint(currentNode, "bottom");
    endPoint = getNodeAnchorPoint(nextNode, "top");
  }

  return { start: startPoint, end: endPoint };
};

// Create proper L-shaped path with correct orientation based on connection type
const createVerticalFlowPath = (
  startNode: LearningNode,
  endNode: LearningNode,
  nodeIndex: number
): string => {
  const points = getConnectionPoints(startNode, endNode, nodeIndex);
  const start = points.start;
  const end = points.end;

  const currentPos = getSmartPosition(nodeIndex);
  const nextPos = getSmartPosition(nodeIndex + 1);

  let path: string;

  const cornerRadius = 8;

  if (currentPos === "center" && nextPos === "right") {
    const cornerX = end.x - cornerRadius;
    const cornerY = start.y + cornerRadius;
    path = `M ${start.x} ${start.y} L ${cornerX} ${start.y} Q ${end.x} ${start.y} ${end.x} ${cornerY} L ${end.x} ${end.y}`;
  } else if (currentPos === "right" && nextPos === "center") {
    const cornerX = start.x - cornerRadius;
    const cornerY = end.y - cornerRadius;
    path = `M ${start.x} ${start.y} L ${start.x} ${cornerY} Q ${start.x} ${end.y} ${cornerX} ${end.y} L ${end.x} ${end.y}`;
  } else if (currentPos === "center" && nextPos === "left") {
    const cornerX = end.x + cornerRadius;
    const cornerY = start.y + cornerRadius;
    path = `M ${start.x} ${start.y} L ${cornerX} ${start.y} Q ${end.x} ${start.y} ${end.x} ${cornerY} L ${end.x} ${end.y}`;
  } else if (currentPos === "left" && nextPos === "center") {
    const cornerX = start.x + cornerRadius;
    const cornerY = end.y - cornerRadius;
    path = `M ${start.x} ${start.y} L ${start.x} ${cornerY} Q ${start.x} ${end.y} ${cornerX} ${end.y} L ${end.x} ${end.y}`;
  } else if (currentPos === "center" && nextPos === "center") {
    path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  } else {
    if (start.x === end.x) {
      path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    } else if (start.y === end.y) {
      path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    } else {
      if (end.x > start.x) {
        const cornerX = end.x - cornerRadius;
        const cornerY = start.y + cornerRadius;
        path = `M ${start.x} ${start.y} L ${cornerX} ${start.y} Q ${end.x} ${start.y} ${end.x} ${cornerY} L ${end.x} ${end.y}`;
      } else {
        const cornerX = start.x - cornerRadius;
        const cornerY = end.y - cornerRadius;
        path = `M ${start.x} ${start.y} L ${start.x} ${cornerY} Q ${start.x} ${end.y} ${cornerX} ${end.y} L ${end.x} ${end.y}`;
      }
    }
  }

  return path;
};

// Generate all vertical flow paths between consecutive nodes
const generateVerticalFlowPaths = (nodes: LearningNode[]): string[] => {
  if (nodes.length < 2) return [];

  const paths: string[] = [];

  for (let i = 0; i < nodes.length - 1; i++) {
    const currentPath = createVerticalFlowPath(nodes[i], nodes[i + 1], i);
    paths.push(currentPath);
  }

  return paths;
};

// Node component with animations
const LearningNodeComponent: React.FC<{
  node: LearningNode;
  onPress: () => void;
  index: number;
}> = ({ node, onPress, index }) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [pulseAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  React.useEffect(() => {
    if (node.status === "current") {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [node.status, pulseAnim]);

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

  const getNodeIcon = () => {
    switch (node.status) {
      case "completed":
        return "checkmark-circle";
      case "locked":
        return "lock-closed";
      case "current":
        return "play-circle";
      default:
        return node.icon;
    }
  };

  const getNodeColor = (): [ColorValue, ColorValue] => {
    switch (node.status) {
      case "completed":
        return ["#10b981", "#059669"];
      case "current":
        return ["#8b5cf6", "#7c3aed"];
      case "locked":
        return ["#6b7280", "#4b5563"];
      default:
        return node.color as [ColorValue, ColorValue];
    }
  };

  const nodeSize = getNodeSize();
  const isDisabled = node.status === "locked";
  const nodeColor = getNodeColor();

  return (
    <Animated.View
      style={[
        styles.nodeContainer,
        {
          left: node.position.x - nodeSize / 2,
          top: node.position.y - nodeSize / 2,
          transform: [
            { scale: scaleAnim },
            { scale: node.status === "current" ? pulseAnim : 1 },
          ],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={nodeColor}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.nodeGradient,
            {
              width: nodeSize,
              height: nodeSize,
              shadowColor: nodeColor[0],
            },
          ]}
        >
          <Ionicons
            name={getNodeIcon() as any}
            size={nodeSize * 0.4}
            color="white"
          />
        </LinearGradient>

        {/* Node label */}
        <View style={styles.nodeLabelContainer}>
          <Text
            style={[
              styles.nodeTitle,
              {
                color: node.status === "locked" ? "#6b7280" : "#ffffff",
              },
            ]}
            numberOfLines={2}
          >
            {node.title}
          </Text>
          {node.xp > 0 && (
            <Text
              style={[
                styles.nodeXp,
                {
                  color: node.status === "locked" ? "#6b7280" : "#fbbf24",
                },
              ]}
            >
              +{node.xp} XP
            </Text>
          )}
        </View>

        {/* Difficulty indicator */}
        {node.status !== "locked" && (
          <View style={styles.difficultyBadge}>
            <Text
              style={[
                styles.difficultyText,
                {
                  color:
                    node.difficulty === "easy"
                      ? "#10b981"
                      : node.difficulty === "medium"
                      ? "#f59e0b"
                      : "#ef4444",
                },
              ]}
            >
              {node.difficulty === "easy"
                ? "E"
                : node.difficulty === "medium"
                ? "M"
                : "H"}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export const LearningFlowPath: React.FC<LearningFlowPathProps> = ({
  nodes,
  onNodePress,
  userStats,
  courseTitle,
  courseProgress,
  onTitlePress,
}) => {
  const flowNodes = generateVerticalFlowPositions(nodes);
  const verticalPaths = generateVerticalFlowPaths(flowNodes);

  const totalContentHeight =
    flowNodes.length > 0
      ? flowNodes[flowNodes.length - 1].position.y +
        FLOW_CONFIG.nodeSpacing +
        300
      : Dimensions.get("window").height;

  return (
    <View style={styles.container}>
      {/* Header with gamification elements */}
      <LinearGradient
        colors={["#0f0f23", "#1a1a2e"]}
        style={styles.headerGradient}
      >
        {/* User Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            {/* Hearts */}
            <View style={styles.statBadge}>
              <Ionicons name="heart" size={20} color="#ef4444" />
              <Text style={styles.statText}>{userStats.hearts}</Text>
            </View>

            {/* Coins */}
            <View style={[styles.statBadge, styles.coinBadge]}>
              <Ionicons name="diamond" size={20} color="#fbbf24" />
              <Text style={styles.statText}>{userStats.coins}</Text>
            </View>

            {/* Streak */}
            <View style={[styles.statBadge, styles.streakBadge]}>
              <Ionicons name="flame" size={20} color="#f97316" />
              <Text style={styles.statText}>{userStats.streak}</Text>
            </View>
          </View>

          {/* Menu */}
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="menu" size={24} color="#00d4ff" />
          </TouchableOpacity>
        </View>

        {/* Course Title */}
        <View style={styles.courseTitleContainer}>
          <View style={styles.courseTitleContent}>
            <TouchableOpacity
              onPress={onTitlePress}
              disabled={!onTitlePress}
              activeOpacity={onTitlePress ? 0.7 : 1}
            >
              <Text
                style={[
                  styles.courseTitle,
                  {
                    color: onTitlePress ? "#60a5fa" : "#ffffff",
                  },
                ]}
              >
                {courseTitle}
              </Text>
              <Text style={styles.courseProgress}>
                {Math.round(courseProgress)}% Complete
              </Text>
              {onTitlePress && (
                <Text style={styles.courseHint}>Tap to change topic</Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.xpContainer}>
            <Text style={styles.xpValue}>{userStats.totalXp}</Text>
            <Text style={styles.xpLabel}>Total XP</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <LinearGradient
            colors={["#8b5cf6", "#7c3aed"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBarFill, { width: `${courseProgress}%` }]}
          />
        </View>
      </LinearGradient>

      {/* Vertical Flow ScrollView */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContentContainer,
          { minHeight: totalContentHeight },
        ]}
        style={styles.scrollView}
      >
        <View
          style={[
            styles.flowContainer,
            {
              minHeight: totalContentHeight,
              width: screenWidth,
            },
          ]}
        >
          {/* Dotted Grid Background */}
          <View style={styles.gridBackground}>
            {Array.from(
              { length: Math.ceil(totalContentHeight / 40) },
              (_, row) =>
                Array.from(
                  { length: Math.ceil(screenWidth / 40) },
                  (_, col) => (
                    <View
                      key={`dot-${row}-${col}`}
                      style={[
                        styles.gridDot,
                        {
                          left: col * 40,
                          top: row * 40,
                        },
                      ]}
                    />
                  )
                )
            )}
          </View>

          {/* Vertical Flow Paths SVG */}
          <Svg
            height={totalContentHeight}
            width="100%"
            style={styles.svgContainer}
          >
            {verticalPaths.map((path, index) => (
              <Path
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
          </Svg>

          {/* Learning Nodes */}
          {flowNodes.map((node, index) => (
            <LearningNodeComponent
              key={node.id}
              node={node}
              onPress={() => onNodePress(node)}
              index={index}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Info Panel */}
      <View style={styles.bottomPanel}>
        <View style={styles.bottomContent}>
          <View>
            <Text style={styles.nextLabel}>
              Next:{" "}
              {flowNodes.find((n) => n.status === "current")?.title ||
                "Complete the course!"}
            </Text>
            <Text style={styles.completedLabel}>
              {flowNodes.filter((n) => n.status === "completed").length} of{" "}
              {flowNodes.length} completed
            </Text>
          </View>
          <View style={styles.trophyContainer}>
            <Ionicons name="trophy" size={20} color="#fbbf24" />
            <Text style={styles.trophyText}>{Math.round(courseProgress)}%</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 24,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  statBadge: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    flexDirection: "row",
    alignItems: "center",
  },
  coinBadge: {
    backgroundColor: "rgba(251, 191, 36, 0.2)",
  },
  streakBadge: {
    backgroundColor: "rgba(249, 115, 22, 0.2)",
  },
  statText: {
    color: "#ffffff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  menuButton: {
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 9999,
  },
  courseTitleContainer: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  courseTitleContent: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  courseProgress: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 4,
  },
  courseHint: {
    color: "#93c5fd",
    fontSize: 12,
    marginTop: 4,
  },
  xpContainer: {
    alignItems: "flex-end",
  },
  xpValue: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  xpLabel: {
    color: "#9ca3af",
    fontSize: 12,
  },
  progressBarContainer: {
    backgroundColor: "#334155",
    borderRadius: 9999,
    height: 12,
  },
  progressBarFill: {
    borderRadius: 9999,
    height: 12,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  scrollContentContainer: {
    paddingBottom: 100,
  },
  flowContainer: {
    position: "relative",
    backgroundColor: "#0f172a",
  },
  gridBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0f172a",
  },
  gridDot: {
    position: "absolute",
    width: 2,
    height: 2,
    backgroundColor: "#4b5563",
    borderRadius: 1,
  },
  svgContainer: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  nodeContainer: {
    position: "absolute",
  },
  nodeGradient: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nodeLabelContainer: {
    position: "absolute",
    bottom: -32,
    left: "50%",
    transform: [{ translateX: -50 }],
    minWidth: 100,
  },
  nodeTitle: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
  },
  nodeXp: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 4,
  },
  difficultyBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ffffff",
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 20,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(30, 41, 59, 0.95)",
    padding: 16,
  },
  bottomContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nextLabel: {
    color: "#ffffff",
    fontWeight: "600",
  },
  completedLabel: {
    color: "#9ca3af",
    fontSize: 14,
  },
  trophyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  trophyText: {
    color: "#fbbf24",
    fontWeight: "bold",
    marginLeft: 4,
  },
});

export default LearningFlowPath;
