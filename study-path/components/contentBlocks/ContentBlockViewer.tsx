import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { ContentBlock } from "../../types/contentBlocks";
import ImageBlockViewer from "./ImageBlockViewer";
import MCQBlockViewer from "./MCQBlockViewer";
import NoteBlockViewer from "./NoteBlockViewer";
import TextBlockViewer from "./TextBlockViewer";
import VideoBlockViewer from "./VideoBlockViewer";

interface ContentBlockViewerProps {
  block: ContentBlock;
  onComplete: () => void;
  onMCQAnswer?: (blockId: string, isCorrect: boolean) => void;
}

const ContentBlockViewer: React.FC<ContentBlockViewerProps> = ({
  block,
  onComplete,
  onMCQAnswer,
}) => {
  const [isCompleted, setIsCompleted] = useState(block.type !== "mcq");

  console.log("ContentBlockViewer block:", block);
  console.log("ContentBlockViewer block.data:", block?.data);

  const handleMCQAnswer = (isCorrect: boolean) => {
    onMCQAnswer?.(block.id, isCorrect);
    setIsCompleted(true);
  };

  const renderBlock = () => {
    switch (block.type) {
      case "text":
        return <TextBlockViewer data={block.data} />;

      case "note":
        return <NoteBlockViewer data={block.data} />;

      case "mcq":
        return <MCQBlockViewer data={block.data} onAnswer={handleMCQAnswer} />;

      case "video":
        return <VideoBlockViewer data={block.data} />;

      case "image":
        return <ImageBlockViewer data={block.data} />;

      case "mcq_pack":
      case "poll":
      case "meme":
      case "code":
        // TODO: Implement these viewers
        return (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>
              {block.type.toUpperCase()} block (Coming soon)
            </Text>
          </View>
        );

      default:
        return (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>
              Unknown block type: {block.type}
            </Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderBlock()}

      {/* Continue Button */}
      <TouchableOpacity
        style={[styles.continueButton, !isCompleted && styles.disabledButton]}
        onPress={isCompleted ? onComplete : undefined}
        disabled={!isCompleted}
      >
        <LinearGradient
          colors={isCompleted ? ["#8b5cf6", "#7c3aed"] : ["#374151", "#4b5563"]}
          style={styles.continueButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  placeholderContainer: {
    backgroundColor: "#1e293b",
    padding: 24,
    borderRadius: 12,
    marginVertical: 8,
    alignItems: "center",
  },
  placeholderText: {
    color: "#9ca3af",
    fontSize: 14,
    fontStyle: "italic",
  },
  continueButton: {
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  disabledButton: {
    opacity: 0.5,
  },
  continueButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
});

export default ContentBlockViewer;
