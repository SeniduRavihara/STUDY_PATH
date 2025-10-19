import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";

interface AIButtonProps {
  onPress: () => void;
  size?: number;
}

export default function AIButton({ onPress, size = 60 }: AIButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const screenHeight = Dimensions.get("window").height;

  // Responsive positioning based on screen height
  const bottomPosition = screenHeight > 800 ? 112 : 96; // 28 * 4 = 112, 24 * 4 = 96

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={[styles.container, { bottom: bottomPosition }]}>
      <Animated.View
        style={{
          transform: [{ scale: pulseAnim }],
        }}
      >
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.8}
          style={[styles.button, { width: size, height: size, borderRadius: size / 2 }]}
        >
          <LinearGradient
            colors={["#667eea", "#764ba2", "#f093fb"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradient, { borderRadius: size / 2 }]}
          >
            {/* AI Brain Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="sparkles" size={size * 0.4} color="white" />

              {/* Animated dots */}
              <View style={styles.dot1}>
                <View style={styles.dot1Inner} />
              </View>
              <View style={styles.dot2}>
                <View style={styles.dot2Inner} />
              </View>
              <View style={styles.dot3}>
                <View style={styles.dot3Inner} />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 24,
    zIndex: 50,
  },
  button: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  gradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    position: "relative",
  },
  dot1: {
    position: "absolute",
    top: -4,
    right: -4,
  },
  dot1Inner: {
    width: 8,
    height: 8,
    backgroundColor: "#fde047",
    borderRadius: 4,
    opacity: 0.8,
  },
  dot2: {
    position: "absolute",
    bottom: -4,
    left: -4,
  },
  dot2Inner: {
    width: 6,
    height: 6,
    backgroundColor: "#7dd3fc",
    borderRadius: 3,
    opacity: 0.8,
  },
  dot3: {
    position: "absolute",
    top: -2,
    left: -4,
  },
  dot3Inner: {
    width: 4,
    height: 4,
    backgroundColor: "#86efac",
    borderRadius: 2,
    opacity: 0.8,
  },
});
