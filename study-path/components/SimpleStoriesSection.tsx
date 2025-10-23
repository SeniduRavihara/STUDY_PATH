import React, { useState, useEffect, useRef } from "react";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Image, Dimensions, Modal, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const cardWidth = screenWidth * 0.35;
const cardHeight = cardWidth * 1.4;

interface Story {
  id: string;
  isOwn?: boolean;
  userName: string;
  userAvatar?: string;
  content?: string;
  mediaUrl?: string;
  timestamp?: string;
  viewCount?: number;
  isViewed?: boolean;
}

const mockStories: Story[] = [
  {
    id: 'add-story',
    isOwn: true,
    userName: 'Your Story',
  },
  {
    id: '1',
    userName: 'Juliette Schmidt',
    userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    content: 'Just aced my calculus exam! 🎉',
    mediaUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop',
    timestamp: '2h',
    viewCount: 24,
  },
  {
    id: '2',
    userName: 'Big Bro',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    content: 'Physics lab breakthrough!',
    mediaUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=600&fit=crop',
    timestamp: '4h',
    viewCount: 18,
  },
  {
    id: '3',
    userName: 'Bhavin Salazar',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    content: 'Chemistry experiment success!',
    mediaUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
    timestamp: '6h',
    viewCount: 32,
    isViewed: true,
  },
  {
    id: '4',
    userName: 'Emma Wilson',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    content: 'Study group session productive!',
    mediaUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=600&fit=crop',
    timestamp: '8h',
    viewCount: 15,
  },
];

const STORY_DURATION = 5000; // 5 seconds per story

const SimpleStoriesSection = () => {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentStoryProgress, setCurrentStoryProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeout = useRef<NodeJS.Timeout | null>(null);

  const storiesWithoutOwn = mockStories.filter(s => !s.isOwn);

  useEffect(() => {
    if (modalVisible && selectedStoryIndex !== null && !isPaused) {
      startProgress();
    } else {
      stopProgress();
    }

    return () => {
      stopProgress();
    };
  }, [modalVisible, selectedStoryIndex, isPaused]);

  const startProgress = () => {
    stopProgress();
    setCurrentStoryProgress(0);
    
    const interval = setInterval(() => {
      setCurrentStoryProgress(prev => {
        if (prev >= 100) {
          goToNextStory();
          return 0;
        }
        return prev + (100 / (STORY_DURATION / 50));
      });
    }, 50);
    
    progressInterval.current = interval;
  };

  const stopProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const goToNextStory = () => {
    if (selectedStoryIndex !== null && selectedStoryIndex < storiesWithoutOwn.length - 1) {
      setSelectedStoryIndex(selectedStoryIndex + 1);
      setCurrentStoryProgress(0);
    } else {
      handleCloseModal();
    }
  };

  const goToPreviousStory = () => {
    if (selectedStoryIndex !== null && selectedStoryIndex > 0) {
      setSelectedStoryIndex(selectedStoryIndex - 1);
      setCurrentStoryProgress(0);
    }
  };

  const handleStoryPress = (story: Story) => {
    if (story.isOwn) {
      console.log('Create story pressed');
    } else {
      const index = storiesWithoutOwn.findIndex(s => s.id === story.id);
      setSelectedStoryIndex(index);
      setModalVisible(true);
      setCurrentStoryProgress(0);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedStoryIndex(null);
    setCurrentStoryProgress(0);
    stopProgress();
  };

  const handleScreenTap = (x: number) => {
    const screenMiddle = screenWidth / 2;
    if (x < screenMiddle) {
      goToPreviousStory();
    } else {
      goToNextStory();
    }
  };

  const handleLongPressIn = () => {
    setIsPaused(true);
    if (pauseTimeout.current) {
      clearTimeout(pauseTimeout.current);
    }
  };

  const handleLongPressOut = () => {
    pauseTimeout.current = setTimeout(() => {
      setIsPaused(false);
    }, 100);
  };

  const onSwipe = ({ nativeEvent }: any) => {
    const { translationX, velocityX } = nativeEvent;
    
    if (Math.abs(velocityX) > 500) {
      if (velocityX > 0) {
        // Swipe right - previous story
        goToPreviousStory();
      } else {
        // Swipe left - next story
        goToNextStory();
      }
    }
  };

  const currentStory = selectedStoryIndex !== null ? storiesWithoutOwn[selectedStoryIndex] : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Stories</Text>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {mockStories.map((story) => (
          <TouchableOpacity
            key={story.id}
            onPress={() => handleStoryPress(story)}
            activeOpacity={0.9}
            style={styles.cardWrapper}
          >
            <View style={styles.card}>
              {story.isOwn ? (
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.addStoryGradient}
                >
                  <View style={styles.addStoryContent}>
                    <View style={styles.addButton}>
                      <Ionicons name="add" size={28} color="#667eea" />
                    </View>
                    <Text style={styles.addStoryText}>Add Story</Text>
                  </View>
                </LinearGradient>
              ) : (
                <View style={styles.storyCard}>
                  <Image
                    source={{ uri: story.mediaUrl }}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.darkOverlay}
                  />
                  <View style={styles.profileContainer}>
                    <View style={[styles.profilePicture, story.isViewed && styles.viewedBorder]}>
                      <Image
                        source={{ uri: story.userAvatar }}
                        style={styles.profileImage}
                        resizeMode="cover"
                      />
                    </View>
                  </View>
                  <View style={styles.bottomContent}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {story.userName}
                    </Text>
                    <View style={styles.bottomRow}>
                      <Text style={styles.content} numberOfLines={1}>
                        {story.content}
                      </Text>
                      <View style={styles.metaContainer}>
                        <Text style={styles.timestamp}>{story.timestamp}</Text>
                        <View style={styles.viewCountContainer}>
                          <Ionicons name="eye" size={12} color="rgba(255,255,255,0.6)" />
                          <Text style={styles.viewCount}>{story.viewCount}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.modalContainer}>
            {/* Progress Bars */}
            <View style={styles.progressContainer}>
              {storiesWithoutOwn.map((_, index) => (
                <View key={index} style={styles.progressBarBg}>
                  <View 
                    style={[
                      styles.progressBar,
                      {
                        width: index < (selectedStoryIndex || 0) 
                          ? '100%' 
                          : index === selectedStoryIndex 
                            ? `${currentStoryProgress}%` 
                            : '0%'
                      }
                    ]} 
                  />
                </View>
              ))}
            </View>

            <PanGestureHandler onGestureEvent={onSwipe} onEnded={onSwipe}>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  activeOpacity={1}
                  onPressIn={handleLongPressIn}
                  onPressOut={handleLongPressOut}
                  onPress={(e) => handleScreenTap(e.nativeEvent.locationX)}
                  style={styles.touchableArea}
                >
                  {currentStory?.mediaUrl ? (
                    <Image
                      source={{ uri: currentStory.mediaUrl }}
                      style={styles.modalImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={styles.modalGradient}
                    >
                      <Text style={styles.modalText}>
                        {currentStory?.content}
                      </Text>
                    </LinearGradient>
                  )}

                  {/* Story Info Overlay */}
                  <View style={styles.infoOverlay}>
                    <View style={styles.infoRow}>
                      <View style={styles.avatarContainer}>
                        {currentStory?.userAvatar ? (
                          <Image
                            source={{ uri: currentStory.userAvatar }}
                            style={styles.avatar}
                            resizeMode="cover"
                          />
                        ) : (
                          <Ionicons name="person" size={20} color="#9ca3af" />
                        )}
                      </View>
                      <View style={styles.userInfo}>
                        <Text style={styles.modalUserName}>
                          {currentStory?.userName}
                        </Text>
                        <Text style={styles.modalTimestamp}>
                          {currentStory?.timestamp}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Pause Indicator */}
                  {isPaused && (
                    <View style={styles.pauseIndicator}>
                      <Ionicons name="pause" size={32} color="white" />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Close Button */}
                <TouchableOpacity
                  onPress={handleCloseModal}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </PanGestureHandler>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
    paddingVertical: 12,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingRight: 48,
  },
  cardWrapper: {
    width: cardWidth,
    marginRight: 12,
  },
  card: {
    height: cardHeight,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addStoryGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addStoryContent: {
    alignItems: 'center',
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  addStoryText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  storyCard: {
    flex: 1,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  profileContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#06b6d4',
  },
  viewedBorder: {
    borderColor: '#4b5563',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  userName: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
    flex: 1,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  timestamp: {
    color: 'white',
    fontSize: 12,
    opacity: 0.6,
    marginRight: 8,
  },
  viewCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCount: {
    color: 'white',
    fontSize: 12,
    opacity: 0.6,
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 48,
    paddingBottom: 8,
    gap: 4,
  },
  progressBarBg: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  modalContent: {
    flex: 1,
  },
  touchableArea: {
    flex: 1,
  },
  modalImage: {
    flex: 1,
  },
  modalGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  infoOverlay: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    flex: 1,
  },
  modalUserName: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  modalTimestamp: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SimpleStoriesSection;