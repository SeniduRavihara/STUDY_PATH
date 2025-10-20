import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Topic = {
  id: number;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: [string, string];
  type: "lessons" | "quizzes";
  count: number;
  completed: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
};

export default function TopicsScreen() {
  const router = useRouter();
  const { subject } = useLocalSearchParams();
  const parsedSubject = JSON.parse(subject as string);

  const topics: Topic[] = [
    {
      id: 1,
      title: "Learning Path",
      description: "Follow the interactive flow-based learning journey",
      icon: "git-branch",
      color: ["#8b5cf6", "#7c3aed"],
      type: "lessons",
      count: 1,
      completed: 0,
      difficulty: "Beginner",
    },
    {
      id: 2,
      title: "Study Lessons",
      description: "Learn through interactive lessons and examples",
      icon: "book",
      color: ["#667eea", "#764ba2"],
      type: "lessons",
      count: 156,
      completed: 89,
      difficulty: "Beginner",
    },
    {
      id: 3,
      title: "Practice Quizzes",
      description: "Test your knowledge with MCQs and exercises",
      icon: "help-circle",
      color: ["#f093fb", "#f5576c"],
      type: "quizzes",
      count: 45,
      completed: 23,
      difficulty: "Intermediate",
    },
  ];

  const handleTopicPress = (topic: Topic) => {
    if (topic.id === 1) {
      // Navigate to flow-based learning path
      router.push({
        pathname: "/study/flow",
        params: { subject: JSON.stringify(parsedSubject) },
      });
    } else if (topic.type === "lessons") {
      // Navigate to chapters/lessons
      router.push({
        pathname: "/study/subject",
        params: { subject: JSON.stringify(parsedSubject) },
      });
    } else if (topic.type === "quizzes") {
      // Navigate to quiz selection
      router.push({
        pathname: "/study/quizzes",
        params: {
          subject: JSON.stringify(parsedSubject),
          topic: JSON.stringify(topic),
        },
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={parsedSubject.color} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              {parsedSubject.name}
            </Text>
            <Text style={styles.headerSubtitle}>
              Choose your learning path
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${((parsedSubject.completed || 0) / (parsedSubject.chapters || 1)) * 100}%`,
              },
            ]}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {parsedSubject.chapters || 0}
            </Text>
            <Text style={styles.statLabel}>Chapters</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {parsedSubject.completed || 0}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {parsedSubject.xp || 0}
            </Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Topics Selection */}
      <View style={styles.topicsSection}>
        <Text style={styles.sectionTitle}>
          How would you like to learn?
        </Text>

        {topics.map(topic => (
          <TouchableOpacity
            key={topic.id}
            style={styles.topicCardWrapper}
            onPress={() => handleTopicPress(topic)}
          >
            <LinearGradient colors={topic.color} style={styles.topicCard}>
              <View style={styles.topicContent}>
                <View style={styles.topicIcon}>
                  <Ionicons name={topic.icon} size={32} color="white" />
                </View>

                <View style={styles.topicInfo}>
                  <Text style={styles.topicTitle}>
                    {topic.title}
                  </Text>
                  <Text style={styles.topicDescription}>
                    {topic.description}
                  </Text>

                  <View style={styles.topicMetaRow}>
                    <Text style={styles.topicMeta}>
                      {topic.completed}/{topic.count} completed
                    </Text>
                    <View style={styles.difficultyBadge}>
                      <Text style={styles.difficultyText}>
                        {topic.difficulty}
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.topicProgressBg}>
                    <View
                      style={[
                        styles.topicProgress,
                        {
                          width: `${(topic.completed / topic.count) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={24} color="white" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Stats */}
      <View style={styles.summarySection}>
        <LinearGradient
          colors={["#1a1a2e", "#16213e"]}
          style={styles.summaryCard}
        >
          <Text style={styles.summaryTitle}>
            Learning Summary
          </Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryValueBlue}>
                {topics[0].completed}
              </Text>
              <Text style={styles.summaryLabel}>Lessons</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryValueGreen}>
                {topics[1].completed}
              </Text>
              <Text style={styles.summaryLabel}>Quizzes</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryValueYellow}>
                {parsedSubject.xp || 0}
              </Text>
              <Text style={styles.summaryLabel}>XP</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 8,
    borderRadius: 9999,
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "white",
    opacity: 0.8,
  },
  progressBarContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 9999,
    height: 12,
    marginBottom: 16,
  },
  progressBar: {
    backgroundColor: "white",
    borderRadius: 9999,
    height: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    color: "white",
    opacity: 0.8,
    fontSize: 12,
  },
  topicsSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  topicCardWrapper: {
    marginBottom: 24,
  },
  topicCard: {
    padding: 24,
    borderRadius: 24,
  },
  topicContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  topicIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 16,
    borderRadius: 16,
    marginRight: 16,
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  topicDescription: {
    color: "white",
    opacity: 0.9,
    fontSize: 14,
    marginBottom: 12,
  },
  topicMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  topicMeta: {
    color: "white",
    opacity: 0.8,
    fontSize: 14,
  },
  difficultyBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  difficultyText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  topicProgressBg: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 9999,
    height: 8,
  },
  topicProgress: {
    backgroundColor: "white",
    borderRadius: 9999,
    height: 8,
  },
  summarySection: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  summaryCard: {
    padding: 24,
    borderRadius: 24,
  },
  summaryTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryStat: {
    alignItems: "center",
  },
  summaryValueBlue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#60a5fa",
  },
  summaryValueGreen: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4ade80",
  },
  summaryValueYellow: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fbbf24",
  },
  summaryLabel: {
    color: "#9ca3af",
    fontSize: 12,
  },
  bottomSpacer: {
    height: 32,
  },
});