import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import React, { useCallback, useEffect, useState } from "react";
import {
Animated,
Dimensions,
Image,
Modal,
StyleSheet,
Text,
TouchableOpacity,
View,
} from "react-native";
import { Story } from "./StoryCard";

interface StoryViewerProps {
  visible: boolean;
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
  onStoryComplete: (storyId: string) => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  visible,
  stories,
  initialIndex,
  onClose,
  onStoryComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const translateX = new Animated.Value(0);

  const currentStory = stories[currentIndex];

  const handleNextStory = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  useEffect(() => {
    if (!visible) return;

    const timer = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNextStory();
            return 0;
          }
          return prev + 2; // 5 seconds total (100/2 = 50 intervals of 100ms)
        });
      }
    }, 100);

    return () => clearInterval(timer);
  }, [visible, isPaused, currentIndex, handleNextStory]);

  const handlePreviousStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;
      
      if (translationX > 100 || velocityX > 500) {
        handlePreviousStory();
      } else if (translationX < -100 || velocityX < -500) {
        handleNextStory();
      }
      
      translateX.setValue(0);
    }
  };

  if (!visible || !currentStory) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Progress Bars */}
        <View style={styles.progressContainer}>
          {stories.map((_, index) => (
            <View
              key={index}
              style={styles.progressBarBg}
            >
              <View
                style={[
                  styles.progressBar,
                  {
                    width: index === currentIndex 
                      ? `${progress}%` 
                      : index < currentIndex 
                        ? '100%' 
                        : '0%'
                  }
                ]}
              />
            </View>
          ))}
        </View>

        {/* Story Content */}
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View
            style={[
              styles.contentContainer,
              {
                transform: [{ translateX }],
              }
            ]}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setIsPaused(!isPaused)}
              style={styles.touchableContent}
            >
              {currentStory.mediaType === 'image' && currentStory.mediaUrl ? (
                <Image
                  source={{ uri: currentStory.mediaUrl }}
                  style={styles.storyImage}
                  resizeMode="cover"
                />
              ) : (
                <LinearGradient
                  colors={currentStory.gradient || ['#667eea', '#764ba2']}
                  style={styles.gradientContent}
                >
                  <Text style={styles.storyText}>
                    {currentStory.content}
                  </Text>
                </LinearGradient>
              )}

              {/* Story Info Overlay */}
              <View style={styles.infoOverlay}>
                <View style={styles.userInfo}>
                  <View style={styles.avatarContainer}>
                    {currentStory.userAvatar ? (
                      <Image
                        source={{ uri: currentStory.userAvatar }}
                        style={styles.avatar}
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons name="person" size={20} color="#9ca3af" />
                    )}
                  </View>
                  <View style={styles.userTextContainer}>
                    <Text style={styles.userName}>
                      {currentStory.userName}
                    </Text>
                    <Text style={styles.timestamp}>
                      {currentStory.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Close Button */}
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>

              {/* Navigation Areas */}
              <View style={styles.navigationContainer}>
                <TouchableOpacity
                  style={styles.navigationArea}
                  onPress={handlePreviousStory}
                />
                <TouchableOpacity
                  style={styles.navigationArea}
                  onPress={handleNextStory}
                />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </PanGestureHandler>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  progressContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 9999,
    marginRight: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: "white",
    borderRadius: 9999,
  },
  contentContainer: {
    flex: 1,
  },
  touchableContent: {
    flex: 1,
  },
  storyImage: {
    flex: 1,
  },
  gradientContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  storyText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  infoOverlay: {
    position: "absolute",
    top: 64,
    left: 16,
    right: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userTextContainer: {
    flex: 1,
  },
  userName: {
    color: "white",
    fontWeight: "600",
  },
  timestamp: {
    color: "white",
    fontSize: 14,
    opacity: 0.8,
  },
  closeButton: {
    position: "absolute",
    top: 64,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  navigationContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
  },
  navigationArea: {
    flex: 1,
  },
});