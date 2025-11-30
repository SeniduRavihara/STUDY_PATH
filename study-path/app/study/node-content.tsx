import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ContentBlockViewer from "../../components/contentBlocks/ContentBlockViewer";
import { SupabaseService } from "../../superbase/services/supabaseService";
import type { ContentBlock } from "../../types/contentBlocks";

export default function NodeContentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Parse node data from params
  const nodeId = params.nodeId as string;
  const nodeTitle = params.nodeTitle as string;

  const loadNodeContent = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load node with its content blocks from database
      const { data: flowNode, error } = await SupabaseService.getFlowNodeById(
        nodeId
      );

      if (error) {
        console.error("Error loading node content:", error);
        return;
      }

      if (flowNode) {
        console.log("Flow node loaded:", flowNode);
        console.log("Content blocks raw:", flowNode.content_blocks);
        
        // Parse content_blocks from JSON and sort by order
        const blocks = (flowNode.content_blocks || []).sort(
          (a: ContentBlock, b: ContentBlock) => a.order - b.order
        );
        console.log("Parsed blocks:", blocks);
        
        setContentBlocks(Array.isArray(blocks) ? blocks : []);
      }
    } catch (error) {
      console.error("Error in loadNodeContent:", error);
    } finally {
      setIsLoading(false);
    }
  }, [nodeId]);

  useEffect(() => {
    loadNodeContent();
  }, [loadNodeContent]);

  const handleBlockComplete = () => {
    if (currentIndex < contentBlocks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All blocks completed, navigate back or to next step
      router.back();
    }
  };

  const handleMCQAnswer = (blockId: string, isCorrect: boolean) => {
    // Could track MCQ answers here if needed in the future
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading content...</Text>
      </View>
    );
  }

  if (contentBlocks.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={["#1e293b", "#0f172a"]} style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {nodeTitle}
              </Text>
            </View>
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No content blocks available</Text>
        </View>
      </View>
    );
  }

  const currentBlock = contentBlocks[currentIndex];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#1e293b", "#0f172a"]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {nodeTitle}
            </Text>
            {contentBlocks.length > 0 && (
              <Text style={styles.headerSubtitle}>
                {currentIndex + 1} of {contentBlocks.length} Blocks
              </Text>
            )}
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Progress Bar */}
        {contentBlocks.length > 0 && (
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${
                    ((currentIndex + 1) / contentBlocks.length) * 100
                  }%`,
                },
              ]}
            />
          </View>
        )}
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ContentBlockViewer
          block={currentBlock}
          onComplete={handleBlockComplete}
          onMCQAnswer={handleMCQAnswer}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#ffffff",
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 4,
  },
  headerRight: {
    width: 40,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "#334155",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#8b5cf6",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 16,
    textAlign: "center",
  },
});
