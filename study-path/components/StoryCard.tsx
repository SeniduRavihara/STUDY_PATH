import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Text, TouchableOpacity, View, Dimensions, StyleSheet } from "react-native";

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  mediaUrl?: string;
  mediaType: 'image' | 'video' | 'text';
  timestamp: Date;
  isViewed?: boolean;
  isOwn?: boolean;
  gradient?: [string, string];
  viewCount?: number;
}

interface StoryCardProps {
  story: Story;
  onPress: (story: Story) => void;
  size?: 'small' | 'medium' | 'large';
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.35; // Narrower cards for horizontal scroll
const cardHeight = cardWidth * 1.4; // 4:3 aspect ratio

const StoryCard: React.FC<StoryCardProps> = ({ 
  story, 
  onPress, 
  size = 'medium' 
}) => {
  const isAddStory = story.isOwn;

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(story)}
      activeOpacity={0.9}
      style={[styles.container, { width: cardWidth }]}
    >
      <View style={[styles.card, { height: cardHeight }]}>
        {isAddStory ? (
          // Add Story Card
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.addStoryGradient}
          >
            <View style={styles.addStoryContent}>
              <View style={styles.addIconContainer}>
                <Ionicons name="add" size={28} color="#667eea" />
              </View>
              <Text style={styles.addStoryText}>Add Story</Text>
            </View>
          </LinearGradient>
        ) : (
          // Regular Story Card
          <View style={styles.storyContainer}>
            {/* Background Image/Video */}
            {story.mediaUrl && story.mediaType === 'image' ? (
              <Image
                source={{ uri: story.mediaUrl }}
                style={styles.mediaImage}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={story.gradient || ['#667eea', '#764ba2']}
                style={styles.mediaGradient}
              />
            )}

            {/* Dark Overlay for better text readability */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.overlay}
            />

            {/* Profile Picture Overlay */}
            <View style={styles.profileContainer}>
              <View style={styles.profileImageContainer}>
                {story.userAvatar ? (
                  <Image
                    source={{ uri: story.userAvatar }}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.profilePlaceholder}>
                    <Ionicons name="person" size={20} color="#9ca3af" />
                  </View>
                )}
              </View>
            </View>

            {/* Viewed Indicator */}
            {story.isViewed && (
              <View style={styles.viewedIndicator}>
                <Ionicons name="checkmark-done" size={16} color="#9ca3af" />
              </View>
            )}

            {/* Bottom Content */}
            <View style={styles.bottomContent}>
              <Text style={styles.username} numberOfLines={1}>
                {story.userName}
              </Text>
              <View style={styles.bottomRow}>
                <Text style={styles.content} numberOfLines={1}>
                  {story.content}
                </Text>
                <View style={styles.timeContainer}>
                  <Text style={styles.timestamp}>
                    {formatTimeAgo(story.timestamp)}
                  </Text>
                  {story.viewCount && story.viewCount > 0 && (
                    <View style={styles.viewCountContainer}>
                      <Ionicons name="eye" size={12} color="rgba(255,255,255,0.6)" />
                      <Text style={styles.viewCount}>
                        {story.viewCount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Media Type Indicator */}
            {story.mediaType === 'video' && (
              <View style={styles.playIndicator}>
                <View style={styles.playButton}>
                  <Ionicons name="play" size={24} color="white" />
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

StoryCard.displayName = 'StoryCard';

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
  },
  card: {
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
  addIconContainer: {
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
  storyContainer: {
    flex: 1,
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  mediaGradient: {
    width: '100%',
    height: '100%',
  },
  overlay: {
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
  profileImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  username: {
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
  timeContainer: {
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
  playIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
  },
  playButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export { StoryCard };
