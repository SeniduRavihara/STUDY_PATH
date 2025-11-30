import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CodeBlockData,
  ContentBlock,
  ImageBlockData,
  isCodeBlock,
  isImageBlock,
  isMCQBlock,
  isMCQPackBlock,
  isMemeBlock,
  isNoteBlock,
  isPollBlock,
  isTextBlock,
  isVideoBlock,
  MCQBlockData,
  MCQPackBlockData,
  MemeBlockData,
  NoteBlockData,
  PollBlockData,
  TextBlockData,
  VideoBlockData,
} from "../types/contentBlocks";
import CodeBlockRenderer from "./blocks/CodeBlockRenderer";
import ImageBlockRenderer from "./blocks/ImageBlockRenderer";
import MCQBlockRenderer from "./blocks/MCQBlockRenderer";
import MCQPackBlockRenderer from "./blocks/MCQPackBlockRenderer";
import MemeBlockRenderer from "./blocks/MemeBlockRenderer";
import NoteBlockRenderer from "./blocks/NoteBlockRenderer";
import PollBlockRenderer from "./blocks/PollBlockRenderer";
import TextBlockRenderer from "./blocks/TextBlockRenderer";
import VideoBlockRenderer from "./blocks/VideoBlockRenderer";

interface NodeJourneyViewerProps {
  nodeId: string;
  nodeTitle: string;
  contentBlocks: ContentBlock[];
  xpReward: number;
  onComplete: (completionData: {
    nodeId: string;
    timeSpent: number;
    blocksCompleted: number;
  }) => void;
  onExit: () => void;
}

export default function NodeJourneyViewer({
  nodeId,
  nodeTitle,
  contentBlocks,
  xpReward,
  onComplete,
  onExit,
}: NodeJourneyViewerProps) {
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [startTime] = useState(Date.now());
  const [showCompletion, setShowCompletion] = useState(false);

  const totalBlocks = contentBlocks.length;
  const progress =
    totalBlocks > 0 ? (currentBlockIndex / totalBlocks) * 100 : 0;
  const currentBlock = contentBlocks[currentBlockIndex];

  const handleBlockComplete = () => {
    // Move to next block or show completion
    if (currentBlockIndex < totalBlocks - 1) {
      setCurrentBlockIndex((prev) => prev + 1);
    } else {
      // All blocks completed!
      const timeSpent = Math.floor((Date.now() - startTime) / 1000); // seconds
      setShowCompletion(true);

      // Notify parent after a short delay to show completion screen
      setTimeout(() => {
        onComplete({
          nodeId,
          timeSpent,
          blocksCompleted: totalBlocks,
        });
      }, 3000);
    }
  };

  const renderBlock = (block: ContentBlock) => {
    if (isTextBlock(block)) {
      return (
        <TextBlockRenderer
          data={block.data as TextBlockData}
          onComplete={handleBlockComplete}
        />
      );
    } else if (isNoteBlock(block)) {
      return (
        <NoteBlockRenderer
          data={block.data as NoteBlockData}
          onComplete={handleBlockComplete}
        />
      );
    } else if (isMCQBlock(block)) {
      return (
        <MCQBlockRenderer
          data={block.data as MCQBlockData}
          onComplete={handleBlockComplete}
        />
      );
    } else if (isMCQPackBlock(block)) {
      return (
        <MCQPackBlockRenderer
          data={block.data as MCQPackBlockData}
          onComplete={handleBlockComplete}
        />
      );
    } else if (isVideoBlock(block)) {
      return (
        <VideoBlockRenderer
          data={block.data as VideoBlockData}
          onComplete={handleBlockComplete}
        />
      );
    } else if (isImageBlock(block)) {
      return (
        <ImageBlockRenderer
          data={block.data as ImageBlockData}
          onComplete={handleBlockComplete}
        />
      );
    } else if (isPollBlock(block)) {
      return (
        <PollBlockRenderer
          data={block.data as PollBlockData}
          onComplete={handleBlockComplete}
        />
      );
    } else if (isMemeBlock(block)) {
      return (
        <MemeBlockRenderer
          data={block.data as MemeBlockData}
          onComplete={handleBlockComplete}
        />
      );
    } else if (isCodeBlock(block)) {
      return (
        <CodeBlockRenderer
          data={block.data as CodeBlockData}
          onComplete={handleBlockComplete}
        />
      );
    } else {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unknown block type: {block.type}</Text>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleBlockComplete}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  if (showCompletion) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#0f172a", "#1e293b"]}
          style={styles.completionContainer}
        >
          <View style={styles.completionContent}>
            <Ionicons name="trophy" size={80} color="#fbbf24" />
            <Text style={styles.completionTitle}>Journey Complete! 🎉</Text>
            <Text style={styles.completionSubtitle}>
              You&apos;ve mastered {nodeTitle}
            </Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                <Text style={styles.statValue}>{totalBlocks}</Text>
                <Text style={styles.statLabel}>Blocks Completed</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Ionicons name="star" size={32} color="#fbbf24" />
                <Text style={styles.statValue}>+{xpReward}</Text>
                <Text style={styles.statLabel}>XP Earned</Text>
              </View>
            </View>

            <ActivityIndicator
              size="large"
              color="#3b82f6"
              style={styles.loader}
            />
            <Text style={styles.loadingText}>Saving your progress...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (totalBlocks === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle" size={64} color="#f59e0b" />
          <Text style={styles.emptyTitle}>No Content Available</Text>
          <Text style={styles.emptyText}>
            This node doesn&apos;t have any content blocks yet.
          </Text>
          <TouchableOpacity style={styles.exitButton} onPress={onExit}>
            <Text style={styles.exitButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with progress */}
      <LinearGradient colors={["#1e293b", "#0f172a"]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.exitIconButton} onPress={onExit}>
            <Ionicons name="close" size={24} color="#9ca3af" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.nodeTitle} numberOfLines={1}>
              {nodeTitle}
            </Text>
            <Text style={styles.blockCounter}>
              Step {currentBlockIndex + 1} of {totalBlocks}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <Ionicons name="star" size={20} color="#fbbf24" />
            <Text style={styles.xpText}>{xpReward} XP</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
      </LinearGradient>

      {/* Block content */}
      <ScrollView
        style={styles.contentArea}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderBlock(currentBlock)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  exitIconButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 16,
  },
  nodeTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  blockCounter: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  xpText: {
    color: "#fbbf24",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 4,
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#334155",
    borderRadius: 3,
    overflow: "hidden",
    marginRight: 12,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#10b981",
    borderRadius: 3,
  },
  progressText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "600",
    minWidth: 45,
    textAlign: "right",
  },
  contentArea: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  skipButton: {
    backgroundColor: "#334155",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  skipButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
  completionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  completionContent: {
    alignItems: "center",
  },
  completionTitle: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "700",
    marginTop: 24,
    textAlign: "center",
  },
  completionSubtitle: {
    color: "#9ca3af",
    fontSize: 18,
    marginTop: 8,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: 48,
    marginBottom: 48,
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#334155",
  },
  statValue: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "700",
    marginTop: 8,
  },
  statLabel: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 4,
  },
  loader: {
    marginTop: 24,
  },
  loadingText: {
    color: "#9ca3af",
    fontSize: 16,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 24,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 24,
  },
  exitButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 32,
  },
  exitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
