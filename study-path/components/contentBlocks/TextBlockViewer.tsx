import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { TextBlockData } from "../../types/contentBlocks";

interface TextBlockViewerProps {
  data: TextBlockData;
}

const TextBlockViewer: React.FC<TextBlockViewerProps> = ({ data }) => {
  // Debug logging
  console.log("TextBlockViewer data:", data);
  console.log("TextBlockViewer data.content:", data?.content);

  // Simple text rendering - HTML content will be rendered as plain text for now
  // Can be enhanced with react-native-render-html package later
  const stripHTML = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  };

  const content = data?.content || "";
  const cleanedContent = stripHTML(content);

  console.log("Cleaned content:", cleanedContent);

  return (
    <View style={styles.container}>
      {cleanedContent ? (
        <Text style={styles.text}>{cleanedContent}</Text>
      ) : (
        <Text style={styles.emptyText}>No content available</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  text: {
    color: "#ffffff",
    fontSize: 16,
    lineHeight: 24,
  },
  emptyText: {
    color: "#9ca3af",
    fontStyle: "italic",
  },
});

export default TextBlockViewer;
