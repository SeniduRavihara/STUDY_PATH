import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ColorValue,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
import {
  Subject,
  SubscriptionService,
} from "../../../superbase/services/subscriptionService";

export default function StudyScreen() {
  const router = useRouter();
  const { subject } = useLocalSearchParams();
  const parsedSubject = subject ? JSON.parse(subject as string) : null;
  const { user } = useAuth();

  const [subscribedSubjects, setSubscribedSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [navigatingToFlow, setNavigatingToFlow] = useState<string | null>(null);

  // Load user's subscribed subjects
  const loadSubscribedSubjects = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const subjects = await SubscriptionService.getUserSubscriptions(user.id);
      setSubscribedSubjects(subjects);
    } catch (error) {
      console.error("Error loading subscribed subjects:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await loadSubscribedSubjects();
    setRefreshing(false);
  };

  // Load subjects on component mount
  useEffect(() => {
    loadSubscribedSubjects();
  }, [loadSubscribedSubjects]);

  // Handle subscribing to new subjects
  const handleSubscribeToSubjects = () => {
    router.push("/study/subscribe");
  };

  // Handle navigation to flow with loading state
  const handleNavigateToFlow = async (subject: Subject) => {
    setNavigatingToFlow(subject.id);
    // Small delay to show loading state
    setTimeout(() => {
      router.push({
        pathname: "/study/flow",
        params: { subject: JSON.stringify(subject) },
      });
      setNavigatingToFlow(null);
    }, 300);
  };

  // If we have a subject from navigation, redirect directly to flow screen
  React.useEffect(() => {
    if (parsedSubject) {
      router.replace({
        pathname: "/study/flow",
        params: { subject: JSON.stringify(parsedSubject) },
      });
    }
  }, [parsedSubject, router]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient colors={["#0f0f23", "#1a1a2e"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Study Hub</Text>
            <Text style={styles.headerSubtitle}>Your subscribed subjects</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color="#00d4ff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Subjects */}
      <View style={styles.subjectsSection}>
        <View style={styles.subjectsHeader}>
          <Text style={styles.sectionTitle}>Your Subjects</Text>
          <TouchableOpacity
            onPress={handleSubscribeToSubjects}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>+ Add Subject</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your subjects...</Text>
          </View>
        ) : subscribedSubjects.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={64} color="#6b7280" />
            <Text style={styles.emptyTitle}>No Subjects Yet</Text>
            <Text style={styles.emptyText}>
              Subscribe to subjects to start learning
            </Text>
            <TouchableOpacity
              onPress={handleSubscribeToSubjects}
              style={styles.browseButton}
            >
              <Text style={styles.browseButtonText}>Browse Subjects</Text>
            </TouchableOpacity>
          </View>
        ) : (
          subscribedSubjects.map((subject) => (
            <TouchableOpacity
              key={subject.id}
              style={styles.subjectCard}
              onPress={() => handleNavigateToFlow(subject)}
              disabled={navigatingToFlow === subject.id}
            >
              <LinearGradient
                colors={["#1a1a2e", "#16213e"]}
                style={styles.subjectGradient}
              >
                {navigatingToFlow === subject.id && (
                  <View style={styles.loadingOverlay}>
                    <View style={styles.loadingCard}>
                      <ActivityIndicator size="small" color="#00d4ff" />
                      <Text style={styles.loadingCardText}>Loading...</Text>
                    </View>
                  </View>
                )}
                <View style={styles.subjectContent}>
                  <LinearGradient
                    colors={
                      subject.color &&
                      Array.isArray(subject.color) &&
                      subject.color.length === 2 &&
                      typeof subject.color[0] === "string" &&
                      typeof subject.color[1] === "string"
                        ? (subject.color as [ColorValue, ColorValue])
                        : (["#3B82F6", "#3B82F6"] as [ColorValue, ColorValue])
                    }
                    style={styles.iconContainer}
                  >
                    <Ionicons
                      name={subject.icon as any}
                      size={28}
                      color="white"
                    />
                  </LinearGradient>

                  <View style={styles.subjectInfo}>
                    <View style={styles.subjectTitleRow}>
                      <Text style={styles.subjectTitle}>{subject.name}</Text>
                      <View style={styles.difficultyBadge}>
                        <Text style={styles.difficultyText}>
                          {subject.difficulty}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.subjectStatsRow}>
                      <Text style={styles.chaptersText}>
                        {subject.user_progress?.completed_chapters || 0}/
                        {subject.chapters} chapters completed
                      </Text>
                      <View style={styles.xpContainer}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text style={styles.xpText}>
                          {subject.user_progress?.total_xp || 0} XP
                        </Text>
                      </View>
                    </View>

                    <View style={styles.progressBarContainer}>
                      <LinearGradient
                        colors={
                          (subject.color as [ColorValue, ColorValue]) ||
                          (["#3B82F6", "#3B82F6"] as [ColorValue, ColorValue])
                        }
                        style={[
                          styles.progressBar,
                          {
                            width: `${
                              ((subject.user_progress?.completed_chapters ||
                                0) /
                                subject.chapters) *
                              100
                            }%`,
                          },
                        ]}
                      />
                    </View>

                    {(subject.user_progress?.streak || 0) > 0 && (
                      <View style={styles.streakContainer}>
                        <Ionicons name="flame" size={16} color="#FF6B6B" />
                        <Text style={styles.streakText}>
                          {subject.user_progress?.streak || 0} day streak
                        </Text>
                      </View>
                    )}
                  </View>

                  <Ionicons name="chevron-forward" size={24} color="#6b7280" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))
        )}
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
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#9ca3af",
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 9999,
  },
  subjectsSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  subjectsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  loadingText: {
    color: "#9ca3af",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptyText: {
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 8,
  },
  browseButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
    marginTop: 16,
  },
  browseButtonText: {
    color: "#ffffff",
    fontWeight: "500",
  },
  subjectCard: {
    marginBottom: 16,
  },
  subjectGradient: {
    padding: 24,
    borderRadius: 24,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  loadingCard: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  loadingCardText: {
    color: "#ffffff",
    marginLeft: 12,
    fontWeight: "500",
  },
  subjectContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    padding: 16,
    borderRadius: 16,
    marginRight: 16,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  subjectTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  difficultyBadge: {
    backgroundColor: "#334155",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  difficultyText: {
    color: "#d1d5db",
    fontSize: 12,
  },
  subjectStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  chaptersText: {
    color: "#9ca3af",
    fontSize: 14,
  },
  xpContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  xpText: {
    color: "#facc15",
    fontSize: 14,
    marginLeft: 4,
  },
  progressBarContainer: {
    backgroundColor: "#334155",
    borderRadius: 9999,
    height: 8,
  },
  progressBar: {
    borderRadius: 9999,
    height: 8,
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  streakText: {
    color: "#f87171",
    fontSize: 12,
    marginLeft: 4,
  },
  bottomSpacer: {
    height: 32,
  },
});
