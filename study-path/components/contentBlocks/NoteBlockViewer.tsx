import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { NoteBlockData } from "../../types/contentBlocks";

interface NoteBlockViewerProps {
  data: NoteBlockData;
}

const NoteBlockViewer: React.FC<NoteBlockViewerProps> = ({ data }) => {
  const getStyleConfig = () => {
    switch (data.style) {
      case "info":
        return {
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderColor: "#3b82f6",
          icon: "information-circle" as const,
          iconColor: "#3b82f6",
        };
      case "warning":
        return {
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          borderColor: "#f59e0b",
          icon: "warning" as const,
          iconColor: "#f59e0b",
        };
      case "success":
        return {
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderColor: "#10b981",
          icon: "checkmark-circle" as const,
          iconColor: "#10b981",
        };
      case "error":
        return {
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          borderColor: "#ef4444",
          icon: "close-circle" as const,
          iconColor: "#ef4444",
        };
      default:
        return {
          backgroundColor: "rgba(156, 163, 175, 0.1)",
          borderColor: "#9ca3af",
          icon: "information-circle" as const,
          iconColor: "#9ca3af",
        };
    }
  };

  const styleConfig = getStyleConfig();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: styleConfig.backgroundColor,
          borderColor: styleConfig.borderColor,
        },
      ]}
    >
      <View style={styles.header}>
        <Ionicons
          name={styleConfig.icon}
          size={20}
          color={styleConfig.iconColor}
        />
        {data.title && (
          <Text style={[styles.title, { color: styleConfig.iconColor }]}>
            {data.title}
          </Text>
        )}
      </View>
      {data.content && <Text style={styles.content}>{data.content}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    color: "#ffffff",
  },
});

export default NoteBlockViewer;
