import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
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

export default function SubscribeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Helper function to get valid icon name
  const getValidIcon = (iconName: string | null): keyof typeof Ionicons.glyphMap => {
    if (!iconName) return "book";
    
    const validIcons = [
      "book", "library", "school", "calculator", "flask", "bulb", "globe", 
      "code-slash", "phone-portrait", "logo-python", "brain", "git-branch"
    ];
    
    if (validIcons.includes(iconName)) {
      return iconName as keyof typeof Ionicons.glyphMap;
    }
    
    return "book";
  };

  // Load all subjects
  const loadAllSubjects = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      const subjects = await SubscriptionService.getAvailableSubjects(user.id);
      setAllSubjects(subjects);
    } catch (error) {
      console.error("Error loading subjects:", error);
      Alert.alert("Error", "Failed to load subjects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllSubjects();
    setRefreshing(false);
  };

  // Load subjects on component mount
  useEffect(() => {
    loadAllSubjects();
  }, [user?.id]);

  // Handle subscription
  const handleSubscribe = async (subject: Subject) => {
    if (!user?.id) return;
    
    try {
      const success = await SubscriptionService.subscribeToSubject(
        user.id,
        subject.id,
      );
      if (success) {
        Alert.alert("Success", `Successfully subscribed to ${subject.name}`);
        // Refresh the list
        await loadAllSubjects();
      } else {
        Alert.alert("Error", "Failed to subscribe to subject");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to subscribe to subject");
    }
  };

  // Handle unsubscription
  const handleUnsubscribe = async (subject: Subject) => {
    if (!user?.id) return;
    
    try {
      const success = await SubscriptionService.unsubscribeFromSubject(
        user.id,
        subject.id,
      );
      if (success) {
        Alert.alert("Success", `Successfully unsubscribed from ${subject.name}`);
        // Refresh the list
        await loadAllSubjects();
      } else {
        Alert.alert("Error", "Failed to unsubscribe from subject");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to unsubscribe from subject");
    }
  };

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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#00d4ff" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              Browse Subjects
            </Text>
            <Text style={styles.headerSubtitle}>
              Subscribe to subjects you want to learn
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Subjects */}
      <View style={styles.subjectsSection}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading subjects...</Text>
          </View>
        ) : (
          allSubjects.map(subject => (
            <View key={subject.id} style={styles.subjectCardWrapper}>
              <LinearGradient
                colors={["#1a1a2e", "#16213e"]}
                style={styles.subjectCard}
              >
                <View style={styles.subjectContent}>
                  <LinearGradient
                    colors={subject.color || ['#3B82F6', '#3B82F6']}
                    style={styles.subjectIcon}
                  >
                    <Ionicons
                      name={getValidIcon(subject.icon)}
                      size={28}
                      color="white"
                    />
                  </LinearGradient>

                  <View style={styles.subjectInfo}>
                    <View style={styles.subjectTitleRow}>
                      <Text style={styles.subjectTitle}>
                        {subject.name}
                      </Text>
                      <View style={styles.difficultyBadge}>
                        <Text style={styles.difficultyText}>
                          {subject.difficulty}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.subjectDescription}>
                      {subject.description}
                    </Text>

                    <View style={styles.subjectMetaRow}>
                      <Text style={styles.subjectMeta}>
                        {subject.chapters} chapters
                      </Text>
                      <View style={styles.xpContainer}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text style={styles.xpText}>
                          {subject.xp} XP
                        </Text>
                      </View>
                    </View>

                    {subject.streak > 0 && (
                      <View style={styles.streakContainer}>
                        <Ionicons name="flame" size={16} color="#FF6B6B" />
                        <Text style={styles.streakText}>
                          {subject.streak} day streak
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={() =>
                        subject.isSubscribed
                          ? handleUnsubscribe(subject)
                          : handleSubscribe(subject)
                      }
                      style={[
                        styles.subscribeButton,
                        subject.isSubscribed
                          ? styles.unsubscribeButton
                          : styles.subscribeButtonActive,
                      ]}
                    >
                      <Text style={styles.subscribeButtonText}>
                        {subject.isSubscribed ? "Unsubscribe" : "Subscribe"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </View>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: "#1e293b",
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
    color: "#9ca3af",
    fontSize: 16,
  },
  subjectsSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  loadingText: {
    color: "#9ca3af",
  },
  subjectCardWrapper: {
    marginBottom: 16,
  },
  subjectCard: {
    padding: 24,
    borderRadius: 24,
  },
  subjectContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  subjectIcon: {
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
    color: "white",
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
    fontSize: 10,
  },
  subjectDescription: {
    color: "#9ca3af",
    fontSize: 14,
    marginBottom: 12,
  },
  subjectMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subjectMeta: {
    color: "#9ca3af",
    fontSize: 14,
  },
  xpContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  xpText: {
    color: "#fbbf24",
    fontSize: 14,
    marginLeft: 4,
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  streakText: {
    color: "#f87171",
    fontSize: 10,
    marginLeft: 4,
  },
  subscribeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 9999,
  },
  subscribeButtonActive: {
    backgroundColor: "#2563eb",
  },
  unsubscribeButton: {
    backgroundColor: "#dc2626",
  },
  subscribeButtonText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },
  bottomSpacer: {
    height: 32,
  },
});