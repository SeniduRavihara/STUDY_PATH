import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomModal from "../../../components/CustomModal";
import {
  LearningFlowPath,
  LearningNode,
} from "../../../components/LearningFlowPath";
import { useAuth } from "../../../contexts/AuthContext";
import { SupabaseService } from "../../../superbase/services/supabaseService";

// Topics are now loaded from database - no more hardcoded mock data

export default function FlowStudyScreen() {
  const router = useRouter();
  const { subject } = useLocalSearchParams();
  const parsedSubject = subject ? JSON.parse(subject as string) : null;
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState<LearningNode | null>(null);
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [currentTopicId, setCurrentTopicId] = useState<string | null>(null);

  // Learning nodes - loaded from database
  const [learningNodes, setLearningNodes] = useState<LearningNode[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  // Load topics from database (like web app does)
  useEffect(() => {
    const loadTopics = async () => {
      if (!parsedSubject?.id || !user?.id) return;

      try {
        // Get topics for this subject from database
        const { data: topics, error } =
          await SupabaseService.getTopicsBySubject(parsedSubject.id);

        if (error) {
          console.error("Error loading topics:", error);
          return;
        }

        console.log("Loaded topics from database:", topics);

        // Store topics in state for use in UI
        setTopics(topics);

        if (topics && topics.length > 0) {
          // Find the first leaf topic (topic without children) for flow assignment
          const findFirstLeafTopic = (topicList: any[]): any => {
            for (const topic of topicList) {
              if (!topic.children || topic.children.length === 0) {
                return topic;
              }
              const leafTopic = findFirstLeafTopic(topic.children);
              if (leafTopic) return leafTopic;
            }
            return null;
          };

          const firstLeafTopic = findFirstLeafTopic(topics);
          if (firstLeafTopic) {
            console.log("Using first leaf topic:", firstLeafTopic);
            setCurrentTopicId(firstLeafTopic.id);
          } else {
            console.log(
              "No leaf topics found for subject:",
              parsedSubject.name
            );
          }
        } else {
          console.log("No topics found for subject:", parsedSubject.name);
        }
      } catch (error) {
        console.error("Error loading topics:", error);
      }
    };

    loadTopics();
  }, [parsedSubject?.id, parsedSubject?.name, user?.id]);

  // Load flow from database
  const loadFlow = useCallback(async (flowId: string) => {
    try {
      const { data: flowWithNodes, error } =
        await SupabaseService.loadFlowWithNodes(flowId);

      if (error) {
        console.error("Error loading flow:", error);
        return;
      }

      if (flowWithNodes && flowWithNodes.nodes) {
        // Convert database nodes back to LearningNode format
        const convertedNodes: LearningNode[] = flowWithNodes.nodes.map(
          (node: any) => ({
            id: node.id,
            title: node.title,
            type:
              node.node_type === "start"
                ? "lesson"
                : node.node_type === "end"
                ? "milestone"
                : node.node_type === "quiz"
                ? "quiz"
                : node.node_type === "practice"
                ? "practice"
                : node.node_type === "assignment"
                ? "project"
                : "lesson",
            status: node.status,
            difficulty: node.difficulty,
            xp: node.xp_reward,
            position: { x: 0, y: 0 }, // Will be calculated by grid system
            icon: getNodeIcon(node.node_type),
            color: getNodeColor(node.node_type),
            description: node.description,
            estimatedTime: `${node.estimated_time} min`,
            is_practice_node: node.is_practice_node || false,
            optional_position: node.optional_position || undefined,
            config: node.config, // Preserve the config including quiz_pack_id
          })
        );

        setLearningNodes(convertedNodes);
        setCurrentFlowId(flowId);
      }
    } catch (error) {
      console.error("Error loading flow:", error);
    }
  }, []);

  // Load existing flow when topic is selected
  useEffect(() => {
    const loadExistingFlow = async () => {
      if (!currentTopicId || !user?.id) return;

      setIsLoading(true);
      try {
        // Get flows for this topic
        const { data: flows, error } = await SupabaseService.getFlowsByTopic(
          currentTopicId
        );

        if (error) {
          console.error("Error loading flows:", error);
          return;
        }

        if (flows && flows.length > 0) {
          // Load the first flow
          const flow = flows[0];
          await loadFlow(flow.id);
        } else {
          // No flow exists for this topic, start fresh
          setLearningNodes([]);
          setCurrentFlowId(null);
        }
      } catch (error) {
        console.error("Error loading existing flow:", error);
        // On error, start fresh
        setLearningNodes([]);
        setCurrentFlowId(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingFlow();
  }, [currentTopicId, user?.id, loadFlow]);

  // Helper functions for node conversion
  const getNodeIcon = (nodeType: string): keyof typeof Ionicons.glyphMap => {
    switch (nodeType) {
      case "start":
        return "play-circle";
      case "study":
        return "book";
      case "quiz":
        return "help-circle";
      case "video":
        return "videocam";
      case "assignment":
        return "document-text";
      case "assessment":
        return "checkmark-circle";
      case "end":
        return "trophy";
      default:
        return "book";
    }
  };

  const getNodeColor = (nodeType: string): [string, string] => {
    switch (nodeType) {
      case "start":
        return ["#10b981", "#059669"];
      case "study":
        return ["#3b82f6", "#1d4ed8"];
      case "quiz":
        return ["#f59e0b", "#d97706"];
      case "video":
        return ["#8b5cf6", "#7c3aed"];
      case "assignment":
        return ["#6366f1", "#4f46e5"];
      case "assessment":
        return ["#ef4444", "#dc2626"];
      case "practice":
        return ["#8b5cf6", "#7c3aed"];
      case "end":
        return ["#fbbf24", "#f59e0b"];
      default:
        return ["#6b7280", "#4b5563"];
    }
  };

  // Mock user stats based on subject data
  const userStats = {
    hearts: 5,
    coins: 200,
    streak: parsedSubject?.streak || 7,
    totalXp: parsedSubject?.xp || 1250,
  };

  // Simulate loading content
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // Simulate loading time

    return () => clearTimeout(timer);
  }, []);

  // Calculate course progress
  const completedNodes = learningNodes.filter(
    (node) => node.status === "completed"
  ).length;
  const totalNodes = learningNodes.length;
  const courseProgress = (completedNodes / totalNodes) * 100;

  // Topic selection functions
  const handleTopicChange = (topicId: string) => {
    setCurrentTopicId(topicId);
    setShowTopicSelector(false);
  };

  // Toggle topic expansion
  const toggleTopicExpansion = (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  // Render table of contents style
  const renderTopicItem = (topic: any, level: number = 0) => {
    const hasChildren = topic.children && topic.children.length > 0;
    const isLeafTopic = !hasChildren;
    const isExpanded = expandedTopics.has(topic.id);
    const isSelected = currentTopicId === topic.id;
    const indentLevel = level * 16;

    return (
      <View key={topic.id}>
        {/* Topic Item */}
        <TouchableOpacity
          onPress={() => {
            if (hasChildren) {
              toggleTopicExpansion(topic.id);
            } else if (isLeafTopic) {
              handleTopicChange(topic.id);
            }
          }}
          style={[
            styles.topicItem,
            isSelected && styles.topicItemSelected,
            { paddingLeft: indentLevel + 16 },
          ]}
        >
          <View style={styles.topicItemContent}>
            {/* Expand/Collapse Button */}
            {hasChildren && (
              <TouchableOpacity
                onPress={() => toggleTopicExpansion(topic.id)}
                style={styles.expandButton}
              >
                <Ionicons
                  name={isExpanded ? "chevron-down" : "chevron-forward"}
                  size={12}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            )}

            {/* Topic Content with dot leaders */}
            <View style={styles.topicContentRow}>
              <Text
                style={[
                  styles.topicName,
                  isSelected && styles.topicNameSelected,
                ]}
              >
                {topic.name}
              </Text>

              {/* Dot leaders */}
              <View style={styles.dotLeaders}>
                <View style={styles.dotLeadersLine} />
              </View>

              {/* Status indicator */}
              <View
                style={[
                  styles.statusIndicator,
                  topic.hasFlow
                    ? styles.statusIndicatorGreen
                    : isLeafTopic
                    ? styles.statusIndicatorBlue
                    : styles.statusIndicatorGray,
                ]}
              />
            </View>

            {/* Selection Indicator */}
            {isSelected && (
              <Ionicons
                name="checkmark"
                size={16}
                color="#60a5fa"
                style={styles.checkmark}
              />
            )}
          </View>
        </TouchableOpacity>

        {/* Children */}
        {isExpanded && hasChildren && (
          <View>
            {topic.children.map((child: any) =>
              renderTopicItem(child, level + 1)
            )}
          </View>
        )}
      </View>
    );
  };

  const getCurrentTopic = () => {
    if (!currentTopicId) {
      return {
        id: null,
        name: "No Topic Selected",
        description: "Please select a topic",
      };
    }

    // Find topic in the hierarchical structure from database
    const findTopicInHierarchy = (topics: any[], topicId: string): any => {
      for (const topic of topics) {
        if (topic.id === topicId) return topic;
        if (topic.children && topic.children.length > 0) {
          const found = findTopicInHierarchy(topic.children, topicId);
          if (found) return found;
        }
      }
      return null;
    };

    // For now, return a basic topic object if not found
    return (
      findTopicInHierarchy(topics, currentTopicId!) || {
        id: currentTopicId,
        name: "Unknown Topic",
        description: "Topic not found",
      }
    );
  };

  const handleNodePress = (node: LearningNode) => {
    if (node.status === "locked") {
      setSelectedNode({
        ...node,
        description: "Complete the previous lessons to unlock this content.",
      });
      setModalVisible(true);
      return;
    }

    setSelectedNode(node);
    setModalVisible(true);
  };

  const handleModalConfirm = () => {
    if (!selectedNode) return;

    // Navigate to node content screen for all node types
    // The content screen will display the content blocks
    router.push({
      pathname: "/study/node-content",
      params: {
        nodeId: selectedNode.id,
        nodeTitle: selectedNode.title,
        flowId: currentFlowId || "",
        nodeType: selectedNode.type,
      },
    });

    setModalVisible(false);
  };

  if (!parsedSubject) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No subject selected</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#00d4ff" />
          <Text style={styles.loadingTitle}>Loading Learning Path...</Text>
          <Text style={styles.loadingSubtitle}>
            Preparing your personalized study flow
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <LearningFlowPath
        nodes={learningNodes}
        onNodePress={handleNodePress}
        userStats={userStats}
        courseTitle={getCurrentTopic().name}
        courseProgress={courseProgress}
        onTitlePress={() => setShowTopicSelector(true)}
      />

      {selectedNode && (
        <CustomModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title={selectedNode.title}
          description={selectedNode.description || "No description available"}
          estimatedTime={selectedNode.estimatedTime}
          type={selectedNode.type}
          onConfirm={handleModalConfirm}
          confirmText={
            selectedNode.status === "locked"
              ? "OK"
              : selectedNode.type === "milestone"
              ? "Awesome!"
              : "Start"
          }
          cancelText="Cancel"
          showCancel={
            selectedNode.status !== "locked" &&
            selectedNode.type !== "milestone"
          }
        />
      )}

      {/* Topic Selector Modal */}
      <Modal
        visible={showTopicSelector}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTopicSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Topic</Text>
                <Text style={styles.modalSubtitle}>
                  Choose a topic to load its learning flow
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowTopicSelector(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.topicsScrollView}
            >
              {topics.length > 0 ? (
                <View style={styles.topicsList}>
                  {/* Hierarchical Topics */}
                  {topics.map((topic) => renderTopicItem(topic, 0))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateTitle}>
                    No Topics Available
                  </Text>
                  <Text style={styles.emptyStateText}>
                    This subject doesn&apos;t have any topics yet.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#ffffff",
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingTitle: {
    color: "#ffffff",
    fontSize: 18,
    marginTop: 16,
    fontWeight: "500",
  },
  loadingSubtitle: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContainer: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 448,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
  },
  modalSubtitle: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
  },
  topicsScrollView: {
    maxHeight: 384,
  },
  topicsList: {
    paddingVertical: 8,
  },
  topicItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  topicItemSelected: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
  },
  topicItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  expandButton: {
    marginRight: 8,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  topicContentRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  topicName: {
    fontSize: 14,
    color: "#ffffff",
  },
  topicNameSelected: {
    color: "#60a5fa",
    fontWeight: "600",
  },
  dotLeaders: {
    flex: 1,
    marginHorizontal: 8,
  },
  dotLeadersLine: {
    height: 1,
    backgroundColor: "#6b7280",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusIndicatorGreen: {
    backgroundColor: "#10b981",
  },
  statusIndicatorBlue: {
    backgroundColor: "#3b82f6",
  },
  statusIndicatorGray: {
    backgroundColor: "#6b7280",
  },
  checkmark: {
    marginLeft: 8,
  },
  emptyState: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#334155",
    marginHorizontal: 8,
  },
  emptyStateTitle: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 18,
  },
  emptyStateText: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 4,
  },
});

// Grid system handles positioning automatically
