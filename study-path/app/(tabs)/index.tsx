// screens/HomeScreen.js
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtext: {
    color: '#9ca3af',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minWidth: 100,
  },
  statNumber: {
    color: '#06b6d4',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subjectsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  subjectCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  subjectCardDisabled: {
    opacity: 0.6,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subjectProgress: {
    color: '#9ca3af',
    fontSize: 14,
  },
  progressBar: {
    backgroundColor: '#334155',
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  subjectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectStatText: {
    color: '#9ca3af',
    fontSize: 12,
    marginLeft: 4,
  },
  activityContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  activityCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  activityPoints: {
    color: '#06b6d4',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activitySubject: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 4,
  },
  activityTime: {
    color: '#6b7280',
    fontSize: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#06b6d4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingCardText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
  },
  subjectsContainer: {
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
    borderRadius: 20,
  },
  viewAllButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

type LocalSubject = {
  id: number;
  name: string;
  progress: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: [string, string];
};

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
  const loadSubscribedSubjects = async () => {
    if (!user?.id) return;

    try {
      const subjects = await SubscriptionService.getUserSubscriptions(user.id);
      setSubscribedSubjects(subjects);
    } catch (error) {
      console.error("Error loading subscribed subjects:", error);
    } finally {
      setLoading(false);
    }
  };

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
  }, [user?.id]);

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
            <Text style={styles.headerText}>Welcome back!</Text>
            <Text style={styles.headerSubtext}>
              Ready to learn today?
            </Text>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="notifications-outline" size={24} color="#00d4ff" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { marginRight: 8 }]}>
            <Text style={styles.statLabel}>Study Streak</Text>
            <Text style={styles.statNumber}>12 Days</Text>
          </View>
          <View style={[styles.statCard, { marginLeft: 8 }]}>
            <Text style={styles.statLabel}>Total Points</Text>
            <Text style={styles.statNumber}>2,847</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Stories Section */}
      <SimpleStoriesSection />

      {/* Continue Learning */}
      {subscribedSubjects.length > 0 && (
        <View className="px-6 mt-6">
          <Text className="text-white text-xl font-bold mb-4">
            Continue Learning
          </Text>
          <TouchableOpacity
            className="bg-slate-800 rounded-3xl overflow-hidden"
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
              className="p-6"
            >
              {navigatingToFlow === subscribedSubjects[0].id && (
                <View className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center z-10">
                  <View className="bg-slate-800 p-4 rounded-2xl flex-row items-center">
                    <ActivityIndicator size="small" color="#00d4ff" />
                    <Text className="text-white ml-3 font-medium">
                      Loading...
                    </Text>
                  </View>
                </View>
              )}
              <View className="flex-row items-center">
                <View className="flex-1">
                  <Text className="text-white text-lg font-bold">
                    {subscribedSubjects[0].name}
                  </Text>
                  <Text className="text-white opacity-80">
                    {subscribedSubjects[0].user_progress?.completed_chapters ||
                      0}
                    /{subscribedSubjects[0].chapters} chapters completed
                  </Text>
                  <View className="bg-white bg-opacity-20 rounded-full h-2 mt-3">
                    <View
                      className="bg-white rounded-full h-2"
                      style={{
                        width: `${Math.round(((subscribedSubjects[0].user_progress?.completed_chapters || 0) / subscribedSubjects[0].chapters) * 100)}%`
                      }}
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
      <View style={styles.subjectsContainer}>
        <View style={styles.subjectsHeader}>
          <Text style={styles.sectionTitle}>Your Subjects</Text>
          <TouchableOpacity
            onPress={() => router.push("/study")}
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllButtonText}>View All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your subjects...</Text>
          </View>
        ) : subscribedSubjects.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="book-outline" size={32} color="#6b7280" />
            </View>
            <Text style={styles.emptyTitle}>
              No Subjects Yet
            </Text>
            <Text style={styles.emptyText}>
              Subscribe to subjects to start learning
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/study")}
              style={styles.emptyButton}
            >
              <Text style={styles.emptyButtonText}>Browse Subjects</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between">
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
                  className="w-[48%] mb-4"
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
                    className="p-5 rounded-2xl"
                  >
                    {navigatingToFlow === subject.id && (
                      <View className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-10">
                        <View className="bg-slate-800 p-3 rounded-xl flex-row items-center">
                          <ActivityIndicator size="small" color="#00d4ff" />
                          <Text className="text-white ml-2 text-sm font-medium">
                            Loading...
                          </Text>
                        </View>
                      </View>
                    )}
                    <Ionicons
                      name={subject.icon as any}
                      size={32}
                      color="white"
                      className="mb-3"
                    />
                    <Text className="text-white font-bold text-base">
                      {subject.name}
                    </Text>
                    <Text className="text-white opacity-70 text-sm">
                      {progress}% Complete
                    </Text>
                    <View className="bg-white bg-opacity-30 rounded-full h-1.5 mt-2">
                      <View
                        className="bg-white rounded-full h-1.5"
                        style={{ width: `${progress}%` }}
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
      <View className="px-6 mt-8 mb-8">
        <Text className="text-white text-xl font-bold mb-4">
          Recent Activity
        </Text>
        {recentActivity.map((activity) => (
          <View key={activity.id} className="bg-slate-800 p-4 rounded-2xl mb-3">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-white font-semibold">
                  {activity.lesson}
                </Text>
                <Text className="text-gray-400 text-sm">
                  {activity.subject}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">
                  {activity.time}
                </Text>
              </View>
              <View className="bg-yellow-500 px-3 py-1 rounded-full">
                <Text className="text-black font-bold text-sm">
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

export default HomeScreen;
