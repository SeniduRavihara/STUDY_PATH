// screens/HomeScreen.js
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import SimpleStoriesSection from "../../components/SimpleStoriesSection";
import { useAuth } from "../../contexts/AuthContext";
import {
  Subject,
  SubscriptionService
} from "../../superbase/services/subscriptionService";

type Activity = {
  id: number;
  subject: string;
  lesson: string;
  time: string;
  points: number;
};

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [subscribedSubjects, setSubscribedSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [navigatingToFlow, setNavigatingToFlow] = useState<string | null>(null);

  // Load user's subscribed subjects
  const loadSubscribedSubjects = useCallback(async () => {
    if (!user?.id) return;

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

  // Handle navigation to flow with loading state
  const handleNavigateToFlow = async (subject: Subject) => {
    setNavigatingToFlow(subject.id);
    // Small delay to show loading state
    setTimeout(() => {
      router.push({
        pathname: "/study/flow",
        params: { subject: JSON.stringify(subject) }
      });
      setNavigatingToFlow(null);
    }, 300);
  };

  // Load subjects on component mount
  useEffect(() => {
    loadSubscribedSubjects();
  }, [loadSubscribedSubjects]);

  const recentActivity: Activity[] = [
    {
      id: 1,
      subject: "Mathematics",
      lesson: "Calculus Basics",
      time: "2 hours ago",
      points: 25
    },
    {
      id: 2,
      subject: "Physics",
      lesson: "Wave Motion",
      time: "1 day ago",
      points: 30
    }
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={["#0f0f23", "#1a1a2e"]}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Welcome back!</Text>
            <Text style={styles.headerSubtitle}>
              Ready to learn today?
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#00d4ff" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={[styles.statCard, styles.statCardLeft]}
          >
            <Text style={styles.statLabel}>Study Streak</Text>
            <Text style={styles.statValue}>12 Days</Text>
          </LinearGradient>
          <LinearGradient
            colors={["#f093fb", "#f5576c"]}
            style={[styles.statCard, styles.statCardRight]}
          >
            <Text style={styles.statLabel}>Total Points</Text>
            <Text style={styles.statValue}>2,847</Text>
          </LinearGradient>
        </View>
      </LinearGradient>

      {/* Stories Section */}
      <SimpleStoriesSection />

      {/* Continue Learning */}
      {subscribedSubjects.length > 0 && (
        <View style={styles.continueSection}>
          <Text style={styles.sectionTitle}>
            Continue Learning
          </Text>
          <TouchableOpacity
            style={styles.continueCard}
            onPress={() => handleNavigateToFlow(subscribedSubjects[0])}
            disabled={navigatingToFlow === subscribedSubjects[0].id}
          >
            <LinearGradient
              colors={
                (subscribedSubjects[0].color as [string, string]) || [
                  "#3B82F6",
                  "#3B82F6"
                ]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.continueGradient}
            >
              {navigatingToFlow === subscribedSubjects[0].id && (
                <View style={styles.loadingOverlay}>
                  <View style={styles.loadingCard}>
                    <ActivityIndicator size="small" color="#00d4ff" />
                    <Text style={styles.loadingText}>
                      Loading...
                    </Text>
                  </View>
                </View>
              )}
              <View style={styles.continueContent}>
                <View style={styles.continueInfo}>
                  <Text style={styles.continueTitle}>
                    {subscribedSubjects[0].name}
                  </Text>
                  <Text style={styles.continueSubtitle}>
                    {subscribedSubjects[0].user_progress?.completed_chapters ||
                      0}
                    /{subscribedSubjects[0].chapters} chapters completed
                  </Text>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.round(((subscribedSubjects[0].user_progress?.completed_chapters || 0) / subscribedSubjects[0].chapters) * 100)}%`
                        }
                      ]}
                    />
                  </View>
                </View>
                <Ionicons name="play-circle" size={48} color="white" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Subject Progress */}
      <View style={styles.subjectsSection}>
        <View style={styles.subjectsHeader}>
          <Text style={styles.sectionTitle}>Your Subjects</Text>
          <TouchableOpacity
            onPress={() => router.push("/study")}
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingSubjectsText}>Loading your subjects...</Text>
          </View>
        ) : subscribedSubjects.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={48} color="#6b7280" />
            <Text style={styles.emptyTitle}>
              No Subjects Yet
            </Text>
            <Text style={styles.emptyText}>
              Subscribe to subjects to start learning
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/study")}
              style={styles.browseButton}
            >
              <Text style={styles.browseButtonText}>Browse Subjects</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.subjectsGrid}>
            {subscribedSubjects.slice(0, 4).map((subject) => {
              const progress =
                subject.chapters > 0
                  ? Math.round(
                      ((subject.user_progress?.completed_chapters || 0) /
                        subject.chapters) *
                        100
                    )
                  : 0;

              return (
                <TouchableOpacity
                  key={subject.id}
                  style={styles.subjectCard}
                  onPress={() => handleNavigateToFlow(subject)}
                  disabled={navigatingToFlow === subject.id}
                >
                  <LinearGradient
                    colors={
                      (subject.color as [string, string]) || [
                        "#3B82F6",
                        "#3B82F6"
                      ]
                    }
                    style={styles.subjectGradient}
                  >
                    {navigatingToFlow === subject.id && (
                      <View style={styles.subjectLoadingOverlay}>
                        <View style={styles.subjectLoadingCard}>
                          <ActivityIndicator size="small" color="#00d4ff" />
                          <Text style={styles.subjectLoadingText}>
                            Loading...
                          </Text>
                        </View>
                      </View>
                    )}
                    <Ionicons
                      name={subject.icon as any}
                      size={32}
                      color="white"
                      style={styles.subjectIcon}
                    />
                    <Text style={styles.subjectName}>
                      {subject.name}
                    </Text>
                    <Text style={styles.subjectProgress}>
                      {progress}% Complete
                    </Text>
                    <View style={styles.subjectProgressBar}>
                      <View
                        style={[
                          styles.subjectProgressFill,
                          { width: `${progress}%` }
                        ]}
                      />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Recent Activity */}
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>
          Recent Activity
        </Text>
        {recentActivity.map((activity) => (
          <View key={activity.id} style={styles.activityCard}>
            <View style={styles.activityContent}>
              <View style={styles.activityInfo}>
                <Text style={styles.activityLesson}>
                  {activity.lesson}
                </Text>
                <Text style={styles.activitySubject}>
                  {activity.subject}
                </Text>
                <Text style={styles.activityTime}>
                  {activity.time}
                </Text>
              </View>
              <View style={styles.activityPoints}>
                <Text style={styles.activityPointsText}>
                  +{activity.points}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#9ca3af',
    fontSize: 16,
  },
  notificationButton: {
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 9999,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
  },
  statCardLeft: {
    marginRight: 8,
  },
  statCardRight: {
    marginLeft: 8,
  },
  statLabel: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.8,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  continueSection: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  continueCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    overflow: 'hidden',
  },
  continueGradient: {
    padding: 24,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    marginLeft: 12,
    fontWeight: '500',
  },
  continueContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueInfo: {
    flex: 1,
  },
  continueTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  continueSubtitle: {
    color: '#ffffff',
    opacity: 0.8,
  },
  progressBarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 9999,
    height: 8,
    marginTop: 12,
  },
  progressBarFill: {
    backgroundColor: '#ffffff',
    borderRadius: 9999,
    height: 8,
  },
  subjectsSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  subjectsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  viewAllText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingSubjectsText: {
    color: '#9ca3af',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyText: {
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },
  browseButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    marginTop: 12,
  },
  browseButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subjectCard: {
    width: '48%',
    marginBottom: 16,
  },
  subjectGradient: {
    padding: 20,
    borderRadius: 16,
  },
  subjectLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  subjectLoadingCard: {
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectLoadingText: {
    color: '#ffffff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  subjectIcon: {
    marginBottom: 12,
  },
  subjectName: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  subjectProgress: {
    color: '#ffffff',
    opacity: 0.7,
    fontSize: 14,
  },
  subjectProgressBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 9999,
    height: 6,
    marginTop: 8,
  },
  subjectProgressFill: {
    backgroundColor: '#ffffff',
    borderRadius: 9999,
    height: 6,
  },
  activitySection: {
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 32,
  },
  activityCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  activityContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityLesson: {
    color: '#ffffff',
    fontWeight: '600',
  },
  activitySubject: {
    color: '#9ca3af',
    fontSize: 14,
  },
  activityTime: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  activityPoints: {
    backgroundColor: '#eab308',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  activityPointsText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default HomeScreen;