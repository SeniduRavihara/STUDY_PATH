import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Text, TouchableOpacity, View, Dimensions } from "react-native";

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
      style={{ width: cardWidth, marginRight: 12 }}
    >
      <View 
        className="rounded-2xl overflow-hidden shadow-lg"
        style={{ 
          height: cardHeight,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        {isAddStory ? (
          // Add Story Card
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            className="flex-1 items-center justify-center"
          >
            <View className="items-center">
              <View className="w-12 h-12 bg-white rounded-full items-center justify-center mb-2">
                <Ionicons name="add" size={28} color="#667eea" />
              </View>
              <Text className="text-white font-semibold text-sm">Add Story</Text>
            </View>
          </LinearGradient>
        ) : (
          // Regular Story Card
          <View className="flex-1 relative">
            {/* Background Image/Video */}
            {story.mediaUrl && story.mediaType === 'image' ? (
              <Image
                source={{ uri: story.mediaUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={story.gradient || ['#667eea', '#764ba2']}
                className="w-full h-full"
              />
            )}

            {/* Dark Overlay for better text readability */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              className="absolute inset-0"
            />

            {/* Profile Picture Overlay */}
            <View className="absolute top-3 left-3">
              <View className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                {story.userAvatar ? (
                  <Image
                    source={{ uri: story.userAvatar }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full bg-slate-700 items-center justify-center">
                    <Ionicons name="person" size={20} color="#9ca3af" />
                  </View>
                )}
              </View>
            </View>

            {/* Viewed Indicator */}
            {story.isViewed && (
              <View className="absolute top-3 right-3 bg-black bg-opacity-50 rounded-full p-1">
                <Ionicons name="checkmark-done" size={16} color="#9ca3af" />
              </View>
            )}

            {/* Bottom Content */}
            <View className="absolute bottom-0 left-0 right-0 p-3">
              <Text className="text-white font-semibold text-base mb-1" numberOfLines={1}>
                {story.userName}
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-white text-sm opacity-80" numberOfLines={1}>
                  {story.content}
                </Text>
                <View className="flex-row items-center ml-2">
                  <Text className="text-white text-xs opacity-60 mr-2">
                    {formatTimeAgo(story.timestamp)}
                  </Text>
                  {story.viewCount && story.viewCount > 0 && (
                    <View className="flex-row items-center">
                      <Ionicons name="eye" size={12} color="rgba(255,255,255,0.6)" />
                      <Text className="text-white text-xs opacity-60 ml-1">
                        {story.viewCount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Media Type Indicator */}
            {story.mediaType === 'video' && (
              <View className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <View className="w-12 h-12 bg-black bg-opacity-50 rounded-full items-center justify-center">
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

export { StoryCard };
