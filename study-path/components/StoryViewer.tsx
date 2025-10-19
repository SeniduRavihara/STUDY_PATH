import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  PanGestureHandler,
  State,
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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
  }, [visible, isPaused, currentIndex]);

  const handleNextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

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
      <View className="flex-1 bg-black">
        {/* Progress Bars */}
        <View className="flex-row px-4 pt-12 pb-2">
          {stories.map((_, index) => (
            <View
              key={index}
              className="flex-1 h-1 bg-white bg-opacity-30 rounded-full mr-1"
            >
              <View
                className="h-1 bg-white rounded-full"
                style={{
                  width: index === currentIndex 
                    ? `${progress}%` 
                    : index < currentIndex 
                      ? '100%' 
                      : '0%'
                }}
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
            style={{
              transform: [{ translateX }],
            }}
            className="flex-1"
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setIsPaused(!isPaused)}
              className="flex-1"
            >
              {currentStory.mediaType === 'image' && currentStory.mediaUrl ? (
                <Image
                  source={{ uri: currentStory.mediaUrl }}
                  className="flex-1"
                  resizeMode="cover"
                />
              ) : (
                <LinearGradient
                  colors={currentStory.gradient || ['#667eea', '#764ba2']}
                  className="flex-1 items-center justify-center"
                >
                  <Text className="text-white text-2xl font-bold text-center px-8">
                    {currentStory.content}
                  </Text>
                </LinearGradient>
              )}

              {/* Story Info Overlay */}
              <View className="absolute top-16 left-4 right-4">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center mr-3">
                    {currentStory.userAvatar ? (
                      <Image
                        source={{ uri: currentStory.userAvatar }}
                        className="w-10 h-10 rounded-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons name="person" size={20} color="#9ca3af" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold">
                      {currentStory.userName}
                    </Text>
                    <Text className="text-white text-sm opacity-80">
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
                className="absolute top-16 right-4 w-10 h-10 rounded-full bg-black bg-opacity-50 items-center justify-center"
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>

              {/* Navigation Areas */}
              <View className="absolute inset-0 flex-row">
                <TouchableOpacity
                  className="flex-1"
                  onPress={handlePreviousStory}
                />
                <TouchableOpacity
                  className="flex-1"
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
