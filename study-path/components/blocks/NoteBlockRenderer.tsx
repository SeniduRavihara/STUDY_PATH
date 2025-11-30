import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NoteBlockData } from "../../types/contentBlocks";

interface NoteBlockRendererProps {
  data: NoteBlockData;
  onComplete: () => void;
}

export default function NoteBlockRenderer({
  data,
  onComplete,
}: NoteBlockRendererProps) {
  const getStyleByType = () => {
    switch (data.style) {
      case "info":
        return {
          backgroundColor: "#1e3a8a",
          borderColor: "#3b82f6",
          iconColor: "#60a5fa",
          iconName: "information-circle" as keyof typeof Ionicons.glyphMap,
        };
      case "warning":
        return {
          backgroundColor: "#78350f",
          borderColor: "#f59e0b",
          iconColor: "#fbbf24",
          iconName: "warning" as keyof typeof Ionicons.glyphMap,
        };
      case "success":
        return {
          backgroundColor: "#064e3b",
          borderColor: "#10b981",
          iconColor: "#34d399",
          iconName: "checkmark-circle" as keyof typeof Ionicons.glyphMap,
        };
      case "error":
        return {
          backgroundColor: "#7f1d1d",
          borderColor: "#ef4444",
          iconColor: "#f87171",
          iconName: "close-circle" as keyof typeof Ionicons.glyphMap,
        };
      default:
        return {
          backgroundColor: "#1e3a8a",
          borderColor: "#3b82f6",
          iconColor: "#60a5fa",
          iconName: "information-circle" as keyof typeof Ionicons.glyphMap,
        };
    }
  };

  const styleConfig = getStyleByType();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.noteContainer,
          {
            backgroundColor: styleConfig.backgroundColor,
            borderColor: styleConfig.borderColor,
          },
        ]}
      >
        <View style={styles.noteHeader}>
          <Ionicons
            name={styleConfig.iconName}
            size={24}
            color={styleConfig.iconColor}
          />
          {data.title && <Text style={styles.noteTitle}>{data.title}</Text>}
        </View>
        <Text style={styles.noteContent}>{data.content}</Text>
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={onComplete}>
        <Text style={styles.continueButtonText}>Got it!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  noteContainer: {
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  noteTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
  noteContent: {
    color: "#e5e7eb",
    fontSize: 16,
    lineHeight: 24,
  },
  continueButton: {
    backgroundColor: "#10b981",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
