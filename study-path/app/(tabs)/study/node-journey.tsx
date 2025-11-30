import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import NodeJourneyViewer from "../../../components/NodeJourneyViewer";
import { useAuth } from "../../../contexts/AuthContext";
import { SupabaseService } from "../../../superbase/services/supabaseService";
import { ContentBlock } from "../../../types/contentBlocks";

export default function NodeJourneyScreen() {
  const router = useRouter();
  const { nodeId, nodeTitle } = useLocalSearchParams();
  const { user } = useAuth();

  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [xpReward, setXpReward] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadNodeContent = useCallback(async () => {
    if (!nodeId) {
      Alert.alert("Error", "Node ID is missing");
      router.back();
      return;
    }

    try {
      const { data: node, error } = await SupabaseService.getNodeWithContent(
        nodeId as string
      );

      if (error) {
        console.error("Error loading node content:", error);
        Alert.alert("Error", "Failed to load node content");
        router.back();
        return;
      }

      if (node) {
        setContentBlocks(node.content_blocks || []);
        setXpReward(node.xp_reward || 0);
      }
    } catch (error) {
      console.error("Error loading node:", error);
      Alert.alert("Error", "Failed to load node");
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [nodeId, router]);

  useEffect(() => {
    loadNodeContent();
  }, [loadNodeContent]);

  const handleComplete = async (completionData: {
    nodeId: string;
    timeSpent: number;
    blocksCompleted: number;
  }) => {
    if (!user) return;

    try {
      // Update node status to completed
      await SupabaseService.updateNodeProgress(
        user.id,
        completionData.nodeId,
        "completed",
        {
          timeSpent: completionData.timeSpent,
          blocksCompleted: completionData.blocksCompleted,
          completedAt: new Date().toISOString(),
        }
      );

      // Award XP to user
      await SupabaseService.awardXP(user.id, xpReward);

      // Navigate back to flow
      router.back();
    } catch (error) {
      console.error("Error completing node:", error);
      Alert.alert("Error", "Failed to save progress");
      router.back();
    }
  };

  const handleExit = () => {
    Alert.alert(
      "Exit Journey",
      "Are you sure you want to exit? Your progress won't be saved.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Exit",
          onPress: () => router.back(),
          style: "destructive",
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <NodeJourneyViewer
      nodeId={nodeId as string}
      nodeTitle={nodeTitle as string}
      contentBlocks={contentBlocks}
      xpReward={xpReward}
      onComplete={handleComplete}
      onExit={handleExit}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
});
