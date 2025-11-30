import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TextBlockData } from "../../types/contentBlocks";

interface TextBlockRendererProps {
  data: TextBlockData;
  onComplete: () => void;
}

export default function TextBlockRenderer({
  data,
  onComplete,
}: TextBlockRendererProps) {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.content}>{data.content}</Text>
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={onComplete}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    flex: 1,
    marginBottom: 20,
  },
  content: {
    color: "#e5e7eb",
    fontSize: 16,
    lineHeight: 24,
  },
  continueButton: {
    backgroundColor: "#3b82f6",
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
