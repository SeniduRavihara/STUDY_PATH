import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ColorValue,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import {
  Subject,
  SubscriptionService,
} from "../../superbase/services/subscriptionService";

export default function SubscribeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [subscribing, setSubscribing] = useState<string | null>(null);

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

  // Load available subjects
  const loadAvailableSubjects = useCallback(async () => {
    if (!user?.id) {
      console.log("No user ID available");
      setLoading(false);
      return;
    }

    try {
      console.log("Loading available subjects for user:", user.id);
      const subjects = await SubscriptionService.getAvailableSubjects(user.id);
      console.log("Available subjects:", subjects);
      setAvailableSubjects(subjects);
    } catch (error) {
      console.error("Error loading available subjects:", error);
      Alert.alert("Error", "Failed to load subjects. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAvailableSubjects();
    setRefreshing(false);
  };

  // Subscribe to a subject
  const handleSubscribe = async (subjectId: string, subjectName: string) => {
    if (!user?.id) return;

    setSubscribing(subjectId);

    try {
      const success = await SubscriptionService.subscribeToSubject(
        user.id,
        subjectId,
      );

      if (success) {
        Alert.alert(
          "Success!",
          `You've subscribed to ${subjectName}. You can now start learning!`,
          [
            {
              text: "OK",
              onPress: () => {
                // Remove the subscribed subject from available list
                setAvailableSubjects(prev =>
                  prev.filter(subject => subject.id !== subjectId),
                );
              },
            },
          ],
        );
      } else {
        Alert.alert("Error", "Failed to subscribe. Please try again.");
      }
    } catch (error) {
      console.error("Error subscribing to subject:", error);
      Alert.alert("Error", "Failed to subscribe. Please try again.");
    } finally {
      setSubscribing(null);
    }
  };

  // Load subjects on component mount
  useEffect(() => {
    loadAvailableSubjects();
  }, [loadAvailableSubjects]);

  // Filter subjects based on search term
  const filteredSubjects = availableSubjects.filter(
    subject =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
            <Text style={styles.headerTitle}>
              Browse Subjects
            </Text>
            <Text style={styles.headerSubtitle}>
              Subscribe to new subjects
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#00d4ff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search subjects..."
            placeholderTextColor="#6b7280"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </LinearGradient>

      {/* Subjects List */}
      <View style={styles.subjectsList}>
        {loading ? (
          <View style={styles.centerContent}>
            <Text style={styles.loadingText}>Loading subjects...</Text>
          </View>
        ) : filteredSubjects.length === 0 ? (
          <View style={styles.centerContent}>
            <Ionicons name="book-outline" size={64} color="#6b7280" />
            <Text style={styles.emptyTitle}>
              {searchTerm ? "No Results Found" : "All Caught Up!"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchTerm
                ? "Try searching for a different subject"
                : "You've subscribed to all available subjects"}
            </Text>
          </View>
        ) : (
          filteredSubjects.map(subject => (
            <View key={subject.id} style={styles.subjectCardWrapper}>
              <LinearGradient
                colors={["#1a1a2e", "#16213e"]}
                style={styles.subjectCard}
              >
                <View style={styles.subjectContent}>
                  <LinearGradient
                  colors={(subject.color as [ColorValue, ColorValue]) || (['#3B82F6', '#3B82F6'] as [ColorValue, ColorValue])}
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

                    {subject.description && (
                      <Text style={styles.subjectDescription}>
                        {subject.description}
                      </Text>
                    )}

                    <View style={styles.subjectFooter}>
                      <Text style={styles.chaptersText}>
                        {subject.chapters} chapters available
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          handleSubscribe(subject.id, subject.name)
                        }
                        disabled={subscribing === subject.id}
                        style={[
                          styles.subscribeButton,
                          subscribing === subject.id && styles.subscribeButtonDisabled,
                        ]}
                      >
                        <Text style={styles.subscribeButtonText}>
                          {subscribing === subject.id
                            ? "Subscribing..."
                            : "Subscribe"}
                        </Text>
                      </TouchableOpacity>
                    </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
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
  closeButton: {
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 9999,
  },
  searchBar: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    color: "white",
    marginLeft: 12,
  },
  subjectsList: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  centerContent: {
    alignItems: "center",
    paddingVertical: 32,
  },
  loadingText: {
    color: "#9ca3af",
  },
  emptyTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtitle: {
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 8,
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
  subjectFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chaptersText: {
    color: "#9ca3af",
    fontSize: 14,
  },
  subscribeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: "#2563eb",
  },
  subscribeButtonDisabled: {
    backgroundColor: "#4b5563",
  },
  subscribeButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  bottomSpacer: {
    height: 32,
  },
});