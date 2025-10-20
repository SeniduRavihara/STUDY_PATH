import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Chapter = {
  id: number;
  title: string;
  lessons: number;
  completed: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  points: number;
};

export default function SubjectDetailScreen() {
  const router = useRouter();
  const { subject } = useLocalSearchParams();
  const parsedSubject = JSON.parse(subject as string);

  const chapters: Chapter[] = [
    {
      id: 1,
      title: "Introduction to Calculus",
      lessons: 8,
      completed: 8,
      difficulty: "Beginner",
      duration: "2 hours",
      points: 200,
    },
    {
      id: 2,
      title: "Limits and Continuity",
      lessons: 12,
      completed: 12,
      difficulty: "Beginner",
      duration: "3 hours",
      points: 300,
    },
    {
      id: 3,
      title: "Derivatives",
      lessons: 15,
      completed: 10,
      difficulty: "Intermediate",
      duration: "4 hours",
      points: 400,
    },
    {
      id: 4,
      title: "Applications of Derivatives",
      lessons: 18,
      completed: 5,
      difficulty: "Intermediate",
      duration: "5 hours",
      points: 500,
    },
    {
      id: 5,
      title: "Integration",
      lessons: 20,
      completed: 0,
      difficulty: "Advanced",
      duration: "6 hours",
      points: 600,
    },
  ];

  const getDifficultyColor = (difficulty: Chapter["difficulty"]): string => {
    switch (difficulty) {
      case "Beginner":
        return "#10b981";
      case "Intermediate":
        return "#f59e0b";
      case "Advanced":
        return "#ef4444";
      default:
        return "#6b7280";
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
              {parsedSubject.completed}/{parsedSubject.chapters} chapters
              completed
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${(parsedSubject.completed / parsedSubject.chapters) * 100}%`,
              },
            ]}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {parsedSubject.chapters}
            </Text>
            <Text style={styles.statLabel}>Chapters</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>156</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3.2k</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Chapters List */}
      <View style={styles.chaptersSection}>
        <Text style={styles.sectionTitle}>Chapters</Text>

        {chapters.map((chapter, index) => (
          <TouchableOpacity
            key={chapter.id}
            style={styles.chapterCard}
            onPress={() =>
              router.push({
                pathname: "/study/lesson",
                params: {
                  chapter: JSON.stringify(chapter),
                  subject: JSON.stringify(parsedSubject),
                },
              })
            }
          >
            <View style={styles.chapterContent}>
              <View style={styles.chapterIconContainer}>
                <LinearGradient
                  colors={
                    chapter.completed === chapter.lessons
                      ? ["#10b981", "#059669"]
                      : ["#374151", "#4b5563"]
                  }
                  style={styles.chapterIcon}
                >
                  {chapter.completed === chapter.lessons ? (
                    <Ionicons name="checkmark" size={20} color="white" />
                  ) : (
                    <Text style={styles.chapterNumber}>{index + 1}</Text>
                  )}
                </LinearGradient>
              </View>

              <View style={styles.chapterInfo}>
                <View style={styles.chapterTitleRow}>
                  <Text style={styles.chapterTitle}>
                    {chapter.title}
                  </Text>
                  <View
                    style={[
                      styles.difficultyBadge,
                      {
                        backgroundColor: getDifficultyColor(chapter.difficulty),
                      },
                    ]}
                  >
                    <Text style={styles.difficultyText}>
                      {chapter.difficulty}
                    </Text>
                  </View>
                </View>

                <View style={styles.chapterMetaRow}>
                  <Text style={styles.chapterMeta}>
                    {chapter.completed}/{chapter.lessons} lessons •{" "}
                    {chapter.duration}
                  </Text>
                  <View style={styles.pointsBadge}>
                    <Text style={styles.pointsText}>
                      {chapter.points}pts
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.chapterProgressContainer}>
                  <LinearGradient
                    colors={parsedSubject.color}
                    style={[
                      styles.chapterProgress,
                      {
                        width: `${(chapter.completed / chapter.lessons) * 100}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
  chaptersSection: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  chapterCard: {
    backgroundColor: "#1e293b",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  chapterContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  chapterIconContainer: {
    marginRight: 16,
  },
  chapterIcon: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  chapterNumber: {
    color: "white",
    fontWeight: "bold",
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  chapterTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  difficultyText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  chapterMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  chapterMeta: {
    color: "#9ca3af",
    fontSize: 14,
  },
  pointsBadge: {
    backgroundColor: "#eab308",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  pointsText: {
    color: "black",
    fontSize: 10,
    fontWeight: "bold",
  },
  chapterProgressContainer: {
    backgroundColor: "#334155",
    borderRadius: 9999,
    height: 8,
  },
  chapterProgress: {
    borderRadius: 9999,
    height: 8,
  },
  bottomSpacer: {
    height: 32,
  },
});