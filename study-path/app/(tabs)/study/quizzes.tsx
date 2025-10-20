import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import drizzleQuizService from "../../../lib/drizzleQuizService";
import type { Quiz } from "../../../lib/schema";

export default function QuizzesScreen() {
  const router = useRouter();
  const { subject, topic } = useLocalSearchParams();
  const parsedSubject = JSON.parse(subject as string);
  const parsedTopic = JSON.parse(topic as string);

  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  // Add isImported property to Quiz type for this component
  interface QuizWithImport extends Quiz {
    isImported: boolean | null;
  }

  useEffect(() => {
    loadQuizzes();
  }, []);

  // Debug: Log database info
  useEffect(() => {
    const logDbInfo = async () => {
      try {
        const stats = await drizzleQuizService.getDatabaseStats();
        console.log("📊 Drizzle Database Stats:", stats);
      } catch (error) {
        console.error("Error logging database info:", error);
      }
    };
    logDbInfo();
  }, [quizzes]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const subjectQuizzes = await drizzleQuizService.getQuizzesBySubject(
        parsedSubject.name,
      );

      // Add import status checking
      const quizzesWithImport = subjectQuizzes.map(quiz => ({
        ...quiz,
        isImported: quiz.isImported || false,
      }));

      setQuizzes(quizzesWithImport);
    } catch (error) {
      console.error("Error loading quizzes:", error);
      // If no quizzes exist, create sample ones
      try {
        await drizzleQuizService.createSampleQuizzes();
        const subjectQuizzes = await drizzleQuizService.getQuizzesBySubject(
          parsedSubject.name,
        );

        // Add import status checking
        const quizzesWithImport = subjectQuizzes.map(quiz => ({
          ...quiz,
          isImported: quiz.isImported || false,
        }));

        setQuizzes(quizzesWithImport);
      } catch (createError) {
        console.error("Error creating sample quizzes:", createError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuizPress = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    Alert.alert(
      `Start ${quiz.title}`,
      `This quiz has ${quiz.questionCount} questions and a ${quiz.timeLimit} minute time limit. Are you ready to begin?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Start Quiz",
          onPress: () => startQuiz(quiz),
        },
      ],
    );
  };

  const startQuiz = (quiz: Quiz) => {
    // Navigate to the actual quiz taking screen
    router.push({
      pathname: "/study/take-quiz",
      params: {
        subject: JSON.stringify(parsedSubject),
        topic: JSON.stringify(parsedTopic),
        quiz: JSON.stringify(quiz),
      },
    });
  };

  const getDifficultyColor = (difficulty: Quiz["difficulty"]): string => {
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

  const handleRemoveImportedQuiz = async (quizId: number) => {
    Alert.alert(
      "Remove Quiz",
      "Are you sure you want to remove this imported quiz?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              // Remove from SQLite database using the correct method
              await drizzleQuizService.removeImportedQuiz(quizId);
              // Refresh quizzes
              loadQuizzes();
            } catch (error) {
              console.error("Error removing imported quiz:", error);
              Alert.alert("Error", "Failed to remove quiz");
            }
          },
        },
      ],
    );
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
              {parsedTopic.title}
            </Text>
            <Text style={styles.headerSubtitle}>Test your knowledge</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${(parsedTopic.completed / parsedTopic.count) * 100}%`,
              },
            ]}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {quizzes.length}
            </Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {quizzes.reduce((sum, quiz) => sum + quiz.questionCount, 0)}
            </Text>
            <Text style={styles.statLabel}>Questions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>2.1k</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quiz Topics */}
      <View style={styles.quizzesSection}>
        <Text style={styles.sectionTitle}>
          Available Quizzes
        </Text>

        {loading ? (
          <View style={styles.centerContent}>
            <Text style={styles.loadingText}>Loading quizzes...</Text>
          </View>
        ) : quizzes.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={styles.loadingText}>No quizzes available</Text>
          </View>
        ) : (
          quizzes.map(quiz => {
            const quizWithImport = quiz as QuizWithImport;
            return (
              <View key={quiz.id} style={styles.quizCardWrapper}>
                <LinearGradient
                  colors={["#1a1a2e", "#16213e"]}
                  style={styles.quizCard}
                >
                  <View style={styles.quizCardContent}>
                    <View
                      style={[
                        styles.quizIcon,
                        {
                          backgroundColor: quizWithImport.isImported
                            ? "#10b981"
                            : "#3b82f6",
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          quizWithImport.isImported ? "download" : "help-circle"
                        }
                        size={28}
                        color="white"
                      />
                    </View>
                    <View style={styles.quizInfo}>
                      <View style={styles.quizTitleRow}>
                        <Text
                          style={styles.quizTitle}
                          numberOfLines={2}
                          ellipsizeMode="tail"
                        >
                          {quiz.title}
                        </Text>
                        <View style={styles.badgesContainer}>
                          <View
                            style={[
                              styles.difficultyBadge,
                              {
                                backgroundColor: getDifficultyColor(
                                  quiz.difficulty,
                                ),
                              },
                            ]}
                          >
                            <Text style={styles.difficultyText}>
                              {quiz.difficulty}
                            </Text>
                          </View>
                          {quizWithImport.isImported && (
                            <View style={styles.importedBadge}>
                              <Text style={styles.importedText}>
                                Imported
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <Text
                        style={styles.quizDescription}
                        numberOfLines={3}
                        ellipsizeMode="tail"
                      >
                        {quiz.description}
                      </Text>
                      <View style={styles.quizMetaRow}>
                        <Text
                          style={styles.quizMeta}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {quiz.questionCount} questions • {quiz.timeLimit} min
                        </Text>
                        {quizWithImport.isImported && (
                          <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => handleRemoveImportedQuiz(quiz.id)}
                          >
                            <Ionicons name="close" size={16} color="#ef4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                    <View style={styles.quizAction}>
                      {quizWithImport.isImported ? (
                        <TouchableOpacity onPress={() => handleQuizPress(quiz)}>
                          <Ionicons
                            name="play-circle"
                            size={24}
                            color="#10b981"
                          />
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity onPress={() => handleQuizPress(quiz)}>
                          <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#6b7280"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </LinearGradient>
              </View>
            );
          })
        )}
      </View>

      {/* Quick Stats */}
      <View style={styles.performanceSection}>
        <LinearGradient
          colors={["#1a1a2e", "#16213e"]}
          style={styles.performanceCard}
        >
          <Text style={styles.performanceTitle}>
            Quiz Performance
          </Text>
          <View style={styles.performanceStats}>
            <View style={styles.performanceStat}>
              <Text style={styles.performanceValueGreen}>
                {quizzes.length}
              </Text>
              <Text style={styles.performanceLabel}>Available</Text>
            </View>
            <View style={styles.performanceStat}>
              <Text style={styles.performanceValueBlue}>
                {quizzes.reduce((sum, quiz) => sum + quiz.questionCount, 0)}
              </Text>
              <Text style={styles.performanceLabel}>Questions</Text>
            </View>
            <View style={styles.performanceStat}>
              <Text style={styles.performanceValueYellow}>85%</Text>
              <Text style={styles.performanceLabel}>Success Rate</Text>
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
  quizzesSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 24,
  },
  centerContent: {
    alignItems: "center",
    paddingVertical: 32,
  },
  loadingText: {
    color: "white",
    fontSize: 18,
  },
  quizCardWrapper: {
    marginBottom: 16,
  },
  quizCard: {
    padding: 24,
    borderRadius: 24,
  },
  quizCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  quizIcon: {
    padding: 16,
    borderRadius: 16,
    marginRight: 16,
  },
  quizInfo: {
    flex: 1,
  },
  quizTitleRow: {
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  quizTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginRight: 8,
  },
  badgesContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    marginRight: 8,
  },
  difficultyText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  importedBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  importedText: {
    color: "#34d399",
    fontSize: 10,
    fontWeight: "600",
  },
  quizDescription: {
    color: "#9ca3af",
    fontSize: 14,
    marginBottom: 12,
  },
  quizMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  quizMeta: {
    color: "#9ca3af",
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    padding: 8,
    borderRadius: 9999,
    flexShrink: 0,
  },
  quizAction: {
    flexShrink: 0,
    marginLeft: 8,
  },
  performanceSection: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  performanceCard: {
    padding: 24,
    borderRadius: 24,
  },
  performanceTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  performanceStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  performanceStat: {
    alignItems: "center",
  },
  performanceValueGreen: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#34d399",
  },
  performanceValueBlue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#60a5fa",
  },
  performanceValueYellow: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fbbf24",
  },
  performanceLabel: {
    color: "#9ca3af",
    fontSize: 12,
  },
  bottomSpacer: {
    height: 96,
  },
});