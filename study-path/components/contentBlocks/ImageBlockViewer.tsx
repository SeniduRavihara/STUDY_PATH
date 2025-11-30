import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { ImageBlockData } from "../../types/contentBlocks";

interface ImageBlockViewerProps {
  data: ImageBlockData;
}

const ImageBlockViewer: React.FC<ImageBlockViewerProps> = ({ data }) => {
  return (
    <View style={styles.container}>
      {data.url && (
        <Image
          source={{ uri: data.url }}
          style={styles.image}
          resizeMode="contain"
          accessible={true}
          accessibilityLabel={data.alt || data.caption || "Image"}
        />
      )}
      {data.caption && <Text style={styles.caption}>{data.caption}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    backgroundColor: "#1e293b",
  },
  caption: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default ImageBlockViewer;
