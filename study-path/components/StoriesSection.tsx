import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Stories</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
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
  scrollView: {
    flexDirection: 'row',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingRight: 48,
  },
});

export { StoriesSection };
