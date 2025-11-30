import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { VideoBlockData } from "../../types/contentBlocks";

interface VideoBlockViewerProps {
  data: VideoBlockData;
}

const VideoBlockViewer: React.FC<VideoBlockViewerProps> = ({ data }) => {
  const handleOpenVideo = async () => {
    if (data.url) {
      await Linking.openURL(data.url);
    }
  };

  return (
    <View style={styles.container}>
      {data.title && <Text style={styles.title}>{data.title}</Text>}

      {data.url && (
        <TouchableOpacity
          style={styles.videoPlaceholder}
          onPress={handleOpenVideo}
        >
          <Ionicons name="play-circle" size={64} color="#ef4444" />
          <Text style={styles.playText}>Tap to watch video</Text>
        </TouchableOpacity>
      )}

      {data.description && (
        <Text style={styles.description}>{data.description}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 12,
  },
  videoPlaceholder: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000000",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  playText: {
    color: "#ffffff",
    marginTop: 12,
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 12,
    lineHeight: 20,
  },
});

export default VideoBlockViewer;
