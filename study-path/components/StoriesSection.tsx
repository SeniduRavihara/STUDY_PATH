import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Story, StoryCard } from "./StoryCard";

interface StoriesSectionProps {
  stories: Story[];
  onStoryPress: (story: Story) => void;
  onCreateStory: () => void;
}

const StoriesSection: React.FC<StoriesSectionProps> = ({
  stories,
  onStoryPress,
  onCreateStory,
}) => {
  // Create "Add Story" item
  const addStoryItem: Story = {
    id: 'add-story',
    userId: 'current-user',
    userName: 'Your Story',
    content: 'Add a new story',
    mediaType: 'text',
    timestamp: new Date(),
    isOwn: true,
  };

  // Combine add story with other stories
  const allStories = [addStoryItem, ...stories];

  const handleStoryPress = (story: Story) => {
    if (story.isOwn) {
      onCreateStory();
    } else {
      onStoryPress(story);
    }
  };

  return (
    <View className="bg-slate-900 py-3">
      <View className="px-6 mb-3">
        <Text className="text-white text-lg font-bold">Stories</Text>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingRight: 48 }}
        className="flex-row"
      >
        {allStories.map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            onPress={handleStoryPress}
            size="medium"
          />
        ))}
      </ScrollView>
    </View>
  );
};

StoriesSection.displayName = 'StoriesSection';

export { StoriesSection };
