import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import { VideoBlockData } from "../../types/contentBlocks";

interface VideoBlockRendererProps {
  data: VideoBlockData;
  onComplete: () => void;
}

export default function VideoBlockRenderer({
  data,
  onComplete,
}: VideoBlockRendererProps) {
  const [watched, setWatched] = useState(false);

  // Extract YouTube video ID from URL
  const getYouTubeEmbedUrl = (url: string) => {
    const videoIdMatch =
      url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/) ||
      url.match(/youtube\.com\/embed\/([^?]+)/);

    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }

    // If already an embed URL, return as is
    if (url.includes("youtube.com/embed/")) {
      return url;
    }

    return url;
  };

  const embedUrl = getYouTubeEmbedUrl(data.url);

  // Mark as watched after some time
  const handleLoadEnd = () => {
    setTimeout(() => {
      setWatched(true);
    }, 3000); // Allow watching for at least 3 seconds
  };

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        {data.title && <Text style={styles.title}>{data.title}</Text>}
        {data.description && (
          <Text style={styles.description}>{data.description}</Text>
        )}

        <View style={styles.videoWrapper}>
          <WebView
            source={{ uri: embedUrl }}
            style={styles.video}
            allowsFullscreenVideo
            onLoadEnd={handleLoadEnd}
            javaScriptEnabled
            domStorageEnabled
          />
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.continueButton,
          !watched && styles.continueButtonDisabled,
        ]}
        onPress={onComplete}
        disabled={!watched}
      >
        <Text style={styles.continueButtonText}>
          {watched ? "Continue" : "Watch the video..."}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  videoContainer: {
    flex: 1,
    marginBottom: 20,
  },
  title: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  description: {
    color: "#9ca3af",
    fontSize: 14,
    marginBottom: 16,
  },
  videoWrapper: {
    flex: 1,
    backgroundColor: "#000000",
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 250,
  },
  video: {
    flex: 1,
  },
  continueButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonDisabled: {
    backgroundColor: "#334155",
    opacity: 0.5,
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
