import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MemeBlockData } from "../../types/contentBlocks";

interface MemeBlockRendererProps {
  data: MemeBlockData;
  onComplete: () => void;
}

export default function MemeBlockRenderer({
  data,
  onComplete,
}: MemeBlockRendererProps) {
  return (
    <View style={styles.container}>
      <View style={styles.memeContainer}>
        <View style={styles.memeWrapper}>
          {data.topText && (
            <View style={styles.textOverlay}>
              <Text style={styles.memeText}>{data.topText}</Text>
            </View>
          )}

          <Image
            source={{ uri: data.imageUrl }}
            style={styles.memeImage}
            resizeMode="cover"
          />

          {data.bottomText && (
            <View style={[styles.textOverlay, styles.bottomOverlay]}>
              <Text style={styles.memeText}>{data.bottomText}</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={onComplete}>
        <Text style={styles.continueButtonText}>😂 Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  memeContainer: {
    flex: 1,
    justifyContent: "center",
    marginBottom: 20,
  },
  memeWrapper: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1e293b",
  },
  memeImage: {
    width: "100%",
    height: 400,
  },
  textOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 1,
  },
  bottomOverlay: {
    top: undefined,
    bottom: 0,
  },
  memeText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    textTransform: "uppercase",
    textShadowColor: "#000000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  continueButton: {
    backgroundColor: "#f59e0b",
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
