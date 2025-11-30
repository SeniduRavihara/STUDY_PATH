import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ImageBlockData } from "../../types/contentBlocks";

interface ImageBlockRendererProps {
  data: ImageBlockData;
  onComplete: () => void;
}

export default function ImageBlockRenderer({
  data,
  onComplete,
}: ImageBlockRendererProps) {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: data.url }}
          style={styles.image}
          resizeMode="contain"
        />
        {data.caption && <Text style={styles.caption}>{data.caption}</Text>}
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
  imageContainer: {
    flex: 1,
    marginBottom: 20,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    backgroundColor: "#1e293b",
  },
  caption: {
    color: "#9ca3af",
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 20,
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
