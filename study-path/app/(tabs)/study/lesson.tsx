import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Lesson = {
  id: number;
  title: string;
  duration: string;
  type: "video" | "reading" | "quiz";
  completed: boolean;
  points: number;
};

export default function LessonScreen() {
  const router = useRouter();
  const { chapter, subject } = useLocalSearchParams();
  const parsedChapter = JSON.parse(chapter as string);
  const parsedSubject = JSON.parse(subject as string);
  const [, setSelectedLesson] = useState<Lesson | null>(null);

  const lessons: Lesson[] = [
    {
      id: 1,
      title: "What is Calculus?",
      duration: "15 min",
      type: "video",
      completed: true,
      points: 25,
    },
    {
      id: 2,
      title: "Historical Background",
      duration: "10 min",
      type: "reading",
      completed: true,
      points: 20,
    },
    {
      id: 3,
      title: "Basic Concepts",
      duration: "20 min",
      type: "video",
      completed: true,
      points: 30,
    },
    {
      id: 4,
      title: "Practice Problems",
      duration: "25 min",
      type: "quiz",
      completed: false,
      points: 50,
    },
    {
      id: 5,
      title: "Real-world Applications",
      duration: "18 min",
      type: "video",
      completed: false,
      points: 35,
    },
  ];

  const getTypeIcon = (
    type: Lesson["type"],
  ): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case "video":
        return "play-circle";
      case "reading":
        return "book";
      case "quiz":
        return "help-circle";
      default:
        return "document";
    }
  };
  const getTypeColor = (type: Lesson["type"]): string => {
    switch (type) {
      case "video":
        return "#ef4444";
      case "reading":
        return "#3b82f6";
      case "quiz":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={parsedSubject.color} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.subjectName}>
              {parsedSubject.name}
            </Text>
            <Text style={styles.chapterTitle}>
              {parsedChapter.title}
            </Text>
          </View>
        </View>

        {/* Chapter Progress */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${(parsedChapter.completed / parsedChapter.lessons) * 100}%`,
              }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {parsedChapter.completed}/{parsedChapter.lessons} lessons completed
        </Text>
      </LinearGradient>

      {/* Lessons List */}
      <View style={styles.lessonsSection}>
        <Text style={styles.sectionTitle}>Lessons</Text>

        {lessons.map((lesson, index) => (
          <TouchableOpacity
            key={lesson.id}
            style={[
              styles.lessonCard,
              lesson.completed ? styles.lessonCardCompleted : styles.lessonCardActive
            ]}
            onPress={() => setSelectedLesson(lesson)}
          >
            <View style={styles.lessonContent}>
              <View style={styles.lessonIconContainer}>
                <View
                  style={[
                    styles.lessonIcon,
                    { backgroundColor: getTypeColor(lesson.type) }
                  ]}
                >
                  <Ionicons
                    name={getTypeIcon(lesson.type)}
                    size={20}
                    color="white"
                  />
                </View>
              </View>

              <View style={styles.lessonInfo}>
                <View style={styles.lessonTitleRow}>
                  <Text style={styles.lessonTitle}>
                    {lesson.title}
                  </Text>
                  {lesson.completed && (
                    <View style={styles.completedBadge}>
                      <Ionicons name="checkmark" size={16} color="white" />
                    </View>
                  )}
                </View>

                <View style={styles.lessonMetaRow}>
                  <Text style={styles.lessonMeta}>
                    {lesson.type} • {lesson.duration}
                  </Text>
                  <View style={styles.pointsBadge}>
                    <Text style={styles.pointsText}>
                      {lesson.points}pts
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.lessonAction}>
                <Ionicons
                  name={
                    lesson.completed
                      ? "checkmark-circle"
                      : "play-circle-outline"
                  }
                  size={24}
                  color={lesson.completed ? "#10b981" : "#6b7280"}
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Continue Button */}
      <View style={styles.continueSection}>
        <LinearGradient
          colors={parsedSubject.color}
          style={styles.continueGradient}
        >
          <TouchableOpacity style={styles.continueButton}>
            <View style={styles.continueContent}>
              <Ionicons name="play" size={24} color="white" />
              <Text style={styles.continueText}>
                Continue Learning
              </Text>
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 9999,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  subjectName: {
    color: '#ffffff',
    opacity: 0.8,
    fontSize: 14,
  },
  chapterTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 9999,
    height: 8,
    marginBottom: 12,
  },
  progressBar: {
    backgroundColor: '#ffffff',
    borderRadius: 9999,
    height: 8,
  },
  progressText: {
    color: '#ffffff',
    opacity: 0.8,
    fontSize: 14,
  },
  lessonsSection: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  lessonCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  lessonCardCompleted: {
    backgroundColor: '#1e293b',
  },
  lessonCardActive: {
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  lessonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonIconContainer: {
    marginRight: 16,
  },
  lessonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  lessonTitle: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  completedBadge: {
    backgroundColor: '#10b981',
    padding: 4,
    borderRadius: 9999,
  },
  lessonMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lessonMeta: {
    color: '#9ca3af',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  pointsBadge: {
    backgroundColor: '#eab308',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  pointsText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lessonAction: {
    marginLeft: 12,
  },
  continueSection: {
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 32,
  },
  continueGradient: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  continueButton: {
    padding: 16,
  },
  continueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
  },
});